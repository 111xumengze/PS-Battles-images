# PS-Battles-images
## Origin
The original repository of the PS-Battles Dataset is [here](https://github.com/dbisUnibas/PS-Battles). Howerver, the script can't work when you run it in certain areas, for example China. Here, we offer some methods for your obtaining the dataset.
## Methods
### 1.Download partial images from https://drive.google.com/open?id=1_BLic5R2_G4deMrGtuAqceKpsEFWCKU5
+ originals(contain 10,759 images)
+ photoshops(contain 37529 images) 
#### Attentions:
1. Some images were deleted, so I can't download them. And for photoshops images, I have just downloaded 37529 images(The total number is 90886). My breakpoint is offered in main.js and you can go ahead if you need more images.
2. The log.txt and originals_log2.txt record failed *images url*, *filename* and *errors* for my downloading original images. The log_photoshops.txt records record failed *images url*, *filename* and *errors* for my downloading photoshops images. You can run downloadFromLogs.js(Altering options is a must), and download the failed images.


### 2.Run the script
#### Attention: If you have socket proxy, you can ignore the following and use request, http module redirectly.
1. A VPN software.
2. The Nodejs environment. You can download the [Node.js](https://nodejs.org/en) source code or a pre-built installer for your platform.
3. Install [puppeteer](https://github.com/puppeteer/puppeteer) by the following command:
```
  npm i puppeteer
```
4. Config the paths. And ```node main.js ```, you will download PS-Battles-images. <br/>
If some images can't be downloaded successfully, the log will be writed. You can re-download them by ```node downloadFromLogs.js ```.
