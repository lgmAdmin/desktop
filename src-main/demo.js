// const { SerialPort } = require('serialport');

// let port;
// let writer;
// let reader;
// async function init(){
//   // 创建一个 SerialPort 对象
//   port = new SerialPort({
//     path: 'COM6', // 串口名称
//     baudRate: 115200, // 波特率
//     dataBits: 8, // 数据位
//     stopBits: 1, // 停止位
//     parity: 'none' // 校验位
//   })

// }
// init()
// // async function openPort(){
// //   await init()
// //   console.log(port.isOpen);
// //   if (!port.isOpen) {
// //     console.log(port.isOpen)
// //     port.open((err) => {
// //       console.log(port.isOpen)
// //         if (err) {
// //             console.error('Error opening port:', err);
// //         } else {
// //             console.log('Port opened successfully');
// //         }
// //     });
// //   } else {
// //     console.log('Port is already open');
// //   }
// // }
// // openPort()

// // 监听打开事件
// port.on('open', () => {
//   console.log('Port opened successfully');
//   console.log(port)
  
// });

// // 监听错误事件
// port.on('error', (err) => {
//   console.error('Serial port error:', err);
// });




