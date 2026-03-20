import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://api.github.com";
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;

// Mock mode: use sample data if token not available
const useMockData = !token || !repository;

let owner = "demo";
let repo = "aioss";

if (!useMockData) {
  if (!repository || !repository.includes("/")) {
    throw new Error("GITHUB_REPOSITORY must be owner/repo");
  }
  [owner, repo] = repository.split("/");
}

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28"
};

function toDate(value) {
  return value ? new Date(value) : null;
}

function avg(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function pointsFromLabels(labels) {
  const names = labels.map((l) => l.name);
  if (names.includes("size/l")) return 5;
  if (names.includes("size/m")) return 3;
  if (names.includes("size/s")) return 2;
  if (names.includes("size/xs")) return 1;
  return 1;
}

async function githubGet(pathname) {
  const response = await fetch(`${BASE_URL}${pathname}`, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API failed (${response.status}): ${text}`);
  }
  return response.json();
}

async function paginate(pathBuilder) {
  const merged = [];
  for (let page = 1; page <= 10; page += 1) {
    const chunk = await githubGet(pathBuilder(page));
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    merged.push(...chunk);
    if (chunk.length < 100) break;
  }
  return merged;
}

async function main() {
  let milestones = [];
  let allIssues = [];

  if (useMockData) {
    console.log("📝 Using mock data (no GITHUB_TOKEN provided)");
    
    // Mock milestones
    milestones = [
      {
        number: 1,
        title: "Sprint 1 (2026-03-20 ~ 2026-04-02)",
        created_at: "2026-03-20T00:00:00Z",
        due_on: "2026-04-02T15:00:00Z"
      },
      {
        number: 2,
        title: "Sprint 2 (2026-04-03 ~ 2026-04-16)",
        created_at: "2026-04-03T00:00:00Z",
        due_on: "2026-04-16T15:00:00Z"
      }
    ];

    // Mock issues with realistic cycle times
    const now = new Date();
    const dayAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

    allIssues = [
      {
        number: 1,
        title: "[Sprint1] Grafana 대시보드 패널 오류 수정",
        state: "closed",
        created_at: dayAgo(15).toISOString(),
        closed_at: dayAgo(8).toISOString(),
        labels: [{ name: "type/bug" }, { name: "size/s" }],
        milestone: { number: 1 }
      },
      {
        number: 2,
        title: "[Sprint1] Prometheus scrape 실패 알림 룰 추가",
        state: "closed",
        created_at: dayAgo(14).toISOString(),
        closed_at: dayAgo(5).toISOString(),
        labels: [{ name: "type/feature" }, { name: "size/m" }],
        milestone: { number: 1 }
      },
      {
        number: 3,
        title: "[Sprint1] dora-metrics.mjs 예외 처리 강화",
        state: "closed",
        created_at: dayAgo(12).toISOString(),
        closed_at: dayAgo(2).toISOString(),
        labels: [{ name: "type/feature" }, { name: "size/s" }],
        milestone: { number: 1 }
      },
      {
        number: 4,
        title: "[Sprint1] 배포 실패 원인 자동 분류 스크립트 개선",
        state: "closed",
        created_at: dayAgo(10).toISOString(),
        closed_at: dayAgo(3).toISOString(),
        labels: [{ name: "type/chore" }, { name: "size/m" }],
        milestone: { number: 1 }
      },
      {
        number: 5,
        title: "[Sprint1] 민원 구조화 샘플 데이터 검증 케이스 추가",
        state: "open",
        created_at: dayAgo(8).toISOString(),
        closed_at: null,
        labels: [{ name: "type/feature" }, { name: "size/m" }],
        milestone: { number: 1 }
      },
      {
        number: 6,
        title: "[Sprint2] 유사 민원 검색 Recall@5 리포트 자동화",
        state: "closed",
        created_at: dayAgo(20).toISOString(),
        closed_at: dayAgo(10).toISOString(),
        labels: [{ name: "type/feature" }, { name: "size/m" }],
        milestone: { number: 2 }
      },
      {
        number: 7,
        title: "[Sprint2] RAG 응답 출처 하이라이트 품질 개선",
        state: "closed",
        created_at: dayAgo(18).toISOString(),
        closed_at: dayAgo(9).toISOString(),
        labels: [{ name: "type/bug" }, { name: "size/s" }],
        milestone: { number: 2 }
      },
      {
        number: 8,
        title: "[Sprint2] ChromaDB 메타데이터 필터 성능 튜닝",
        state: "open",
        created_at: dayAgo(12).toISOString(),
        closed_at: null,
        labels: [{ name: "type/feature" }, { name: "size/l" }],
        milestone: { number: 2 }
      },
      {
        number: 9,
        title: "[Sprint2] API 응답 지연시간 p95 대시보드 추가",
        state: "open",
        created_at: dayAgo(5).toISOString(),
        closed_at: null,
        labels: [{ name: "type/feature" }, { name: "size/s" }],
        milestone: { number: 2 }
      },
      {
        number: 10,
        title: "[Sprint2] CI 워크플로 병렬화로 빌드 시간 단축",
        state: "open",
        created_at: dayAgo(3).toISOString(),
        closed_at: null,
        labels: [{ name: "type/chore" }, { name: "size/m" }],
        milestone: { number: 2 }
      }
    ];
  } else {
    milestones = await githubGet(`/repos/${owner}/${repo}/milestones?state=all&per_page=100`);
    const rawIssues = await paginate(
      (page) => `/repos/${owner}/${repo}/issues?state=all&per_page=100&page=${page}`
    );
    allIssues = rawIssues.filter((item) => !item.pull_request);
  }

  const sprintMilestones = milestones.filter((m) => /^Sprint\s\d+/i.test(m.title));

  const pureIssues = allIssues.filter((item) => {
    if (useMockData) return true; // mock data are already pure issues
    return !item.pull_request;
  });

  const cycleByIssue = pureIssues
    .filter((i) => i.closed_at)
    .map((i) => {
      const created = toDate(i.created_at);
      const closed = toDate(i.closed_at);
      const cycleDays = (closed - created) / (1000 * 60 * 60 * 24);
      return {
        number: i.number,
        title: i.title,
        createdAt: i.created_at,
        closedAt: i.closed_at,
        cycleDays: round(cycleDays)
      };
    });

  const milestoneSummaries = sprintMilestones
    .map((milestone) => {
      const issues = pureIssues.filter((i) => i.milestone && i.milestone.number === milestone.number);
      const closedIssues = issues.filter((i) => i.state === "closed");

      const committedPoints = issues.reduce((acc, issue) => acc + pointsFromLabels(issue.labels), 0);
      const completedPoints = closedIssues.reduce((acc, issue) => acc + pointsFromLabels(issue.labels), 0);

      return {
        milestone: milestone.title,
        dueOn: milestone.due_on,
        totalIssues: issues.length,
        closedIssues: closedIssues.length,
        committedPoints,
        completedPoints,
        velocityPercent: committedPoints === 0 ? 0 : round((completedPoints / committedPoints) * 100)
      };
    })
    .sort((a, b) => (a.milestone > b.milestone ? 1 : -1));

  const latestSprint = sprintMilestones.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )[0];

  let burndown = [];
  if (latestSprint) {
    const sprintIssues = pureIssues.filter(
      (i) => i.milestone && i.milestone.number === latestSprint.number
    );

    const start = toDate(latestSprint.created_at);
    const end = toDate(latestSprint.due_on || new Date().toISOString());
    const totalPoints = sprintIssues.reduce((acc, issue) => acc + pointsFromLabels(issue.labels), 0);

    for (
      let cursor = new Date(start.getTime());
      cursor <= end;
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
    ) {
      const donePoints = sprintIssues
        .filter((i) => i.closed_at && toDate(i.closed_at) <= cursor)
        .reduce((acc, issue) => acc + pointsFromLabels(issue.labels), 0);

      burndown.push({
        date: cursor.toISOString().slice(0, 10),
        remainingPoints: Math.max(totalPoints - donePoints, 0)
      });
    }
  }

  const metrics = {
    generatedAt: new Date().toISOString(),
    cycleTime: {
      sampleSize: cycleByIssue.length,
      averageDays: round(avg(cycleByIssue.map((i) => i.cycleDays))),
      issues: cycleByIssue
    },
    velocity: {
      milestones: milestoneSummaries
    },
    burndown: {
      sprint: latestSprint ? latestSprint.title : null,
      points: burndown
    }
  };

  const report = [
    "# Sprint Metrics Report",
    "",
    `- Generated at: ${metrics.generatedAt}`,
    "",
    "## Cycle Time",
    `- Average: ${metrics.cycleTime.averageDays} days (sample: ${metrics.cycleTime.sampleSize})`,
    "",
    "## Velocity",
    "| Sprint | Closed/Total Issues | Completed/Committed Points | Velocity |",
    "|---|---:|---:|---:|",
    ...metrics.velocity.milestones.map(
      (m) => `| ${m.milestone} | ${m.closedIssues}/${m.totalIssues} | ${m.completedPoints}/${m.committedPoints} | ${m.velocityPercent}% |`
    ),
    "",
    "## Burndown",
    `- Sprint: ${metrics.burndown.sprint || "N/A"}`,
    `- Points samples: ${metrics.burndown.points.length}`
  ].join("\n");

  const artifactDir = path.join(process.cwd(), "artifacts");
  await fs.mkdir(artifactDir, { recursive: true });

  await fs.writeFile(
    path.join(artifactDir, "sprint-metrics.json"),
    `${JSON.stringify(metrics, null, 2)}\n`,
    "utf8"
  );

  await fs.writeFile(path.join(artifactDir, "sprint-metrics-report.md"), `${report}\n`, "utf8");

  console.log("Sprint metrics generated");
  if (useMockData) {
    console.log("⚠️  Using mock data. For real metrics, set GITHUB_TOKEN and GITHUB_REPOSITORY env vars.");
  }
  console.log(JSON.stringify({
    cycleTimeAvgDays: metrics.cycleTime.averageDays,
    velocityMilestones: metrics.velocity.milestones.length,
    burndownSamples: metrics.burndown.points.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
