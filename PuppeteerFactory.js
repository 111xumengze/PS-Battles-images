const puppeteer = require('puppeteer');
const fs = require("fs");
const assert = require('assert');
const readline = require('readline');

// last  
// http://i.imgur.com/UFgNpKi.jpg is downloaded!
function logError(logName, content) {
    fs.appendFile(logName, content + '\r\n', (err, data) => {
        if (!err) {
            console.log(err); // Hello world
        }
    });
}

class PuppeteerFactory {
    constructor(taskFn, options = { maxNumPages: 6, logName: './data/log.txt' }) {
        this.taskFn = taskFn;
        this.maxNumPages = options.maxNumPages;
        this.logName = options.logName;

        this.taskQueue = [];
        this.readyQueue = [];
        this.pendingQueue = [];
        this.puppeteerPages = [];
        this.status = false;
    }

    init(taskQueue = []) {
        return new Promise(async (resolve) => {
            try {
                this.taskQueue = Array.from(taskQueue);

                this.puppeteerBrowser = await puppeteer.launch({
                    headless: true,
                    timeout: 5000,
                });

                let page = null;
                for (let i = 0; i < this.maxNumPages; i++) {
                    page = await this.puppeteerBrowser.newPage();
                    this.puppeteerPages.push(page);
                    this.readyQueue.push(i);
                }

                this.status = true;
                resolve();
            } catch (err) {
                // reject(err);
                throw err;
            }
        })

    }

    createTask(options) {
        this.taskQueue.push(options);
        this.run();
    }


    async run() {

        let { readyQueue, puppeteerPages, pendingQueue, taskQueue, taskFn, logName } = this;

        if(taskQueue.length > 0 || readyQueue.length > 0) {

            // console.log(readyQueue, pendingQueue, taskQueue.length);
            // 如果 taskQueue为空或者无空闲readyQueues，则继续等待
            if (taskQueue.length === 0 || readyQueue.length === 0) {
                return;
            }

            const options = taskQueue.shift();

            // 有空闲page，readyQueue弹出空闲page放入pendingQueue中执行
            const freePageIndex = readyQueue.shift();
            const freePage = puppeteerPages[freePageIndex];
            pendingQueue.push(freePageIndex);

            // await this.fn(freePage, options);
            // console.log(freePageIndex, 'is working');

            await taskFn(freePage, options).catch(err => {
                // console.log(err);
            });

            // 从pendingQueue中释放占用的page，放入readyQueue
            // const len = pendingQueue.length;
            let idx = pendingQueue.findIndex(value => value === freePageIndex);
            [pendingQueue[idx], pendingQueue[0]] = [pendingQueue[0], pendingQueue[idx]];
            let pendePageIndex = pendingQueue.shift();
            readyQueue.push(pendePageIndex);

            this.run();
            // taskFn(freePage, options, () => {
            //     // 从pendingQueue中释放占用的page，放入readyQueue
            //     const len = pendingQueue.length;
            //     let idx = pendingQueue.findIndex(value => value === freePageIndex);
            //     [pendingQueue[idx], pendingQueue[len - 1]] = [pendingQueue[len - 1], pendingQueue[idx]];
            //     let pendePageIndex = pendingQueue.pop();
            //     readyQueue.push(pendePageIndex);

            //     // this.run();
            // })



        }

    }

    close() {
        // return new Promise((resolve) => {
        //     const result = await this.puppeteerBrowser.close();
        //     this.status = false;
        //     console.log('puppeteerBrowser is closed');
        //     resolve(result);
        // })
        this.puppeteerBrowser.close()
            .then(() => {
                this.status = false;
                console.log('puppeteerBrowser is closed');
            })
            .catch(err => {
                console.log('puppeteerBrowser is not closed');
            })
    }

}

module.exports = PuppeteerFactory;