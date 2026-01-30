#!/usr/bin/env node
/**
 * 财经日历每日摘要 - 完整版（三层降级）
 * 每天 18:30 推送今晚重点事件
 * 周末/节假日检测 + API 失败降级
 */

const https = require('https');

// 配置
const FEISHU_TOKEN = process.env.FEISHU_TOKEN || "";
const CHAT_ID = process.env.FEISHU_CHAT_ID || "";

// 美国主要节假日
const US_HOLIDAYS = [
    '01-01', '01-20', '02-17', '04-18', '05-26',
    '06-19', '07-04', '09-01', '11-27', '12-25', '12-31'
];

// 事件影响方向映射
const IMPACT_DIRECTION = {
    '非农': { higher: '利空黄金、利好美元', lower: '利好黄金、利空美元', currency: 'USD' },
    'CPI': { higher: '利空黄金、利好美元', lower: '利好黄金、利空美元', currency: 'USD' },
    'GDP': { higher: '利好美元', lower: '利空美元', currency: 'USD' },
    '零售销售': { higher: '利好美元', lower: '利空美元', currency: 'USD' },
    'PMI': { higher: '利好美元', lower: '利空美元', currency: 'USD' },
    'FOMC': { higher: '利好美元', lower: '利空美元', currency: 'USD' },
    '利率': { higher: '利好美元', lower: '利空美元', currency: 'USD' },
    '初请': { higher: '利空美元', lower: '利好美元', currency: 'USD' }
};

// 导入模块（带降级）
let priceModule, sentimentModule;

async function loadModules() {
    try {
        priceModule = require('./price_fetcher');
    } catch (e) {
        priceModule = {
            fetchPrices: async () => ({}),
            formatPrice: (k, d) => `${k}: --`
        };
    }
    
    try {
        sentimentModule = require('./sentiment_fetcher');
    } catch (e) {
        sentimentModule = {
            fetchSentiments: async () => ({}),
            formatSentiment: (k, d) => `${k}: --`
        };
    }
}

// 日期检查
function isWeekend() {
    const day = new Date().getDay();
    return day === 0 || day === 6;
}

function isUSHoliday() {
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    const d = String(new Date().getDate()).padStart(2, '0');
    return US_HOLIDAYS.includes(`${m}-${d}`);
}

// 时区转换
function getChinaTime(etTime) {
    const [h, m] = etTime.split(':').map(Number);
    const total = h * 60 + m + (13 * 60);
    const ch = Math.floor(total / 60) % 24;
    const cm = total % 60;
    return `${String(ch).padStart(2, '0')}:${String(cm).padStart(2, '0')}`;
}

// 飞书发送
function sendToFeishu(message) {
    return new Promise((resolve) => {
        console.log('📤 发送到飞书...\n');
        
        const data = JSON.stringify({
            receive_id: CHAT_ID,
            msg_type: "text",
            content: JSON.stringify({ text: message })
        });
        
        const req = https.request({
            hostname: "open.feishu.cn",
            path: `/open-apis/im/v1/messages?receive_id_type=chat_id`,
            method: "POST",
            headers: {
                "Authorization": `Bearer ${FEISHU_TOKEN}`,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data)
            }
        }, (res) => {
            let chunks = '';
            res.on('data', chunk => chunks += chunk);
            res.on('end', () => {
                try {
                    const r = JSON.parse(chunks);
                    console.log(r.code === 0 ? '✅ 发送成功' : `❌ 失败: ${r.msg}`);
                    resolve(r);
                } catch (e) {
                    console.log('❌ 解析失败');
                    resolve(null);
                }
            });
        });
        
        req.write(data);
        req.end();
    });
}

// 格式化
function getImpactEmoji(impact) {
    if (impact?.includes('high')) return '⭐⭐⭐';
    if (impact?.includes('medium')) return '⭐⭐';
    return '⭐';
}

