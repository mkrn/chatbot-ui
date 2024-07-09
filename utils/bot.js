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
bot.on('message:text', (ctx) => {
  console.log('message text', ctx);
  //   const keyboard = new InlineKeyboard().game('Start Mini App');
  //   ctx.replyWithGame('my_mini_app', { reply_markup: keyboard });
  ctx.reply('Hi!');
});
