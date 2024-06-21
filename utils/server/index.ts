import { Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';
import { OPENAI_API_HOST } from '../app/const';

export class OpenAIError extends Error {
  type: string;
  param: string;
  code: string;

  constructor(message: string, type: string, param: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }
}

export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  key: string,
  messages: Message[],
) => {
  const bodystr = JSON.stringify({
    model: model.id,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages,
    ],
    // max_tokens: 1000,
    temperature: 1,
    // stream: true,
  });
  const res = await fetch(`${OPENAI_API_HOST}/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`,
      ...(process.env.OPENAI_ORGANIZATION && {
        'OpenAI-Organization': process.env.OPENAI_ORGANIZATION,
      }),
    },
    method: 'POST',
    body: bodystr,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const result = await res.json();
    if (result.error) {
      throw new OpenAIError(
        result.error.message,
        result.error.type,
        result.error.param,
        result.error.code,
      );
    } else {
      console.error(result.error);
      throw new Error(
        `OpenAI API returned an error: ${
          decoder.decode(result?.value) || result.statusText
        }`,
      );
    }
  }

  const responseBody = await res.json();
  const fullText = responseBody.choices[0].message.content;

  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 5; // Adjust this value to control the streaming speed
      for (let i = 0; i < fullText.length; i += chunkSize) {
        const chunk = fullText.slice(i, i + chunkSize);
        const queue = encoder.encode(chunk);
        controller.enqueue(queue);
        await new Promise((resolve) => setTimeout(resolve, 50)); // Adjust delay as needed
      }
      controller.close();
    },
  });

  return stream;
};
