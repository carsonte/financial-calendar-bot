#!/usr/bin/env node
/**
 * 财经日历抓取 - ForexFactory
 * 用法: node economic_calendar.js [日期] 默认今天
 */

const https = require('https');
const { JSDOM } = require('jsdom');

// 中国时区偏移
const CHINA_OFFSET = 8;

function getChinaTime(etTime) {
    // ET 时间转换为北京时间
    // ET 是 UTC-5（冬令时）或 UTC-4（夏令时）
    // 简化为统一 +13 小时转换
    const [hours, minutes] = etTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + (13 * 60); // +13 小时
    const chinaHours = Math.floor(totalMinutes / 60) % 24;
    const chinaMinutes = totalMinutes % 60;
    return `${String(chinaHours).padStart(2, '0')}:${String(chinaMinutes).padStart(2, '0')}`;
}

function parseImpact(impactText) {
    const map = {
        'high': '⭐⭐⭐ 高',
        'medium': '⭐⭐ 中',
        'low': '⭐ 低'
    };
    return map[impactText] || '⭐ 低';
}

function fetchCalendar(date = 'today') {
    return new Promise((resolve, reject) => {
        console.log(`\n🔍 抓取 ForexFactory 经济日历: ${date}\n`);
        
        const url = date === 'today' 
            ? 'https://www.forexfactory.com/calendar'
            : `https://www.forexfactory.com/calendar?day=${date}`;
        
        const req = https.get(url, (res) => {
            let chunks = '';
            res.on('data', (chunk) => chunks += chunk);
            res.on('end', () => {
                try {
                    const dom = new JSDOM(chunks);
                    const document = dom.window.document;
                    
                    const events = [];
                    const rows = document.querySelectorAll('tr.calendar__row');
                    
                    rows.forEach(row => {
                        try {
                            const time = row.querySelector('.calendar__time')?.textContent?.trim() || '';
                            const country = row.querySelector('.flag-icon')?.getAttribute('class')?.split(' ')[1] || '';
                            const name = row.querySelector('.calendar__event')?.textContent?.trim() || '';
                            const impact = row.querySelector('.calendar__impact')?.getAttribute('data-original-title') || '';
                            const actual = row.querySelector('.calendar__actual')?.textContent?.trim() || '';
                            const forecast = row.querySelector('.calendar__forecast')?.textContent?.trim() || '';
                            const previous = row.querySelector('.calendar__previous')?.textContent?.trim() || '';
                            
                            // 只保留有时间的行（重要事件）
                            if (!time || time.includes(':') === false) return;
                            
                            // 过滤非美国事件
                            if (country !== 'US') return;
                            
                            // 过滤低影响
                            if (impact.toLowerCase().includes('low')) return;
                            
                            const chinaTime = getChinaTime(time);
                            
                            events.push({
                                time,
                                chinaTime,
                                country,
                                name,
                                impact: parseImpact(impact),
                                actual,
                                forecast,
                                previous
                            });
                        } catch (e) {}
                    });
                    
                    console.log(`✅ 找到 ${events.length} 个高影响事件\n`);
                    resolve(events);
                } catch (e) {
                    reject(e);
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

// 测试
if (process.argv[2] === '--test') {
    fetchCalendar().then(events => {
        events.forEach(e => {
            console.log(`${e.chinaTime} ${e.name} ${e.impact}`);
        });
    }).catch(console.error);
}

module.exports = { fetchCalendar };
