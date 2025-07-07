const {app,session,powerSaveBlocker,powerMonitor, webContents} = require('electron');
const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');


const axios = require("axios");

const {SerialPort} = require('serialport')
// requestSingleInstanceLock() crashes the app in signed MAS builds
// https://github.com/electron/electron/issues/15958
if (!process.mas && !app.requestSingleInstanceLock()) {
  app.exit();
}

const path = require('path');
const openExternal = require('./open-external');
const AbstractWindow = require('./windows/abstract');
const EditorWindow = require('./windows/editor');
const {checkForUpdates} = require('./update-checker');
const {tranlateOrNull} = require('./l10n');
const migrate = require('./migrate');
const { ipcMain } = require('electron')

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fsPro = require('fs').promises
const cors = require('cors');
const Bottleneck = require('bottleneck');
const timeout = require('connect-timeout');
const {getLanyaList,setLanyaList} = require('../utils/lanya')
const {getWin,setWin} = require('../utils/win')
// const {getWss,setWss} = require('../utils/wsSever')
const WebSocket = require('ws');
const {getDistance,setDistance} = require('../utils/distance')
const {setPort,getPort,setDeviceState,getDeviceState} = require('../utils/port')

const currentEspIp=require('../utils/currentEspIp')
const {getCloseBn,setCloseBn} = require('../utils/closeBn')

const {setSocket,getSocket,setBricksSocket,setBricksMotor} = require('../utils/socket')

const {systemPreferences} = require('electron')

// const wifi = require('node-wifi');
const Current=require('../utils/currentWifi')

const { spawn } = require('child_process');
const net = require("net");
const { exec } = require("child_process");
// 初始化 wifi 模块
// wifi.init({ iface: null });  // null 会选择默认的 Wi-Fi 接口
require('./protocols');
require('./context-menu');
require('./menu-bar');
require('./crash-messages');
require('./demo')
// const {getCode} = require('../utils/global')
// import { getCode } from '../utils/global';
// const myFun =require('../utils/data.mjs').default
// (async () => {
//   const myModule = await import("../utils/data.mjs")
//   myModule.default()
// })();


// myFun()



// console.log(getCode());

const blockerId = powerSaveBlocker.start('prevent-app-suspension');
console.log('powerSaveBlocker started, ID:', blockerId);

let DEVList;
let isDownLoad;
let currentWifi=''

app.enableSandbox();
const { BrowserWindow } = require('electron');
const DesktopSettingsWindow = require('./windows/desktop-settings');
const e = require('connect-timeout');

let bluetoothPinCallback
let selectBluetoothCallback
require = require('esm')(module )

// const {getCode} = codeModule
let CODE='111';


const baseIp = "192.168.137."; // 你的电脑热点 IP 段（例如 192.168.137.X）
const port = 8082; // ESP32 运行 WebSocket 的端口
const TimeOut = 500; // 超时时间（毫秒）

let netTimer

function checkIp(ip) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(TimeOut);

        socket.on("connect", () => {
            console.log(`找到 ESP32: ${ip}`);
            socket.destroy();
            // socket.close()
            resolve(ip);
        });

        socket.on("error", () => {
            resolve(null);
        });

        socket.on("timeout", () => {
            resolve(null);
        });

        socket.connect(port, ip);
    });
}

async function scanNetwork() {
    const tasks = [];
    for (let i = 2; i < 255; i++) {
        tasks.push(checkIp(baseIp + i));
    }

    const results = await Promise.all(tasks);
    const espIp = results.find((ip) => ip !== null);

    if (espIp) {
        console.log(`ESP32 IP 地址: ${espIp}`);
        clearInterval(netTimer)
        // await new Promise(resolve => setTimeout(resolve, 1000));
        if(getSocket()){
            getSocket().send(JSON.stringify({
              type: 'whatIp',
              data: { message: espIp }
            }))
        }
    } else {
        console.log("未找到 ESP32");
    }
}




// const EventEmitter = require('events');
// const deviceEmitter = new EventEmitter();

// // 设备状态跟踪器
// const deviceStatus = new Map(); // 存储结构：Map<mac, { lastSeen: Date, online: boolean }>

// // 标准化MAC地址（兼容不同系统格式）
// function normalizeMac(mac) {
//   return mac.replace(/[^0-9a-f]/gi, '').toLowerCase();
// }

// // 增强版ARP扫描（兼容多平台）
// async function scanARP() {
//   return new Promise((resolve, reject) => {
//     const cmd = process.platform === 'win32' ? 'arp -a' : 'arp -n';
    
//     exec(cmd, (err, stdout) => {
//       if (err) return reject(err);

//       // 使用增强正则匹配MAC地址
//       const macRegex = /((?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2})/gi;
//       const currentMacs = new Set(
//         (stdout.match(macRegex) || [])
//           .map(normalizeMac)
//           .filter(mac => mac.length === 12) // 过滤无效地址
//       );

//       resolve(currentMacs);
//     });
//   });
// }

// // 智能状态检测（修复重连问题）
// async function checkDevices() {
//   try {
//     const currentMacs = await scanARP();
//     const now = new Date();

//     // 检测新连接/重连设备
//     currentMacs.forEach(mac => {
//       if (!deviceStatus.has(mac)) {
//         // 新设备连接
//         deviceStatus.set(mac, { 
//           firstSeen: now,
//           lastSeen: now,
//           online: true
//         });
//         deviceEmitter.emit('connected', mac);
//       } else if (!deviceStatus.get(mac).online) {
//         // 设备重连
//         deviceStatus.get(mac).online = true;
//         deviceStatus.get(mac).lastSeen = now;
//         deviceEmitter.emit('reconnected', mac);
//       }
//     });

//     // 检测断开设备
//     deviceStatus.forEach((status, mac) => {
//       if (status.online && !currentMacs.has(mac)) {
//         status.online = false;
//         deviceEmitter.emit('disconnected', mac);
//       }
//     });

//   } catch (err) {
//     console.error('scan failed:', err);
//   }
// }

// // 每3秒检测一次（平衡性能与实时性）
// setInterval(checkDevices, 3000);

// // 事件监听示例
// deviceEmitter.on('connected', (mac) => {
//   console.log(`[+] new device: ${mac}`);
// });

// deviceEmitter.on('reconnected', (mac) => {
//   console.log(`[↻] device reconnect: ${mac}`);
// });

// deviceEmitter.on('disconnected', (mac) => {
//   console.log(`[-] device leave: ${mac}`);
// });


// const targetIP = "192.168.1.100";
const targetPort = 80; // 目标设备的端口

