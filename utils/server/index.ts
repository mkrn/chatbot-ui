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
      messages[messages.length - 1],
    ],
    // max_tokens: 1000,
    temperature: 1,
    stream: true,
  });
  console.log(`${OPENAI_API_HOST}/chat/completions`);
  console.log(process.env.OPENAI_API_KEY);

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

  console.log(bodystr);

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
      console.error(result);
      console.error(result.error);
      throw new Error(
        `OpenAI API returned an error: ${
          decoder.decode(result?.value) || result.statusText
        }`,
      );
    }
  }

  // const stream = new ReadableStream({
  //   async start(controller) {
  //     console.log('Stream start initiated');

  //     const onParse = (event: ParsedEvent | ReconnectInterval) => {
  //       console.log('Parsing event:', event.type);

  //       if (event.type === 'event') {
  //         const data = event.data;
  //         console.log('Received data:', data);

  //         if (data === '[DONE]') {
  //           console.log('Stream complete');
  //           controller.close();
  //           return;
  //         }

  //         try {
  //           console.log(data);
  //           const json = JSON.parse(data);
  //           console.log('Parsed JSON:', json);

  //           const text = json.choices[0].delta.content;
  //           console.log('Extracted text:', text);

  //           const queue = encoder.encode(text);
  //           console.log('Encoded queue length:', queue.length);

  //           controller.enqueue(queue);
  //         } catch (e) {
  //           console.error('Error parsing or processing data:', e);
  //           controller.error(e);
  //         }
  //       }
  //     };

  //     const parser = createParser(onParse);
  //     console.log('Parser created');

  //     try {
  //       for await (const chunk of res.body as any) {
  //         console.log('Received chunk, length:', chunk.length);
  //         const decodedChunk = decoder.decode(chunk);
  //         console.log('Decoded chunk:', decodedChunk);
  //         parser.feed(decodedChunk);
  //       }
  //     } catch (error) {
  //       console.error('Error processing response body:', error);
  //     }
  //   },
  // });
  const stream = new ReadableStream({
    async start(controller) {
      console.log('Stream start initiated');
      try {
        for await (const chunk of res.body as any) {
          console.log('Received chunk, length:', chunk.length);
          const decodedChunk = decoder.decode(chunk);
          console.log('Decoded chunk:', decodedChunk);

          try {
            const json = JSON.parse(decodedChunk);
            console.log('Parsed JSON:', json);

            if (json.choices && json.choices.length > 0) {
              const text = json.choices[0].delta.content;
              console.log('Extracted text:', text);

              if (text) {
                const queue = encoder.encode(text);
                console.log('Encoded queue length:', queue.length);
                controller.enqueue(queue);
              }
            }

            if (json.choices[0].finish_reason === 'stop') {
              console.log('Stream complete');
              controller.close();
              return;
            }
          } catch (e) {
            console.error('Error parsing or processing data:', e);
            controller.error(e);
          }
        }
      } catch (error) {
        // Keeping this error log as it might be important for debugging
        console.error('Error processing response body:', error);
      }
    },
  });

  return stream;
  // const stream = new ReadableStream({
  //   async start(controller) {
  //     const chunkSize = 25; // Adjust this value to control the streaming speed
  //     for (let i = 0; i < fullText.length; i += chunkSize) {
  //       const chunk = fullText.slice(i, i + chunkSize);
  //       const queue = encoder.encode(chunk);
  //       controller.enqueue(queue);
  //       await new Promise((resolve) => setTimeout(resolve, 50)); // Adjust delay as needed
  //     }
  //     controller.close();
  //   },
  // });

  // return stream;
};
