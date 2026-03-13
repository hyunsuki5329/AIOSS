import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://api.github.com";
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const windowDays = Number(process.env.DORA_WINDOW_DAYS || "7");

if (!token) {
  throw new Error("GITHUB_TOKEN is required");
}

if (!repository || !repository.includes("/")) {
  throw new Error("GITHUB_REPOSITORY must be in owner/repo format");
}

const [owner, repo] = repository.split("/");
const now = new Date();
const since = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28"
};

function toIso(dt) {
  return dt.toISOString();
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

async function githubGet(urlPath) {
  const response = await fetch(`${BASE_URL}${urlPath}`, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API request failed (${response.status}): ${text}`);
  }
  return response.json();
}

async function paginate(urlBuilder) {
  const results = [];
  for (let page = 1; page <= 10; page += 1) {
    const data = await githubGet(urlBuilder(page));
    if (!Array.isArray(data) || data.length === 0) {
      break;
    }
    results.push(...data);
    if (data.length < 100) {
      break;
    }
  }
  return results;
}

async function getMergedPullRequests() {
  const pulls = await paginate(
    (page) =>
      `/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`
  );

  return pulls.filter((pr) => pr.merged_at && new Date(pr.merged_at) >= since);
}

async function getPullRequestLeadTimes(mergedPrs) {
  const leadTimesHours = [];

  for (const pr of mergedPrs) {
    const commits = await paginate(
      (page) =>
        `/repos/${owner}/${repo}/pulls/${pr.number}/commits?per_page=100&page=${page}`
    );

    if (commits.length === 0) {
      continue;
    }

    const firstCommitDate = commits
      .map((commit) => commit?.commit?.author?.date)
      .filter(Boolean)
      .map((date) => new Date(date))
      .sort((a, b) => a - b)[0];

    if (!firstCommitDate) {
      continue;
    }

    const mergedDate = new Date(pr.merged_at);
    const leadTimeHours = (mergedDate - firstCommitDate) / (1000 * 60 * 60);
    leadTimesHours.push(leadTimeHours);
  }

  return leadTimesHours;
}

async function getDeploymentRecords() {
  const deployments = await paginate(
    (page) => `/repos/${owner}/${repo}/deployments?per_page=100&page=${page}`
  );

  const inWindow = deployments.filter((dep) => new Date(dep.created_at) >= since);
  const records = [];

  for (const dep of inWindow) {
    const statuses = await githubGet(
      `/repos/${owner}/${repo}/deployments/${dep.id}/statuses?per_page=1&page=1`
    );

    const latestStatus = Array.isArray(statuses) ? statuses[0] : null;
    const state = latestStatus?.state || "pending";

    records.push({
      id: dep.id,
      environment: dep.environment || "unknown",
      createdAt: dep.created_at,
      state
    });
  }

  return records.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function calculateMttrHours(records) {
  const failures = records.filter((r) => ["failure", "error", "inactive"].includes(r.state));
  const successes = records.filter((r) => r.state === "success");
  const recoveryHours = [];

  for (const failure of failures) {
    const failureTime = new Date(failure.createdAt);
    const recovered = successes.find((success) => new Date(success.createdAt) > failureTime);
    if (!recovered) {
      continue;
    }

    const recoveredTime = new Date(recovered.createdAt);
    const diffHours = (recoveredTime - failureTime) / (1000 * 60 * 60);
    recoveryHours.push(diffHours);
  }

  return recoveryHours;
}

function average(values) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function median(values) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

async function main() {
  const mergedPrs = await getMergedPullRequests();
  const leadTimesHours = await getPullRequestLeadTimes(mergedPrs);

  const deploymentRecords = await getDeploymentRecords();
  const successfulDeployments = deploymentRecords.filter((r) => r.state === "success");
  const failedDeployments = deploymentRecords.filter((r) =>
    ["failure", "error", "inactive"].includes(r.state)
  );

  const recoveryHours = calculateMttrHours(deploymentRecords);

  const totalDeployments = deploymentRecords.length;
  const leadTimeAvgHours = average(leadTimesHours);
  const leadTimeMedianHours = median(leadTimesHours);
  const deploymentsPerDay = successfulDeployments.length / Math.max(windowDays, 1);
  const mttrHours = average(recoveryHours);
  const changeFailureRate =
    totalDeployments === 0 ? 0 : (failedDeployments.length / totalDeployments) * 100;

  const metrics = {
    generatedAt: toIso(now),
    window: {
      days: windowDays,
      since: toIso(since),
      until: toIso(now)
    },
    dora: {
      leadTime: {
        averageHours: round(leadTimeAvgHours),
        medianHours: round(leadTimeMedianHours),
        sampleSize: leadTimesHours.length
      },
      deploymentFrequency: {
        successfulDeployments: successfulDeployments.length,
        deploymentsPerDay: round(deploymentsPerDay, 3)
      },
      mttr: {
        averageHours: round(mttrHours),
        recoverySamples: recoveryHours.length
      },
      changeFailureRate: {
        failedDeployments: failedDeployments.length,
        totalDeployments,
        percent: round(changeFailureRate)
      }
    },
    raw: {
      mergedPullRequests: mergedPrs.map((pr) => ({
        number: pr.number,
        title: pr.title,
        mergedAt: pr.merged_at,
        htmlUrl: pr.html_url
      })),
      deployments: deploymentRecords
    }
  };

  const report = [
    "# Weekly DORA Report",
    "",
    `- Generated at: ${metrics.generatedAt}`,
    `- Window: last ${windowDays} days (${metrics.window.since} to ${metrics.window.until})`,
    "",
    "## DORA 4 Metrics",
    "",
    "| Metric | Value |",
    "|---|---:|",
    `| Lead Time (avg) | ${metrics.dora.leadTime.averageHours} hours |`,
    `| Deployment Frequency | ${metrics.dora.deploymentFrequency.deploymentsPerDay} deploy/day |`,
    `| MTTR (avg) | ${metrics.dora.mttr.averageHours} hours |`,
    `| Change Failure Rate | ${metrics.dora.changeFailureRate.percent}% |`,
    "",
    "## Samples",
    "",
    `- Lead Time samples: ${metrics.dora.leadTime.sampleSize}`,
    `- Successful deployments: ${metrics.dora.deploymentFrequency.successfulDeployments}`,
    `- Failed deployments: ${metrics.dora.changeFailureRate.failedDeployments}`,
    `- MTTR recovery samples: ${metrics.dora.mttr.recoverySamples}`
  ].join("\n");

  const dashboardData = {
    generatedAt: metrics.generatedAt,
    windowDays,
    labels: ["Lead Time (h)", "Deploy/day", "MTTR (h)", "CFR (%)"],
    values: [
      metrics.dora.leadTime.averageHours,
      metrics.dora.deploymentFrequency.deploymentsPerDay,
      metrics.dora.mttr.averageHours,
      metrics.dora.changeFailureRate.percent
    ]
  };

  const artifactDir = path.join(process.cwd(), "artifacts");
  await fs.mkdir(artifactDir, { recursive: true });

  await fs.writeFile(
    path.join(artifactDir, "dora-metrics.json"),
    `${JSON.stringify(metrics, null, 2)}\n`,
    "utf8"
  );

  await fs.writeFile(path.join(artifactDir, "weekly-report.md"), `${report}\n`, "utf8");

  await fs.writeFile(
    path.join(artifactDir, "dashboard-data.json"),
    `${JSON.stringify(dashboardData, null, 2)}\n`,
    "utf8"
  );

  console.log("DORA metrics collection completed");
  console.log(JSON.stringify(metrics.dora, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
