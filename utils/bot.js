import { Bot } from 'grammy';

export const {
  // Telegram bot token from t.me/BotFather
  TELEGRAM_BOT_TOKEN: token,

  // Secret token to validate incoming updates
  TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(':').pop(),
} = process.env;

// Default grammY bot instance
export const bot = new Bot(token);

const OPENAI_API_HOST = process.env.OPENAI_API_HOST;

// Reply with link to mini app when user sends a message
bot.on('message:text', async (ctx) => {
  ctx.api.sendChatAction(ctx.chat.id, 'typing');
  console.log('message text', ctx.message.text);

  console.log(
    JSON.stringify({
      model: 'meta-llama-3-70b-instruct',
      messages: [
        {
          role: 'system',
          content: '',
        },
        ctx.message.text,
      ],
      // max_tokens: 1000,
      temperature: 1,
      stream: false,
    }),
  );

  const res = await fetch(`${OPENAI_API_HOST}/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'meta-llama-3-70b-instruct',
      messages: [
        {
          role: 'system',
          content: '',
        },
        {
          role: 'user',
          content: ctx.message.text,
        },
      ],
      temperature: 1,
    }),
  });

  const data = await res.json();
  console.log('data', data);

  const r = await ctx.reply(data.choices[0].message.content);

  console.log(r);
});
