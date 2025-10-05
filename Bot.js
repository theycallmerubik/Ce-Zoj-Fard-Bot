// Import required modules
const TelegramBot = require('node-telegram-bot-api');
const jalaali = require('jalaali-js');
const cron = require('node-cron');
const express = require('express');

// Access environment variables directly
const TOKEN = process.env.TELEGRAM_TOKEN;
const groupChatIds = process.env.GROUP_CHAT_IDS.split(',');
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
const PORT = process.env.PORT || 3000;
const webhookurl = process.env.WEBHOOK_URL;

const app = express();
const bot = new TelegramBot(TOKEN);

bot.setWebHook(`${webhookurl}/bot${TOKEN}`);

app.use(express.json());

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Bot is live on port ${PORT}`);
});

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

// Convert English Gregorian months to Persian
const gregorianMonthsFa = {
    'January': 'ژانویه', 'February': 'فوریه', 'March': 'مارس', 'April': 'آوریل',
    'May': 'می', 'June': 'ژوئن', 'July': 'ژوئیه', 'August': 'اوت',
    'September': 'سپتامبر', 'October': 'اکتبر', 'November': 'نوامبر', 'December': 'دسامبر'
};

let isWeekTypeReversed = false;
let custommessage = '';

// Function to determine if the current week (starting on Saturday) is odd or even
function getWeekType(date) {
    const firstSaturdayOfYear = new Date(date.getFullYear(), 0, 1);
    while (firstSaturdayOfYear.getDay() !== 6) {
        firstSaturdayOfYear.setDate(firstSaturdayOfYear.getDate() + 1);
    }
    const daysSinceFirstSaturday = Math.floor((date - firstSaturdayOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.floor(daysSinceFirstSaturday / 7) + 1;
    const isEven = weekNumber % 2 === 0;
    // Use toggle to reverse week type
    return (isWeekTypeReversed ? !isEven : isEven) ? 'زوج' : 'فرد';
}

// Convert Gregorian date to Persian date
function formatPersianDate(date) {
    const persianDate = jalaali.toJalaali(date);
    return `${persianDate.jd}ام ${getPersianMonthName(persianDate.jm)} ماه ${persianDate.jy} شمسی`;
}

// Convert month number to Persian month name
function getPersianMonthName(month) {
    const months = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    return months[month - 1];
}

// Start command handler
bot.onText(/\/start(@\w+)?/, (msg, match) => {

    const botUsername = 'Cezojfardbot'; // <-- Replace with your bot's username
    if (msg.chat.type !== 'private') {
        // If /start is not addressed to this bot, ignore
        if (!match[1] || match[1].toLowerCase() !== `@${botUsername.toLowerCase()}`) return;
    }

    const chatId = msg.chat.id;
    const currentDate = new Date();
    
    // Get Persian and Gregorian dates
    const persianDateText = formatPersianDate(currentDate);
    const gregorianMonthFa = gregorianMonthsFa[currentDate.toLocaleString('en-US', { month: 'long' })];
    const gregorianDateText = `${currentDate.getDate()}ام ${gregorianMonthFa} سال ${currentDate.getFullYear()} میلادی`;

    // Get the Persian weekday and week type
    const dayOfWeekFa = weekdaysFa[currentDate.toLocaleDateString('en-US', { weekday: 'long' })];
    const weekType = getWeekType(currentDate);
    
    // Construct the start command message
    const messageText = `📅 ${gregorianDateText}\n\n🗓 ${persianDateText}\n\n📌 روز هفته: ${dayOfWeekFa}\n\n🖋 هفته ${weekType} آموزشی`;
    
    const inlineKeyboard = {
        reply_markup: {
            inline_keyboard: msg.chat.type === 'private' ? [
                [{ text: '🌐', web_app: { url: 'https://theycallmerubik.github.io/zojfard' } }]
            ] : [
                [{ text: '🌐', url: 'https://theycallmerubik.github.io/zojfard' }]
            ]
        }
    };
    
    bot.sendMessage(chatId, messageText, inlineKeyboard);
});

// Command to toggle week type
bot.onText(/\/toggleweektype/, (msg) => {
    if (msg.from.id.toString() !== ADMIN_USER_ID) return;
    
    isWeekTypeReversed = !isWeekTypeReversed;
    bot.sendMessage(msg.chat.id, `وضعیت زوج/فرد هفته تغییر کرد. حالت فعلی: ${isWeekTypeReversed ? 'معکوس' : 'عادی'}`);
});

// Command to set a custom message
bot.onText(/\/custommessage (.+)/, (msg, match) => {
    if (msg.from.id.toString() !== ADMIN_USER_ID) return;
    custommessage = match[1];
    bot.sendMessage(msg.chat.id, `پیام سفارشی با موفقیت ثبت شد:\n${custommessage}`);
});

bot.onText(/\/setting/, (msg) => {
    if (msg.from.id.toString() !== ADMIN_USER_ID) return;

    bot.sendMessage(msg.chat.id, `تنظیمات فعلی:\n\n- وضعیت زوج/فرد هفته: ${isWeekTypeReversed ? 'معکوس' : 'عادی'}\n- پیام سفارشی: ${custommessage || 'ثبت نشده'}`);
});

// Schedule a weekly message for multiple groups
cron.schedule('30 21 * * 5', () => {
    groupChatIds.forEach(chatId => {
        // Get tomorrow's date and convert it to Jalali
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const persianDate = jalaali.toJalaali(tomorrow);

        // Get the English weekday for tomorrow and convert it to Persian
        const dayOfWeekEng = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
        const dayOfWeekFa = weekdaysFa[dayOfWeekEng];

        // Determine if the week is odd or even for tomorrow
        const weekType = getWeekType(tomorrow);

        // Format the Persian date
        const persianDateFormatted = `${persianDate.jd}ام ${getPersianMonthName(persianDate.jm)}`;

        // Construct the scheduled message text
        const messageText = `شب آدینه شما بخیر 🌙\n\n📅 فردا ${dayOfWeekFa}\n🗓 ${persianDateFormatted}\n🖋 شروع هفته ${weekType} آموزشی\n${custommessage}`;

        // Send the message to the group
        bot.sendMessage(chatId, messageText);
        custommessage = ''; // Clear custom message after sending
    });
}, {
    timezone: "Asia/Tehran" // Set timezone as needed
});