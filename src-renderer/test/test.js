import {setWriter,setReader,getWriter,getReader} from '../../utils/ble.js'


let device;
let server;
let service;
let characteristicWrite;
let characteristicRead;
let state='0'
let isExit=false
let promise
let deviceName

document.getElementById('btn').addEventListener('click', async function () {
    let isContin=true
    device = await navigator.bluetooth.requestDevice({
      filters: [{
        services: ['0000fff0-0000-1000-8000-00805f9b34fb']
      }],
      // exclusionFilters: [{
      //   name: "未知或不支持的设备"
      // }],
      // acceptAllDevices: true,
      optionalServices: ['0000fff0-0000-1000-8000-00805f9b34fb']
    }).catch((e)=>{
      console.log(e)
      isContin=false
    })
    if (isContin){
      deviceName = device.name
      console.log(device.name)
      server = await device.gatt.connect();
      service = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
      characteristicWrite = await service.getCharacteristic('0000fff2-0000-1000-8000-00805f9b34fb');
      characteristicRead = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');
    
      setWriter(characteristicWrite)
      setReader(characteristicRead)
      device.addEventListener('gattserverdisconnected', onDisconnected);
      await characteristicRead.startNotifications()
    
      alert("连接成功！！！！！")
      document.getElementById('p6').innerText = deviceName
    }
})
