// electron/main.js
// NOTE: Root package.json me "type": "module" hai,
// lekin electron-builder extraMetadata me "type": "commonjs" set hai,
// isliye ye file CommonJS (require) me hi rahegi.

const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;

function createWindow() {
  const isMac = process.platform === "darwin";

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: "#000000",

    titleBarStyle: isMac ? "hidden" : "default",
    frame: true,
    show: false,
    center: true,

    ...(isMac && {
      trafficLightPosition: { x: 16, y: 16 },
    }),

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // ─────────────────────────────────────────────
  // Debug helpers (black screen diagnose)
  // ─────────────────────────────────────────────
  mainWindow.webContents.on("did-fail-load", (e, code, desc, url) => {
    console.log("did-fail-load:", code, desc, url);
  });

  mainWindow.webContents.on("render-process-gone", (event, details) => {
    console.log("render-process-gone:", details);
  });

  mainWindow.webContents.on("unresponsive", () => {
    console.log("Renderer became unresponsive");
  });

  // ─────────────────────────────────────────────
  // Load URL / File
  // ─────────────────────────────────────────────
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    // IMPORTANT: packaged app me safest path
    const indexPath = path.join(app.getAppPath(), "dist", "index.html");
    console.log("Loading:", indexPath);

    mainWindow.loadFile(indexPath);

    // TEMP: black screen debug ke liye prod me bhi devtools khol do
    // (issue fix ho jaye to is line ko remove kar dena)
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  // Ready hone par show karo
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // External links browser me open karo
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Window controls IPC
  ipcMain.on("minimize-window", () => {
    mainWindow.minimize();
  });

  ipcMain.on("maximize-window", () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });

  ipcMain.on("close-window", () => {
    mainWindow.close();
  });

  ipcMain.handle("get-version", () => app.getVersion());
  ipcMain.handle("get-platform", () => process.platform);

  // Maximize state renderer ko batao
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window-maximized", true);
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window-maximized", false);
  });
}

// App ready
app.whenReady().then(() => {
  createWindow();

  // Mac me app active ho to window recreate
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Windows/Linux me sab windows band hone par app quit
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});