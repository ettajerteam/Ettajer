import { getImplementedBlocks } from "../block-registry";
import type { BlockId } from "../types";
import { stubProvider } from "./providers/stub-provider";
import type { AiGenerationProvider } from "./provider";
import {
  validateGeneratedPage,
  validateGeneratedSection,
  validateGeneratedSite,
} from "./validate";
import type {
  AiGeneratedPage,
  AiGeneratedSection,
  AiGeneratedSite,
  AiGeneratedTheme,
  AiGenerationContext,
  AiGenerationPrompt,
  AiGenerationResult,
} from "./types";

export interface GenerateOptions {
  provider?: AiGenerationProvider;
  context?: Partial<AiGenerationContext>;
}

function normalizePrompt(prompt: string | AiGenerationPrompt): AiGenerationPrompt {
  if (typeof prompt === "string") {
    return { text: prompt.trim() };
  }
  return { ...prompt, text: prompt.text.trim() };
}

function buildContext(
  prompt: AiGenerationPrompt,
  partial?: Partial<AiGenerationContext>
): AiGenerationContext {
  return {
    prompt,
    availableBlocks: getImplementedBlocks().map((b) => b.id),
    ...partial,
  };
}

function resolveProvider(options?: GenerateOptions): AiGenerationProvider {
  return options?.provider ?? stubProvider;
}

async function runWithValidation<T>(
  fn: () => Promise<T>,
  validate: (data: T) => string[]
): Promise<AiGenerationResult<T>> {
  try {
    const data = await fn();
    const warnings = validate(data);
    return { success: true, data, warnings: warnings.length > 0 ? warnings : undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return { success: false, error: message };
  }
}

export async function generateSite(
  prompt: string | AiGenerationPrompt,
  options?: GenerateOptions
): Promise<AiGenerationResult<AiGeneratedSite>> {
  const normalized = normalizePrompt(prompt);
  const ctx = buildContext(normalized, options?.context);
  const provider = resolveProvider(options);

  if (!provider.generateSite) {
    return { success: false, error: `Provider "${provider.id}" does not support generateSite` };
  }

  return runWithValidation(
    () => provider.generateSite!(normalized, ctx),
    validateGeneratedSite
  );
}

export async function generatePage(
  prompt: string | AiGenerationPrompt,
  options?: GenerateOptions
): Promise<AiGenerationResult<AiGeneratedPage>> {
  const normalized = normalizePrompt(prompt);
  const ctx = buildContext(normalized, options?.context);
  const provider = resolveProvider(options);

  if (!provider.generatePage) {
    return { success: false, error: `Provider "${provider.id}" does not support generatePage` };
  }

  return runWithValidation(
    () => provider.generatePage!(normalized, ctx),
    validateGeneratedPage
  );
}

export async function generateSection(
  prompt: string | AiGenerationPrompt,
  options?: GenerateOptions & { blockId?: BlockId }
): Promise<AiGenerationResult<AiGeneratedSection>> {
  const normalized = normalizePrompt(prompt);
  const ctx = buildContext(normalized, {
    ...options?.context,
  });
  const provider = resolveProvider(options);

  if (!provider.generateSection) {
    return { success: false, error: `Provider "${provider.id}" does not support generateSection` };
  }

  return runWithValidation(
    () => provider.generateSection!(normalized, { ...ctx, blockId: options?.blockId }),
    validateGeneratedSection
  );
}

export async function generateTheme(
  prompt: string | AiGenerationPrompt,
  options?: GenerateOptions
): Promise<AiGenerationResult<AiGeneratedTheme>> {
  const normalized = normalizePrompt(prompt);
  const ctx = buildContext(normalized, options?.context);
  const provider = resolveProvider(options);

  if (!provider.generateTheme) {
    return { success: false, error: `Provider "${provider.id}" does not support generateTheme` };
  }

  const result = await runWithValidation(
    () => provider.generateTheme!(normalized, ctx),
    () => []
  );

  return result;
}
