import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const feedbackPath = path.join(root, "artifacts", "week13-persona-feedback.json");
const metricsPath = path.join(root, "artifacts", "week13-ab-metrics.json");
const summaryPath = path.join(root, "artifacts", "week13-experiment-summary.json");

function sumBy(rows, key) {
  return rows.reduce((acc, row) => acc + Number(row[key] || 0), 0);
}

function toRate(numerator, denominator) {
  if (!denominator) {
    return 0;
  }
  return numerator / denominator;
}

function percent(value) {
  return Number((value * 100).toFixed(2));
}

function computeVariantSummary(rows) {
  const users = sumBy(rows, "users");
  const engagedUsers = sumBy(rows, "engagedUsers");
  const taskSuccess = sumBy(rows, "taskSuccess");

  return {
    users,
    engagedUsers,
    taskSuccess,
    engagementRate: percent(toRate(engagedUsers, users)),
    taskSuccessRate: percent(toRate(taskSuccess, users))
  };
}

function computeFeedbackSummary(participants) {
  const count = participants.length;
  const avgSatisfaction = participants.reduce((acc, item) => acc + item.satisfaction, 0) / count;

  const signalCounts = participants.reduce(
    (acc, item) => {
      acc[item.decisionSignal] = (acc[item.decisionSignal] || 0) + 1;
      return acc;
    },
    { scale: 0, iterate: 0, pivot: 0 }
  );

  const frictionCounts = new Map();
  for (const participant of participants) {
    for (const friction of participant.frictionPoints) {
      frictionCounts.set(friction, (frictionCounts.get(friction) || 0) + 1);
    }
  }

  const topFrictions = [...frictionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  return {
    participants: count,
    averageSatisfaction: Number(avgSatisfaction.toFixed(2)),
    signals: signalCounts,
    topFrictions
  };
}

function decisionFromSignals(feedbackSummary, compactSummary, controlSummary) {
  const uplift = compactSummary.taskSuccessRate - controlSummary.taskSuccessRate;
  const positiveSignals = feedbackSummary.signals.scale + feedbackSummary.signals.iterate;
  const pivotSignals = feedbackSummary.signals.pivot;

  if (uplift >= 6 && positiveSignals > pivotSignals) {
    return "scale_compact_variant";
  }

  if (uplift >= 0 && pivotSignals <= 2) {
    return "iterate_compact_variant";
  }

  return "pivot_experiment_hypothesis";
}

async function main() {
  const [feedbackRaw, metricsRaw] = await Promise.all([
    fs.readFile(feedbackPath, "utf8"),
    fs.readFile(metricsPath, "utf8")
  ]);

  const feedbackJson = JSON.parse(feedbackRaw);
  const metricsJson = JSON.parse(metricsRaw);

  const feedbackSummary = computeFeedbackSummary(feedbackJson.participants);
  const controlSummary = computeVariantSummary(metricsJson.control);
  const compactSummary = computeVariantSummary(metricsJson.compact);

  const result = {
    generatedAt: new Date().toISOString(),
    experimentName: metricsJson.experimentName,
    window: metricsJson.window,
    feedbackSummary,
    abSummary: {
      control: controlSummary,
      compact: compactSummary,
      uplift: {
        engagementRate: Number((compactSummary.engagementRate - controlSummary.engagementRate).toFixed(2)),
        taskSuccessRate: Number((compactSummary.taskSuccessRate - controlSummary.taskSuccessRate).toFixed(2))
      }
    }
  };

  result.decision = {
    recommendation: decisionFromSignals(feedbackSummary, compactSummary, controlSummary),
    rationale: [
      `compact variant task success uplift: ${result.abSummary.uplift.taskSuccessRate}%p`,
      `compact variant engagement uplift: ${result.abSummary.uplift.engagementRate}%p`,
      `feedback signals (scale/iterate/pivot): ${feedbackSummary.signals.scale}/${feedbackSummary.signals.iterate}/${feedbackSummary.signals.pivot}`
    ]
  };

  await fs.writeFile(summaryPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(`week13 summary written to ${summaryPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});