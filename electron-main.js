const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;

function getIconPath() {
  const candidates = [
    path.join(__dirname, 'public', 'logo.png'),
    path.join(__dirname, 'dist', 'logo.png'),
    path.join(__dirname, 'public', 'favicon.png'),
    path.join(__dirname, 'dist', 'favicon.png')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return undefined;
}

function createWindow() {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the web app that the backend server is hosting
  mainWindow.loadURL('http://localhost:3000');
  mainWindow.maximize();
}

app.whenReady().then(() => {
  // Start the Node.js backend server
  const serverPath = fs.existsSync(path.join(__dirname, 'dist', 'server.cjs'))
    ? path.join(__dirname, 'dist', 'server.cjs')
    : path.join(__dirname, '..', 'dist', 'server.cjs');

  serverProcess = fork(serverPath, [], {
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Give the server a second to boot up before opening the window
  setTimeout(createWindow, 1500);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
