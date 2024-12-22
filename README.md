# Crypto Price Alert Telegram Bot 🤖

A Node.js telegram bot that monitors cryptocurrency prices and sends alerts when specified conditions are met.

## Features ✨

- Real-time cryptocurrency price monitoring
- Set price alerts for any cryptocurrency supported by CoinGecko
- Receive notifications when price conditions are met
- View and manage your active alerts
- Simple and intuitive telegram interface

## Tech Stack 🛠

- Node.js
- TypeScript
- Telegram Bot API
- CoinGecko API
- Axios

## Prerequisites 📋

- Node.js (v14 or higher)
- npm
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

## Installation 🚀

1. Clone the repository

2. Install dependencies

3. Create a `.env` file in the root directory and add your Telegram bot token:

4. Start the bot

## Usage 📱

Available commands in Telegram:

- `/start` - Get started with the bot
- `/alert <symbol> <price> <above/below>` - Set a new price alert
- `/myalerts` - View your active alerts
- `/cancel` - Cancel all your active alerts
