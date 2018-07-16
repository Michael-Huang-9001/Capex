const puppeteer = require('puppeteer');
const creds = require('../Script/Credentials.js'); // May eventually be configurable, instead of using Nikko's

let browser = null;

async function f0() {
    browser = await puppeteer.launch({
        headless: false,
        timeout: 15000
    });
}

async function f1() {
    let browser = await puppeteer.launch({
        headless: false,
        timeout: 15000
    });
    let page = await browser.newPage();
    await page.goto('https://www.google.com/');
    await page.waitFor(10000);
    await page.goto('https://www.yahoo.com/');
    await page.waitFor(10000);
    await page.close();
    await login(page);
    await page.waitFor(5000);
    await browser.close();
}

async function f2() {
    let browser = await puppeteer.launch({
        headless: false,
        timeout: 15000
    });
    let page = await browser.newPage();
    await login(page);
    await page.goto('https://dashboard.proofpointarchiving.net' +
        '/Dashboard/Customer_Details_Overview.aspx?cid=1_ba9ae4b5ec28f46b__2342b2ab_15746f9a3dc__8000');
    await page.waitFor(10000);
    //await browser.close();
}

// Logs into the archiving dashboard
async function login(page) {
    // Credentials
    const login_url = 'https://dashboard.proofpointarchiving.net/Dashboard/Login.aspx';
    const username = creds.username;
    const password = creds.password;

    // DOM selectors for login
    await page.goto(login_url);

    await page.click('#lcLogin_tbUsername');
    await page.keyboard.type(username);

    await page.click('#lcLogin_tbPassword');
    await page.keyboard.type(password);

    // console.log("- Logging in...");

    await page.click('#lcLogin_lbtnLogin');
    await page.waitForNavigation();

    // console.log("- Logged in...");
}

f2();