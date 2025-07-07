const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('espSend', {
    sendWho:(who) => ipcRenderer.invoke('send-who', who),
    getStd: () => ipcRenderer.sendSync('get-std'),
    onResult: (callback) => {
        ipcRenderer.on('esptool-result', (event, result) => callback(result));
        ipcRenderer.on('avrdude-result', (event, result) => callback(result));
      },
    wifiInfo: async (info) => await ipcRenderer.invoke('wifi-info',info),

    usbWifiInfo: async (info) => await ipcRenderer.invoke('usb-wifi-info',info),

    setHistory: async (info) => await ipcRenderer.invoke('set-history',info),

    getHistory: () => ipcRenderer.sendSync('get-history'),
});