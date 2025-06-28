import ExcelJS from 'exceljs';
import path from 'path';

async function createSampleStudentExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');

  // Add headers
  const headers = [
    'Student Name',
    'Address',
    "Father's Name",
    "Mother's Name",
    "Father's Phone",
    "Mother's Phone"
  ];

  worksheet.addRow(headers);

  // Add sample student data
  const sampleStudents = [
    ['Aarav Sharma', 'Kathmandu, Nepal', 'Ramesh Sharma', 'Sita Sharma', '9841234567', '9851234567'],
    ['Bina Thapa', 'Lalitpur, Nepal', 'Krishna Thapa', 'Maya Thapa', '9842345678', '9852345678'],
    ['Chetan Gurung', 'Bhaktapur, Nepal', 'Dorje Gurung', 'Pema Gurung', '9843456789', '9853456789'],
    ['Diya Patel', 'Pokhara, Nepal', 'Amit Patel', 'Nisha Patel', '9844567890', '9854567890'],
    ['Eshwar Koirala', 'Chitwan, Nepal', 'Shyam Koirala', 'Gita Koirala', '9845678901', '9855678901'],
    ['Fiona Rai', 'Dharan, Nepal', 'Bikash Rai', 'Sunita Rai', '9846789012', '9856789012'],
    ['Ganesh Magar', 'Butwal, Nepal', 'Tek Magar', 'Kamala Magar', '9847890123', '9857890123'],
    ['Hira Tamang', 'Janakpur, Nepal', 'Pemba Tamang', 'Diki Tamang', '9848901234', '9858901234'],
    ['Ishaan Joshi', 'Biratnagar, Nepal', 'Naresh Joshi', 'Meena Joshi', '9849012345', '9859012345'],
    ['Jyoti Adhikari', 'Nepalgunj, Nepal', 'Keshab Adhikari', 'Laxmi Adhikari', '9840123456', '9850123456']
  ];

  // Add sample data rows
  sampleStudents.forEach(student => {
    worksheet.addRow(student);
  });

  // Format the worksheet
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6FA' }
  };

  // Auto-fit columns
  worksheet.columns.forEach((column, index) => {
    column.width = Math.max(15, headers[index].length + 2);
  });

  // Add borders
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
  const filePath = path.join(process.cwd(), 'sample_students_data.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`Sample Excel file created: ${filePath}`);
}

createSampleStudentExcel().catch(console.error);
