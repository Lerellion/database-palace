#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Database Dashboard Demo Data Manager${NC}"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js to continue.${NC}"
    exit 1
fi

# Check if the required files exist
if [ ! -f "lib/seed.ts" ]; then
    echo -e "${RED}Error: Seed file not found. Make sure you're running this script from the project root.${NC}"
    exit 1
fi

# Function to create SQLite database schema
create_sqlite_schema() {
    echo -e "${BLUE}Creating SQLite database schema...${NC}"
    npx drizzle-kit push --dialect=sqlite --schema=./lib/schema/sqlite.ts
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}SQLite schema created successfully!${NC}"
        return 0
    else
        echo -e "${RED}Failed to create SQLite schema.${NC}"
        return 1
    fi
}

# Function to create Neon PostgreSQL database schema
create_neon_schema() {
    echo -e "${BLUE}Creating Neon PostgreSQL database schema...${NC}"
    
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}Error: DATABASE_URL environment variable is not set.${NC}"
        echo "Please set the DATABASE_URL environment variable to your Neon PostgreSQL connection string."
        return 1
    fi
    
    npx drizzle-kit push --dialect=pg --schema=./lib/schema/postgres.ts
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Neon PostgreSQL schema created successfully!${NC}"
        return 0
    else
        echo -e "${RED}Failed to create Neon PostgreSQL schema.${NC}"
        return 1
    fi
}

# Function to seed databases with demo data
seed_demo_data() {
    echo -e "${BLUE}Seeding databases with demo data...${NC}"
    node -r ts-node/register lib/seed.ts
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Demo data seeded successfully!${NC}"
        return 0
    else
        echo -e "${RED}Failed to seed demo data.${NC}"
        return 1
    fi
}

# Function to reset databases (remove all data)
reset_databases() {
    echo -e "${BLUE}Resetting databases...${NC}"
    
    # Reset SQLite database
    if [ -f "sqlite.db" ]; then
        rm sqlite.db
        echo -e "${GREEN}SQLite database reset.${NC}"
    else
        echo -e "${BLUE}SQLite database file not found, nothing to reset.${NC}"
    fi
    
    # For Neon, we'll just drop all tables
    if [ ! -z "$DATABASE_URL" ]; then
        echo -e "${BLUE}Dropping tables from Neon PostgreSQL database...${NC}"
        # This would require a PostgreSQL client to be installed
        # For simplicity, we'll just recreate the schema which will drop and recreate tables
        create_neon_schema
    else
        echo -e "${RED}DATABASE_URL not set, skipping Neon PostgreSQL reset.${NC}"
    fi
    
    return 0
}

# Main menu
while true; do
    echo ""
    echo "Please select an option:"
    echo "1) Create database schemas"
    echo "2) Seed databases with demo data"
    echo "3) Reset databases (remove all data)"
    echo "4) Full setup (create schemas + seed demo data)"
    echo "5) Exit"
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            create_sqlite_schema
            create_neon_schema
            ;;
        2)
            seed_demo_data
            ;;
        3)
            read -p "Are you sure you want to reset all databases? This will delete all data. (y/n): " confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                reset_databases
            else
                echo -e "${BLUE}Reset cancelled.${NC}"
            fi
            ;;
        4)
            reset_databases
            create_sqlite_schema
            create_neon_schema
            seed_demo_data
            ;;
        5)
            echo -e "${GREEN}Exiting. Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please enter a number between 1 and 5.${NC}"
            ;;
    esac
done
