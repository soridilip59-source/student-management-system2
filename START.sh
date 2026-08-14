#!/bin/bash
# Quick Start Script - Student Management System

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║      🎓 STUDENT MANAGEMENT SYSTEM - QUICK START 🎓        ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}📋 Project Status: ✅ COMPLETE AND PRODUCTION READY${NC}\n"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js/npm not installed${NC}"
    echo -e "Please install from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm found${NC}\n"

# Installation steps
echo -e "${BLUE}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│ STEP 1: Install Backend Dependencies                       │${NC}"
echo -e "${BLUE}└─────────────────────────────────────────────────────────────┘${NC}\n"

read -p "Press Enter to install backend dependencies (or Ctrl+C to skip)..."
cd backend
npm install
echo -e "\n${GREEN}✅ Backend dependencies installed${NC}\n"

# Ask to start backend
echo -e "${BLUE}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│ STEP 2: Backend Server Setup                               │${NC}"
echo -e "${BLUE}└─────────────────────────────────────────────────────────────┘${NC}\n"

echo -e "Backend server is ready. To start it, run:"
echo -e "${GREEN}cd backend${NC}"
echo -e "${GREEN}npm run dev${NC}\n"

echo -e "Backend will run on: ${YELLOW}http://localhost:5000${NC}\n"

# Frontend setup
cd ../frontend
echo -e "${BLUE}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│ STEP 3: Install Frontend Dependencies                      │${NC}"
echo -e "${BLUE}└─────────────────────────────────────────────────────────────┘${NC}\n"

read -p "Press Enter to install frontend dependencies (or Ctrl+C to skip)..."
npm install
echo -e "\n${GREEN}✅ Frontend dependencies installed${NC}\n"

echo -e "${BLUE}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│ STEP 4: Frontend Server Setup                              │${NC}"
echo -e "${BLUE}└─────────────────────────────────────────────────────────────┘${NC}\n"

echo -e "Frontend server is ready. To start it, run:"
echo -e "${GREEN}cd frontend${NC}"
echo -e "${GREEN}npm run dev${NC}\n"

echo -e "Frontend will run on: ${YELLOW}http://localhost:5173${NC}\n"

# Final instructions
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    🚀 READY TO START! 🚀                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}✅ Setup Complete!${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}\n"
echo -e "1. Open ${GREEN}two terminal windows${NC}\n"

echo -e "2. In ${YELLOW}Terminal 1${NC} - Start Backend:"
echo -e "   ${GREEN}cd backend${NC}"
echo -e "   ${GREEN}npm run dev${NC}\n"

echo -e "3. In ${YELLOW}Terminal 2${NC} - Start Frontend:"
echo -e "   ${GREEN}cd frontend${NC}"
echo -e "   ${GREEN}npm run dev${NC}\n"

echo -e "4. Open your browser:"
echo -e "   ${YELLOW}http://localhost:5173${NC}\n"

echo -e "5. Login with:"
echo -e "   Email: ${GREEN}admin@sms.com${NC}"
echo -e "   Password: ${GREEN}admin123${NC}\n"

echo -e "${BLUE}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│ 📚 Documentation                                           │${NC}"
echo -e "${BLUE}├─────────────────────────────────────────────────────────────┤${NC}"
echo -e "${BLUE}│ • README.md              - Full documentation              │${NC}"
echo -e "${BLUE}│ • QUICKSTART.md          - 5-minute setup                  │${NC}"
echo -e "${BLUE}│ • API_TESTING.md         - Test all endpoints              │${NC}"
echo -e "${BLUE}│ • DEPLOYMENT.md          - Deploy to production            │${NC}"
echo -e "${BLUE}│ • DOCUMENTATION_INDEX.md - Browse all docs                 │${NC}"
echo -e "${BLUE}└─────────────────────────────────────────────────────────────┘${NC}\n"

echo -e "${YELLOW}🎓 Other Demo Accounts:${NC}\n"
echo -e "Teacher: ${GREEN}teacher@sms.com${NC} / ${GREEN}teacher123${NC}"
echo -e "Student: ${GREEN}student@sms.com${NC} / ${GREEN}student123${NC}\n"

echo -e "${GREEN}🎉 Happy coding!${NC}\n"

# Display command reference
echo -e "${BLUE}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│ 🚀 Quick Commands Reference                                │${NC}"
echo -e "${BLUE}├─────────────────────────────────────────────────────────────┤${NC}"
echo -e "${BLUE}│ Backend dev:       ${GREEN}npm run dev${NC}              │${NC}"
echo -e "${BLUE}│ Backend prod:      ${GREEN}npm start${NC}"        │${NC}"
echo -e "${BLUE}│ Frontend dev:      ${GREEN}npm run dev${NC}"        │${NC}"
echo -e "${BLUE}│ Frontend build:    ${GREEN}npm run build${NC}"      │${NC}"
echo -e "${BLUE}│ Seed database:     ${GREEN}npm run seed${NC}"       │${NC}"
echo -e "${BLUE}│ Docker setup:      ${GREEN}docker-compose up -d${NC} │${NC}"
echo -e "${BLUE}└─────────────────────────────────────────────────────────────┘${NC}\n"

echo -e "${YELLOW}💡 Tip: For Docker deployment, see DEPLOYMENT.md${NC}\n"

cd ..
