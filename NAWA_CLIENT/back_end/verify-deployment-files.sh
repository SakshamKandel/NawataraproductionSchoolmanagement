#!/bin/bash

# Deployment File Verification Script
# This script checks if all critical files are present before deployment

echo "========================================="
echo "NAWA BACKEND DEPLOYMENT FILE VERIFICATION"
echo "========================================="

# Set color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize counters
MISSING_FILES=0
TOTAL_CHECKS=0

# Function to check if file exists
check_file() {
    local file_path="$1"
    local file_type="$2"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✓${NC} $file_type: $file_path"
    else
        echo -e "${RED}✗${NC} $file_type: $file_path ${RED}(MISSING)${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
}

# Function to check if directory exists
check_directory() {
    local dir_path="$1"
    local dir_type="$2"
    
    if [ -d "$dir_path" ]; then
        echo -e "${GREEN}✓${NC} $dir_type: $dir_path/"
    else
        echo -e "${RED}✗${NC} $dir_type: $dir_path/ ${RED}(MISSING)${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
}

echo -e "\n${YELLOW}Checking Core Application Files...${NC}"
check_file "index.js" "Main Entry Point"
check_file "package.json" "Package Configuration"
check_file ".env" "Environment Configuration"

echo -e "\n${YELLOW}Checking Configuration Files...${NC}"
check_directory "config"
check_file "config/database.js" "Database Configuration (CRITICAL)"
check_file "config/init-db.js" "Database Initialization"
check_file "config/create-admin.js" "Admin Creation Script"
check_file "config/create-teacher.js" "Teacher Creation Script"

echo -e "\n${YELLOW}Checking Model Files...${NC}"
check_directory "models"
check_file "models/associations.js" "Model Associations"
check_file "models/Student.js" "Student Model"
check_file "models/Teacher.js" "Teacher Model"
check_file "models/Admin.js" "Admin Model"
check_file "models/Notice.js" "Notice Model"
check_file "models/Routine.js" "Routine Model"
check_file "models/ClassFee.js" "Class Fee Model"
check_file "models/StudentFee.js" "Student Fee Model"
check_file "models/TeacherPayroll.js" "Teacher Payroll Model"
check_file "models/TeacherNotice.js" "Teacher Notice Model"
check_file "models/LeaveRequest.js" "Leave Request Model"
check_file "models/AcademicYear.js" "Academic Year Model"

echo -e "\n${YELLOW}Checking Controller Files...${NC}"
check_directory "controllers"
check_file "controllers/authController.js" "Auth Controller"
check_file "controllers/routineController.js" "Routine Controller"
check_file "controllers/teacherController.js" "Teacher Controller"
check_file "controllers/teacherPayrollController.js" "Teacher Payroll Controller"

# Check admin controllers
check_directory "controllers/admin"
check_file "controllers/admin/admin_management_controller.js" "Admin Management Controller"
check_file "controllers/admin/notice_controller.js" "Notice Controller"
check_file "controllers/admin/studentDataController.js" "Student Data Controller"

# Check login controllers
check_directory "controllers/login"
check_file "controllers/login/admin_login_controller.js" "Admin Login Controller"
check_file "controllers/login/teacher_login_controller.js" "Teacher Login Controller"
check_file "controllers/login/student_login_controller.js" "Student Login Controller"

# Check other controller directories
check_directory "controllers/logout"
check_directory "controllers/noticeFetch"
check_directory "controllers/routinesFetch"
check_directory "controllers/setup"
check_directory "controllers/studentsData"
check_directory "controllers/teachersData"

echo -e "\n${YELLOW}Checking Route Files...${NC}"
check_directory "routes"
check_file "routes/authRoutes.js" "Auth Routes"
check_file "routes/routineRoutes.js" "Routine Routes"
check_file "routes/teacherRoutes.js" "Teacher Routes"
check_file "routes/teacherPayrollRoutes.js" "Teacher Payroll Routes"
check_file "routes/calendar.js" "Calendar Routes"
check_file "routes/leaveManagement.js" "Leave Management Routes"
check_file "routes/teacherManagement.js" "Teacher Management Routes"
check_file "routes/teacherNotices.js" "Teacher Notices Routes"

# Check route subdirectories
check_directory "routes/admin_accessible_routes"
check_directory "routes/login_logout"
check_directory "routes/notice"
check_directory "routes/routines"
check_directory "routes/teacher_accessible_routes"

echo -e "\n${YELLOW}Checking Middleware Files...${NC}"
check_directory "middleware"
check_file "middleware/auth.js" "Authentication Middleware"
check_file "middleware/verifyToken.js" "Token Verification Middleware"

echo -e "\n${YELLOW}Checking Token Files...${NC}"
check_directory "tokens"
check_file "tokens/token_verify.js" "Token Verification"
check_directory "tokens/token_roleslogin"
check_file "tokens/token_roleslogin/loginToken.js" "Login Token Handler"

echo -e "\n========================================="
echo "VERIFICATION SUMMARY"
echo "========================================="

if [ $MISSING_FILES -eq 0 ]; then
    echo -e "${GREEN}✓ ALL FILES PRESENT${NC} - Ready for deployment!"
    echo -e "Total files checked: $TOTAL_CHECKS"
    echo -e "\n${GREEN}DEPLOYMENT STATUS: READY${NC}"
    
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "1. Upload all files to cPanel using File Manager or FTP"
    echo "2. Maintain the exact directory structure"
    echo "3. Run 'npm install' on the server"
    echo "4. Test the application"
    
    exit 0
else
    echo -e "${RED}✗ MISSING FILES DETECTED${NC}"
    echo -e "Missing files: $MISSING_FILES"
    echo -e "Total files checked: $TOTAL_CHECKS"
    echo -e "\n${RED}DEPLOYMENT STATUS: NOT READY${NC}"
    
    echo -e "\n${YELLOW}Action Required:${NC}"
    echo "1. Fix the missing files listed above"
    echo "2. Run this script again to verify"
    echo "3. Do not deploy until all files are present"
    
    exit 1
fi
