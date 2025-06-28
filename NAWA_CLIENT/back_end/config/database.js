import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Only log database credentials in development
if (process.env.NODE_ENV === 'development') {
  console.log('MYSQL_USER:', process.env.MYSQL_USER);
  console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD);
}

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'nawa_db',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize; 