function checkOnline() {
    const socket = new net.Socket();
    socket.setTimeout(2000); // 设置 2 秒超时

    socket.connect(targetPort, currentEspIp.getIp(), () => {
        console.log(`${currentEspIp.getIp()}:${targetPort} online`);
        socket.destroy();
    });

    socket.on("error", () => {
        console.log(`${currentEspIp.getIp()}:${targetPort} offline`);
        socket.destroy();
    });

    socket.on("timeout", () => {
        console.log(`${currentEspIp.getIp()}:${targetPort} timeout`);
        socket.destroy();
    });
}
function createWindow () {
  const mainWindow = new BrowserWindow({
    width:550,
    height:500,
    title: `蓝牙连接`,
    // show:false,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.webContents.openDevTools()

  mainWindow.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault()
    setLanyaList(deviceList)
    selectBluetoothCallback = callback
    DEVList=deviceList
    console.log(deviceList)

    mainWindow.webContents.send('device-list', deviceList)
    // const result = deviceList.find((device) => {
    //   return device.deviceName === 'xx Bricks3.34_45:be'
    // })
    // console.log(deviceList);
    
    // if (result) {
    //   callback(result.deviceId)
    // } else {
    //   // The device wasn't found so we need to either wait longer (eg until the
    //   // device is turned on) or until the user cancels the request
    // }
  })

  

  ipcMain.on('cancel-bluetooth-request', (event) => {
    // console.log("A:",getCode())
    selectBluetoothCallback('')
  })

  // Listen for a message from the renderer to get the response for the Bluetooth pairing.
  ipcMain.on('bluetooth-pairing-response', (event, response) => {
    bluetoothPinCallback(response)
  })

  ipcMain.handle('send-imagedata', async (event, imagedata) => {

    console.log(imagedata)
  })


  mainWindow.webContents.session.setBluetoothPairingHandler((details, callback) => {
    bluetoothPinCallback = callback
    // Send a message to the renderer to prompt the user to confirm the pairing.
    mainWindow.webContents.send('bluetooth-pairing-request', details)
  })

  mainWindow.loadFile('index.html')
}

async function checkAndApplyCameraAccess(){
  
  const cameraPrivilege = systemPreferences.getMediaAccessStatus('camera')
  console.log(cameraPrivilege)
  if(cameraPrivilege!=='granted'){
    try{
      await systemPreferences.askForMediaAccess('camera')

      console.log('#################')
    }catch(error){
      console.log('camera filed'+error)
    }
  }
}

let stopServer
let extension;
let distance=[]
let isConnectBle='1'


function startServer(){
  // 创建 Express 应用程序
  const server = express();
  const limiter = new Bottleneck({
    maxConcurrent: 1, // 设置最大并发数为1，即一次只处理一个请求
    minTime: 500 // 可选：设置最小时间间隔，单位为毫秒
  });

  // 配置端口
  const port = 3000;

  // 指定文件路径
  // const filePath = 'node_modules/scratch-vm/src/extensions/scratch3_hello_world/index.js';
  const filePath = path.join(app.getPath('userData'), 'localWifi.js')

  // 确保路径存在
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // 确保文件存在（如果不存在就创建一个空文件）
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '', 'utf8');
  }
  // 使用 body-parser 中间件解析请求体
  server.use(bodyParser.text());

  // 允许跨域请求
  server.use(cors());

  server.use(express.json({ limit: '50mb' }));

  // 设置请求超时
  server.use(timeout('3s')); // 设置30秒超时
  server.use((req, res, next) => {
    if (!req.timedout) next();
  });
  // 定义接收数据的路由
  server.post('/save-data', limiter.wrap((req, res) => {
    const data = req.body;
    console.log(data)

     // 清空文件内容
    fs.truncate(filePath, 0, (err) => {
      if (err) {
        console.error('清空文件出错:', err);
        res.status(500).send('内部服务器错误');
        return;
      }

      // 写入新数据
      fs.appendFile(filePath, data + '\n', (err) => {
        if (err) {
          console.error('写入文件出错:', err);
          res.status(500).send('内部服务器错误');
        } else {
          res.status(200).send('dataissaved');
        }
      });
    });
    
  }));

  // 读取文件的路由
    server.get('/read-data', (req, res) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('读取文件出错:', err);
          return res.status(500).send('内部服务器错误');
        }

        // 解析数据
        let ssid = '';
        let password = '';

        const lines = data.split('\n');
        lines.forEach(line => {
          if (line.startsWith('热点名称:')) {
            ssid = line.replace('热点名称:', '').trim();
          } else if (line.startsWith('热点密码:')) {
            password = line.replace('热点密码:', '').trim();
          }
        });

        // 返回 JSON 格式
        res.status(200).json({ ssid, password });
      });
  });

  //保存机器学习项目
  server.post('/save-project', limiter.wrap((req, res) => {
    // console.log(req.body)
    const { projectName, imageDATA, down } = req.body;

    try {
        // 获取 Electron 应用根目录，避免硬编码
        const userDataPath = app.getPath('userData'); // 推荐路径
        console.log(userDataPath)
        const projectsDir = path.join(userDataPath, 'projects');

        if (!fs.existsSync(projectsDir)) {
            fs.mkdirSync(projectsDir, { recursive: true });
        }

        const filePath = path.join(projectsDir, `${projectName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 4));

        console.log(`项目保存到：${filePath}`);
        res.status(200).send({ message: '保存成功' });
    } catch (error) {
        console.error("保存失败:", error);
        res.status(500).send({ message: '保存失败', error });
    }

   
    
  }));

  server.get('/get-projects', limiter.wrap((req, res) => {
      try {
          const userDataPath = app.getPath('userData');
          const projectsDir = path.join(userDataPath, 'projects');

          if (!fs.existsSync(projectsDir)) {
              return res.status(200).send([]); // 目录不存在，返回空数组
          }

          const files = fs.readdirSync(projectsDir);
          const projects = [];

          files.forEach(file => {
              if (path.extname(file) === '.json') {
                  const filePath = path.join(projectsDir, file);
                  const content = fs.readFileSync(filePath, 'utf-8');
                  try {
                      const parsed = JSON.parse(content);
                      projects.push(parsed);
                  } catch (e) {
                      console.warn(`跳过无法解析的文件: ${file}`);
                  }
              }
          });

          res.status(200).send(projects);
      } catch (error) {
          console.error("读取项目失败:", error);
          res.status(500).send({ message: '读取失败', error });
      }
  }));

  server.post('/get-code', limiter.wrap((req, res) => {
    const data = req.body;
    console.log(data)
    CODE=data
    
  }))
  server.get('/get',limiter.wrap((req,res)=>{
    console.log(CODE)
    res.status(200).send(CODE || '');
  }))

  //设置已选扩展
  server.post('/set-extension', limiter.wrap((req, res) => {
    extension=req.body
    console.log("extension"+extension)
    res.status(200).send('OK'); // 或其他响应内容
  }));
  //获得已选扩展
  server.get('/get-extension', limiter.wrap((req, res) => {
    res.status(200).send(extension || 'No extension available'); // 如果extension未定义，则返回'No code available'
  }));

  server.get('/get-devicelist', limiter.wrap((req, res) => {
    res.status(200).send(DEVList || ''); 
  }));

  //是否下载代码
  server.post('/download', limiter.wrap((req, res) => {
    isDownLoad=req.body
    console.log("isdowbload"+isDownLoad)
  }));

  server.get('/get-download', limiter.wrap((req, res) => {
    res.status(200).send(isDownLoad || ''); 
  }));

  //互动
  server.post('/set-action', limiter.wrap((req, res) => {
    distance=req.body
    console.log("distance"+distance)
  }));

  server.get('/get-action', limiter.wrap((req, res) => {
    res.status(200).send(distance || ''); 
  }));

  //是否成功连接上蓝牙
  server.post('/set-ble', limiter.wrap((req, res) => {
    isConnectBle=req.body
    console.log("isConnectBle"+isConnectBle)
  }));

  server.get('/get-ble', limiter.wrap((req, res) => {
    res.status(200).send(isConnectBle || ''); 
  }));

  //当前wifi
  // server.post('/set-wifi', limiter.wrap((req, res) => {
  //   currentWifi=req.body
  // }));

  // server.get('/get-wifi', limiter.wrap((req, res) => {
  //   res.status(200).send(currentWifi || ''); 
  // }));

  //主控器是否添加
  server.get('/get-close', limiter.wrap((req, res) => {
    res.status(200).send(getCloseBn() || ''); 
  }));

  //wifi下载
  server.post('/wifi-down', limiter.wrap((req, res) => {
    // if(req.body=='0'){
    //   fetch(`http://192.168.4.1:8082/upload_script`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json;'
    //     },
    //     body: JSON.stringify({ // 将参数转换为 JSON 字符串
    //         script: CODE
    //     }),
    //   })
    //   .then(response => response.text())
    //   .then(data => {
    //     console.log('服务器响应:', data);
    //   })
    //   .catch(error => {
    //     console.error('错误:', error);
    //   });
    // }
    console.log(req.body)
    fetch(`http://192.168.4.1:8080/upload_script`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;'
      },
      body: JSON.stringify({ // 将参数转换为 JSON 字符串
          script: req.body
      }),
    })
    .then(response => response.text())
    .then(data => {
      console.log('服务器响应:', data);
      let dataJson=JSON.parse(data)
      if(dataJson.status=='success'){
        res.send('111')
      }
      
    })
    .catch(error => {
      console.error('错误:', error);
    });
  }));

  //二维码数据
  server.post('/qr-down', limiter.wrap((req, res) => {
    console.log(req.body)
    fetch(`http://192.168.4.1:8080/qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;'
      },
      body: JSON.stringify({ // 将参数转换为 JSON 字符串
        data: req.body
    }),
    })
    .then(response => response.text())
    .then(data => {
      console.log('服务器响应:', data);
    })
    .catch(error => {
      console.error('错误:', error);
      console.log('11111111111111111111')
    });
  }));

  //人脸检测
  server.post('/face-down', limiter.wrap((req, res) => {
    fetch(`http://192.168.4.1:8080/face_detection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: req.body
    })
    .then(response => response.text())
    .then(data => {
      console.log('服务器响应:', data);
    })
    .catch(error => {
      console.error('错误:', error);
    });
  }));

  //手势识别
  server.post('/hand-down', limiter.wrap((req, res) => {
    fetch(`http://192.168.4.1:8080/gesture_recognition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: req.body
    })
    .then(response => response.text())
    .then(data => {
      console.log('服务器响应:', data);
    })
    .catch(error => {
      console.error('错误:', error);
    });
  }));

  //物体识别
  server.post('/object-down', limiter.wrap((req, res) => {
    fetch(`http://192.168.4.1:8080/20_object`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;'
      },
      body: JSON.stringify({ // 将参数转换为 JSON 字符串
        data: req.body
    }),
    })
    .then(response => response.text())
    .then(data => {
      console.log('服务器响应:', data);
    })
    .catch(error => {
      console.error('错误:', error);
    });
  }));



  //wifi下载代理
 

  // 启动服务器
  server.listen(port, () => {
    console.log(`服务器已启动，正在监听端口 ${port}`);
    // 停止服务器的函数
    stopServer = () => {
      console.log('停止服务器...');
      process.exit(0); // 优雅地关闭服务器
    };
  });
}


