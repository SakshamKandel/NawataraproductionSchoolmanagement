import { Sequelize, Op } from 'sequelize';
import Admin from './models/Admin.js';

async function checkAdmins() {
    try {
        
        const admins = await Admin.findAll({
            where: {
                email: {
                    [Op.in]: [
                        'admin@nawataraenglishschool.com',
                        'developer@nawataraenglishschool.com',
                        'admin@gmail.com',
                        'developer@gmail.com'
                    ]
                }
            }
        });

        console.log('Found admins:');
        admins.forEach(admin => {
            console.log(`- Email: ${admin.email} | Name: ${admin.name} | Role: ${admin.role}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error checking admins:', error);
        process.exit(1);
    }
}

checkAdmins();
