import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import YAML from "yaml";
import { getDocument, getDocuments } from "./library";
import { targetRelativePath, validateInput, type GovernedDocumentInput } from "./governance";

const ROOT = path.resolve(process.cwd(), "..", "..", "foundation");
const GOVERNANCE = path.join(ROOT, "03-INSTITUTION", "Governance");
const HISTORY = path.join(GOVERNANCE, ".history");
const CHANGE_LOG = path.join(GOVERNANCE, "change-log.json");

export type ChangeRecord = {
  id: string;
  documentId: string;
  timestamp: string;
  action: "created" | "updated" | "retired";
  previousHash?: string;
  currentHash: string;
  amendmentReference?: string;
  summary: string;
  path: string;
  snapshot?: string;
};

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function readChangeLog(): ChangeRecord[] {
  if (!fs.existsSync(CHANGE_LOG)) return [];
  try { return JSON.parse(fs.readFileSync(CHANGE_LOG, "utf8")); } catch { return []; }
}

function writeChangeLog(records: ChangeRecord[]) {
  fs.mkdirSync(GOVERNANCE, { recursive: true });
  fs.writeFileSync(CHANGE_LOG, `${JSON.stringify(records, null, 2)}\n`);
}

export function getDocumentHistory(id: string) {
  return readChangeLog().filter((record) => record.documentId.toLowerCase() === id.toLowerCase()).reverse();
}

export function validateGovernedDocument(input: GovernedDocumentInput) {
  const docs = getDocuments();
  const ids = new Set(docs.map((doc) => doc.id.toUpperCase()));
  const existing = input.originalId ? getDocument(input.originalId) : undefined;
  const issues = validateInput(input, ids, existing?.status);
  const missing = input.dependencies.filter((dependency) => !ids.has(dependency.toUpperCase()));
  for (const dependency of missing) issues.push({ field: "dependencies", message: `Dependency ${dependency} is not registered.`, severity: "error" as const });
  return issues;
}

function renderMarkdown(input: GovernedDocumentInput) {
  const metadata: Record<string, unknown> = {
    id: input.id,
    title: input.title,
    class: input.className,
    status: input.status,
    layer: input.layer,
    stability: input.stability === "Unclassified" ? undefined : input.stability,
    evidence_score: input.evidence || undefined,
    necessity_score: input.necessity || undefined,
    dependencies: input.dependencies,
    amendment_reference: input.amendmentReference || undefined,
    updated_at: new Date().toISOString(),
  };
  Object.keys(metadata).forEach((key) => metadata[key] === undefined && delete metadata[key]);
  return matter.stringify(input.content.trim() + "\n", metadata);
}

export function saveGovernedDocument(input: GovernedDocumentInput) {
  const issues = validateGovernedDocument(input);
  if (issues.some((issue) => issue.severity === "error")) return { ok: false as const, issues };
  const existing = input.originalId ? getDocument(input.originalId) : undefined;
  const newRelative = targetRelativePath(input.id, input.title, input.className);
  const newAbsolute = path.join(ROOT, ...newRelative.split("/"));
  const markdown = renderMarkdown(input);
  fs.mkdirSync(path.dirname(newAbsolute), { recursive: true });
  let previousHash: string | undefined;
  let snapshot: string | undefined;
  if (existing) {
    const previousAbsolute = path.join(ROOT, ...existing.path.split("/"));
    const previousRaw = fs.readFileSync(previousAbsolute, "utf8");
    previousHash = hash(previousRaw);
    fs.mkdirSync(HISTORY, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    snapshot = path.posix.join("03-INSTITUTION/Governance/.history", `${existing.id}-${stamp}.md`);
    fs.writeFileSync(path.join(ROOT, ...snapshot.split("/")), previousRaw);
    if (previousAbsolute !== newAbsolute) fs.unlinkSync(previousAbsolute);
  }
  fs.writeFileSync(newAbsolute, markdown);
  const currentHash = hash(markdown);
  const records = readChangeLog();
  records.push({
    id: `CHG-${String(records.length + 1).padStart(4, "0")}`,
    documentId: input.id,
    timestamp: new Date().toISOString(),
    action: existing ? (input.status === "Retired" ? "retired" : "updated") : "created",
    previousHash,
    currentHash,
    amendmentReference: input.amendmentReference || undefined,
    summary: input.changeSummary || (existing ? "Document updated." : "Document created."),
    path: newRelative,
    snapshot,
  });
  writeChangeLog(records);
  return { ok: true as const, issues, documentId: input.id, path: newRelative };
}

export function getReleaseManifest() {
  const documents = getDocuments();
  const changes = readChangeLog();
  return {
    release: "Library of Eternity Platform v0.4 / Foundation v1.0 RC1",
    generatedAt: new Date().toISOString(),
    researchLock: true,
    documents: documents.map((document) => ({ id: document.id, title: document.title, class: document.className, status: document.status, path: document.path })),
    workflow: documents.reduce<Record<string, number>>((acc, document) => { acc[document.status] = (acc[document.status] ?? 0) + 1; return acc; }, {}),
    recentChanges: changes.slice(-20).reverse(),
  };
}

export function writeReleaseManifest() {
  const manifest = getReleaseManifest();
  const output = path.join(ROOT, "08-PUBLICATION", "Releases", "release-manifest-v0.4.yaml");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, YAML.stringify(manifest));
  return path.relative(ROOT, output).replaceAll(path.sep, "/");
}
