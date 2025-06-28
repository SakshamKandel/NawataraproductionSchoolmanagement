# Quick Fix Script for Remaining Files

## Files to fix (systematically):

### Student Data Files:
1. StudentDashboard.jsx - 1 reference
2. FetchStudents.jsx - 1 reference  
3. FetchStudentData.jsx - 1 reference
4. ViewFee.jsx - 2 references
5. EditFeeRecord.jsx - 3 references
6. EditStudentData.jsx - 2 references

### Notice Files:
7. Notice.jsx - 5 references
8. NoticeDiagnostic.jsx - 2 references  
9. AttachmentTest.jsx - 6 references

### Admin Files:
10. ViewTeacherNotices.jsx - 3 references
11. ViewTeacherRoutine.jsx - 3 references
12. RoutineEdit.jsx - 3 references
13. ClassAssignment.jsx - 2 references
14. ViewClassRoutine.jsx - 1 reference
15. YearEndManagement.jsx - 10 references

### Teacher Files:
16. SubmitLeave.jsx - 2 references

Total: ~46 references across 16 files

## Import Path Patterns:
- `/components/` → `../config/api.js`
- `/components/admin_components/` → `../../config/api.js`  
- `/components/teachers_components/` → `../../config/api.js`
- `/components/students_data/` → `../../config/api.js`
- `/components/notices/` → `../../config/api.js`
- `/components/admin_components/routine_edit/` → `../../../config/api.js`
- `/components/students_data/fee_record/` → `../../../config/api.js`
- `/components/students_data/edit_profile/` → `../../../config/api.js`
- `/components/students_data/students_profile_view/` → `../../../config/api.js`
- `/components/teachers_components/leave_management/` → `../../../config/api.js`
- `/components/admin_components/year_end_management/` → `../../../config/api.js`
