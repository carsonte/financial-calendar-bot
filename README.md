# 📊 Financial Calendar Bot

> 每日财经日历推送机器人 - 自动获取财经事件、价格、情绪指标，推送到飞书
>
> [English README](README_EN.md)

![Node.js](https://img.shields.io/badge/Node.js-22.x-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ 功能特性

- 📅 **财经日历** - 自动抓取 ForexFactory 今晚重点事件
- 💰 **价格监控** - BTC、黄金、白银、美元指数、原油
- 📈 **情绪指标** - 加密货币恐惧/贪婪指数、黄金市场情绪
- 🤖 **AI 分析** - 预判事件影响方向（利多/利空）
- 📱 **飞书推送** - 每天 18:30 自动推送到飞书群
- 🛡️ **三层降级** - API 失败时自动使用估算值
- 🎯 **周末/节假日检测** - 自动提示不推送

## 🚀 快速开始

### 1. 安装依赖

```bash
git clone https://github.com/carsonte/financial-calendar-bot.git
cd financial-calendar-bot
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

### 3. 配置飞书

1. 创建飞书应用：https://open.feishu.cn/app
2. 获取 `App ID` 和 `App Secret`
3. 开通「发送消息」权限
4. 获取群聊 `Chat ID`

### 4. 运行测试

```bash
npm run test
```

### 5. 设置定时任务

```bash
# crontab -e
0 18 * * * cd /path/to/financial-calendar-bot && npm start
```

## 📁 项目结构

```
financial-calendar-bot/
├── scripts/
│   ├── daily_digest.js        # 主入口
│   ├── price_fetcher.js       # 价格获取（三层降级）
│   ├── sentiment_fetcher.js   # 情绪指标（三层降级）
│   └── economic_calendar.js   # 财经日历抓取
├── .env.example               # 配置示例
├── .gitignore
├── package.json
└── README.md
```

## 📊 推送示例

```
📊 今晚重点事件

⏰ 今晚事件
20:30 非农就业数据
   🇺🇸 | ⭐⭐⭐ 高
   前值：22.5万 → 预期：20万

📈 当前价格
BTC $97.2K (+2.3%)
黄金 $2,654 (+0.8%)

💰 黄金情绪：偏多
😱 加密货币恐惧/贪婪：65（贪婪）

🤖 AI 预判
非农：若公布值>预期，则利空黄金、利好美元
```

## 🔧 技术方案

### 价格获取（三层降级）

1. **Yahoo Finance** - 主数据源
2. **CoinGecko** - 备用（加密货币）
3. **估算值** - 极端情况兜底

### 情绪指标（三层降级）

1. **Alternative.me** - 官方 API
2. **趋势估算** - 基于价格趋势
3. **默认值** - 极端情况兜底

## 🛡️ 健壮性设计

- **超时控制**：所有 API 调用 5 秒超时
- **自动降级**：任一 API 失败自动切换备用方案
- **周末检测**：周六日发送休息提示
- **节假日检测**：美国节假日自动提示

## 📝 License

MIT License - 欢迎 Fork 和 Star！

## 🤝 贡献

欢迎提交 Issue 和 PR！

---

⭐ 如果对你有帮助，点个 Star 支持一下！
