import type { BuilderDocumentV2, BuilderElement } from "../types";

export interface BuilderValidationIssue {
  code: string;
  message: string;
  elementId?: string;
  sectionId?: string;
  pageId?: string;
}

/**
 * Structural validation for V2 documents.
 * Does not validate content against block schemas (see lib/builder/ai/validate.ts).
 */
export function validateBuilderDocumentV2(doc: BuilderDocumentV2): BuilderValidationIssue[] {
  const issues: BuilderValidationIssue[] = [];
  const elementIds = new Set(Object.keys(doc.elements));
  const sectionIds = new Set(Object.keys(doc.sections));

  for (const page of doc.pages) {
    for (const sectionId of page.sections) {
      if (!sectionIds.has(sectionId)) {
        issues.push({
          code: "PAGE_ORPHAN_SECTION",
          message: `Page "${page.id}" references missing section "${sectionId}"`,
          pageId: page.id,
          sectionId,
        });
      }
    }
  }

  for (const [sectionId, section] of Object.entries(doc.sections)) {
    if (!elementIds.has(section.rootElementId)) {
      issues.push({
        code: "SECTION_ORPHAN_ROOT",
        message: `Section "${sectionId}" references missing root element "${section.rootElementId}"`,
        sectionId,
        elementId: section.rootElementId,
      });
    }

    for (const childId of section.elements) {
      if (!elementIds.has(childId)) {
        issues.push({
          code: "SECTION_ORPHAN_CHILD",
          message: `Section "${sectionId}" references missing child element "${childId}"`,
          sectionId,
          elementId: childId,
        });
      }
    }
  }

  for (const [elementId, element] of Object.entries(doc.elements)) {
    if (element.parentId !== null && !elementIds.has(element.parentId)) {
      issues.push({
        code: "ELEMENT_ORPHAN_PARENT",
        message: `Element "${elementId}" references missing parent "${element.parentId}"`,
        elementId,
      });
    }

    for (const childId of element.children) {
      if (!elementIds.has(childId)) {
        issues.push({
          code: "ELEMENT_ORPHAN_CHILD",
          message: `Element "${elementId}" references missing child "${childId}"`,
          elementId,
        });
      } else {
        const child = doc.elements[childId];
        if (child.parentId !== elementId) {
          issues.push({
            code: "ELEMENT_PARENT_MISMATCH",
            message: `Element "${childId}" parentId does not match parent "${elementId}"`,
            elementId: childId,
          });
        }
      }
    }
  }

  return issues;
}

/** Collect element id and all descendants. */
export function collectSubtree(
  elements: Record<string, BuilderElement>,
  rootId: string
): Record<string, BuilderElement> {
  const result: Record<string, BuilderElement> = {};
  const queue = [rootId];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (result[id]) continue;
    const el = elements[id];
    if (!el) continue;
    result[id] = el;
    queue.push(...el.children);
  }

  return result;
}

/** Find section id owning a given element (root or descendant). */
export function findSectionForElement(
  doc: BuilderDocumentV2,
  elementId: string
): string | null {
  for (const [sectionId, section] of Object.entries(doc.sections)) {
    if (section.rootElementId === elementId) return sectionId;
    const subtree = collectSubtree(doc.elements, section.rootElementId);
    if (elementId in subtree) return sectionId;
  }
  return null;
}
