import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateLeadTimeHours,
  calculateDeploymentFrequency,
  calculateChangeFailureRate,
  calculateMttrHours,
  buildDoraSnapshot
} from "../src/dora-core.js";

test("calculateLeadTimeHours returns elapsed hours", () => {
  const result = calculateLeadTimeHours("2026-05-01T00:00:00.000Z", "2026-05-01T06:30:00.000Z");
  assert.equal(result, 6.5);
});

test("calculateLeadTimeHours rejects reverse timeline", () => {
  assert.throws(
    () => calculateLeadTimeHours("2026-05-02T12:00:00.000Z", "2026-05-02T11:00:00.000Z"),
    /cannot be earlier/
  );
});

test("calculateDeploymentFrequency returns deployments per day", () => {
  const result = calculateDeploymentFrequency(["d1", "d2", "d3", "d4"], 2);
  assert.equal(result, 2);
});

test("calculateDeploymentFrequency validates window", () => {
  assert.throws(() => calculateDeploymentFrequency(["d1"], 0), /positive number/);
});

test("calculateChangeFailureRate returns percentage", () => {
  const result = calculateChangeFailureRate(1, 4);
  assert.equal(result, 25);
});

test("calculateChangeFailureRate handles zero deployments", () => {
  const result = calculateChangeFailureRate(0, 0);
  assert.equal(result, 0);
});

test("calculateChangeFailureRate validates upper bound", () => {
  assert.throws(() => calculateChangeFailureRate(3, 2), /cannot exceed/);
});

test("calculateMttrHours returns incident recovery hours", () => {
  const result = calculateMttrHours("2026-05-04T12:00:00.000Z", "2026-05-04T09:30:00.000Z");
  assert.equal(result, 2.5);
});

test("calculateMttrHours rejects reverse timeline", () => {
  assert.throws(
    () => calculateMttrHours("2026-05-05T07:00:00.000Z", "2026-05-05T08:00:00.000Z"),
    /cannot be earlier/
  );
});

test("buildDoraSnapshot composes all KPIs", () => {
  const snapshot = buildDoraSnapshot({
    changeCreatedAt: "2026-05-01T00:00:00.000Z",
    deployedAt: "2026-05-01T08:00:00.000Z",
    deployments: ["d1", "d2", "d3"],
    windowDays: 3,
    failedDeployments: 1,
    totalDeployments: 3,
    incidentResolvedAt: "2026-05-02T05:30:00.000Z",
    incidentStartedAt: "2026-05-02T02:30:00.000Z"
  });

  assert.deepEqual(snapshot, {
    leadTimeHours: 8,
    deploymentFrequencyPerDay: 1,
    changeFailureRatePercent: 33.33333333333333,
    mttrHours: 3
  });
});