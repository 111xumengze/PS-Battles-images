# PS-Battles-images
## Origin
The original repository of the PS-Battles Dataset is [here](https://github.com/dbisUnibas/PS-Battles). Howerver, the script can't work when you run it in certain areas, for example China. Here, we offer some methods for your obtaining the dataset.
## Methods
### 1.Download images directly
+ originals: https://drive.google.com/open?id=1_BLic5R2_G4deMrGtuAqceKpsEFWCKU5
+ photoshops:
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
