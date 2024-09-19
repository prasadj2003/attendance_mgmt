const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let attendanceData = [];

// Load attendance data from JSON file
function loadAttendanceData() {
  const filePath = path.join(__dirname, 'attendance.json');
  if (fs.existsSync(filePath)) {
    attendanceData = JSON.parse(fs.readFileSync(filePath));
  }
}

// Save attendance data to JSON file
function saveAttendanceData() {
  const filePath = path.join(__dirname, 'attendance.json');
  fs.writeFileSync(filePath, JSON.stringify(attendanceData, null, 2));
}

// Create the main window
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

// Start the app
app.whenReady().then(() => {
  loadAttendanceData();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle attendance submission
ipcMain.on('submit-attendance', (event, studentData) => {
  attendanceData.push(...studentData);
  saveAttendanceData();
  event.reply('attendance-saved', 'Attendance saved successfully');
});
