

// let device;
// let server;
// let service;
// let characteristicWrite;
// let characteristicRead;
// let state='0'
// let isExit=false
// let promise
// let deviceName
// let CODE;
// // 序列化规则
// class CharacteristicSerializer {
//   static toString(characteristic) {
//     const proto = Object.getPrototypeOf(characteristic);
//     // 获取所有属性名称（包括不可枚举的）
//     let propertyNames = Object.getOwnPropertyNames(proto);
//      // 创建一个普通的对象来保存原型中的属性和方法名称
//      let serialized = {};

//      for (let name of propertyNames) {
//       if (name === 'writeValue') {
//         let descriptor = Object.getOwnPropertyDescriptor(proto, name);
      
//         // 只序列化那些可以安全序列化的属性（例如，跳过 getter/setter）
//         serialized[name] = descriptor.value;
//       }
      
//     }
//     console.log(serialized['writeValue'].toString());
//     console.log(proto);
//     return JSON.stringify({
//       writeValue:serialized['writeValue'].toString(),
//     }
      
//     )
//   }
  
//   static fromString(str) {
//     const data = JSON.parse(str)
//     // 重建对象
//     return {
//       writeValue: new Function('value', data.writeValue),
//     }
//   }
// }


// function startMsg(){
//   let msg=[0xAF,0x04,0x96,0x00,0x01,0x4a]
//   return msg;
// }

// function nameMsg(){
//   let msg=[0xAF,0x1C,0x00,0x06]
//   return msg;
// }

// function timeMsg(){
//   let msg=[0xAF,0x1C,0x01,0x06]
//   return msg;
// }

// function codeMsg(){
//   let msg=[0xAF,0x1C,0x02,0x06];
//   return msg;
// }

// function endMsg(){
//   let msg=[0xAF,0x04,0x96,0x00,0x00,0x49]
//   return msg;
// }

// function binToByteArray(binaryString) {
//   // 确保二进制字符串的长度为 16 位
//   if (binaryString.length !== 16) {
//       binaryString = binaryString.padStart(16, '0');
//   }

//   const byte1 = parseInt(binaryString.substring(0, 8), 2);
//   const byte2 = parseInt(binaryString.substring(8, 16), 2);

//   return new Uint8Array([byte1, byte2]);
// }

// function codeSlice(start,end,code){
//   return code.slice(start,end);
// }

// function stringToBinary(str) {
//   const encoder = new TextEncoder();
//   const uint8Array = encoder.encode(str);
//   return uint8Array;
// }

// let lanyaMsg=[]
// let lanyaStrMsg=''
// function createPromise() {
//   return new Promise(resolve => {
//     const eventListener = async (event) => {
//       let value = await event.target.value;
//       state = value.getUint8(0);
//         console.log(value.byteLength)
//       for (let i=0;i<value.byteLength-1;i++){
//           lanyaMsg.push(value.getUint8(i))
//       }
//       console.log(lanyaMsg)
//       for (let i=0;i<lanyaMsg.length;i++){
//           let char = String.fromCharCode(lanyaMsg[i]);
//           lanyaStrMsg = lanyaStrMsg + char.toString()
//       }
//       isExit = true;
//       console.log(state);
//       resolve(); // Signal event handling is done
//       characteristicRead.removeEventListener('characteristicvaluechanged', eventListener); // 移除事件监听器
//     };
//     characteristicRead.addEventListener('characteristicvaluechanged', eventListener);
//   });
// }






// document.getElementById('down').addEventListener('click',async ()=>{
//   // await window.electronAPI.sendCharacteristic('1','1')
//   // let code=window.electronAPI.sendCode((event,CODE)=>{
//   //   console.log(CODE);
//   // })
//   // console.log(code);

//   window.electronAPI.requestData(); // 请求数据
  
// })

// // 监听数据响应
// window.electronAPI.onReceiveData(async (data) => {
//   console.log(data); // 显示接收到的数据

//   let place=document.getElementById('place')
//   let fileName=document.getElementById('name')

//   console.log("坑位"+place.value)
//   console.log("名称"+fileName.value)
//   let NAME=place.value+'_'+fileName.value+'.py'


//   //发送代码

//   //开始请求信息（固定不变）
//   const data1 = new Uint8Array(startMsg());

