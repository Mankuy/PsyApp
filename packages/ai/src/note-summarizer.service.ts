/**
 * Note Summarizer Service
 * AI-powered note summarization using OpenAI-compatible LLM APIs.
 */

import OpenAI from 'openai';

export interface SummarizeOptions {
  maxLength?: number;
  style?: 'concise' | 'detailed' | 'bullet-points';
  model?: string;
}

export interface SummarizeResult {
  summary: string;
  originalLength: number;
  summaryLength: number;
}

const DEFAULT_MODEL = 'gpt-4o-mini';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is required for note summarization.'
    );
  }

  const config: { apiKey: string; baseURL?: string } = { apiKey };
  if (baseURL) {
    config.baseURL = baseURL;
  }

  return new OpenAI(config);
}

function buildSystemPrompt(style: string, maxLength?: number): string {
  let prompt =
    'You are a helpful assistant that summarizes therapy notes for mental health professionals. ';

  switch (style) {
    case 'concise':
      prompt +=
        'Provide a concise summary that captures the key points in a few sentences. ';
      break;
    case 'detailed':
      prompt +=
        'Provide a detailed summary that covers all important aspects of the session. ';
      break;
    case 'bullet-points':
      prompt +=
        'Provide a summary in bullet points covering the main topics and observations. ';
      break;
    default:
      prompt += 'Provide a concise summary. ';
  }

  if (maxLength) {
    prompt += `Keep the summary under approximately ${maxLength} words.`;
  }

  return prompt;
}

/**
 * Summarizes a given note text using an AI model via OpenAI-compatible API.
 */
export async function summarizeNote(
  text: string,
  options: SummarizeOptions = {}
): Promise<SummarizeResult> {
  const {
    maxLength = 150,
    style = 'concise',
    model = DEFAULT_MODEL,
  } = options;

  if (!text || text.trim().length === 0) {
    return {
      summary: '',
      originalLength: 0,
      summaryLength: 0,
    };
  }

  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(style, maxLength),
      },
      {
        role: 'user',
        content: `Please summarize the following therapy note:\n\n${text}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const summary = response.choices[0]?.message?.content?.trim() ?? '';

  return {
    summary,
    originalLength: text.length,
    summaryLength: summary.length,
  };
}

/**
 * Service class wrapper for dependency injection patterns.
 */
export class NoteSummarizerService {
  async summarize(text: string, options?: SummarizeOptions): Promise<SummarizeResult> {
    return summarizeNote(text, options);
  }
}
