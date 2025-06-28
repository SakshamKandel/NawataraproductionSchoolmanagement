import Student from '../../models/Student.js';
import sequelize from '../../config/database.js'; // Import sequelize for transactions
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing

// Function to update roll numbers for all students in a class
async function updateRollNumbersForClass(grade, transaction) {
  try {
    const studentsInClass = await Student.findAll({
      where: { grade: grade },
      order: [
        ['name', 'ASC']
      ],
      transaction: transaction // Ensure this query is part of the transaction if one is passed
    });

    for (let i = 0; i < studentsInClass.length; i++) {
      const student = studentsInClass[i];
      if (student.rollNumber !== (i + 1).toString()) { // Only update if different
        student.rollNumber = (i + 1).toString();
        await student.save({ transaction: transaction });
      }
    }
    console.log(`Roll numbers updated for class ${grade}`);
  } catch (error) {
    console.error(`Error updating roll numbers for class ${grade}:`, error);
    // If an error occurs, the transaction should be rolled back by the caller
    throw error; // Re-throw to be caught by the main transaction handler
  }
}

const student_accountCreate = async (req, res) => {
    // Start a transaction
    const t = await sequelize.transaction();

    try {
        if (!req.admin) {
            await t.rollback();
            return res.status(403).json({ message: "Only admin can create student accounts" });
        }

        // Log the incoming request body for debugging
        console.log('Student creation request body:', req.body);        // Auto-generate professional email and password for the student
        const generateStudentEmail = async (name, transaction) => {
            // Get first 3 letters of the name (cleaned)
            const cleanName = name.toLowerCase()
                .replace(/[^a-z]/g, '') // Remove special characters and spaces
                .substring(0, 3); // Get first 3 letters
            
            // If name has less than 3 letters, pad with 'x'
            const namePrefix = cleanName.padEnd(3, 'x');
            
            // Generate a unique 3-digit code
            let uniqueCode = '';
            let isUnique = false;
            let attempts = 0;
            const maxAttempts = 999; // Max 3-digit codes available
            
            while (!isUnique && attempts < maxAttempts) {
                // Generate random 3-digit code (001-999)
                const randomCode = Math.floor(Math.random() * 999) + 1;
                uniqueCode = randomCode.toString().padStart(3, '0');
                
                const potentialEmail = `${namePrefix}${uniqueCode}@nawataraenglishschool.com`;
                
                // Check if this email already exists in database
                const existingStudent = await Student.findOne({ 
                    where: { email: potentialEmail }, 
                    transaction 
                });
                
                if (!existingStudent) {
                    isUnique = true;
                    return potentialEmail;
                }
                
                attempts++;
            }
            
            // If we couldn't find a unique code, fall back to timestamp
            const timestamp = Date.now().toString().slice(-6); // Use 6 digits for more uniqueness
            return `${namePrefix}${timestamp}@nawataraenglishschool.com`;
        };        
        const tempEmail = await generateStudentEmail(req.body.name, t);
        const defaultPassword = `nawa${Date.now().toString().slice(-4)}`; // nawa + last 4 digits of timestamp
        
        const studentData = {
          name: String(req.body.name),
          email: req.body.email || tempEmail, // Use provided email or auto-generate
          password: req.body.password || defaultPassword, // Use provided password or default
          grade: String(req.body.class_name || req.body.grade),
          section: req.body.section && req.body.section.trim() !== '' ? req.body.section.trim() : 'A', // Default to 'A' if empty or not provided
          // rollNumber will be set by updateRollNumbersForClass
          address: req.body.address,
          fatherName: req.body.father_name, // form is father_name, model is fatherName
          fatherPhone: req.body.father_phone,
          motherName: req.body.mother_name,
          motherPhone: req.body.mother_phone
        };

        // Check for required fields based on the model's needs (excluding email/password as they're auto-generated)
        const requiredFieldsFromModel = ['name', 'grade']; // email and password are now auto-generated
        const missingFields = requiredFieldsFromModel.filter(field => !studentData[field]);
        if (missingFields.length > 0) {
            await t.rollback();
            return res.status(400).json({
                message: "Validation Error",
                details: [`Missing required fields: ${missingFields.join(', ')}`]
            });
        }        // Check if student with email already exists (only if email was provided by admin)
        if (req.body.email) {
            const existingStudent = await Student.findOne({ where: { email: studentData.email }, transaction: t });
            if (existingStudent) {
                await t.rollback();
                return res.status(400).json({ 
                    message: "A student with this email already exists",
                    details: "Please use a different email address or check if the student is already registered"
                });
            }        }

        // Hash the password before creating the student
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(studentData.password, saltRounds);
        studentData.password = hashedPassword;

        // Create new student account (rollNumber is initially null or default)
        const newStudent = await Student.create({ ...studentData, rollNumber: 'TEMP' }, { transaction: t });
        
        // Update roll numbers for the entire class
        await updateRollNumbersForClass(newStudent.grade, t);

        // Commit the transaction
        await t.commit();
        
        res.status(201).json({ 
            message: "Student Account Creation Successful. Roll numbers updated.",
            studentId: newStudent.id
        });
    } catch (error) {
        // Rollback transaction if any error occurs
        await t.rollback();
        console.error("Student creation error (with rollback):", error);
        res.status(500).json({ 
            message: "Failed to create student account",
            details: error.message
        });
    }
};

export default student_accountCreate;