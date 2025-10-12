#!/bin/bash

echo "🔒 Setting up Security for Nail Art Application"
echo "=============================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please run ./setup-env.sh first to create the environment file."
    exit 1
fi

echo "✅ .env.local file found"

# Check if ADMIN_PASSWORD is set
if grep -q "ADMIN_PASSWORD=your_secure_admin_password" .env.local; then
    echo "⚠️  ADMIN_PASSWORD is still set to default value!"
    echo ""
    echo "Please edit .env.local and set a strong admin password:"
    echo "ADMIN_PASSWORD=your_very_secure_password_here"
    echo ""
    echo "Example:"
    echo "ADMIN_PASSWORD=MySecureAdminPass123!@#"
    echo ""
    read -p "Press Enter after you've updated the password..."
fi

# Check if ADMIN_PASSWORD is properly set
if grep -q "ADMIN_PASSWORD=" .env.local && ! grep -q "ADMIN_PASSWORD=your_secure_admin_password" .env.local; then
    echo "✅ ADMIN_PASSWORD is configured"
else
    echo "❌ ADMIN_PASSWORD is not properly configured"
    echo "Please set a strong password in .env.local"
    exit 1
fi

echo ""
echo "🔒 Security Setup Complete!"
echo "=========================="
echo ""
echo "Your admin panel is now protected with authentication."
echo ""
echo "To test security:"
echo "1. Start your dev server: npm run dev"
echo "2. Go to: http://localhost:3000/admin/generate"
echo "3. You should see a login page"
echo "4. Enter your admin password to access the panel"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "- Never commit .env.local to version control"
echo "- Use different passwords for development and production"
echo "- Keep your admin password secure"
echo "- Monitor your application for suspicious activity"