//   //名称请求信息（固定不变）
//   let nameM = nameMsg();
//   let name = stringToBinary(NAME);
//   let j = 0;
//   for (let i = 4; i < 29; i++) {
//     if (j < name.length) {
//       nameM.push(name[j]);
//       j++;
//     } else {
//       nameM.push(0);
//     }
//   }
//   let perfi = 0;
//   for (let s = 0; s < nameM.length; s++) {
//     perfi = perfi + nameM[s];
//   }
//   nameM.push(perfi)
//   const data2 = new Uint8Array(nameM);
//   console.log(data2)

//   //结束请求信息（固定不变）
//   const data4 = new Uint8Array(endMsg());

//   const now = new Date()
//   let year=now.getFullYear()
//   let month=now.getMonth()+1
//   let date=now.getDate()
//   let hours=now.getHours()
//   let minutes=now.getMinutes()
//   let seconds=now.getSeconds()
//   console.log(year)
//   console.log(month)
//   console.log(date)
//   console.log(hours)
//   console.log(minutes)
//   console.log(seconds)

//   let yearBin=(year-1980).toString(2)
//   let first=(year-1980)*Math.pow(2,9)+month*32+date
//   let second=hours*2048+minutes*32+seconds/2

//   let firstArray=binToByteArray(first.toString(2))
//   let secondArray=binToByteArray(second.toString(2))
//   let timeM=timeMsg()
//   for (let p=0;p<firstArray.length;p++){
//     timeM.push(firstArray[p])
//   }
//   for (let q=0;q<secondArray.length;q++){
//     timeM.push(secondArray[q])
//   }
//   for (let k=8;k<29;k++){
//     timeM.push(0)
//   }
//   let totalTime = 0;
//   for (let x = 0; x < timeM.length; x++) {
//     totalTime = totalTime + timeM[x];
//   }
//   timeM.push(totalTime)
//   console.log(timeM)
//   const data5=new Uint8Array(timeM)

//   let dataTotalCode=[]
//   if (stringToBinary(CODE).length > 25) {//如果代码长度大于25则需要切片
//     let start = 0;
//     let end = 24
//     let flag = false;
//     while (true) {
//       if (flag) {
//         let dataCode = codeSlice(start, end, stringToBinary(CODE));
//         let codeM = codeMsg();
//         codeM.push(end - start);
//         for (let i = 0; i < dataCode.length; i++) {
//           codeM.push(dataCode[i]);
//         }
//         let len0 = 25 - end + start - 1;
//         for (let j = 0; j < len0; j++) {
//           codeM.push(0);
//         }
//         if (codeM.length>30){
//           codeM=codeM.slice(0,-1)
//         }
//         let m = 0;
//         for (let k = 0; k < codeM.length; k++) {
//           m = m + codeM[k];
//         }
//         codeM.push(m)
//         const data3 = new Uint8Array(codeM);
//         console.log(data3)
//         dataTotalCode.push(data3)
//         break;
//       }
//       let dataCode = codeSlice(start, end, stringToBinary(CODE));
//       let codeM = codeMsg();
//       codeM.push(end - start);
//       for (let i = 0; i < dataCode.length; i++) {
//         codeM.push(dataCode[i]);
//       }
//       let m = 0;
//       for (let k = 0; k < codeM.length; k++) {
//         m = m + codeM[k];
//       }
//       codeM.push(m)
//       const data3 = new Uint8Array(codeM);
//       start = end;
//       end = end + 24;
//       if (end > stringToBinary(CODE).length) {
//         end = stringToBinary(CODE).length
//         flag = true
//       }
//       console.log(data3)
//       dataTotalCode.push(data3)

//     }
//   } else {
//     console.log("执行了")
//     let codeM = codeMsg();
//     codeM.push(stringToBinary(CODE).length);
//     for (let i = 0; i < stringToBinary(CODE).length; i++) {
//       codeM.push(stringToBinary(CODE)[i]);
//     }
//     let len0 = 24 - stringToBinary(CODE).length
//     for (let j = 0; j < len0; j++) {
//       codeM.push(0)
//     }
//     let m = 0;
//     for (let k = 0; k < codeM.length; k++) {
//       m = m + codeM[k]
//     }

//     codeM.push(m);
//     const data3 = new Uint8Array(codeM);
//     dataTotalCode.push(data3)
//   }

//   await characteristicWrite.writeValue(data1);

