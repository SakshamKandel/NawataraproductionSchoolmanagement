#!/bin/bash

# cPanel Deployment Script for Nawa School Management System
echo "🚀 Starting cPanel Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Step 1: Clean and build frontend
print_step "Building frontend for production..."
cd front_end

# Clean previous build
if [ -d "dist" ]; then
    rm -rf dist
    print_status "Cleaned previous build"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_step "Installing frontend dependencies..."
    npm install
fi

# Build frontend
print_step "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    print_status "Frontend build successful!"
else
    print_error "Frontend build failed!"
    exit 1
fi

# Step 2: Prepare backend for deployment
print_step "Preparing backend for deployment..."
cd ../back_end

# Create production environment file
if [ ! -f ".env" ]; then
    cp .env.production-template .env
    print_warning "Created .env from template. Please update database credentials!"
else
    print_status "Using existing .env file"
fi

# Step 3: Create deployment package
print_step "Creating deployment package..."
cd ..

# Create deployment directory
DEPLOY_DIR="cpanel_deployment_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$DEPLOY_DIR"

print_step "Copying files to deployment directory..."

# Copy backend files
mkdir -p "$DEPLOY_DIR/backend"
cp -r back_end/{config,controllers,middleware,models,routes,public,*.js,package.json,.env} "$DEPLOY_DIR/backend/" 2>/dev/null

# Copy frontend build
mkdir -p "$DEPLOY_DIR/frontend"
cp -r front_end/dist/* "$DEPLOY_DIR/frontend/"

# Create installation script for cPanel
cat > "$DEPLOY_DIR/install-on-cpanel.sh" << 'EOF'
#!/bin/bash

echo "🔧 Installing Nawa School System on cPanel..."

# Step 1: Upload backend to ~/nawatara/ directory
echo "📁 Setting up backend directory..."
mkdir -p ~/nawatara
cp -r backend/* ~/nawatara/

# Step 2: Upload frontend to public_html
echo "📁 Setting up frontend..."
cp -r frontend/* ~/public_html/

# Step 3: Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ~/nawatara
npm install --production

# Step 4: Test database connection
echo "🔍 Testing database connection..."
node test-db-connection.js

echo "✅ Installation complete!"
echo "🚀 Start your backend with: cd ~/nawatara && node index.js"
EOF

chmod +x "$DEPLOY_DIR/install-on-cpanel.sh"

# Create README for deployment
cat > "$DEPLOY_DIR/README.md" << 'EOF'
# cPanel Deployment Package

## What's included:
- `backend/` - Complete backend application
- `frontend/` - Built frontend files
- `install-on-cpanel.sh` - Installation script

## Manual Installation Steps:

### 1. Upload Files
- Upload `backend/*` to `/home/nawatara/nawatara/`
- Upload `frontend/*` to `/home/nawatara/public_html/`

### 2. Update Database Configuration
Edit `/home/nawatara/nawatara/.env` with your cPanel database details:
```
MYSQL_HOST=localhost
MYSQL_USER=your_cpanel_db_user
MYSQL_PASSWORD=your_cpanel_db_password
MYSQL_DATABASE=your_cpanel_db_name
```

### 3. Install Dependencies
```bash
cd /home/nawatara/nawatara
npm install --production
```

### 4. Test Database Connection
```bash
node test-db-connection.js
```

### 5. Start Backend
```bash
NODE_ENV=production node index.js
```

## Troubleshooting:
- Check database credentials in cPanel MySQL section
- Ensure Node.js is available on your hosting
- Check file permissions (755 for directories, 644 for files)
EOF

print_status "Deployment package created in: $DEPLOY_DIR"

# Step 4: Create upload instructions
print_step "Creating upload instructions..."

cat > "$DEPLOY_DIR/UPLOAD_INSTRUCTIONS.txt" << EOF
📋 CPANEL UPLOAD INSTRUCTIONS

1. BACKEND UPLOAD:
   - Go to cPanel File Manager
   - Navigate to home directory (/home/nawatara/)
   - Create folder 'nawatara' if it doesn't exist
   - Upload all files from 'backend/' folder to '/home/nawatara/nawatara/'

2. FRONTEND UPLOAD:
   - Go to cPanel File Manager
   - Navigate to public_html folder
   - Upload all files from 'frontend/' folder to '/home/nawatara/public_html/'
   - Make sure index.html is in the root of public_html

3. DATABASE SETUP:
   - Go to cPanel MySQL Databases
   - Note your database name, username, and password
   - Update the .env file in /home/nawatara/nawatara/ with these credentials

4. INSTALL DEPENDENCIES:
   - Open cPanel Terminal (if available) OR SSH
   - Run: cd /home/nawatara/nawatara
   - Run: npm install --production

5. TEST CONNECTION:
   - Run: node test-db-connection.js
   - Should show "✅ Database connection successful"

6. START BACKEND:
   - Run: NODE_ENV=production node index.js
   - Should show "Server successfully running on port 3000"

🎯 Your site should now work at: https://nawataraenglishschool.com
EOF

print_status "Upload instructions created!"

# Final summary
echo ""
print_step "🎉 Deployment preparation complete!"
echo ""
print_status "Next steps:"
echo "1. Upload files from '$DEPLOY_DIR' to your cPanel"
echo "2. Follow instructions in UPLOAD_INSTRUCTIONS.txt"
echo "3. Update database credentials in .env file"
echo "4. Test the application"
echo ""
print_warning "Don't forget to update your database credentials in the .env file!"