// Import required modules
const TelegramBot = require('node-telegram-bot-api');
const jalaali = require('jalaali-js');
const cron = require('node-cron');

// Access environment variables directly
const token = process.env.TELEGRAM_TOKEN;
const groupChatIds = process.env.GROUP_CHAT_IDS.split(',');

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
function getWeekType(date) {
    const firstSaturdayOfYear = new Date(date.getFullYear(), 0, 1);
    while (firstSaturdayOfYear.getDay() !== 6) {
        firstSaturdayOfYear.setDate(firstSaturdayOfYear.getDate() + 1);
    }
    const daysSinceFirstSaturday = Math.floor((date - firstSaturdayOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.floor(daysSinceFirstSaturday / 7) + 1;
    return weekNumber % 2 === 0 ? 'فرد' : 'زوج';
}

// Create a new bot instance using polling
const bot = new TelegramBot(token, { polling: true });

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

// Convert English Gregorian months to Persian
const gregorianMonthsFa = {
    'January': 'ژانویه', 'February': 'فوریه', 'March': 'مارس', 'April': 'آوریل',
    'May': 'می', 'June': 'ژوئن', 'July': 'ژوئیه', 'August': 'اوت',
    'September': 'سپتامبر', 'October': 'اکتبر', 'November': 'نوامبر', 'December': 'دسامبر'
};

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
        const messageText = `یلدا مبارک! 🍉

📅 فردا ${dayOfWeekFa}
🗓 ${persianDateFormatted}
🖋 شروع هفته ${weekType} آموزشی`;

        // Send the message to the group
        bot.sendMessage(chatId, messageText);
    });
}, {
    timezone: "Asia/Tehran" // Set timezone as needed
});

// Start command handler
bot.onText(/\/start/, (msg) => {
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
    const messageText = `📅 ${gregorianDateText}\n
🗓 ${persianDateText}\n
📌 روز هفته: ${dayOfWeekFa}\n
🖋 هفته ${weekType} آموزشی`;

    const inlineKeyboard = {
        reply_markup: {
            inline_keyboard: msg.chat.type === 'private' ? [
                [{ text: '🌐', web_app: { url: 'https://theycallmerubik.github.io' } }]
            ] : [
                [{ text: '🌐', url: 'https://theycallmerubik.github.io' }]
            ]
        }
    };

    bot.sendMessage(chatId, messageText, inlineKeyboard);
});