//   await createPromise()
//   if (state=='48'){
//     console.log('开始请求发送成功')
//     await characteristicWrite.writeValue(data5)
//     await createPromise()
//     if (state=='48'){
//       console.log('时间发送成功')
//       await characteristicWrite.writeValue(data2);

//       await createPromise()
//       if (state=='48'){
//         console.log('名称发送成功')
//         for (let i=0;i<dataTotalCode.length;i++){
//           await characteristicWrite.writeValue(dataTotalCode[i]);
//           await createPromise()
//           if (state=='48'){
//             console.log('代码发送成功')
//             if (i==dataTotalCode.length-1){
//               console.log('开始发送结束请求')
//               await characteristicWrite.writeValue(data4);
//               await createPromise()
//               if (state=='48'){
//                 dataTotalCode=[]
//                 console.log('结束请求发送成功')
//                 alert('下载完毕')
//               }else {
//                 console.log('结束失败')
//               }
//             }
//           }else{
//             console.log('代码发送失败')
//           }
//         }
//       }
//     }

//   }

// });


// async function testIt () {  
//   // console.log(navigator);
  
//     const device = await navigator.bluetooth.requestDevice({
//          filters: [{ services: ['0000fff0-0000-1000-8000-00805f9b34fb'] }]
//     }).catch(err => {
//       alert(err)   
//     }
//     )
//     alert(device.name)
//     console.log(device);
    

//     server = await device.gatt.connect();
//     try{
//       service = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
//       characteristicWrite = await service.getCharacteristic('0000fff2-0000-1000-8000-00805f9b34fb');
//       characteristicRead = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');
//       // device.addEventListener('gattserverdisconnected', onDisconnected);
//       await characteristicRead.startNotifications()
//       // console.log(characteristicWrite.properties.writeValue);
      
      
//       // electronAPI.sendCharacteristic(characteristicRead,characteristicWrite)
//       // window.electronAPI.sendCharacteristic(JSON.stringify(service),JSON.stringify(characteristicWrite))

//     }catch(err){
//       alert(err)
//     }
    
//     document.getElementById('device-name').innerHTML = device.name || `ID: ${device.id}`
// }
  
//   document.getElementById('clickme').addEventListener('click', testIt)

//   function cancelRequest () {
//     window.electronAPI.cancelBluetoothRequest()
//   }
  
//   document.getElementById('cancel').addEventListener('click', cancelRequest)
  
//   window.electronAPI.bluetoothPairingRequest((event, details) => {
//     const response = {}
  
//     switch (details.pairingKind) {
//       case 'confirm': {
//         response.confirmed = window.confirm(`Do you want to connect to device ${details.deviceId}?`)
//         break
//       }
//       case 'confirmPin': {
//         response.confirmed = window.confirm(`Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`)
//         break
//       }
//       case 'providePin': {
//         const pin = window.prompt(`Please provide a pin for ${details.deviceId}.`)
//         if (pin) {
//           response.pin = pin
//           response.confirmed = true
//         } else {
//           response.confirmed = false
//         }
//       }
//     }
  
//     window.electronAPI.bluetoothPairingResponse(response)
//   })

let service
let serviceDown
let server
let characteristicWrite
let characteristicRead
let Lua=[0x4c,0x75,0x61,0x3a]
let Lua1=[0x4c,0x75,0x61,0x31]
let endLua=[0x65,0x6e,0x64,0x4c,0x75,0x61]
let CODE;

let lanyaMsg=[]
let lanyaStrMsg=''
function createPromise() {
  return new Promise(resolve => {
    const eventListener = async (event) => {
      let value = await event.target.value;
      state = value.getUint8(0);
        console.log(value.byteLength)
      for (let i=0;i<value.byteLength-1;i++){
          lanyaMsg.push(value.getUint8(i))
      }
      console.log(lanyaMsg)
      for (let i=0;i<lanyaMsg.length;i++){
          let char = String.fromCharCode(lanyaMsg[i]);
          lanyaStrMsg = lanyaStrMsg + char.toString()
      }
      isExit = true;
      console.log(state);
      resolve(); // Signal event handling is done
      characteristicRead.removeEventListener('characteristicvaluechanged', eventListener); // 移除事件监听器
    };
    characteristicRead.addEventListener('characteristicvaluechanged', eventListener);
  });
}

