# 📊 Financial Calendar Bot

> Daily financial calendar push bot - Automatically fetch financial events, prices, and sentiment indicators, push to Feishu

![Node.js](https://img.shields.io/badge/Node.js-22.x-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 📅 **Financial Calendar** - Auto-fetch tonight's key events from ForexFactory
- 💰 **Price Monitoring** - BTC, Gold, Silver, DXY, Crude Oil
- 📈 **Sentiment Indicators** - Crypto Fear & Greed Index, Gold market sentiment
- 🤖 **AI Analysis** - Predict event impact direction (Bullish/Bearish)
- 📱 **Feishu Push** - Auto-push to Feishu group at 18:30 daily
- 🛡️ **Triple Fallback** - Use estimates when APIs fail
- 🎯 **Weekend/Holiday Detection** - Auto提示

## 🚀 Quick Start

### 1. Install Dependencies

```bash
git clone https://github.com/carsonte/financial-calendar-bot.git
cd financial-calendar-bot
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Feishu credentials
```

### 3. Setup Feishu

1. Create Feishu App: https://open.feishu.cn/app
2. Get `App ID` and `App Secret`
3. Enable "Send Message" permission
4. Get group `Chat ID`

### 4. Run Test

```bash
npm run test
```

### 5. Setup Cron Job

```bash
# crontab -e
0 18 * * * cd /path/to/financial-calendar-bot && npm start
```

## 📁 Project Structure

```
financial-calendar-bot/
├── scripts/
│   ├── daily_digest.js        # Main entry
│   ├── price_fetcher.js       # Price fetch (triple fallback)
│   ├── sentiment_fetcher.js   # Sentiment (triple fallback)
│   └── economic_calendar.js   # Calendar scraper
├── .env.example               # Config template
├── .gitignore
├── package.json
└── README.md
```

## 📊 Push Example

```
📊 今晚重点事件

⏰ 今晚事件
20:30 Non-Farm Payrolls
   🇺🇸 | ⭐⭐⭐ High
   Previous: 225K → Forecast: 200K

📈 Current Prices
BTC $97.2K (+2.3%)
Gold $2,654 (+0.8%)

💰 Gold Sentiment: Bullish
😱 Crypto Fear & Greed: 65 (Greed)

🤖 AI Prediction
NFP: If actual > forecast, Bearish Gold, Bullish USD
```

## 🔧 Technical Design

### Price Fetch (Triple Fallback)

1. **Yahoo Finance** - Primary data source
2. **CoinGecko** - Backup (crypto)
3. **Estimates** - Extreme fallback

### Sentiment (Triple Fallback)

1. **Alternative.me** - Official API
2. **Trend Estimation** - Based on price trends
3. **Defaults** - Extreme fallback

## 🛡️ Robustness

- **Timeout Control**: All API calls timeout at 5 seconds
- **Auto Fallback**: Any API failure switches to backup
- **Weekend Detection**: Send rest tips on Sat/Sun
- **Holiday Detection**: Auto提示 on US holidays

## 📝 License

MIT License - Fork and Star welcome!

## 🤝 Contributing

Issues and PRs welcome!

---

⭐ If helpful, please give a Star!
