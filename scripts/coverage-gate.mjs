import { spawn } from "node:child_process";

const THRESHOLD = {
  line: 80,
  branch: 80,
  funcs: 80
};

const child = spawn(process.execPath, ["--test", "--experimental-test-coverage"], {
  stdio: ["inherit", "pipe", "pipe"],
  env: process.env
});

let combinedOutput = "";

child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  combinedOutput += text;
  process.stdout.write(text);
});

child.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  combinedOutput += text;
  process.stderr.write(text);
});

child.on("close", (code) => {
  if (code !== 0) {
    process.exit(code ?? 1);
    return;
  }

  const match = combinedOutput.match(/all files\s+\|\s+([0-9.]+)\s+\|\s+([0-9.]+)\s+\|\s+([0-9.]+)/i);
  if (!match) {
    console.error("Coverage summary for 'all files' was not found.");
    process.exit(1);
    return;
  }

  const [line, branch, funcs] = match.slice(1).map((value) => Number(value));

  const failures = [];
  if (line < THRESHOLD.line) failures.push(`line ${line.toFixed(2)} < ${THRESHOLD.line}`);
  if (branch < THRESHOLD.branch) failures.push(`branch ${branch.toFixed(2)} < ${THRESHOLD.branch}`);
  if (funcs < THRESHOLD.funcs) failures.push(`funcs ${funcs.toFixed(2)} < ${THRESHOLD.funcs}`);

  if (failures.length > 0) {
    console.error(`Coverage gate failed: ${failures.join(", ")}`);
    process.exit(1);
    return;
  }

  console.log(
    `Coverage gate passed: line=${line.toFixed(2)} branch=${branch.toFixed(2)} funcs=${funcs.toFixed(2)}`
  );
});