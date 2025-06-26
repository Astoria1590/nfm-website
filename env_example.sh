# Environment Variables for Admin Portal
# Copy this file to .env and fill in your actual values

# Server Configuration
PORT=5500
NODE_ENV=development

# Session Security
SESSION_SECRET=your-super-secure-session-secret-change-this

# Database Configuration
DATABASE_PATH=./db/admin_portal.sqlite

# Email Configuration (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads
