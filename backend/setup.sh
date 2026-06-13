#!/bin/bash

echo "Setting up LuxeScents Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo "Please edit .env file with your database credentials"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your PostgreSQL credentials"
echo "2. Run: npm run db:generate"
echo "3. Run: npm run db:migrate" 
echo "4. Run: npm run seed"
echo "5. Run: npm run dev"
