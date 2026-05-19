import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { existsSync } from "node:fs";

const root = process.cwd();
const git = process.env.GIT_EXE || [
  "C:\\Program Files\\Git\\cmd\\git.exe",
  "C:\\Program Files\\Git\\bin\\git.exe",
  "C:\\Program Files (x86)\\Git\\cmd\\git.exe"
].find((candidate) => existsSync(candidate)) || "git";
const sensitivePathPatterns = [
  /^data\//i,
  /^generated\//i,
  /^external-resources\//i,
  /^tools\/ComfyUI/i,
  /\.env$/i,
  /\.env\./i,
  /\.(sqlite|db|pem|key|pfx|crt|bak|zip|7z)$/i
];

const secretPatterns = [
  { name: "GitHub token", pattern: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/g },
  { name: "GitHub fine-grained token", pattern: /\bgithub_pat_[A-Za-z0-9_]{40,}\b/g },
  { name: "OpenAI-style key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { name: "OpenRouter key", pattern: /\bsk-or-v1-[A-Za-z0-9_-]{20,}\b/g },
  { name: "Google API key", pattern: /\bAIza[0-9A-Za-z_-]{25,}\b/g },
  { name: "Private key block", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  {
    name: "Hardcoded secret assignment",
    pattern: /\b(api[_-]?key|secret|token|password|senha|private[_-]?key)\b\s*[:=]\s*["']?([A-Za-z0-9_./+=:-]{20,})["']?/gi
  }
];

const placeholderWords = [
  "placeholder",
  "example",
  "troque",
  "sua-chave",
  "nome-do-modelo",
  "password",
  "root_password",
  "app_password",
  "USER",
  "PASSWORD",
  "aurora_local_dev",
  "aurora_root_dev",
  "latest"
];

function trackedFiles() {
  return execFileSync(git, ["ls-files"], { cwd: root, encoding: "utf8" })
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);
}

function lineForOffset(text, offset) {
  return text.slice(0, offset).split(/\r?\n/).length;
}

function looksLikePlaceholder(value) {
  const normalized = String(value || "").toLowerCase();
  return placeholderWords.some((word) => normalized.includes(word.toLowerCase()));
}

const findings = [];

for (const file of trackedFiles()) {
  const normalized = file.replace(/\\/g, "/");
  if (sensitivePathPatterns.some((pattern) => pattern.test(normalized))) {
    findings.push(`${file}: arquivo sensivel ou operacional esta versionado.`);
    continue;
  }

  const fullPath = path.join(root, file);
  let text = "";
  try {
    text = readFileSync(fullPath, "utf8");
  } catch {
    continue;
  }

  for (const check of secretPatterns) {
    check.pattern.lastIndex = 0;
    for (const match of text.matchAll(check.pattern)) {
      const value = match[2] || match[0];
      if (looksLikePlaceholder(value)) continue;
      findings.push(`${file}:${lineForOffset(text, match.index || 0)} possivel segredo: ${check.name}`);
    }
  }
}

if (findings.length) {
  console.error("Security scan failed:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("Security scan passed: no tracked secrets or sensitive local files found.");
