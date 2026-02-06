#!/usr/bin/env node
/**
 * Screenshot tool for Friday Voice App
 * Takes screenshot and saves to /root/.openclaw/media/outbound/
 * Usage: node take-screenshot.js [output-filename.png]
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const URL = process.env.SCREENSHOT_URL || 'https://provider-oils-myers-gary.trycloudflare.com';
const OUTPUT_DIR = '/root/.openclaw/media/outbound';
const OUTPUT_FILE = process.argv[2] || 'friday-voice-screenshot.png';
const OUTPUT_PATH = path.join(OUTPUT_DIR, OUTPUT_FILE);

(async () => {
    console.log('📸 Taking screenshot of Friday Voice App...');
    console.log(`🌐 URL: ${URL}`);
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
    }
    
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });
    
    console.log('🌐 Opening page...');
    const page = await browser.newPage();
    
    // Set viewport (mobile size to match Jonas' phone)
    await page.setViewport({
        width: 412,
        height: 915,
        deviceScaleFactor: 2
    });
    
    console.log('📥 Loading Friday Voice App...');
    await page.goto(URL, {
        waitUntil: 'networkidle2',
        timeout: 30000
    });
    
    // Wait for canvas orb to render
    await page.waitForSelector('#voice-orb', { timeout: 10000 });
    console.log('✅ Canvas orb loaded');
    
    // Wait a bit for animations to settle
    await page.waitForTimeout(2000);
    
    console.log(`💾 Saving screenshot to: ${OUTPUT_PATH}`);
    await page.screenshot({
        path: OUTPUT_PATH,
        fullPage: false
    });
    
    await browser.close();
    
    console.log('✅ Screenshot saved!');
    console.log(`📸 File: ${OUTPUT_PATH}`);
    console.log('');
    console.log('To send in Discord:');
    console.log(`MEDIA:${OUTPUT_PATH}`);
})();
