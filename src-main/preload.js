const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  cancelBluetoothRequest: () => ipcRenderer.send('cancel-bluetooth-request'),
  bluetoothPairingRequest: (callback) => ipcRenderer.on('bluetooth-pairing-request', () => callback()),
  getDeviceList: (callback) => ipcRenderer.on('device-list', (event, arg) => {
    callback(arg);
  }),
  bluetoothPairingResponse: (response) => ipcRenderer.send('bluetooth-pairing-response', response),
  sendCharacteristic:(read,write)=> ipcRenderer.send('send-characteristic', read,write),
  sendCode: (callback) => ipcRenderer.on('send-code', () => callback()),
  requestData: () => ipcRenderer.send('request-data'), // 发送请求
  onReceiveData: (callback) => ipcRenderer.on('response-data', (event, data) => callback(data)) // 处理响应
})