const {app, shell} = require('electron');
const AbstractWindow = require('./abstract');
const {translate, getStrings, getLocale} = require('../l10n');
const {APP_NAME} = require('../brand');
const settings = require('../settings');
const {isUpdateCheckerAllowed} = require('../update-checker');
const RichPresence = require('../rich-presence');

const { SerialPort } = require('serialport');
const Readline = require('@serialport/parser-readline')
// const parser = require('@serialport/parser-readline');
const {setPort,getPort} = require('../../utils/port')
const socket =require('../../utils/socket')


class SerialConnectWindow extends AbstractWindow {
  constructor () {
    super();

    this.window.setTitle(`串口连接 - ${APP_NAME}`);
    this.window.setMinimizable(false);
    this.window.setMaximizable(false);

    const ipc = this.window.webContents.ipc;
    ipc.on('get-strings', (event) => {
      event.returnValue = {
        locale: getLocale(),
        strings: getStrings()
      }
    });


    let PORT
    ipc.handle('send-connect-port', async (event, port) =>{
      console.log(port)

      // 创建一个 SerialPort 对象
      PORT = new SerialPort({
          path: port, // 串口名称
          baudRate: 115200, // 波特率
          dataBits: 8, // 数据位
          stopBits: 1, // 停止位
          parity: 'none' // 校验位
      },(err) =>{
        console.log(PORT)
      })


      // 监听打开事件
      PORT.on('open', () => {
        console.log('Port opened successfully');
        console.log(PORT)
        setPort(PORT)
        if(socket.getSocket()){
          socket.getSocket().send(JSON.stringify({
            type: 'isOpenPort',
            data: { message: true }
          }))
        }
        console.log('GETPORT: ')
        console.log(getPort())
        ipc.on('is-connected', (event) => {
          event.returnValue = {
            flag: true
          }
        });
        // try {
        //   let startMsg=[0xAF,0x04,0x96,0x00,0x01,0x4a]
        //   const data1 = new Uint8Array(startMsg);
        //   PORT.write(data1);
        // }
        // catch (err) {
        //   console.log('发送数据失败: ' + err.message+'\n');
        // }
        // // 创建解析器
        // const parserInstance = PORT.pipe(new parser({ delimiter: '\r\n' }));
        // // 监听数据
        // parserInstance.on('data', (data) => {
        //   console.log(`Received: ${data}`);
        // });
      
      });
  

      PORT.on('close',()=>{
        console.log('Port closed')
        if(socket.getSocket()){
          socket.getSocket().send(JSON.stringify({
            type: 'isOpenPort',
            data: { message: false }
          }))
        }
      })
      // 监听错误事件
      PORT.on('error', (err) => {
      console.error('Serial port error:', err);
      });

      let bufferData = '';
      PORT.on('data', (data) => {
        bufferData += data.toString(); // 累加接收到的串口数据

        // 判断是否一条消息结束（根据你的设备协议，这里以 \r\n 为结尾）
        if (bufferData.endsWith('\r\n')) {
          const message = bufferData.trim(); // 去除 \r\n 和空格
          bufferData = ''; // 清空缓存，准备下一条
          console.log(typeof message)
          if(message=='["success"]'){
            console.log(message)
          }
      
          // 尝试判断是不是 JSON 数组
          if (message.startsWith('[') && message.endsWith(']')) {
            // console.log('recive array'+message)
            try {
              const parsedArray = JSON.parse(message);
              // console.log('✅ 接收到数组:', parsedArray);
      
              
              // 广播或其他操作...
              socket.getSocket()?.send(JSON.stringify({
                type: 'serialData',
                data: { message: parsedArray }
              }));
      
            } catch (err) {
              // console.error('JSON 解析失败:', err.message);
            }
          } else {
            // console.log('recive string:', message);
      
            socket.getSocket()?.send(JSON.stringify({
              type: 'serialData',
              data: { message }
            }));
      
            // 你也可以做一些判断
            if (message === 'success') {
              console.log('SUCCESS');
            } else if (message === 'fail') {
              console.log('FAILED');
            }
          }
        }
      });


      // // 创建解析器，每次读取一行
      // const parser = PORT.pipe(new Readline({ delimiter: '\r\n' }))

      // // 监听数据
      // parser.on('data', (line) => {
      //   try {
      //     const data = JSON.parse(line)
      //     console.log('收到 JSON 数据:', data)

      //     if (Array.isArray(data) && data[0] === 'success') {
      //       console.log('aaaaaaaaaaa')
      //     }

      //   } catch (err) {
      //     console.error('JSON 解析失败:', err.message, '收到原始数据:', line)
      //   }
      // })
      // PORT.on('readable',()=>{
      //   console.log(PORT.read());
        
      // })

    })
    

    const session = require('electron').session;
    session.defaultSession.setPermissionCheckHandler((permission, details) => {
      if (permission === 'serial') {
        return true; // 允许访问串口设备
      }
      return false;
    });

    

    let port;
    let writer;
    let reader;
    let PORTS=[]
    async function init(){
      await SerialPort.list().then(ports => {
        ports.forEach(port=>{
          console.log(port.path)
          PORTS.push(port.path)
          // console.log(PORTS)
        })
      })
      console.log(PORTS)
      ipc.on('get-ports', (event) => {
        event.returnValue = {
          PORTS
        }
      });
    

    }
    init()



    
    this.loadURL('serial-connect://./serial-connect.html');
  }

  getDimensions () {
    return {
      width: 550,
      height: 500
    };
  }

  getPreload () {
    return 'serial-data';
  }

  isPopup () {
    return true;
  }

  static show () {
    const window = AbstractWindow.singleton(SerialConnectWindow);
    window.show();
  }
}

module.exports = SerialConnectWindow;
