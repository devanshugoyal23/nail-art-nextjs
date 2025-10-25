#!/bin/bash

# Supabase Setup Script
echo "Setting up Supabase environment..."

# Create .env.local file
cat > .env.local << EOF
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uzlyuzhxayzaxmtzaslg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bHl1emh4YXl6YXhtdHphc2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzI1MDAsImV4cCI6MjA3NjgwODUwMH0.x8VdV93ZM4xvgQ_pAoRDhtyX1_RprdnqtTlCaqcPhlc

# Cloudflare R2 Configuration (Unified Bucket)
R2_ENDPOINT=https://05b5ee1a83754aa6b4fcd974016ecde8.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=75285deddfed8d17042993c0522c33f5
R2_SECRET_ACCESS_KEY=066792709f1ddeb4b2913ccbd6936817f3bc89bbbaf9482c7eef5e89269b588d

# R2 Public URL (Custom Domain)
R2_PUBLIC_URL=https://cdn.nailartai.app

# Site URL
NEXT_PUBLIC_SITE_URL=https://nailartai.app

# Admin Authentication (Optional - for basic protection)
ADMIN_PASSWORD=your_secure_admin_password

# API Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
EOF

echo "✅ Created .env.local file"
echo "📝 Please update the values in .env.local with your actual API keys"
echo ""
echo "To get your Supabase credentials:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to Settings > API"
echo "3. Copy the Project URL and Anon/Public Key"
echo "4. Update .env.local with these values"


