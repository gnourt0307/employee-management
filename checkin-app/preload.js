const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getMacAddress: () => ipcRenderer.invoke("get-mac"),
});
