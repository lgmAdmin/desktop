const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('sendWifi', {
    sendNum:(num) => ipcRenderer.invoke('send-num', num),
    scanWifi: () => ipcRenderer.invoke('scan-wifi'),   // 扫描 Wi-Fi 网络
    connectWifi: (ssid, password) => ipcRenderer.invoke('connect-wifi', ssid, password), // 连接 Wi-Fi

    isClose: (flag) => ipcRenderer.invoke('close', flag), // 连接 Wi-Fi

    disConn: () => ipcRenderer.invoke('disConn'), // 连接 Wi-Fi


    sendData: async (message) => await ipcRenderer.invoke('whatssid', message),
    changeName: async (name) => await ipcRenderer.invoke('change-name',name),

    currentWifi: () => ipcRenderer.sendSync('current-wifi'),
})
