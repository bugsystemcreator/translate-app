const { app, BrowserWindow} = require('electron');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

const APP_ID = '20230527001691807';
const SECRET_KEY = 'sa54XKm_hM7uB97tNrNK';

// 要翻译的文本文件路径
const textFilePath = 'text.txt';

let win;

function createWindow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // 加载index.html文件
  win.loadFile('index.html');

  // 监听渲染进程发送过来的消息
  win.webContents.on('ipc-message', (event, channel, data) => {
    if (channel === 'translate') {
      const text = data.text;
      translateText(text, (translation) => {
        // 使用 win.webContents.postMessage 方法发送消息给渲染进程
        win.webContents.postMessage('translated', { type: 'translated', translation });
      });
    }
  });
}

app.whenReady().then(() => {
  createWindow();
});



function translateText(text, callback) {
    // 百度翻译 API 接口地址
    const apiUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
  
    // 计算请求参数
    const salt = (new Date).getTime();
    const sign = crypto.createHash('md5')
      .update(APP_ID + text + salt + SECRET_KEY)
      .digest('hex');
    const params = {
      q: text,
      from: 'auto',
      to: 'zh',
      appid: APP_ID,
      salt: salt,
      sign: sign
    };
    const query = Object.keys(params)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');
    const requestUrl = `${apiUrl}?${query}`;
  
    console.log('Sending request to Baidu Translate API:', requestUrl);
  
    // 发送 HTTP 请求
    https.get(requestUrl, (res) => {
      console.log('Received response from Baidu Translate API:', res.statusCode, res.headers);
  
      let data = '';
  
      // 接收响应数据
      res.on('data', (chunk) => {
        data += chunk;
      });
  
      // 处理响应数据
      res.on('end', () => {
        console.log('Received response data from Baidu Translate API:', data);
        const response = JSON.parse(data);
        const translation = response.trans_result[0].dst;
        callback(translation);
      });
    }).on('error', (error) => {
      console.error(error);
    });
  }
  