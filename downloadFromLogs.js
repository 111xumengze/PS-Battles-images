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

function readLogs(filePath, delimiter=' ') {
    return new Promise((resolve, reject) => {
        let results = [];

        try {
            const rl = readline.createInterface({
                input: fs.createReadStream(filePath),
            });

            rl.on('line', async (line) => {
                const [imgUrl, fileName, err] = line.split(delimiter);
                // if(err == 'Error: Error: failed to find element matching selector "img"')
                results.push({
                    imgUrl,
                    fileName,
                })
            });

            rl.on('close', () => {
                resolve(results);
            })
        } catch (err) {
            reject(err);
        }

    })

}

async function downloadImgsFromLogs({
    dirPath = './data/originals2',
    logPath = './data/log.txt',
    errPath = './data/originals_log2.txt',
    navTimeout = 40000,
    useBreakPoint=false,
    breakPointImgName='280wi1.jpg'
}={}) {
    // const dirPath = './data/originals2';
    // const logPath = './data/log.txt';
    // const errPath = './data/originals_log2.txt';
    // const navTimeout = 40000; 

    const results = await readLogs(logPath);

    const new_index = !useBreakPoint ? -1 : results.findIndex((el) => el.fileName === breakPointImgName);
    const new_results = results.slice(new_index + 1);
    console.log(new_index, results.length);

    const taskFn = async (page, options) => {
        let { imgUrl, fileName } = options;

        try {
            await page.goto(imgUrl, { timeout: navTimeout });
            const url = await page.$eval('img', el => el.src);

            const content = await getResourceContent(page, url);

            if(!content){
                return;
            }
            const contentBuffer = Buffer.from(content, 'base64');
  
            fs.writeFile(dirPath + '/' + fileName, contentBuffer, 'base64', (err) => {
                // callback();
                if (err) {
                    // return logError(`${imgUrl} ${fileName}`);
                    return logError(errPath, `${imgUrl} ${fileName} ${err}`);
                }
                
                console.log(imgUrl, 'is download!');
            });
        } catch (err) {
            logError(errPath, `${imgUrl} ${fileName} ${err}`);
        }

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

downloadImgsFromLogs();