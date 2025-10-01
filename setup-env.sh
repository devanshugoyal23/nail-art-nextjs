#!/bin/bash

# Supabase Setup Script
echo "Setting up Supabase environment..."

# Create .env.local file
cat > .env.local << EOF
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://nail-art-gallery.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF

echo "✅ Created .env.local file"
echo "📝 Please update the values in .env.local with your actual API keys"
echo ""
echo "To get your Supabase credentials:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to Settings > API"
echo "3. Copy the Project URL and Anon/Public Key"
echo "4. Update .env.local with these values"


