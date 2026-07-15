import type { BlockId } from "../types";
import type {
  AiGeneratedPage,
  AiGeneratedSection,
  AiGeneratedSite,
  AiGeneratedTheme,
  AiGenerationContext,
  AiGenerationPrompt,
} from "./types";

export interface AiGenerationProvider {
  id: string;
  name: string;
  generateSite?(
    prompt: AiGenerationPrompt,
    ctx: AiGenerationContext
  ): Promise<AiGeneratedSite>;
  generatePage?(
    prompt: AiGenerationPrompt,
    ctx: AiGenerationContext
  ): Promise<AiGeneratedPage>;
  generateSection?(
    prompt: AiGenerationPrompt,
    ctx: AiGenerationContext & { blockId?: BlockId }
  ): Promise<AiGeneratedSection>;
  generateTheme?(
    prompt: AiGenerationPrompt,
    ctx: AiGenerationContext
  ): Promise<AiGeneratedTheme>;
}
