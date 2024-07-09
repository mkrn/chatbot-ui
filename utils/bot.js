import { Bot } from 'grammy';

export const {
  // Telegram bot token from t.me/BotFather
  TELEGRAM_BOT_TOKEN: token,

  // Secret token to validate incoming updates
  TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(':').pop(),
} = process.env;

// Default grammY bot instance
export const bot = new Bot(token);

// Reply with link to mini app when user sends a message
bot.on('message:text', async (ctx) => {
  console.log('message text', ctx.message.text);

  const res = await fetch(`${OPENAI_API_HOST}/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'meta-llama-3-70b-instruct',
      messages: [ctx.message.text],
      // max_tokens: 1000,
      temperature: 1,
      stream: false,
    }),
  });

  const data = await res.json();
  console.log('data', data);

  //   const keyboard = new InlineKeyboard().game('Start Mini App');
  //   ctx.replyWithGame('my_mini_app', { reply_markup: keyboard });
  ctx.reply(data.choices[0].message.content);
});
