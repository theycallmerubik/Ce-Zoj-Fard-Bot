// Import the Telegram Bot API library
const TelegramBot = require('node-telegram-bot-api');
const jalaali = require('jalaali-js');

// Dictionary to convert English weekdays to Persian
const weekdaysFa = {
  'Saturday': 'شنبه',
  'Sunday': 'یک‌شنبه',
  'Monday': 'دوشنبه',
  'Tuesday': 'سه‌شنبه',
  'Wednesday': 'چهارشنبه',
  'Thursday': 'پنج‌شنبه',
  'Friday': 'جمعه'
};

// Function to determine if the current week (starting on Saturday) is odd or even
function getWeekType() {
    const today = new Date();
    
    // Calculate the most recent Saturday
    const daysSinceSaturday = (today.getDay() + 1) % 7;
    const saturday = new Date(today.getTime() - daysSinceSaturday * 24 * 60 * 60 * 1000);
    
    // Calculate the week number based on this Saturday
    const firstDayOfYear = new Date(saturday.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((saturday - firstDayOfYear) / (7 * 24 * 60 * 60 * 1000)) + 1);
    
    // Check if the week number is odd or even
    if (weekNumber % 2 === 0) {
        return 'زوج';
    } else {
        return 'فرد';
    }
  }

// Replace with your bot token from @BotFather
const token = '7096302611:AAGdtfWVWzJDyptv-ybKYAPa1AIzVAJ06vQ';

// Create a new bot instance using polling (checks for updates)
const bot = new TelegramBot(token, { polling: true });

// Get the current date in Gregorian and Persian formats
const currentDate = new Date();
const persianDate = jalaali.toJalaali(currentDate);

// Get day of the week in English and convert to Persian
const dayOfWeekEng = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
const dayOfWeekFa = weekdaysFa[dayOfWeekEng];

const weekType = getWeekType();


// Start command handler
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
  
    // Get the current date in Gregorian and Persian formats
    const currentDate = new Date();
    const persianDate = jalaali.toJalaali(currentDate);
  
    // Get day of the week in English and convert to Persian
    const dayOfWeekEng = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayOfWeekFa = weekdaysFa[dayOfWeekEng];
  
    // Determine if the week is odd or even
    const weekType = getWeekType();
  
    // Construct the message text
    const messageText = `📅تاریخ میلادی: ${currentDate.toISOString().split('T')[0]}\n
🗓تاریخ شمسی: ${persianDate.jy}/${persianDate.jm}/${persianDate.jd}\n
📌روز هفته: ${dayOfWeekFa}\n
🖋هفته ${weekType} آموزشی
`;

  // Define the inline keyboard based on the chat type
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: []
    }
  };

  // Check if the bot was started in a private chat or a group
  if (msg.chat.type === 'private') {
    // Add the web app button for private chat
    inlineKeyboard.reply_markup.inline_keyboard.push([
      {
        text: '🌐', // Button text
        web_app: { url: 'https://theycallmerubik.github.io' } //your mini app URL
      }
    ]);
  } else {
    // Add a normal webpage button for groups
    inlineKeyboard.reply_markup.inline_keyboard.push([
      {
        text: '🌐', // Button text
        url: 'https://theycallmerubik.github.io' //your webpage URL
      }
    ]);
  }
  
    // Send the message to the user
    bot.sendMessage(chatId, messageText, inlineKeyboard);
  });