function stringToBinary(str) {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(str);
  return uint8Array;
}
console.log(window);
document.getElementById('get').addEventListener('click',()=>{
  fetch(`http://localhost:3000/get`,{
            method: 'GET'
    })
    .then(response => {
        if (response.ok) {
        return response.text();
        } else {
        throw new Error('请求失败，状态码：' + response.status);
        }
    })
    .then(code => {
        console.log('返回的变量值：', code);
        CODE=code
    })
    .catch(error => {
        console.error('发生错误：', error);
    });
})

document.getElementById('downLoad').addEventListener('click',async()=>{
  const encoder = new TextEncoder();
  const data1 = encoder.encode('Lua:').buffer;
  await characteristicWriteDown.writeValue(data1)
  // await createPromise()
  // const code=stringToBinary(CODE)
  const data2 = encoder.encode(CODE).buffer;
  console.log(data2)
  await characteristicWriteDown.writeValue(data2)
  const data3 = encoder.encode('endLua1').buffer;
  await characteristicWriteDown.writeValue(data3)
  // const data4=encoder.encode('Lua1').buffer;
  // await characteristicWriteDown.writeValue(data4)
  console.log('执行了')

})

document.getElementById('status').addEventListener('click',async()=>{
  // setInterval(async()=>{
  //   await createPromise()
  // },1000)
  characteristicRead.addEventListener('characteristicvaluechanged', (event)=>{
    console.log(event.target.value.getUint8(0));
    console.log(event.target.value.getUint8(1));
    console.log(event.target.value.getUint8(2));
    console.log(event.target.value.getUint8(3));
    console.log(event.target.value);
    
  });
})

async function testIt () {
  console.log(navigator);
  
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: ['108f94d5-570b-4a6c-9a47-12f428f362e6'] }],
    optionalServices: ['108f94d5-570b-4a6c-9a47-12f428f362e6', '4e8d78da-f40e-4983-9cc6-9b888aab1800']
  }).catch(e=>{
    console.log(e);
    
  })

  console.log('开始');
  
  server = await device.gatt.connect();
  console.log('结束');
  //1551BBE8-2765-11EE-BE56-0242AC120002
  //1551bbe8-2765-11ee-be56-0242ac120002
  try{
    service = await server.getPrimaryService('108f94d5-570b-4a6c-9a47-12f428f362e6');
    serviceDown = await server.getPrimaryService('4e8d78da-f40e-4983-9cc6-9b888aab1800');
    characteristicWrite = await service.getCharacteristic('20bc2441-0aed-48d0-81bd-68f28d02c2a6');
    characteristicRead = await service.getCharacteristic('407ccc3a-7ed4-42fc-b66f-899d82e1a695');
    characteristicWriteDown = await serviceDown.getCharacteristic('1551bbe8-2765-11ee-be56-0242ac120002');
    // device.addEventListener('gattserverdisconnected', onDisconnected);
    await characteristicRead.startNotifications()
    // console.log(characteristicWrite.properties.writeValue);
    
    
    // electronAPI.sendCharacteristic(characteristicRead,characteristicWrite)
    // window.electronAPI.sendCharacteristic(JSON.stringify(service),JSON.stringify(characteristicWrite))

  }catch(err){
    alert(err)
  }
  document.getElementById('device-name').innerHTML = device.name || `ID: ${device.id}`
}
// const clickEvent = new MouseEvent('click', {
//   bubbles: true,
//   cancelable: true,
//   view: window
// });

// setInterval(()=>{
//   document.getElementById('clickme').dispatchEvent(clickEvent);
// },2000)

document.getElementById('clickme').addEventListener('click', testIt)

function cancelRequest () {
window.electronAPI.cancelBluetoothRequest()
}

document.getElementById('cancel').addEventListener('click', cancelRequest)

window.electronAPI.bluetoothPairingRequest((event, details) => {
console.log('执行了');

const response = {}

switch (details.pairingKind) {
  case 'confirm': {
    response.confirmed = window.confirm(`Do you want to connect to device ${details.deviceId}?`)
    break
  }
  case 'confirmPin': {
    response.confirmed = window.confirm(`Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`)
    break
  }
  case 'providePin': {
    const pin = window.prompt(`Please provide a pin for ${details.deviceId}.`)
    if (pin) {
      response.pin = pin
      response.confirmed = true
    } else {
      response.confirmed = false
    }
  }
}

window.electronAPI.bluetoothPairingResponse(response)
})