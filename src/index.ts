import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';
import { PriceAlert, CryptoPrice } from './types';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });
const alerts: PriceAlert[] = [];

// Fetch crypto price from CoinGecko
async function getCryptoPrice(symbol: string): Promise<number> {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
    );
    return response.data[symbol].usd;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return 0;
  }
}

// Check alerts every minute
async function checkAlerts() {
  for (const alert of alerts) {
    const currentPrice = await getCryptoPrice(alert.symbol);
    
    if (
      (alert.isAbove && currentPrice >= alert.targetPrice) ||
      (!alert.isAbove && currentPrice <= alert.targetPrice)
    ) {
      const condition = alert.isAbove ? 'above' : 'below';
      bot.sendMessage(
        alert.userId,
        `🚨 Alert: ${alert.symbol.toUpperCase()} is now ${condition} $${alert.targetPrice}! Current price: $${currentPrice}`
      );
      // Remove the triggered alert
      const index = alerts.indexOf(alert);
      alerts.splice(index, 1);
    }
  }
}

// Start checking alerts every minute
setInterval(checkAlerts, 60000);

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Welcome to the Crypto Price Alert Bot! 🤖\n\n' +
    'Commands:\n' +
    '/alert <symbol> <price> <above/below>\n' +
    'Example: /alert bitcoin 30000 above\n\n' +
    '/myalerts - View your active alerts\n' +
    '/cancel - Cancel all your alerts'
  );
});

// Handle /alert command
bot.onText(/\/alert (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  
  if (!match) return;
  
  const params = match[1].split(' ');
  if (params.length !== 3) {
    bot.sendMessage(chatId, '❌ Invalid format. Use: /alert <symbol> <price> <above/below>');
    return;
  }

  const [symbol, price, direction] = params;
  const targetPrice = parseFloat(price);
  const isAbove = direction.toLowerCase() === 'above';

  if (isNaN(targetPrice)) {
    bot.sendMessage(chatId, '❌ Invalid price value');
    return;
  }

  const currentPrice = await getCryptoPrice(symbol);
  if (!currentPrice) {
    bot.sendMessage(chatId, '❌ Invalid cryptocurrency symbol');
    return;
  }

  alerts.push({
    userId: chatId,
    symbol,
    targetPrice,
    isAbove,
  });

  bot.sendMessage(
    chatId,
    `✅ Alert set for ${symbol.toUpperCase()}\n` +
    `Target: ${isAbove ? 'Above' : 'Below'} $${targetPrice}\n` +
    `Current price: $${currentPrice}`
  );
});

// Handle /myalerts command
bot.onText(/\/myalerts/, (msg) => {
  const chatId = msg.chat.id;
  const userAlerts = alerts.filter(alert => alert.userId === chatId);

  if (userAlerts.length === 0) {
    bot.sendMessage(chatId, 'You have no active alerts.');
    return;
  }

  const alertMessages = userAlerts.map(alert => 
    `${alert.symbol.toUpperCase()}: ${alert.isAbove ? 'Above' : 'Below'} $${alert.targetPrice}`
  );

  bot.sendMessage(chatId, 'Your active alerts:\n\n' + alertMessages.join('\n'));
});

// Handle /cancel command
bot.onText(/\/cancel/, (msg) => {
  const chatId = msg.chat.id;
  const userAlertCount = alerts.filter(alert => alert.userId === chatId).length;
  
  for (let i = alerts.length - 1; i >= 0; i--) {
    if (alerts[i].userId === chatId) {
      alerts.splice(i, 1);
    }
  }

  bot.sendMessage(chatId, `Cancelled ${userAlertCount} alert(s)`);
});

console.log('Bot is running...');