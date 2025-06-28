import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Server Configuration
PORT=8000
NODE_ENV=development

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=S@ksham123
MYSQL_DATABASE=nawa_db

# JWT Configuration
SECRET_KEY=mysecretkeyfornawasystem23498759834759843
JWT_EXPIRES_IN=24h
`;

fs.writeFileSync(path.join(__dirname, '.env'), envContent);
console.log('Created .env file with SECRET_KEY'); 