// 系统从休眠状态恢复
powerMonitor.on('resume', () => {
    // 弹出警告提示
  dialog.showMessageBox({
    type: 'warning',
    buttons: ['确定'],
    defaultId: 0,
    title: '系统恢复通知',
    message: '系统已从睡眠/休眠恢复。',
    detail: '您有一分钟的时间保存项目，随后将自动重启应用以确保功能正常。',
  });

  // 延时 60 秒后执行重启
  setTimeout(() => {
    app.relaunch(); // 重启应用
    app.exit();     // 退出当前实例
  }, 60 * 1000); // 60秒 = 60000 毫秒
});

// Allows certain versions of Scratch Link to work without an internet connection
// https://github.com/LLK/scratch-desktop/blob/4b462212a8e406b15bcf549f8523645602b46064/src/main/index.js#L45
app.commandLine.appendSwitch('host-resolver-rules', 'MAP device-manager.scratch.mit.edu 127.0.0.1');
// app.commandLine.appendSwitch('proxy-server', 'http=127.0.0.1:8888;https=127.0.0.1:8888');

app.on('session-created', async (session) => {
  // Permission requests are delegated to AbstractWindow
  // const win = new BrowserWindow({
  //   webPreferences: {
  //     nodeIntegration: true,
  //     contextIsolation: false
  //   }
  // });

  session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (!details.isMainFrame) {
      return false;
    }
    const window = AbstractWindow.getWindowByWebContents(webContents);
    if (!window) {
      return false;
    }
    const allowed = window.handlePermissionCheck(permission, details);
    return allowed;
  });

  session.setPermissionRequestHandler((webContents, permission, callback, details) => {
    if (!details.isMainFrame) {
      callback(false);
      return;
    }
    const window = AbstractWindow.getWindowByWebContents(webContents);
    if (!window) {
      callback(false);
      return;
    }
    window.handlePermissionRequest(permission, details).then((allowed) => {
      callback(allowed);
    });
  });

  session.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url.toLowerCase();
    // Always allow devtools
    if (url.startsWith('devtools:')) {
      return callback({});
    }

    const webContents = details.webContents;
    const window = AbstractWindow.getWindowByWebContents(webContents);
    if (!webContents || !window) {
      // Background requests for things like loading service workers in iframes
      // are not associated with a specific webcontents, so we'll just have to
      // allow these to avoid breakage.
      return callback({});
    }

    window.onBeforeRequest(details, callback);
  });

  session.webRequest.onHeadersReceived((details, callback) => {
    const window = AbstractWindow.getWindowByWebContents(details.webContents);
    if (!window) {
      return callback({});
    }
    window.onHeadersReceived(details, callback);
  });

  session.on('will-download', (event, item, webContents) => {
    const options = {
      // The default filename is a better title than "blob:..."
      title: item.getFilename()
    };

    // Ensure that the type selector shows proper names on Windows instead of things like "SPRITE3 File"
    const extension = path.extname(item.getFilename()).replace(/^\./, '').toLowerCase();
    const translated = tranlateOrNull(`files.${extension}`);
    if (translated !== null) {
      options.filters = [
        {
          name: translated,
          extensions: [extension]
        }
      ];
    }

    item.setSaveDialogOptions(options);
  });
});

app.on('web-contents-created', (event, webContents) => {
  // Overwritten by AbstractWindow. We just set this here as a safety measure.
  webContents.setWindowOpenHandler((details) => ({
    action: 'deny'
  }));
});

app.on('window-all-closed', () => {
  if (!isMigrating) {
    stopServer()
    console.log('执行了')
    if(getWin()){
      try{
        getWin().close()
      }catch(e){
        console.log(e)
      }
      
    }
    app.quit();
  }
});

// macOS
app.on('activate', () => {
  if (app.isReady() && !isMigrating && AbstractWindow.getWindowsByClass(EditorWindow).length === 0) {
    EditorWindow.newWindow();
  }
});

// macOS
const filesQueuedToOpen = [];
app.on('open-file', (event, path) => {
  event.preventDefault();
  // This event can be called before ready.
  if (app.isReady() && !isMigrating) {
    // The path we get should already be absolute
    EditorWindow.openFiles([path], '');
  } else {
    filesQueuedToOpen.push(path);
  }
});

