import Teacher from "../../models/Teacher.js";
import Admin from "../../models/Admin.js";
import Student from "../../models/Student.js";
import student_controller from "./student_login_controller.js";
import teacher_controller from "./teacher_login_controller.js";
import admin_controller from "./admin_login_controller.js";


const loginMiddleware=async(req,res)=>{
    try {
        console.log('Login attempt for email:', req.body.email); // Debug log
        
        let result = await Teacher.findOne({ where: { email: req.body.email } });
        if(result)
        {
            console.log('Found teacher account'); // Debug log
            req.userType="teacher";
            req.data=result
            return teacher_controller(req,res)
        }
        
        result = await Admin.findOne({ where: { email: req.body.email } });
        if(result)
        {
            console.log('Found admin account'); // Debug log
            req.userType="admin";
            req.data=result
            return admin_controller(req,res)
        }
        
        result = await Student.findOne({ where: { email: req.body.email } });
        if(result)
        {
            console.log('Found student account'); // Debug log
            req.userType="student";
            req.data=result
            return student_controller(req,res)
        }

        console.log('No account found'); // Debug log
        return res.status(404).send("Invalid Email ID or Password")
    } catch (error) {
        console.log('Login error:', error); // Debug log
        res.status(404).send(error.message)
    }
}

export default loginMiddleware;