export interface PromptContext {
  agentName: string;
  agentRole: string;
  currentPhase: number;
  relevantContext?: string;
  constraints?: string[];
}

export class PromptBuilder {
  static buildSystemPrompt(basePrompt: string, context: PromptContext): string {
    const parts: string[] = [basePrompt];

    parts.push(`\n\n--- CONTEXT ---`);
    parts.push(`Agent: ${context.agentName}`);
    parts.push(`Role: ${context.agentRole}`);
    parts.push(`Current Phase: ${context.currentPhase}`);

    if (context.relevantContext) {
      parts.push(`\nRelevant Context:\n${context.relevantContext}`);
    }

    if (context.constraints && context.constraints.length > 0) {
      parts.push(`\nConstraints:`);
      for (const constraint of context.constraints) {
        parts.push(`- ${constraint}`);
      }
    }

    parts.push(`\n--- END CONTEXT ---`);

    return parts.join('\n');
  }

  static buildTaskPrompt(taskTitle: string, taskDescription: string, additionalInstructions?: string): string {
    const parts: string[] = [
      `Task: ${taskTitle}`,
      `\nDescription: ${taskDescription}`,
    ];

    if (additionalInstructions) {
      parts.push(`\nAdditional Instructions: ${additionalInstructions}`);
    }

    parts.push('\nProvide a structured JSON response with your analysis and actions.');

    return parts.join('\n');
  }
}
