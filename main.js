const { app, BrowserWindow, ipcMain} = require('electron');
const fs = require('fs');

// 替换为你的GPT API密钥
const API_KEY = 'skiwWv3M2dda4djbR0PTT0T3BlbkFJpmpLNZTE5PTzWpMTCSBH';

// 要翻译的文本文件路径
const textFilePath = 'text.txt';

// GPT API接口地址
const apiUrl = 'https://api.openai.com/v1/engines/davinci/completions';

function createWindow() {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // 加载index.html文件
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.on('translate', (event, text) => {
    translateText(text, (translation) => {
      event.reply('translated', translation);
    });
  });
});

function createWindow() {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // 加载index.html文件
  win.loadFile('index.html');

  // 打开开发者工具
  win.webContents.openDevTools();
}

function translateText(text, callback) {
  const https = require('https');

  // 设置HTTP请求选项
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  };

  // 创建HTTP请求
  const req = https.request(apiUrl, options, (res) => {
    let data = '';

    // 接收响应数据
    res.on('data', (chunk) => {
      data += chunk;
    });

    // 处理响应数据
    res.on('end', () => {
      const response = JSON.parse(data);
      const translation = response.choices[0].text;
      callback(translation);
    });
  });

  // 处理请求错误
  req.on('error', (error) => {
    console.error(error);
  });

  // 发送请求数据
  const requestData = {
    prompt: `translate English to Chinese: ${text}`,
    max_tokens: 100,
    n: 1,
    stop: null,
  };
  req.write(JSON.stringify(requestData));

  // 结束请求
  req.end();
}
