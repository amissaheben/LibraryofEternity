export const DOCUMENT_CLASSES = ["AA", "LAW", "LC", "FO", "ADR", "EP", "ES", "RP", "AR", "IA", "IRN", "IH", "IP", "TC", "TM", "EV", "DOC"] as const;
export const WORKFLOW_STATES = ["Draft", "Under Review", "Approved", "Locked", "Retired"] as const;
export const STABILITY_CLASSES = ["CSC-0", "CSC-1", "CSC-2", "CSC-3", "Unclassified"] as const;
export const EVIDENCE_SCORES = ["E0", "E1", "E2", "E3", "E4", "E5", ""] as const;
export const NECESSITY_SCORES = ["N0", "N1", "N2", "N3", "N4", "N5", ""] as const;

export type DocumentClass = (typeof DOCUMENT_CLASSES)[number];
export type WorkflowState = (typeof WORKFLOW_STATES)[number];

const classDirectories: Record<DocumentClass, string> = {
  AA: "01-FOUNDATION/AA",
  LAW: "01-FOUNDATION/Laws",
  LC: "00-CONSTITUTION",
  FO: "01-FOUNDATION/FO",
  ADR: "01-FOUNDATION/ADR",
  EP: "01-FOUNDATION/EP",
  ES: "01-FOUNDATION/ES",
  RP: "02-RESEARCH/RP",
  AR: "02-RESEARCH/AR",
  IA: "02-RESEARCH/IA",
  IRN: "02-RESEARCH/IRN",
  IH: "03-INSTITUTION/IH",
  IP: "03-INSTITUTION/IP",
  TC: "03-INSTITUTION/TC",
  TM: "03-INSTITUTION/TM",
  EV: "02-RESEARCH/Evidence",
  DOC: "03-INSTITUTION/Governance",
};

export function classDirectory(className: DocumentClass) {
  return classDirectories[className];
}

export function idMatchesClass(id: string, className: DocumentClass) {
  if (className === "DOC") return /^[A-Z][A-Z0-9-]*-\d{4}$/i.test(id);
  return new RegExp(`^${className}-\\d{4}$`, "i").test(id);
}

export function slugifyTitle(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function targetRelativePath(id: string, title: string, className: DocumentClass) {
  return `${classDirectory(className)}/${id}-${slugifyTitle(title) || "Untitled"}.md`;
}

export type GovernedDocumentInput = {
  originalId?: string;
  id: string;
  title: string;
  className: DocumentClass;
  status: WorkflowState;
  layer: string;
  stability: string;
  evidence: string;
  necessity: string;
  dependencies: string[];
  amendmentReference?: string;
  changeSummary?: string;
  content: string;
};

export type ValidationIssue = { field: string; message: string; severity: "error" | "warning" };

export function validateInput(input: GovernedDocumentInput, existingIds: Set<string>, existingStatus?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!input.id.trim()) issues.push({ field: "id", message: "Document ID is required.", severity: "error" });
  if (!idMatchesClass(input.id.trim(), input.className)) issues.push({ field: "id", message: `ID must match ${input.className}-0000.`, severity: "error" });
  if (!input.title.trim()) issues.push({ field: "title", message: "Title is required.", severity: "error" });
  if (!input.content.trim()) issues.push({ field: "content", message: "Document content is required.", severity: "error" });
  if (existingIds.has(input.id.toUpperCase()) && input.originalId?.toUpperCase() !== input.id.toUpperCase()) {
    issues.push({ field: "id", message: "A document with this ID already exists.", severity: "error" });
  }
  if (input.dependencies.some((dependency) => dependency.toUpperCase() === input.id.toUpperCase())) {
    issues.push({ field: "dependencies", message: "A document cannot depend on itself.", severity: "error" });
  }
  if (["Locked", "Approved"].includes(existingStatus ?? "") && !input.amendmentReference?.trim()) {
    issues.push({ field: "amendmentReference", message: "Editing an approved or locked record requires an amendment reference.", severity: "error" });
  }
  if (input.status === "Locked" && !input.changeSummary?.trim()) {
    issues.push({ field: "changeSummary", message: "Locking a record requires a change summary.", severity: "error" });
  }
  if (["AA", "FO", "ADR"].includes(input.className) && !input.originalId) {
    issues.push({ field: "className", message: `${input.className} creation is blocked while Research Lock is active. Create a research artifact instead.`, severity: "error" });
  }
  if (input.dependencies.length === 0 && !["AA", "LAW", "LC", "IH", "IP", "TC", "TM"].includes(input.className)) {
    issues.push({ field: "dependencies", message: "Derived records should declare at least one dependency.", severity: "warning" });
  }
  return issues;
}