/**
 * @param {string[]} argv
 * @returns {{files: string[]; fullscreen: boolean;}}
 */
const parseCommandLine = (argv) => {
  // argv could be any of:
  // turbowarp.exe project.sb3
  // electron.exe --inspect=sdf main.js project.sb3
  // electron.exe main.js project.sb3

  const files = argv
    // Remove --inspect= and other flags
    .filter((i) => !i.startsWith('--'))
    // Ignore macOS process serial number argument eg. "-psn_0_98328"
    // https://github.com/TurboWarp/desktop/issues/939
    .filter((i) => !i.startsWith('-psn_'))
    // Remove turbowarp.exe, electron.exe, etc. and the path to the app if it exists
    // defaultApp is true when the path to the app is in argv
    .slice(process.defaultApp ? 2 : 1);

  const fullscreen = argv.includes('--fullscreen');

  return {
    files,
    fullscreen
  };
};

let isMigrating = true;
let migratePromise = null;

app.on('second-instance', (event, argv, workingDirectory) => {

  // 找到已有的窗口并激活它
  const existingWindow = AbstractWindow.getWindowsByClass(EditorWindow)[0];
  if (existingWindow) {
    if (existingWindow.window.isMinimized()) existingWindow.window.restore();
    existingWindow.window.focus();
  }
  // migratePromise.then(() => {
  //   const commandLineOptions = parseCommandLine(argv);
  //   EditorWindow.openFiles(commandLineOptions.files, commandLineOptions.fullscreen, workingDirectory);
  // });

   
});

// ipcMain.on('channel-name', (event, data) => {
//   console.log(data)
// })

app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('enable-webgl'); // 保证 WebGL 不被停
app.commandLine.appendSwitch('enable-media-stream'); // 确保音视频流保持工作
app.whenReady().then(async() => {

  // setTimeout(()=>{
  //   app.relaunch(); // 重启应用（会保留当前执行参数）
  //   app.exit();     // 退出当前实例
  // },30000)
  // 启用必要的命令行开关
  app.commandLine.appendSwitch('enable-experimental-web-platform-features');
  // 配置USB权限
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'usb') callback(true);
    else callback(true);
  });
  startServer()
  await checkAndApplyCameraAccess()
  const WSS = new WebSocket.Server({ port: 8081 });
  WSS.on('connection', (ws) => {

    // const timer = setInterval(() => {
    //   if (ws.readyState === ws.OPEN) {
    //     ws.send(JSON.stringify({ type: 'heart', data: { message: 'heart' } }));
    //   }
    // }, 5000);


    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true; // 客户端回应 ping → 说明活着
      console.log('pong')
    });

    const pingInterval = setInterval(() => {
      if (ws.isAlive === false) {
        console.log('客户端无响应，关闭连接');
        return ws.terminate(); // 强制关闭
      }

      ws.isAlive = false;
      ws.ping(); // 发送原生 ping（不等于 send）
    }, 20000); // 30秒一次更合适

    ws.on('close', () => {
      // clearInterval(timer);
    });
    setSocket(ws)
    ws.on('message', async function incoming(message) {
      // console.log('Received from client:', message.toString());
      // console.log(JSON.parse(message).type)
      // console.log(JSON.parse(message).data.message)
      if(JSON.parse(message).type=='code'){
        fetch(`http://192.168.4.1:8080/upload_script`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;'
          },
          body: JSON.stringify({ // 将参数转换为 JSON 字符串
              script: JSON.parse(message).data.message
          }),
        })
        .then(response => response.text())
        .then(data => {
          console.log('服务器响应:', data);
          let dataJson=JSON.parse(data)
          if(dataJson.status=='success'){
            // res.send('111')
            // console.log('SUCCESS')
            ws.send(JSON.stringify({
              type:'wifiDown',
              data:{message:'success'}
            }))
          }else{
            ws.send(JSON.stringify({
              type:'wifiDown',
              data:{message:'error'}
            }))
          }
          
        })
        .catch(error => {
          console.error('错误:', error);
          ws.send(JSON.stringify({
            type:'wifiDown',
            data:{message:'error'}
          }))
        });
      }else if(JSON.parse(message).type=='offline'){
        // console.log('##############################################')
        Current.setWifi('')
      }else if(JSON.parse(message).type=='port'){
        let str=JSON.parse(message).data.message+'\n'
        console.log(typeof str)
        if(getPort()){
          await getPort().write(str, (err) => {
            if (err) {
              return reject('Error on write: ' + err.message);
            }
  
            console.log(`Data sent: ${str}`);
          });
        }
        
      }
      
  });
  })
  const wss = new WebSocket.Server({ port: 8082 });
  // setWss(wss)
  let previousDistance = null;  // 保存上一次的距离数据
  wss.on('connection', (ws) => {
    setBricksSocket(ws)
    ws.on('message', function incoming(message) {
      console.log(message)
    })
      // setInterval(()=>{
      //   ws.send(`${getDistance()}`);
      // },1000)
       // 定期检查 getDistance() 的值是否发生变化
      // setInterval(() => {
      //   const currentDistance = getDistance();  // 获取当前的距离

      //   // 如果当前的距离与之前的不同，则发送新数据
      //   if (JSON.stringify(currentDistance) !== JSON.stringify(previousDistance)) {
      //     console.log('sending')
      //     // ws.send(`${currentDistance}`);
      //     ws.send(JSON.stringify(currentDistance))
      //     previousDistance = currentDistance;  // 更新保存的距离数据
      //   }
      // }, 100);  // 每 100 毫秒检查一次
      
  });
  // createWindow()



  const w = new WebSocket.Server({ port: 8084 });

  w.on('connection', (ws) => {
    setBricksMotor(ws)
    // ws.on('message', function incoming(message) {
    //   console.log(message)
    // })
  })

 
  setInterval(()=>{
    // console.log(AbstractWindow.getAllWindows()[0].constructor.name)
    try{

      // console.log(AbstractWindow.getAllWindows())
      if(AbstractWindow.getAllWindows().length==0 && getWin()){
        // getWin().close()
        getWin().destroy()
      }
      if(AbstractWindow.getAllWindows()[0].constructor.name!='EditorWindow'){
        AbstractWindow.getAllWindows().forEach((win)=>{
          // console.log(win)
          if (!win.window.isDestroyed()) {
            win.window.close()
          }
        })
      }
      
    }catch(e){
      console.log(e)
    }
    
  },2000)

  app.on('activate', function () {
    // if (BrowserWindow.getAllWindows().length === 0){
      
    // } 
    
  })
  // ipcMain.on('toMain', (event, message) => {
  //   console.log(event)
  //   console.log(message)
  // })
  let failureCount = 0;  // 失败计数器

  function isDeviceConnected(ip) {
      return new Promise((resolve) => {
          exec(`ping -n 1 -w 500 ${ip}`, (error, stdout) => { // Windows: -n 1, Linux/macOS: -c 1
              if (error) {
                  resolve(false); // 无法 ping 通，设备可能未连接
              } else {
                  resolve(true); // 设备在线
              }
          });
      });
  }


  const interval = 2000; // 检查间隔，单位毫秒
  let lastStatus = null;

