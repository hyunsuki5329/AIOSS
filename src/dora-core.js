function toTimestamp(value) {
  const time = Date.parse(value);
  if (Number.isNaN(time)) {
    throw new Error(`Invalid date: ${value}`);
  }
  return time;
}

export function calculateLeadTimeHours(changeCreatedAt, deployedAt) {
  const start = toTimestamp(changeCreatedAt);
  const end = toTimestamp(deployedAt);
  if (end < start) {
    throw new Error("Deployment time cannot be earlier than change creation time");
  }
  return (end - start) / (1000 * 60 * 60);
}

export function calculateDeploymentFrequency(deployments, windowDays) {
  if (!Number.isFinite(windowDays) || windowDays <= 0) {
    throw new Error("windowDays must be a positive number");
  }
  if (!Array.isArray(deployments)) {
    throw new Error("deployments must be an array");
  }
  return deployments.length / windowDays;
}

export function calculateChangeFailureRate(failedDeployments, totalDeployments) {
  if (!Number.isInteger(totalDeployments) || totalDeployments < 0) {
    throw new Error("totalDeployments must be a non-negative integer");
  }
  if (!Number.isInteger(failedDeployments) || failedDeployments < 0) {
    throw new Error("failedDeployments must be a non-negative integer");
  }
  if (failedDeployments > totalDeployments) {
    throw new Error("failedDeployments cannot exceed totalDeployments");
  }
  if (totalDeployments === 0) {
    return 0;
  }
  return (failedDeployments / totalDeployments) * 100;
}

export function calculateMttrHours(incidentResolvedAt, incidentStartedAt) {
  const resolved = toTimestamp(incidentResolvedAt);
  const started = toTimestamp(incidentStartedAt);
  if (resolved < started) {
    throw new Error("Incident resolved time cannot be earlier than started time");
  }
  return (resolved - started) / (1000 * 60 * 60);
}

export function buildDoraSnapshot(input) {
  const {
    changeCreatedAt,
    deployedAt,
    deployments,
    windowDays,
    failedDeployments,
    totalDeployments,
    incidentResolvedAt,
    incidentStartedAt
  } = input;

  return {
    leadTimeHours: calculateLeadTimeHours(changeCreatedAt, deployedAt),
    deploymentFrequencyPerDay: calculateDeploymentFrequency(deployments, windowDays),
    changeFailureRatePercent: calculateChangeFailureRate(failedDeployments, totalDeployments),
    mttrHours: calculateMttrHours(incidentResolvedAt, incidentStartedAt)
  };
}