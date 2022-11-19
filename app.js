const puppeeter = require("puppeteer");
const fs = require("fs");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

let fileName = "";

async function scrap(url) {
  const browser = await puppeeter.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const title = await page.evaluate(() => document.title);
  const playlist = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll("#contents #content"),
      (e) => e.querySelector("#meta a").href.split("&list")[0]
    )
  );

  fileName = fileName ? fileName : title;
  const writeStream = fs.createWriteStream(`${fileName}.txt`);
  const pathName = writeStream.path;

  writeStream.write(`${title}\n`);
  writeStream.write(`--------------------------------\n`);
  playlist.forEach((value) => writeStream.write(`${value}\n`));

  writeStream.on("error", function (err) {
    console.log(err);
  });

  writeStream.on("finish", function () {
    console.log(`Status: Scraped output written to file: "${pathName}"`);
  });

  writeStream.end();
  await browser.close();
}

readline.question(
  "Enter URL of the playlist and name of the file with separating comma(,): ",
  (userInput) => {
    userInput = userInput.split(",");
    fileName = userInput[1];
    scrap(userInput[0]);
    readline.close();
  }
);
