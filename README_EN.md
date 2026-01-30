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
- 🎯 **Weekend/Holiday Detection** - Auto rest tips

## 🚀 Installation

```bash
git clone https://github.com/carsonte/financial-calendar-bot.git
cd financial-calendar-bot
npm install
```

## 🔧 Configuration

### 1. Copy Environment File

```bash
cp .env.example .env
```

### 2. Configure Feishu (Required)

#### Step 2.1: Create Feishu App
1. Go to: https://open.feishu.cn/app
2. Click "Create App"
3. Fill in app name and description

#### Step 2.2: Get Credentials
1. Click your app → "Credentials & Basic Info"
2. Note down **App ID** and **App Secret**

#### Step 2.3: Enable Permissions
1. Click "Permissions" tab
2. Add these permissions:
   - `im:message:send_as_bot` - Send messages
   - `im:message:send_to_conv` - Send to conversations

#### Step 2.4: Get Tenant Access Token
```bash
curl -X POST "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" \
  -H "Content-Type: application/json" \
  -d '{"app_id": "YOUR_APP_ID", "app_secret": "YOUR_APP_SECRET"}'
```

#### Step 2.5: Add App to Group Chat
1. Open your target group in Feishu
2. Click group info → Manage members → Add members
3. Add your bot app

#### Step 2.6: Get Chat ID
```bash
curl -X GET "https://open.feishu.cn/open-apis/im/v1/chats" \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN"
```

### 3. Configure AI (Optional)

For AI-powered analysis, get MiniMax API key:
1. Register at: https://api.minimaxi.com
2. Create API key in dashboard
3. Add to `.env`:
```bash
MINIMAX_API_KEY=your_api_key_here
```

### 4. Edit .env File

```bash
FEISHU_TOKEN=your_tenant_access_token_here
FEISHU_CHAT_ID=your_group_chat_id_here
MINIMAX_API_KEY=optional_api_key_here
```

## 🏃 Run

### Test Mode

```bash
npm run test
```

### Production Mode

```bash
npm start
```

## ⏰ Setup Cron Job (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line (runs at 18:30 daily)
0 18 * * * cd /path/to/financial-calendar-bot && npm start >> /tmp/cron.log 2>&1
```

### Verify Cron is Running

```bash
# Check cron status
sudo systemctl status cron

# Or on Mac
brew services list | grep cron
```

## 📁 Project Structure

```
financial-calendar-bot/
├── scripts/
│   ├── daily_digest.js        # Main entry point
│   ├── price_fetcher.js       # Price fetch (triple fallback)
│   ├── sentiment_fetcher.js   # Sentiment (triple fallback)
│   └── economic_calendar.js   # Calendar scraper
├── .env.example               # Configuration template
├── .gitignore
├── package.json
├── README.md                  # Chinese documentation
└── README_EN.md               # This file
```

## 📊 Push Example

```
📊 今晚重点事件 (Tonight's Key Events)

⏰ Time: 20:30 (Beijing)
Non-Farm Payrolls (NFP)
   🇺🇸 | ⭐⭐⭐ High Impact
   Previous: 225K → Forecast: 200K

📈 Current Prices
BTC $97.2K (+2.3%) | Gold $2,654 (+0.8%)
Silver $29.8 (+0.5%) | DXY 105.2 (+0.1%)

💰 Gold Sentiment: Bullish
😱 Crypto Fear & Greed: 65 (Greed)

🤖 AI Prediction
NFP: If actual > forecast → Bearish Gold, Bullish USD
```

## 🔧 Technical Details

### Price Fetch (Triple Fallback)

| Priority | Source | Type |
|----------|--------|------|
| 1st | Yahoo Finance | Primary (Gold, Silver, DXY, Oil) |
| 2nd | CoinGecko | Backup (BTC, ETH) |
| 3rd | Estimates | Fallback (when all fail) |

### Sentiment Sources

| Priority | Source | Data |
|----------|--------|------|
| 1st | Alternative.me | Crypto Fear & Greed Index |
| 2nd | Trend Estimation | Based on price trends |
| 3rd | Defaults | Static values |

### Timezone Handling

- All events converted from ET (New York) to Beijing Time
- Auto-adjust for daylight saving time
- Example: NFP at 8:30 AM ET = 20:30 Beijing Time

## 🛡️ Robustness Features

- **5-second timeout** for all API calls
- **Auto fallback** when any API fails
- **Weekend detection** - Sends rest tips on Sat/Sun
- **US Holiday detection** - Skips trading on holidays
- **Error logging** - Check console output for issues

## 🐛 Troubleshooting

### Bot Not Sending Messages

1. Check token is valid (regenerate if expired)
2. Verify bot is added to group
3. Check chat ID is correct

### No Events Found

1. Check internet connection
2. ForexFactory may have changed format
3. Timezone conversion issue (check server time)

### API Errors

1. Rate limiting - wait and retry
2. Network issues - check connectivity
3. Service may be down - fallback to estimates

## 📝 License

MIT License - Feel free to fork and customize!

## 🤝 Contributing

Issues, feedback, and PRs are welcome!

---

⭐ If this project helps you, please give it a Star!