//  function checkOnline() {
//     const ip = currentEspIp.getIp();
//     if (ip !== '') {
//       const cmd = process.platform === 'win32' ? `ping -n 1 ${ip}` : `ping -c 1 ${ip}`;
//       exec(cmd, (error, stdout, stderr) => {
//         const isOnline = /TTL=/i.test(stdout); // 只要输出包含 TTL 就说明通
//         if (isOnline !== lastStatus) {
//           console.log(`[statusChange] ESP32 device ${isOnline ? 'online' : 'offline'}！`);

//           if (getSocket() && !isOnline) {
//             currentEspIp.setIp('');
//             getSocket().send(JSON.stringify({
//               type: 'espIpStatus',
//               data: { message: true }
//             }));
//           }

//           lastStatus = isOnline;
//         }
//       });
//     }
//   }



    function checkOnline() {
      const ip = currentEspIp.getIp();
      if (!ip) return;


      // console.log(ip)
      const ping = spawn('ping', ['-n', '4', ip]); // Windows: -n 是次数

      let output = '';
      ping.stdout.on('data', (data) => {
        output += data.toString();
        // console.log(data.toString())
      });

      ping.stderr.on('data', (data) => {
        console.error(`ping stderr: ${data}`);
      });

      ping.on('close', (code) => {
        // 分析输出中有多少个“TTL=”（代表成功收到响应）
        const successMatches = output.match(/TTL=/gi);
        const successCount = successMatches ? successMatches.length : 0;

        const isOnline = successCount >= 1; // 👈 至少成功 2 次才认为在线

        if (isOnline !== lastStatus) {
          console.log(`[statusChange] ESP32 device ${isOnline ? '🟢 online' : '🔴 offline'}`);
          if (getSocket() && !isOnline) {
            currentEspIp.setIp('');
            getSocket().send(JSON.stringify({
              type: 'espIpStatus',
              data: { message: true }
            }));
          }
          lastStatus = isOnline;
        } else {
          console.log(`[pingCheck] ESP32 untile ${isOnline ? 'online' : 'offline'} (${successCount}/4)`);
        }
      });
    

      // const ping = process.platform === 'win32'
      //   ? spawn('ping', ['-n', '1', ip])
      //   : spawn('ping', ['-c', '1', ip]);

      // let output = '';

      // ping.stdout.on('data', (data) => {
      //   output += data.toString();
      // });

      // const timeout = setTimeout(() => {
      //   ping.kill();
      // }, 3000); // 如果 3 秒还没响应，强制杀死
      // ping.on('close', (code) => {
      //   const isOnline = /TTL=/i.test(output);

      //   if (isOnline !== lastStatus) {
      //     console.log(`[statusChange] ESP32 device ${isOnline ? 'online' : 'offline'}！`);

      //     if (getSocket() && !isOnline) {
      //       currentEspIp.setIp('');
      //       getSocket().send(JSON.stringify({
      //         type: 'espIpStatus',
      //         data: { message: true }
      //       }));
      //     }

      //     lastStatus = isOnline;
      //   }
      // });
    }

  setInterval(checkOnline, interval);



  // setInterval(()=>{
  //   if(currentEspIp.getIp() !=''){
  //     // checkOnline()
  //     // isDeviceConnected(currentEspIp.getIp()).then((isConnected) => {
  //     //   console.log(`设备 ${currentEspIp.getIp()} 是否在线: ${isConnected}`);
        
  //     //   if (isConnected) {
  //     //     // 如果 ping 通了，重置失败计数器
  //     //     failureCount = 0;
  //     //   } else {
  //     //       // 如果 ping 不通，增加失败计数
  //     //       failureCount++;

  //     //       if (failureCount >= 3) {
  //     //           // 连续三次 ping 不通，执行操作
  //     //           currentEspIp.setIp('');
  //     //           if (getSocket()) {
  //     //               getSocket().send(JSON.stringify({
  //     //                   type: 'espIpStatus',
  //     //                   data: { message: true }
  //     //               }));
  //     //           }
  //     //           // 重置计数器
  //     //           failureCount = 0;
  //     //       }
  //     //   }
  //     // });

      
  //     exec("arp -a", (error, stdout, stderr) => {
  //       if (error) {
  //           console.error(`ERROR: ${error.message}`);
  //           return;
  //       }
  //       if (stderr) {
  //           console.error(`stderr: ${stderr}`);
  //           return;
  //       }
        
  //       // console.log("device list：");
  //       const regex = /(\d+\.\d+\.\d+\.\d+)/g;
  //       const ips = stdout.match(regex);
  //       // console.log(ips);
  //       try{
  //         if(!ips.includes(currentEspIp.getIp())){
  //           currentEspIp.setIp('')
  //           if(getSocket()){
  //             getSocket().send(JSON.stringify({
  //               type: 'espIpStatus',
  //               data: { message: true }
  //             }))
  //           }
  //         }
  //       }catch(e){
  //         console.log(e)
  //       }
        
  //     });
  //   }

    
  // },3000)



   // 检查更新
  // const server = 'http://8.130.129.159:9000/updates/';
  // const feed = `${server}${process.platform}-${process.arch}/${app.getVersion()}`;
  // console.log(feed)
  // // autoUpdater.setFeedURL({ url: feed });
  // try{
  //   autoUpdater.checkForUpdates();

  //     console.log(webContents)
  //     autoUpdater.on('update-available', () => {
  //       // webContents.send('update-available');
  //     });

  //     autoUpdater.on('update-downloaded', () => {
  //       const hiddenWin = new BrowserWindow({
  //         show: false,           // 不显示
  //         width: 800,
  //         height: 600,
  //         webPreferences: {
  //           nodeIntegration: true
  //         }
  //       });
  //       const choice = dialog.showMessageBoxSync(hiddenWin, {
  //         type: 'question',
  //         buttons: ['立即重启', '以后'],
  //         title: '可更新',
  //         message: '最新版本已就绪，是否立即更新?'
  //       });

  //       if (choice === 0) {
  //         // 用户选了 Restart，直接安装并退出
  //         hiddenWin.destroy();
  //         autoUpdater.quitAndInstall();
  //       } else {
  //         // 用户选了 Later，关闭窗口并销毁，保持进程可控
  //         hiddenWin.destroy();

  //         // 你可以选择主动退出应用，或者让它继续运行
  //         // app.quit();
  //       }
  //     });

  //     autoUpdater.on('error', (err) => {
  //       console.error('Update error:', err);
  //     });
  // }catch(e){
  //   console.log(e)
  // }

  // // 主进程未捕获异常捕获器
  // process.on('uncaughtException', (error) => {
  //   console.error('未捕获异常:', error);
  // });

  // process.on('unhandledRejection', (reason, promise) => {
  //   console.error('未处理的Promise拒绝:', reason);
  // });


  function safeCheckForUpdates() {
    return autoUpdater.checkForUpdates().catch((err) => {
      // 吃掉异常，不弹窗
      console.warn('自动更新检查失败:', err.message);
      return null; // 或根据需要返回标记
    });
  }

  function setupAutoUpdater() {
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.on('update-downloaded', () => {
      const hiddenWin = new BrowserWindow({
        show: false,
        webPreferences: { nodeIntegration: true }
      });

      const choice = dialog.showMessageBoxSync(hiddenWin, {
        type: 'question',
        buttons: ['立即重启', '以后'],
        title: '可更新',
        message: '最新版本已就绪，是否立即更新?'
      });

      hiddenWin.destroy();

      if (choice === 0) {
        autoUpdater.quitAndInstall();
      }
    });

    autoUpdater.on('error', (err) => {
      console.warn('autoUpdater error:', err.message);
    });

    // 全局兜底
    process.on('uncaughtException', (e) => {
      console.warn('未捕获异常:', e.message);
    });

    process.on('unhandledRejection', (reason) => {
      console.warn('未处理拒绝:', reason?.message || reason);
    });

    // 最终调用安全的更新检查
    safeCheckForUpdates();
  }

 
  setTimeout(() => {
    setupAutoUpdater();
  }, 3000); // 延迟3秒进行更新检查
  AbstractWindow.settingsChanged();

  migratePromise = migrate().then((shouldContinue) => {
    if (!shouldContinue) {
      // If we use exit() instead of quit() then openExternal() calls made before the app quits
      // won't work on Windows.
      app.quit();
      return;
    }

    isMigrating = false;

    const commandLineOptions = parseCommandLine(process.argv);
    EditorWindow.openFiles([
      ...filesQueuedToOpen,
      ...commandLineOptions.files
    ], commandLineOptions.fullscreen, process.cwd());

    if (AbstractWindow.getAllWindows().length === 0) {
      console.log('aaaaaaaaaa')
      // No windows were successfully opened. Let's just quit.
      if(getWin()){
        getWin().close()
      }
      app.quit();
    }

    // checkForUpdates()
    //   .catch((error) => {
    //     // We don't want to show a full error message when updates couldn't be fetched.
    //     // The website might be down, the internet might be broken, might be a school
    //     // network that blocks turbowarp.org, etc.
    //     console.error('Error checking for updates:', error);
    //   });
  });
});



