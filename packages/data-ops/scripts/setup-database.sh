#!/bin/bash

# Kurama Database Setup Script
# This script sets up the complete database with all seed data

set -e  # Exit on error

echo "🚀 Kurama Database Setup"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create a .env file with your database credentials:"
    echo ""
    echo "DATABASE_HOST=your-host"
    echo "DATABASE_USERNAME=your-username"
    echo "DATABASE_PASSWORD=your-password"
    echo ""
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Running database migrations...${NC}"
pnpm run drizzle:migrate
echo -e "${GREEN}✅ Migrations completed${NC}"
echo ""

echo -e "${YELLOW}📋 Step 2: Seeding base curriculum data...${NC}"
pnpm run seed
echo -e "${GREEN}✅ Base data seeded${NC}"
echo ""

echo -e "${YELLOW}📋 Step 3: Seeding core lessons (Math, French, English, Physics)...${NC}"
pnpm run seed:lessons
echo -e "${GREEN}✅ Core lessons seeded${NC}"
echo ""

echo -e "${YELLOW}📋 Step 4: Seeding extended lessons (SVT, History, Philosophy, Economics, Spanish)...${NC}"
pnpm run seed:lessons:extended
echo -e "${GREEN}✅ Extended lessons seeded${NC}"
echo ""

echo -e "${GREEN}🎉 Database setup complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  - 13 Grades"
echo "  - 4 Series"
echo "  - 12 Subjects"
echo "  - 17 Lessons"
echo "  - 61 Flashcards"
echo ""
echo "🚀 Next steps:"
echo "  1. cd ../../apps/user-application"
echo "  2. pnpm run dev:kurama-frontend"
echo "  3. Navigate to /app/subjects to see your content"
echo ""
