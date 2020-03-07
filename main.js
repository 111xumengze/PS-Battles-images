
const puppeteer = require('puppeteer');
const fs = require("fs");
const assert = require('assert');
const readline = require('readline');
// const EventEmitter = require('events');
const PuppeteerFactory = require("./PuppeteerFactory");

// last  
// http://i.imgur.com/UFgNpKi.jpg is downloaded!
function logError(logName, content) {
    fs.appendFile(logName, content + '\r\n', (err, data) => {
        if (!err) {
            console.log(content); // Hello world
        }
    });
}

async function readTSV(filePath) {
    const findFieldIndex = (rows, fieldName) => rows.findIndex((value) => value === fieldName);

    return new Promise((resolve, reject) => {
        let i = 0;
        let rows = undefined, urlIndex = -1, idIndex = -1, orginalIndex = -1, endIndex = -1;
        let results = [];

        try {
            const rl = readline.createInterface({
                input: fs.createReadStream(filePath),
            });

            rl.on('line', async (line) => {
                rows = line.split('\t');
                if (i === 0) {
                    i = i + 1;
                    urlIndex = findFieldIndex(rows, 'url');
                    idIndex = findFieldIndex(rows, 'id');
                    orginalIndex = findFieldIndex(rows, 'original');
                    endIndex = findFieldIndex(rows, 'end');
                    return;
                }

                if (urlIndex >= 0) {
                    const imgUrl = rows[urlIndex];
                    const end = `.${rows[endIndex]}`;
                    const fileName = orginalIndex === -1 ? rows[idIndex] + end : rows[idIndex] + '_' + rows[orginalIndex] + end;

                    results.push({
                        imgUrl,
                        fileName,
                    })

                }
            });
            rl.on('close', () => {
                resolve(results);
            })
        } catch (err) {
            reject(err);
        }

    })

}



async function getResourceContent(page, url) {
    const { content, base64Encoded } = await page._client.send(
        'Page.getResourceContent',
        { frameId: String(page.mainFrame()._id), url },
    );
    assert.equal(base64Encoded, true);
    return content;
};

async function main1() {
    // const browser = await puppeteer.launch({ 
    //     headless: false 
    // });
    // const browser = await puppeteer.launch();
    const dirPath = './data/originals';
    const logPath = './data/log.txt';
    const browser = await puppeteer.launch({
        headless: true,
        timeout: 5000,
    });
    // 捕获超时错误
    // const page = await browser.newPage();

    const results = await readTSV('./originals.tsv', './data/originals', browser);
    // http://i.imgur.com/XwDEmh0.jpg is downloaded!
    const new_index = results.findIndex((el) => el.imgUrl === 'http://i.imgur.com/XwDEmh0.jpg');
    const new_results = results.slice(new_index + 1);
    console.log(new_index, results.length);
    const page = await browser.newPage();

    for await ({ imgUrl, fileName } of new_results) {
        try {

            await page.goto(imgUrl, { timeout: 30000 });
            const url = await page.$eval('img', el => el.src);

            const content = await getResourceContent(page, url);
            const contentBuffer = Buffer.from(content, 'base64');
            // await page.close();
            fs.writeFileSync(dirPath + '/' + fileName, contentBuffer, 'base64');

            console.log(`${imgUrl} is downloaded!`);
        } catch (err) {
            console.error(err);
            logError(logPath, `${imgUrl} ${fileName}`)
        }
    }
}




async function main() {

    const dirPath = './data/photoshops';
    const logPath = './data/log_photoshops.txt';
    const navTimeout = 30000; 

    // const results = await readTSV('./originals.tsv');
    const results = await readTSV('./photoshops.tsv');
 
    const new_index = -1; //results.findIndex((el) => el.imgUrl === 'http://i.imgur.com/vWzGa.jpg');
   
    const new_results = results.slice(new_index + 1);
    console.log(new_index, results.length);
    // return;
 
    const taskFn = async (page, options) => {
        let { imgUrl, fileName } = options;

        // return new Promise((resolve, reject) => {
        try {
            await page.goto(imgUrl, { timeout: navTimeout });
            const url = await page.$eval('img', el => el.src);

            const content = await getResourceContent(page, url);

            if(!content){
                return;
            }
            const contentBuffer = Buffer.from(content, 'base64');
            // await page.close();
            // fs.writeFileSync(dirPath + '/' + fileName, contentBuffer, 'base64');
            fs.writeFile(dirPath + '/' + fileName, contentBuffer, 'base64', (err) => {
                // callback();
                if (err) {
                    // return logError(`${imgUrl} ${fileName}`);
                    return logError(logPath, `${imgUrl} ${fileName} ${err}`);
                }
                
                console.log(imgUrl, 'is download!');
                // resolve();
            });
        } catch (err) {
            // callback();
            logError(logPath, `${imgUrl} ${fileName} ${err}`);
        }
        // })

    }

    const puppeteerFactory = new PuppeteerFactory(taskFn, {
        maxNumPages: 6,
        logName: logPath,
    });

    await puppeteerFactory.init();
    // puppeteerFactory.run();
    // new_results.forEach((options) => {
    //     puppeteerFactory.createTask(options);
    // })
    for(let options of new_results){
        // console.log(options);
        try{
            puppeteerFactory.createTask(options);
        }catch(err){
            // console.log(err);
        }
        
    }


}

main();

