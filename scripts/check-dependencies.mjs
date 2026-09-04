import { readFile } from "node:fs/promises";

const lock = JSON.parse(await readFile(new URL("../package-lock.json", import.meta.url), "utf8"));

function compare(version, target) {
  const left = version.split(".").map(Number);
  const right = target.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

function isAffected(version) {
  const major = Number(version.split(".")[0]);
  if (major === 1) return compare(version, "1.1.18") < 0;
  if (major === 2) return compare(version, "2.1.4") < 0;
  if (major === 3) return compare(version, "3.0.6") < 0;
  if (major === 4) return true;
  if (major === 5) return compare(version, "5.0.9") < 0;
  return false;
}

const packages = Object.entries(lock.packages || {});
const braceExpansion = packages
  .filter(([path]) => path.endsWith("/brace-expansion"))
  .map(([path, metadata]) => ({ path, version: metadata.version }));
const affected = braceExpansion.filter(({ version }) => isAffected(version));
const foreignRegistry = packages.filter(([, metadata]) =>
  metadata.resolved && !metadata.resolved.startsWith("https://registry.npmjs.org/")
);

if (affected.length || foreignRegistry.length) {
  console.error(JSON.stringify({ affected, foreignRegistry: foreignRegistry.map(([path]) => path) }, null, 2));
  process.exit(1);
}

console.log(`Dependency check passed (${braceExpansion.map(({ version }) => version).join(", ") || "no brace-expansion"}).`);
