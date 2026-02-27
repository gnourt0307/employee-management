const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 480, // slightly taller for new UI
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // win.webContents.openDevTools();

  win.loadFile(path.join(__dirname, "dist", "index.html"));
}

app.disableHardwareAcceleration();

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (BrowserWindow.getAllWindows().length > 0) {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    ipcMain.handle("get-mac", () => {
      const interfaces = os.networkInterfaces();
      for (let name in interfaces) {
        for (let net of interfaces[name]) {
          if (!net.internal && net.mac !== "00:00:00:00:00:00") {
            return net.mac;
          }
        }
      }
      return null;
    });
    createWindow();
  });
}
