import ExcelJS from 'exceljs';
import path from 'path';

async function createCleanStudentExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');

  // Add headers directly without any merged cells or instructions
  const headers = [
    'Student Name',
    'Address',
    "Father's Name",
    "Mother's Name",
    "Father's Phone",
    "Mother's Phone"
  ];

  // Add header row
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
    ['Jyoti Adhikari', 'Nepalgunj-4, Bus Park', 'Keshab Adhikari', 'Laxmi Adhikari', '9840123456', '9850123456']
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

  // Add borders to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Save the file
  const filePath = path.join(process.cwd(), 'clean_student_import.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`Clean student import file created: ${filePath}`);
  
  return filePath;
}

createCleanStudentExcel().catch(console.error);
