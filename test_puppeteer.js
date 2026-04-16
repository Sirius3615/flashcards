const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    await page.goto('file://' + __dirname + '/quiz/iik1kol/index.html');
    await page.waitForTimeout(2000);
    const html = await page.content();
    console.log(html.includes('KaTeX') ? 'KaTeX loaded' : 'KaTeX NOT loaded');
    await browser.close();
})();
