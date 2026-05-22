// electron/main.js
// ⚠️ NOTE: "type": "module" hai package.json me
// isliye electron files CommonJS me hi likhni hain
// electron-builder extraMetadata me "type": "commonjs" set kiya hai

const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('path')

const isDev = !app.isPackaged

function createWindow() {
  const isMac = process.platform === 'darwin'
  const isWindows = process.platform === 'win32'
  const isLinux = process.platform === 'linux'

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: '#000000',

    // Mac me hidden titlebar, Windows/Linux me default
    titleBarStyle: isMac ? 'hidden' : 'default',
    frame: true,
    show: false,
    center: true,

    // Mac traffic lights position
    ...(isMac && {
      trafficLightPosition: { x: 16, y: 16 },
    }),

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    // Development mode
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // Production mode
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Ready hone par show karo
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // External links browser me open karo
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Window controls IPC
  ipcMain.on('minimize-window', () => {
    mainWindow.minimize()
  })

  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on('close-window', () => {
    mainWindow.close()
  })

  ipcMain.handle('get-version', () => {
    return app.getVersion()
  })

  ipcMain.handle('get-platform', () => {
    return process.platform
  })

  // Maximize state renderer ko batao
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized', false)
  })
}

// App ready
app.whenReady().then(() => {
  createWindow()

  // Mac me sab windows band ho jaye to dobara open karo
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Windows/Linux me sab windows band hone par app quit karo
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})