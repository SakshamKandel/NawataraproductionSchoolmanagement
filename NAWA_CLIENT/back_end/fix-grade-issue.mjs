import Student from './models/Student.js';

async function fixGradeIssue() {
  try {
    // Find students with grade "Two" and update to "2"
    const studentsWithWrongGrade = await Student.findAll({
      where: { grade: 'Two' }
    });
    
    console.log(`Found ${studentsWithWrongGrade.length} students with grade "Two":`);
    studentsWithWrongGrade.forEach(student => {
      console.log(`ID: ${student.id}, Name: ${student.name}, Grade: "${student.grade}", Section: "${student.section}"`);
    });
    
    if (studentsWithWrongGrade.length > 0) {
      // Update the grade from "Two" to "2"
      const updateResult = await Student.update(
        { grade: '2' },
        { where: { grade: 'Two' } }
      );
      
      console.log(`\nUpdated ${updateResult[0]} student(s) from grade "Two" to "2"`);
      
      // Verify the update
      const verifyStudents = await Student.findAll({
        where: { grade: '2' },
        order: [['section', 'ASC'], ['name', 'ASC']]
      });
      
      console.log(`\nAfter update, Class 2 students (${verifyStudents.length}):`);
      verifyStudents.forEach(student => {
        console.log(`ID: ${student.id}, Name: ${student.name}, Grade: "${student.grade}", Section: "${student.section}"`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error fixing grade issue:', error.message);
    process.exit(1);
  }
}

fixGradeIssue();
