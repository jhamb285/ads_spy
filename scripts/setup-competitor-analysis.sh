#!/bin/bash
# Setup script for Competitive Analysis Feature
# 1-vs-5 Ad Dominance Engine

echo "🚀 Setting up Competitive Analysis feature..."
echo ""

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install uuid @types/uuid
echo "✅ Dependencies installed"
echo ""

# 2. Run database migration
echo "💾 Running database migration..."
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set. Please run:"
  echo "   export DATABASE_URL='your_database_url'"
  echo "   psql \$DATABASE_URL -f scripts/schema-competitor-analysis.sql"
else
  psql $DATABASE_URL -f scripts/schema-competitor-analysis.sql
  echo "✅ Database migration complete"
fi
echo ""

# 3. Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run build
echo "✅ TypeScript compilation complete"
echo ""

echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Restart the API server: pm2 restart ads-intel-api"
echo "2. Test the endpoint:"
echo "   curl -X POST http://localhost:1002/api/analyze-competitor-set \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"competitors\": [...]}'  # See plan for full example"
echo ""
echo "📖 Documentation: See implementation plan for API contract"
