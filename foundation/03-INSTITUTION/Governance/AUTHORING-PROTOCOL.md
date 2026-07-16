---
id: GOV-0001
title: Governed Authoring Protocol
document_class: DOC
class: DOC
status: Approved
layer: Institution
version: 1.0
stability: CSC-3
provenance: {origin: Platform v0.3 authoring implementation, source: LC-0001}
evidence_score: E2
necessity_score: N3
last_updated: 2026-07-15
dependencies:
  - LC-0001
  - LC-0005
  - LC-0006
---

# Governed Authoring Protocol

All repository changes must pass validation before entry into the Foundation repository.

## Workflow

1. Create or open a governed record.
2. Declare its constitutional class, workflow state, stability, evidence, necessity, and dependencies.
3. Run validation.
4. Resolve all errors.
5. Save the record.
6. Review the generated change-log entry and snapshot trail.

## Research Lock

While Research Lock is active, the platform prohibits creation of new AA, FO, and ADR records. Existing records may be revised only through the amendment controls defined by the Constitution.

## Locked records

Revising an Approved or Locked record requires an amendment reference. Previous content is preserved as an immutable local snapshot before the revision is written.
