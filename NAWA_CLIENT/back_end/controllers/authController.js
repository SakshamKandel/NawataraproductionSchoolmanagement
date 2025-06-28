import Teacher from '../models/Teacher.js';
import Admin from '../models/Admin.js'; // Assuming you might have an Admin model too
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs'; // We'll add this if password hashing is implemented

const JWT_SECRET = 'YOUR_VERY_SECRET_KEY_CHANGE_THIS'; // IMPORTANT: Change this and move to .env

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Try to find a teacher first
    let user = await Teacher.findOne({ where: { email } });
    let userType = 'teacher';

    // If not a teacher, try to find an admin (optional)
    if (!user) {
      user = await Admin.findOne({ where: { email } });
      userType = 'admin';
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // IMPORTANT: Password comparison should use bcrypt if passwords are hashed.
    // const isMatch = await bcrypt.compare(password, user.password);
    // For now, doing a plain text comparison (NOT SECURE FOR PRODUCTION)
    const isMatch = user.password === password;

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: userType // or user.role if you have a role field
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name, // Assuming user has a name field
            email: user.email,
            role: userType // or user.role
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).send('Server error during login');
  }
}; 