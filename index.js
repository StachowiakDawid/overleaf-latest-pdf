#!/usr/bin/env zx
const puppeteer = require('puppeteer');
const fs = require('fs');
const http = require('https');

const download = (url, dest, session) => {
  const file = fs.createWriteStream(dest);
  const request = http.get(url, {
    headers: {
      'Cookie': `${session.name}=${session.value}`
    }
  }, function (response) {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
    });
  }).on('error', (err) => {
    fs.unlink(dest);
  });
};

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(process.argv[2], {
    waitUntil: 'networkidle0',
  });
  const href = await page.evaluate(() => document.querySelector('div.toolbar-pdf-left a.btn').href.replace('&popupDownload=true', ''));
  console.log(href);
  const cookies = await page.cookies();
  download(href, process.argv[3], cookies.filter(el => el.name.includes('overleaf_session'))[0]);
  await browser.close();
})();