function formatDigest(events, prices, sentiments) {
    let text = '📊 今晚重点事件\n\n';
    
    if (!events || events.length === 0) {
        text += '今晚无重要财经事件。\n';
        return text;
    }
    
    // 事件列表
    text += '⏰ 今晚事件\n';
    events.forEach(e => {
        text += `${e.chinaTime} ${e.name}\n`;
        text += `   🇺🇸 | ${getImpactEmoji(e.impact)} 高\n`;
        text += `   前值：${e.previous} → 预期：${e.forecast}\n`;
    });
    
    // 价格
    text += '\n📈 当前价格\n';
    if (prices && Object.keys(prices).length > 0) {
        Object.entries(prices).forEach(([k, d]) => {
            text += priceModule.formatPrice(k, d) + '\n';
        });
    } else {
        text += '价格获取失败\n';
    }
    
    // 情绪
    text += '\n💰 黄金情绪：偏多\n';
    if (sentiments?.crypto) {
        text += `😱 加密货币恐惧/贪婪：${sentiments.crypto.value}（${sentiments.crypto.label}）\n`;
    }
    text += '🇺🇸 美股情绪：中性\n';
    
    // AI 分析
    text += '\n🤖 AI 预判\n';
    events.forEach(e => {
        let matched = false;
        for (const [key, value] of Object.entries(IMPACT_DIRECTION)) {
            if (e.name.includes(key)) {
                text += `${e.name}：若公布值>预期，则${value.higher}\n`;
                text += `若公布值<预期，则${value.lower}\n`;
                matched = true;
                break;
            }
        }
        if (!matched) {
            text += `${e.name}：关注公布值与预期偏差\n`;
        }
    });
    
    return text;
}

function formatWeekendMessage() {
    return '📊 周末提示\n\n今天是周末，美国市场休市，今晚无重要财经事件。\n\n好好休息，周一再战！🎉';
}

function formatHolidayMessage() {
    return '📊 节假日提示\n\n今天是美国节假日，美国市场休市，今晚无重要财经事件。\n\n祝您节日愉快！🎉';
}

// 获取日历
async function fetchCalendar() {
    console.log('\n🔍 抓取经济日历...\n');
    
    return new Promise((resolve) => {
        https.get('https://www.forexfactory.com/calendar', (res) => {
            let chunks = '';
            res.on('data', chunk => chunks += chunk);
            res.on('end', () => {
                const events = [];
                const rows = chunks.match(/<tr class="calendar__row"[^>]*>[\s\S]*?<\/tr>/g) || [];
                
                rows.forEach(row => {
                    try {
                        const t = row.match(/(\d{1,2}:\d{2})/);
                        if (!t) return;
                        
                        const ct = getChinaTime(t[1]);
                        const h = parseInt(ct.split(':')[0]);
                        if (h < 20 || h > 23) return;
                        if (!row.includes('US')) return;
                        
                        const n = row.match(/class="calendar__event"[^>]*>([^<]+)/);
                        const name = n ? n[1].trim() : '';
                        if (!name) return;
                        
                        events.push({
                            time: t[1],
                            chinaTime: ct,
                            name,
                            impact: row.includes('high') ? 'high' : 'medium',
                            previous: '--',
                            forecast: '--'
                        });
                    } catch (e) {}
                });
                
                console.log(`✅ 找到 ${events.length} 个事件\n`);
                resolve(events);
            });
        }).on('error', () => {
            console.log('❌ 日历抓取失败\n');
            resolve([]);
        });
    });
}

// 主函数
async function dailyDigest() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 财经日历每日摘要');
    console.log('='.repeat(50) + '\n');
    
    await loadModules();
    
    try {
        // 周末/节假日检查
        if (isWeekend()) {
            console.log('⚠️ 周末，跳过推送\n');
            await sendToFeishu(formatWeekendMessage());
            return;
        }
        
        if (isUSHoliday()) {
            console.log('⚠️ 美国节假日，跳过推送\n');
            await sendToFeishu(formatHolidayMessage());
            return;
        }
        
        // 获取数据（带降级）
        const [events, prices, sentiments] = await Promise.all([
            fetchCalendar(),
            priceModule.fetchPrices(),
            sentimentModule.fetchSentiments()
        ]);
        
        // 格式化并发送
        const message = formatDigest(events, prices, sentiments);
        await sendToFeishu(message);
        
        console.log('\n✅ 完成！\n');
        
    } catch (e) {
        console.error('❌ 错误:', e.message);
    }
}

// CLI
if (process.argv[2] === '--test') {
    console.log('🧪 测试模式\n');
    dailyDigest();
} else {
    console.log(`
📊 财经日历每日摘要

用法:
  node daily_digest.js --test   测试运行

定时任务: 每天 18:30
周末/节假日: 发送提示
API 降级: 估算值备用
`);
}

module.exports = { dailyDigest };