ipcMain.handle('send-imagedata', async (event, imagedata) => {

  try {
    const response = await axios({
      method: "POST",
      url: "https://detect.roboflow.com/trafficmodel/5",
      params: {
        api_key: "VTJhX8PwBa8h7KJzpNov"
      },
      data: imagedata,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    // ✅ 将结果返回给渲染进程
    return response.data;

  } catch (error) {
    // ❗也返回错误给渲染进程（你可以自定义格式）
    return { error: true, message: error.message };
  }
})




//---------------------------------------





const DAPjs = require('dapjs');
const { DAPLink } = DAPjs;
const usb = require('usb');
const { ReadlineParser } = require('@serialport/parser-readline');
const {MicropythonFsHex }  = require('@microbit/microbit-fs');
const { microbitBoardId } = require('@microbit/microbit-universal-hex');
let options_mode ='full';//烧录模式---full：完整模式；incremental：增量模式



// 状态管理
const deviceState = {
  usbDevice: null,
  daplink: null,
  serialPort: null,
  parser: null,
  replActive: false,
  serialBuffer: '',
  currentResolve: null
};

// ==================== 设备扫描 ====================
ipcMain.handle('usb-request-device', async () => {
  try {
    // 扫描USB设备
    const usbDevices = usb.getDeviceList().filter(d => 
      d.deviceDescriptor.idVendor === 0x0d28 && 
      [0x0204, 0x0205].includes(d.deviceDescriptor.idProduct)
    );

    // 扫描串口设备
    const ports = await SerialPort.list();
    const microbitPorts = ports.filter(p => 
      p.vendorId === '0D28' && 
      ['0204', '0205'].includes(p.productId)
    );

    // 匹配
    const devices = usbDevices.map(d => {
      // Windows特殊处理
      let port = null;
      if (process.platform === 'win32') {
        // 从locationId中提取设备号
        const deviceNumber = `${d.busNumber}-${d.deviceAddress}`;
        port = microbitPorts.find(p => 
          p.locationId && p.locationId.includes(deviceNumber)
        );
        
        //匹配设备路径中的数字
        if (!port) {
          const usbPathMatch = d.device?.deviceAddress?.toString() || '';
          port = microbitPorts.find(p => 
            p.path && p.path.includes(usbPathMatch)
          );
        }
      } else {
        // 非Windows系统使用常规匹配
        port = microbitPorts.find(p => 
          p.serialNumber && d.serialNumber &&
          p.serialNumber === d.serialNumber
        );
      }
      
      return {
        vendorId: d.deviceDescriptor.idVendor,
        productId: d.deviceDescriptor.idProduct,
        busNumber: d.busNumber,
        deviceAddress: d.deviceAddress,
        serialNumber: d.serialNumber || 'N/A',
        comPort: port?.path || null,
        manufacturer: 'Micro:bit'
      };
    });

    return { 
      success: true, 
      devices,
      selectedDevice: devices[0] || null
    };
  } catch (err) {
    return { 
      success: false, 
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
  }
});

// ==================== 设备连接 ====================
ipcMain.handle('usb-connect-device', async (_, deviceInfo) => {
  try {
    // 先清理可能存在的旧连接
    await disconnectDevice();

    // 验证端口是否存在
    if (deviceInfo.comPort) {
      const ports = await SerialPort.list();
      if (!ports.some(p => p.path === deviceInfo.comPort)) {
        throw new Error(`COM端口 ${deviceInfo.comPort} 不可用`);
      }
    }

    // 初始化USB设备
    deviceState.usbDevice = usb.findByIds(deviceInfo.vendorId, deviceInfo.productId);
    if (!deviceState.usbDevice) throw new Error('设备未找到');

    // 打开设备-烧录使用
    try {
      deviceState.usbDevice.open();
      if (deviceState.usbDevice.interfaces?.length > 0) {
        deviceState.usbDevice.interfaces[0].claim();
      }
    } catch (openErr) {
      console.warn('设备打开警告:', openErr.message);
    }

    // 初始化串口-repl使用
    if (deviceInfo.comPort) {
      deviceState.serialPort = new SerialPort({
        path: deviceInfo.comPort,
        baudRate: 115200,
        autoOpen: false
      });

      await new Promise((resolve, reject) => {
        deviceState.serialPort.open(err => err ? reject(err) : resolve());
      });

      deviceState.parser = deviceState.serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));
      setupSerialListeners();// 监听断开或异常
    }

    notifyRenderer('usb-device-connected', { comPort: deviceInfo.comPort });
    return { success: true };
  } catch (err) {
    await disconnectDevice();
    return { success: false, error: err.message };
  }
});

// ==================== 断开功能 ====================
ipcMain.handle('usb-disconnect-device', async () => {
  try {
    // 检查是否有活动连接
    if (!deviceState.usbDevice && !deviceState.serialPort) {
      throw new Error('没有已连接的设备');
    }
    // 保存当前状态用于通知
    const wasReplActive = deviceState.replActive;
    // 执行断开操作
    await disconnectDevice();
    console.log(wasReplActive)
    notifyRenderer('usb-device-disconnected', { wasReplActive });
    return { 
      success: true, 
      message: '设备已断开连接',
      wasReplActive // 返回断开前的REPL状态
    };
  } catch (err) {
    return { 
      success: false, 
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
  }
});


// ==================== 固件烧录 ====================
ipcMain.handle('usb-flash-firmware', async () => {
  // try {
  //   if (!deviceState.usbDevice) {
  //     throw new Error('未找到连接的USB设备');
  //   }

  //   // 读取HEX文件
  //   const hexPath = path.join(__dirname, '../utils/microbit_firmware/MICROBIT.hex');
  //   const hexData = fs.readFileSync(hexPath);

  //  // await flashHexToDevice(hexData);
  //  try {
  //   // 创建DAPLink传输层
  //   const transport = new DAPjs.USB(deviceState.usbDevice);
  //   deviceState.daplink = new DAPLink(transport);

  //   // 连接设备
  //   await deviceState.daplink.connect();

  //   // 执行烧录
  //   await new Promise((resolve, reject) => {
  //     deviceState.daplink.on(DAPjs.DAPLink.EVENT_PROGRESS, progress => {
  //       const percent = Math.round(progress * 100);
  //       notifyRenderer('flash-progress', percent );
  //     });

  //     deviceState.daplink.flash(hexData)
  //       .then(resolve)
  //       .catch(reject);
  //   });
  // } catch (err) {
  //   // 确保发生错误时断开连接
  //   if (deviceState.daplink) {
  //     await deviceState.daplink.disconnect().catch(() => {});
  //     deviceState.daplink = null;
  //   }
  //   return { 
  //     success: false, 
  //     error: `烧录失败: ${err.message}`,
  //     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  //   };
  // }



  //   // 完成烧录
  //   //notifyRenderer('flash-status', { status: 'completed' });
  //   return { success: true, message: '固件烧录完成' };

  // } catch (err) {
  //   // 确保发生错误时断开连接
  //   if (deviceState.daplink) {
  //     await deviceState.daplink.disconnect().catch(() => {});
  //     deviceState.daplink = null;
  //   }
  //   return { 
  //     success: false, 
  //     error: `烧录失败: ${err.message}`,
  //     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  //   };
  // }



   try {
    // 读取HEX文件
    const hexPath = path.join(__dirname, '../utils/microbit_firmware/MICROBIT.hex');
    const hexData = fs.readFileSync(hexPath);

    // 弹出保存窗口，让用户选择 micro:bit U盘目录（或任意位置）
    const saveDialogResult = await dialog.showSaveDialog({
      title: '保存 HEX 文件到 micro:bit',
      defaultPath: 'MICROBIT.hex',
      filters: [
        { name: 'HEX 文件', extensions: ['hex'] }
      ]
    });

    if (saveDialogResult.canceled || !saveDialogResult.filePath) {
      return {
        success: false,
        error: '用户取消了保存 HEX 文件操作'
      };
    }

    //  return new Promise((resolve, reject) => {
    //   const child = fork(path.join(__dirname, '../utils/writeHexChild.js'));
    //   child.send({
    //     hexPath: path.join(__dirname, '../utils/microbit_firmware/MICROBIT.hex'),
    //     targetPath: saveDialogResult.filePath
    //   });

    //   child.on('message', (msg) => {
    //     resolve(msg);
    //   });

    //   child.on('error', (err) => {
    //     reject({ success: false, error: `子进程失败：${err.message}` });
    //   });
    // });

    // 将 HEX 数据写入用户指定的位置
    fs.writeFileSync(saveDialogResult.filePath, hexData);

    return {
      success: true,
      message: 'HEX 文件已保存，请手动复制或已直接保存至 micro:bit'
    };

  } catch (err) {
    return {
      success: false,
      error: `保存 HEX 文件失败: ${err.message}`,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
  }
});






//下载程序
ipcMain.handle('usb-download-flash', async (_, code) => {

    console.log(code)
    // code=`from microbit import *\ndisplay.show(Image.YES)\n`
    await generateV2Hex(code);

    const hexPath = path.join(__dirname, '../utils/microbit_firmware/MICROBIT.hex');
    const hexData = fs.readFileSync(hexPath);

    // try {
    //   // 创建DAPLink传输层
    //   const transport = new DAPjs.USB(getDeviceState().usbDevice);
    //   // deviceState.daplink = new DAPLink(transport);
    //   setDeviceState(['daplink',new DAPLink(transport)])

    //   // 连接设备
    //   await getDeviceState().daplink.connect();

    //   // 执行烧录
    //   await new Promise((resolve, reject) => {
    //     getDeviceState().daplink.on(DAPjs.DAPLink.EVENT_PROGRESS, progress => {
    //       const percent = Math.round(progress * 100);
    //       notifyRenderer('flash-progress', percent );
    //     });

    //     getDeviceState().daplink.flash(hexData)
    //       .then(async()=>{
    //         await getDeviceState().daplink.disconnect().catch(() => {});
    //         resolve()
    //       })
    //       .catch(reject);
    //   });
    // } catch (err) {
    //   // 确保发生错误时断开连接
    //   if (getDeviceState().daplink) {
    //     await getDeviceState().daplink.disconnect().catch(() => {});
    //     deviceState.daplink = null;
    //     setDeviceState(['daplink',null])
    //   }
    //   return { 
    //     success: false, 
    //     error: `烧录失败: ${err.message}`,
    //     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    //   };
    // }   


    // try {
    //   const oldDaplink = getDeviceState().daplink;
    //   if (oldDaplink) {
    //     await oldDaplink.disconnect().catch(() => {});
    //     setDeviceState(['daplink', null]);
    //   }

    //   const transport = new DAPjs.USB(getDeviceState().usbDevice);
    //   const daplink = new DAPjs.DAPLink(transport);
    //   setDeviceState(['daplink', daplink]);

      
    //   await daplink.connect();
    //   await new Promise(resolve => setTimeout(resolve, 500)); // 延迟确保设备准备好

    //   await new Promise((resolve, reject) => {
    //     daplink.on(DAPjs.DAPLink.EVENT_PROGRESS, progress => {
    //       const percent = Math.round(progress * 100);
    //       notifyRenderer('flash-progress', percent);
    //     });

    //     daplink.flash(hexData)
    //       .then(async () => {
    //         await daplink.disconnect().catch(() => {});
    //         resolve();
    //       })
    //       .catch(reject);
    //   });
    // } catch (err) {
    //   if (getDeviceState().daplink) {
    //     await getDeviceState().daplink.disconnect().catch(() => {});
    //     setDeviceState(['daplink', null]);
    //   }
    //   return {
    //     success: false,
    //     error: `烧录失败: ${err.message}`,
    //     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    //   };
    // }

      try {
        console.log(code)
        // 第一步：生成 HEX 文件（你已有这个函数）
        await generateV2Hex(code);

        // 第二步：读取生成的 HEX 文件
        // const hexPath = path.join(__dirname, '../utils/output_v2.hex');
        const hexPath = getResourcePath('/output_v2.hex')
        const hexData = fs.readFileSync(hexPath);

        console.log(hexData)
        // 第三步：弹出“保存文件”对话框，让用户选择保存路径（例如 micro:bit U盘）
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: '保存 HEX 文件到 micro:bit',
          defaultPath: 'microbit.hex',
          filters: [
            { name: 'HEX 文件', extensions: ['hex'] }
          ]
        });

        if (canceled || !filePath) {
          return {
            success: false,
            error: '用户取消了保存操作'
          };
        }

        // 第四步：保存 HEX 文件到用户指定的位置
        fs.writeFileSync(filePath, hexData);

        return {
          success: true,
          message: 'HEX 文件已保存，请在 micro:bit 中查看运行效果'
        };

      } catch (err) {
        return {
          success: false,
          error: `保存 HEX 文件失败: ${err.message}`,
          ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        };
    }
});


function getResourcePath(relativePath) {
    if (app.isPackaged) {
      // 打包后
      return path.join(process.resourcesPath, 'utils', relativePath);
    } else {
      // 开发环境
      return path.join(__dirname, '../utils', relativePath);
    }
  }
// ==================== HEX生成 ====================
async function generateV2Hex(code) {
  try{
    // 基础HEX
    // const baseHexPath = path.join(__dirname, '../utils/microbit_firmware/MICROBIT.hex');
    const baseHexPath = getResourcePath('/microbit_firmware/MICROBIT.hex')
    const hexContent = fs.readFileSync(baseHexPath, 'utf8');
    const fsHex = new MicropythonFsHex([{
      hex: hexContent,
      boardId: microbitBoardId.V2 
    }]);

    // 更新代码
    if (code && code.trim() !== '') {
        fsHex.write('main.py', code); 
    } else if (fsHex.exists('main.py')) {
        fsHex.remove('main.py');  
    }

    //板级HEX
    const boardHex = fsHex.getIntelHex(); 

    //生成文件
    // const outputPath = path.join(__dirname, '../utils/output_v2.hex');
    const outputPath = getResourcePath('/output_v2.hex')
    fs.writeFileSync(outputPath, boardHex);
  }catch(e){
    console.log(e)
  }
}



//进入烧录模式
ipcMain.handle('usb-exit-repl', async () => {
  try {
    if (!getDeviceState().replActive) {
      return { success: false, error: "未处于REPL模式" };
    }

    await sendSerialCommand('\x03'); 
    await sendSerialCommand('\x04'); 
    
    // deviceState.replActive = false;
    setDeviceState(['replActive',false])
    notifyRenderer('usb-flash-activated');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ==================== REPL功能 ====================
//进入repl模式
ipcMain.handle('usb-enter-repl', async () => {
  try {
    if (!getDeviceState().serialPort || getDeviceState().replActive) {
      return { success: false, error: "串口未连接或已处于REPL模式"};
    }

    // 中断当前程序
    await sendSerialCommand('\x03'); 
    await sendSerialCommand('from microbit import *\r',200);
    await sendSerialCommand('from ICreate import *\r',200);
    await sendSerialCommand('display.show(Image.HEART)\n\r', 200);
    
    // deviceState.replActive = true;
    setDeviceState(['replActive',true])
    notifyRenderer('usb-repl-activated');
    return { success: true , message: 'REPL模式已激活'};
  } catch (err) {
    return { success: false, error: err.message };
  }
});

//发送数据
ipcMain.handle('usb-send-command', async (_, command) => {
  try {
    if (!getDeviceState().serialPort) {
      return { success: false, error: "未连接设备" };
    }
    // deviceState.serialBuffer = '';// 清空上次结果

    setDeviceState(['serialBuffer',''])
    getDeviceState().serialPort.write(command + '\r\n');//发送
    
    // 等待响应
    const response = await new Promise((resolve) => {
      // deviceState.currentResolve = (data) => {
      //   deviceState.currentResolve = null;
      //   resolve(data);
      // };

      setDeviceState(['currentResolve', (data) => {
        setDeviceState(['currentResolve', null]);
        resolve(data);
      }]);
      
      // 超时
      // setTimeout(() => {
      //   if (deviceState.currentResolve) {
      //     deviceState.currentResolve = null;
      //     resolve(' 未收到响应');
      //   }
      // }, 2000);
    });

    // 控制发送速率
    await new Promise(resolve => setTimeout(resolve, 50));

    return { success: true, response: response.trim() };
  } catch (err) {
    return { success: false, error: err.message };
  }
});



// ==================== 相关函数 ====================
//断开初始化
async function disconnectDevice() {
  // 1. 先重置状态避免后续操作
  const stateCopy = { ...deviceState };
  deviceState.serialPort = null;
  deviceState.usbDevice = null;
  deviceState.daplink = null;
  deviceState.replActive = false;
  deviceState.serialBuffer = '';
  deviceState.currentResolve = null;
  // 2. 异步执行资源清理（避免阻塞主线程）
  return new Promise(resolve => {
    setImmediate(async () => {
      try {
        // 3. 关闭串口
        if (stateCopy.serialPort) {
          await closeSerialPort(stateCopy.serialPort);
        }

        // 4. 关闭USB设备
        // if (stateCopy.usbDevice) {
        //   await closeUsbDevice(stateCopy.usbDevice);
        // }
        // 5. 关闭DAPLink
        if (stateCopy.daplink) {
          await closeDapLink(stateCopy.daplink);
        }
      } catch (err) {
        console.error('资源清理错误:', err);
      } finally {
        resolve();
      }
    });
  });
}
async function closeSerialPort(port) {
  return new Promise(resolve => {
    try {
      // 移除所有监听器
      port.removeAllListeners();
      
      if (port.isOpen) {
        port.close(err => {
          if (err) console.error('串口关闭错误:', err);
          resolve();
        });
      } else {
        resolve();
      }
    } catch (err) {
      console.error('串口清理异常:', err);
      resolve();
    }
  });
}

async function closeUsbDevice(device) {
  return new Promise(resolve => {
    setTimeout(() => {
      try {
        // 检查设备是否仍然连接
        const stillConnected = usb.getDeviceList().some(d => 
          d.busNumber === device.busNumber &&
          d.deviceAddress === device.deviceAddress
        );

        if (!stillConnected) {
          console.warn('USB设备已物理断开');
          return resolve();
        }

        // 使用setTimeout避免NAPI冲突
        setTimeout(() => {
          try {
            device.close(() => {
              // 额外延迟确保资源释放
              setTimeout(resolve, 50);
            });
          } catch (err) {
            console.error('USB关闭异常:', err);
            resolve();
          }
        }, 0);
      } catch (err) {
        console.error('USB设备检查错误:', err);
        resolve();
      }
    }, 100); // 增加延迟
  });
}

async function closeDapLink(daplink) {
  return new Promise(resolve => {
    try {
      daplink.disconnect().then(resolve).catch(err => {
        console.error('DAPLink断开错误:', err);
        resolve();
      });
    } catch (err) {
      console.error('DAPLink断开异常:', err);
      resolve();
    }
  });
}

// 监听断开或异常
function setupSerialListeners() {
  // 先移除旧监听器
  if (getDeviceState().parser) {
    getDeviceState().parser.removeAllListeners();
  }

  getDeviceState().parser.on('data', data => {
    // deviceState.serialBuffer += data;
    setDeviceState(['serialBuffer',getDeviceState().serialBuffer+data])
    if (getDeviceState().serialBuffer.includes('>>>') && getDeviceState().currentResolve) {
      const response = getDeviceState().serialBuffer;
      console.log("####",response)
      // deviceState.serialBuffer = '';
      setDeviceState(['serialBuffer',''])
      getDeviceState().currentResolve(response);
      // deviceState.currentResolve = null;
      setDeviceState('currentResolve',null)
    }
  });

  getDeviceState().serialPort.once('close', () => {
    disconnectDevice().catch(console.error);
    notifyRenderer('usb-device-disconnected');
  });

  getDeviceState().serialPort.once('error', err => {
    disconnectDevice().catch(console.error);
    notifyRenderer('usb-device-error', { error: err.message });
  });
}

async function sendSerialCommand(command, delay = 50) {
  return new Promise((resolve, reject) => {
    getDeviceState().serialPort.write(command, err => {
      if (err) return reject(err);
      setTimeout(resolve, delay);
    });
  });
}

function notifyRenderer(channel, payload = {}) {
  const win = BrowserWindow.getAllWindows()[0];
  win?.webContents?.send(channel, payload);
}