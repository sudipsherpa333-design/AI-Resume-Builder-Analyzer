#!/bin/bash

# AI Resume Builder - Quick Start Script
# This script sets up and runs the entire application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18+: https://nodejs.org/"
        exit 1
    fi
    print_success "Node.js $(node --version) found"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm --version) found"
    
    # Check MongoDB (optional but recommended)
    if command -v mongod &> /dev/null; then
        print_success "MongoDB found locally"
    else
        print_warn "MongoDB not found locally. Using MongoDB Atlas or Docker is recommended."
    fi
}

# Setup backend
setup_backend() {
    print_header "Setting up Backend"
    
    cd backend
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_info "Creating .env file from template..."
        cat > .env << 'EOF'
# Server Configuration
PORT=5001
HOST=0.0.0.0
NODE_ENV=development

# Database (Update with your actual MongoDB URI)
MONGODB_URI=mongodb://localhost:27017/resume-builder

# API Keys (Add your actual keys)
OPENAI_API_KEY=sk-your-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars-required
JWT_EXPIRES_IN=7d

# URLs
CLIENT_URL=http://localhost:3000,http://localhost:5173
BACKEND_URL=http://localhost:5001

# Development
ENABLE_CLUSTER=false
LOG_LEVEL=debug
EOF
        print_success ".env file created. Please update it with your actual credentials."
        print_warn "IMPORTANT: Update MONGODB_URI, OPENAI_API_KEY, and other credentials in backend/.env"
    else
        print_success ".env file already exists"
    fi
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        print_info "Installing backend dependencies..."
        npm install
        print_success "Backend dependencies installed"
    else
        print_success "Backend dependencies already installed"
    fi
    
    cd ..
}

# Setup frontend
setup_frontend() {
    print_header "Setting up Frontend"
    
    cd frontend
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_info "Creating .env file..."
        cat > .env << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:5001/api

# Features
VITE_USE_MOCK_AI=false
VITE_ENABLE_ANALYTICS=true

# App Config
VITE_APP_NAME=AI Resume Builder
VITE_APP_URL=http://localhost:5173
EOF
        print_success ".env file created"
    else
        print_success ".env file already exists"
    fi
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        print_info "Installing frontend dependencies..."
        npm install
        print_success "Frontend dependencies installed"
    else
        print_success "Frontend dependencies already installed"
    fi
    
    cd ..
}

# Start MongoDB (if available)
start_mongodb() {
    print_header "Starting MongoDB"
    
    if command -v mongod &> /dev/null; then
        # Check if MongoDB is already running
        if ! mongo --eval "db.adminCommand('ping')" &> /dev/null; then
            print_info "Starting MongoDB service..."
            if [[ "$OSTYPE" == "darwin"* ]]; then
                brew services start mongodb-community || true
            elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                sudo systemctl start mongodb || sudo service mongodb start || true
            fi
            sleep 2
            print_success "MongoDB started"
        else
            print_success "MongoDB is already running"
        fi
    else
        print_warn "MongoDB not found locally. Make sure your MongoDB instance is running (MongoDB Atlas or Docker)."
    fi
}

# Start services
start_services() {
    print_header "Starting Services"
    
    print_info "Opening 2 terminal windows to run backend and frontend..."
    print_info "Press Ctrl+C to stop any service"
    
    # Check OS for terminal command
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - use open -a Terminal
        open -a Terminal <<EOF
cd "$(pwd)/backend" && npm run dev
EOF
        sleep 1
        open -a Terminal <<EOF
cd "$(pwd)/frontend" && npm run dev
EOF
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - use gnome-terminal or xterm
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd backend && npm run dev; exec bash"
            sleep 1
            gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e "cd backend && npm run dev" &
            sleep 1
            xterm -e "cd frontend && npm run dev" &
        else
            print_warn "Cannot open terminal automatically. Please start services manually:"
            print_info "Terminal 1: cd backend && npm run dev"
            print_info "Terminal 2: cd frontend && npm run dev"
        fi
    else
        print_warn "Cannot open terminal automatically on this OS."
        print_info "Please start services manually in separate terminals:"
        print_info "Terminal 1: cd backend && npm run dev"
        print_info "Terminal 2: cd frontend && npm run dev"
    fi
}

# Show summary
show_summary() {
    print_header "Setup Complete! 🎉"
    
    echo ""
    echo -e "${GREEN}Services will be running at:${NC}"
    echo -e "  ${BLUE}Frontend:${NC}   http://localhost:5173"
    echo -e "  ${BLUE}Backend:${NC}    http://localhost:5001"
    echo -e "  ${BLUE}API:${NC}        http://localhost:5001/api"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Update backend/.env with your MongoDB URI and API keys"
    echo "  2. Update frontend/.env if needed"
    echo "  3. Open http://localhost:5173 in your browser"
    echo "  4. Sign up and start creating resumes!"
    echo ""
    echo -e "${BLUE}📚 Documentation:${NC} See DEPLOYMENT.md for detailed instructions"
    echo ""
}

# Main execution
main() {
    print_header "AI Resume Builder - Quick Start"
    
    check_prerequisites
    setup_backend
    setup_frontend
    start_mongodb
    
    # Ask if user wants to start services
    read -p "Do you want to start the services now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_services
    else
        print_info "To start services manually, run:"
        echo "  Terminal 1: cd backend && npm run dev"
        echo "  Terminal 2: cd frontend && npm run dev"
    fi
    
    show_summary
}

# Run main function
main
