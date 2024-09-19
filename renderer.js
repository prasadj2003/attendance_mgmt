const { ipcRenderer } = require('electron');
const XLSX = require('xlsx');

let studentData = []; // Stores the parsed Excel data

// Function to handle file upload
function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const worksheet = workbook.Sheets[sheetName];
    const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Remove any header row and process the student data
    studentData = jsonSheet.slice(1).map(row => ({
      name: row[0],
      rollNumber: row[1],
      status: 'Absent' // Default status is 'Absent', teacher can change it
    }));

    displayStudentData();
  };

  reader.readAsArrayBuffer(file);
}

// Function to display the student data in the table
function displayStudentData() {
  const table = document.getElementById('attendance-table');

  // Clear the existing table rows except for the header
  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Roll Number</th>
      <th>Attendance Status</th>
    </tr>
  `;

  // Loop through the student data and create table rows
  studentData.forEach((student, index) => {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${student.name}</td>
      <td>${student.rollNumber}</td>
      <td>
        <select onchange="updateStatus(${index}, this)">
          <option value="Present">Present</option>
          <option value="Absent" selected>Absent</option>
        </select>
      </td>
    `;
    table.appendChild(newRow);
  });
}

// Function to update attendance status
function updateStatus(index, element) {
  studentData[index].status = element.value;
}

// Function to submit attendance
// Function to submit attendance
function submitAttendance() {
  ipcRenderer.send('submit-attendance', studentData);
  alert('Attendance submitted successfully!');
  
  // Clear the table and reset the studentData array
  studentData = [];
  const table = document.getElementById('attendance-table');
  
  // Reset table content to only show the header row
  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Roll Number</th>
      <th>Attendance Status</th>
    </tr>
  `;
}


// Receive confirmation from main process
ipcRenderer.on('attendance-saved', (event, message) => {
  alert(message);
});
