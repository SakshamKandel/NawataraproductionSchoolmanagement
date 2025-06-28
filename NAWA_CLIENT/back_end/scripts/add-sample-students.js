import Student from '../models/Student.js';
import sequelize from '../config/database.js';

const sampleStudents = [
  // Nursery
  { name: 'Alice Johnson', grade: 'Nursery', fatherName: 'John Johnson', fatherPhone: '1234567890', motherName: 'Mary Johnson', motherPhone: '1234567891', address: '123 Main St', email: 'alice@test.com', password: 'password123' },
  { name: 'Bob Smith', grade: 'Nursery', fatherName: 'Robert Smith', fatherPhone: '2345678901', motherName: 'Linda Smith', motherPhone: '2345678902', address: '456 Oak Ave', email: 'bob@test.com', password: 'password123' },
  
  // L.K.G.
  { name: 'Charlie Brown', grade: 'L.K.G.', fatherName: 'David Brown', fatherPhone: '3456789012', motherName: 'Sarah Brown', motherPhone: '3456789013', address: '789 Pine St', email: 'charlie@test.com', password: 'password123' },
  { name: 'Diana Wilson', grade: 'L.K.G.', fatherName: 'Michael Wilson', fatherPhone: '4567890123', motherName: 'Emma Wilson', motherPhone: '4567890124', address: '321 Elm St', email: 'diana@test.com', password: 'password123' },
  
  // U.K.G.
  { name: 'Ethan Davis', grade: 'U.K.G.', fatherName: 'James Davis', fatherPhone: '5678901234', motherName: 'Lisa Davis', motherPhone: '5678901235', address: '654 Cedar Ave', email: 'ethan@test.com', password: 'password123' },
  { name: 'Fiona Miller', grade: 'U.K.G.', fatherName: 'William Miller', fatherPhone: '6789012345', motherName: 'Anna Miller', motherPhone: '6789012346', address: '987 Birch St', email: 'fiona@test.com', password: 'password123' },
  
  // Class 1
  { name: 'George Taylor', grade: '1', fatherName: 'Thomas Taylor', fatherPhone: '7890123456', motherName: 'Helen Taylor', motherPhone: '7890123457', address: '147 Maple St', email: 'george@test.com', password: 'password123' },
  { name: 'Hannah Anderson', grade: '1', fatherName: 'Christopher Anderson', fatherPhone: '8901234567', motherName: 'Jessica Anderson', motherPhone: '8901234568', address: '258 Walnut Ave', email: 'hannah@test.com', password: 'password123' },
  
  // Class 2
  { name: 'Ian Thomas', grade: '2', fatherName: 'Daniel Thomas', fatherPhone: '9012345678', motherName: 'Michelle Thomas', motherPhone: '9012345679', address: '369 Cherry St', email: 'ian@test.com', password: 'password123' },
  { name: 'Julia Jackson', grade: '2', fatherName: 'Matthew Jackson', fatherPhone: '0123456789', motherName: 'Amy Jackson', motherPhone: '0123456780', address: '741 Apple Ave', email: 'julia@test.com', password: 'password123' },
  
  // Class 3
  { name: 'Kevin White', grade: '3', fatherName: 'Anthony White', fatherPhone: '1122334455', motherName: 'Laura White', motherPhone: '1122334456', address: '852 Orange St', email: 'kevin@test.com', password: 'password123' },
  { name: 'Lily Harris', grade: '3', fatherName: 'Mark Harris', fatherPhone: '2233445566', motherName: 'Susan Harris', motherPhone: '2233445567', address: '963 Lemon Ave', email: 'lily@test.com', password: 'password123' },
  
  // Class 4
  { name: 'Mason Martin', grade: '4', fatherName: 'Steven Martin', fatherPhone: '3344556677', motherName: 'Karen Martin', motherPhone: '3344556678', address: '159 Peach St', email: 'mason@test.com', password: 'password123' },
  { name: 'Nora Garcia', grade: '4', fatherName: 'Paul Garcia', fatherPhone: '4455667788', motherName: 'Nancy Garcia', motherPhone: '4455667789', address: '357 Plum Ave', email: 'nora@test.com', password: 'password123' },
  
  // Class 5
  { name: 'Oscar Rodriguez', grade: '5', fatherName: 'Kenneth Rodriguez', fatherPhone: '5566778899', motherName: 'Dorothy Rodriguez', motherPhone: '5566778800', address: '468 Grape St', email: 'oscar@test.com', password: 'password123' },
  { name: 'Penny Lewis', grade: '5', fatherName: 'Joshua Lewis', fatherPhone: '6677889900', motherName: 'Sharon Lewis', motherPhone: '6677889901', address: '579 Berry Ave', email: 'penny@test.com', password: 'password123' },
  
  // Class 6
  { name: 'Quinn Lee', grade: '6', fatherName: 'Ryan Lee', fatherPhone: '7788990011', motherName: 'Cynthia Lee', motherPhone: '7788990012', address: '680 Coconut St', email: 'quinn@test.com', password: 'password123' },
  { name: 'Ruby Walker', grade: '6', fatherName: 'Brandon Walker', fatherPhone: '8899001122', motherName: 'Deborah Walker', motherPhone: '8899001123', address: '791 Mango Ave', email: 'ruby@test.com', password: 'password123' }
];

async function addSampleStudents() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Clear existing students
    await Student.destroy({ where: {} });
    console.log('Cleared existing students.');
    
    // Add sample students
    for (const studentData of sampleStudents) {
      await Student.create(studentData);
      console.log(`Added student: ${studentData.name} (Class ${studentData.grade})`);
    }
    
    console.log(`Successfully added ${sampleStudents.length} sample students.`);
    
    // Show summary by class
    const classSummary = {};
    for (const student of sampleStudents) {
      classSummary[student.grade] = (classSummary[student.grade] || 0) + 1;
    }
    
    console.log('\nClass Summary:');
    Object.entries(classSummary).forEach(([grade, count]) => {
      console.log(`Class ${grade}: ${count} students`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample students:', error);
    process.exit(1);
  }
}

addSampleStudents();
