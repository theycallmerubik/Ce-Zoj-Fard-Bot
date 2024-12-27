# Odd/Even Week Type Telegram Bot

This script is a Telegram bot designed to inform the users about the current week type with the `/start` command. The bot supports Persian (Jalali) dates and integrates with the Telegram Bot API to manage messaging tasks. It uses the `jalaali-js` library for date conversions and the `node-cron` library for scheduling messages.

---

## Features

### 1. Weekly Scheduled Messages
- Sends a scheduled message every Friday at 9:30 PM (Asia/Tehran timezone).
- Provides the following information:
  - Persian and Gregorian dates.
  - Persian weekday name.
  - Week type (odd/even) based on the academic calendar.

### 2. `/start` Command
- Responds with:
  - Current Persian and Gregorian dates.
  - Persian weekday name.
  - Week type (odd/even).
- Includes an inline keyboard with a web link.

### 3. Persian Calendar Support
- Converts Gregorian dates to Persian dates.
- Provides Persian weekday names and month names.

---

## Installation

### Prerequisites
- Node.js installed on your system.
- A Telegram bot token obtained from [BotFather](https://core.telegram.org/bots#botfather).
- `jalaali-js`, `node-telegram-bot-api`, and `node-cron` npm packages.

### Steps
1. Clone the repository or copy the script.
2. Install required packages:
   ```bash
   npm install node-telegram-bot-api jalaali-js node-cron
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```env
   TELEGRAM_TOKEN=your-telegram-bot-token
   GROUP_CHAT_IDS=groupChatId1,groupChatId2
   ```
4. Run the script:
   ```bash
   node bot.js
   ```

---

## Code Explanation

### Environment Variables
- `TELEGRAM_TOKEN`: Telegram bot token.
- `GROUP_CHAT_IDS`: Comma-separated list of group chat IDs where messages will be sent.

### Scheduling Messages
- Uses `node-cron` to schedule weekly messages every Friday at 9:30 PM.
- Timezone is set to `Asia/Tehran`.

### Persian Date Conversion
- Converts Gregorian dates to Persian dates using `jalaali-js`.
- Includes Persian month and weekday names.

### `/start` Command
- Handles `/start` command to provide detailed date and week type information.
- Displays an inline keyboard with a web link (different for private and group chats).

---

## Example Output

### Scheduled Message on friday for groups
```
شب آدینه شما بخیر 🌙

📅 فردا شنبه
🗓 2ام دی ماه
🖋 شروع هفته فرد آموزشی
```

### `/start` Command Response
```
📅 22ام دسامبر سال 2024 میلادی

🗓 2ام دی ماه 1402 شمسی

📌 روز هفته: شنبه
🖋 هفته فرد آموزشی
```

---

## Libraries Used

- **[node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api):** Interacts with the Telegram Bot API.
- **[jalaali-js](https://github.com/jalaali/jalaali-js):** Converts Gregorian dates to Persian dates.
- **[node-cron](https://github.com/node-cron/node-cron):** Schedules tasks using cron expressions.

---

## Future Improvements

- Add more dynamic features, such as custom message scheduling by group admins.
- Support additional time zones.
- Implement error handling for invalid group chat IDs.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For questions or suggestions, contact:

- Telegram: [@Ru\_bic](https://t.me/Ru_Bic)
- Email: [rubikmanyt@Gmail.com](mailto\:rubikmanyt@Gmail.com)