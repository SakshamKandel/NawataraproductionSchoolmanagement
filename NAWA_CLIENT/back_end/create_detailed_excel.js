import ExcelJS from 'exceljs';
import path from 'path';

async function createDetailedStudentExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Student Data');

  // Add title and instructions
  worksheet.mergeCells('A1:F1');
  worksheet.getCell('A1').value = 'STUDENT DATA IMPORT TEMPLATE';
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:F2');
  worksheet.getCell('A2').value = 'Instructions: Fill in the data below. Phone numbers must be exactly 10 digits or leave empty.';
  worksheet.getCell('A2').font = { italic: true, size: 10 };
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  // Add empty row
  worksheet.addRow([]);

  // Add headers in row 4
  const headers = [
    'Student Name',
    'Address',
    "Father's Name",
    "Mother's Name",
    "Father's Phone",
    "Mother's Phone"
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6FA' }
  };

  // Add sample student data
  const sampleStudents = [
    ['Aarav Sharma', 'Kathmandu-15, Bagbazar', 'Ramesh Sharma', 'Sita Sharma', '9841234567', '9851234567'],
    ['Bina Thapa', 'Lalitpur-12, Patan Dhoka', 'Krishna Thapa', 'Maya Thapa', '9842345678', '9852345678'],
    ['Chetan Gurung', 'Bhaktapur-8, Durbar Square', 'Dorje Gurung', 'Pema Gurung', '9843456789', '9853456789'],
    ['Diya Patel', 'Pokhara-16, Lakeside', 'Amit Patel', 'Nisha Patel', '9844567890', '9854567890'],
    ['Eshwar Koirala', 'Chitwan-10, Bharatpur', 'Shyam Koirala', 'Gita Koirala', '9845678901', '9855678901'],
    ['Fiona Rai', 'Dharan-5, Hospital Area', 'Bikash Rai', 'Sunita Rai', '9846789012', '9856789012'],
    ['Ganesh Magar', 'Butwal-11, Traffic Chowk', 'Tek Magar', 'Kamala Magar', '9847890123', '9857890123'],
    ['Hira Tamang', 'Janakpur-2, Station Road', 'Pemba Tamang', 'Diki Tamang', '9848901234', '9858901234'],
    ['Ishaan Joshi', 'Biratnagar-7, Main Road', 'Naresh Joshi', 'Meena Joshi', '9849012345', '9859012345'],
    ['Jyoti Adhikari', 'Nepalgunj-4, Bus Park', 'Keshab Adhikari', 'Laxmi Adhikari', '9840123456', '9850123456'],
    ['Kiran Bastola', 'Hetauda-3, New Bus Park', 'Mohan Bastola', 'Radha Bastola', '9841567890', '9851567890'],
    ['Lila Shrestha', 'Birgunj-15, Ghantaghar', 'Hari Shrestha', 'Kamala Shrestha', '9842567890', ''],
    ['Manoj KC', 'Itahari-6, Main Chowk', 'Bal KC', 'Saraswoti KC', '9843567890', '9853567890'],
    ['Nisha Pandey', 'Dhangadhi-1, Hospital Road', 'Gopal Pandey', 'Sushila Pandey', '', '9854567890'],
    ['Om Karki', 'Siddharthanagar-5, Bank Road', 'Ram Karki', 'Shanti Karki', '9845567890', '9855567890']
  ];

  // Add sample data rows
  sampleStudents.forEach(student => {
    worksheet.addRow(student);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column, index) => {
    if (index < headers.length) {
      column.width = Math.max(18, headers[index].length + 2);
    }
  });

  // Add borders to data area
  for (let rowIndex = 4; rowIndex <= 4 + sampleStudents.length; rowIndex++) {
    for (let colIndex = 1; colIndex <= headers.length; colIndex++) {
      const cell = worksheet.getCell(rowIndex, colIndex);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }

  // Add validation notes
  worksheet.addRow([]);
  worksheet.addRow(['VALIDATION RULES:']);
  worksheet.addRow(['• Student Name: Required, cannot be empty']);
  worksheet.addRow(['• Address: Required, cannot be empty']);
  worksheet.addRow(['• Father\'s Name: Required, cannot be empty']);
  worksheet.addRow(['• Mother\'s Name: Required, cannot be empty']);
  worksheet.addRow(['• Father\'s Phone: Must be exactly 10 digits or leave empty']);
  worksheet.addRow(['• Mother\'s Phone: Must be exactly 10 digits or leave empty']);

  // Save the file
  const filePath = path.join(process.cwd(), 'detailed_student_import_template.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`Detailed student import template created: ${filePath}`);
  
  return filePath;
}

createDetailedStudentExcel().catch(console.error);
