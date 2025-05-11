# PostgreSQL Dashboard

A powerful dashboard for visualizing and managing Neon PostgreSQL databases. This dashboard provides a clean interface for viewing table data, visualizing schema relationships, monitoring database metrics, and performing CRUD operations.

## Features

- **PostgreSQL Support**: Works with Neon PostgreSQL databases
- **Table Viewer**: Browse and search table data with sorting and pagination
- **Schema Visualization**: Interactive diagram of table relationships
- **Database Metrics**: Comprehensive statistics about your database
- **CRUD Operations**: Create, read, update, and delete records
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Neon PostgreSQL account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/postgres-dashboard.git
   cd postgres-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Neon PostgreSQL configuration
   DATABASE_URL=your_neon_connection_string
   ```

4. Run the setup script to create database schemas and seed demo data:
   ```bash
   chmod +x scripts/toggle-demo-data.sh
   ./scripts/toggle-demo-data.sh
   ```
   
   Select option 4 for a full setup (create schemas + seed demo data).

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the dashboard.

## Usage

### Viewing Table Data

1. Select a table from the sidebar
2. View the table data in the main panel
3. Use the search box to filter records
4. Click on column headers to sort data
5. Use pagination controls to navigate through large datasets

### Managing Records

1. Click the "Add Record" button to create a new record
2. Use the actions menu (three dots) to edit or delete existing records

### Visualizing Schema

1. Click the "Schema Diagram" tab to view table relationships
2. Drag tables to rearrange them
3. Zoom in/out using the controls or mouse wheel

### Monitoring Database Metrics

1. Click the "Database Metrics" tab to view statistics
2. Explore charts showing table sizes and row counts
3. View detailed metrics for each table

## Demo Data

The dashboard comes with a demo data script that creates sample tables and populates them with test data. To manage demo data:

```bash
./scripts/toggle-demo-data.sh
```

This script provides options to:
1. Create database schemas
2. Seed databases with demo data
3. Reset databases (remove all data)
4. Perform a full setup (create schemas + seed demo data)

## Project Structure

```
├── app/                  # Next.js app directory
├── components/           # React components
├── lib/                  # Utility functions and database logic
│   ├── actions/          # Server actions
│   ├── schema/           # Database schema definitions
│   └── services/         # Database services
├── drizzle/              # Drizzle ORM migrations
├── scripts/              # Utility scripts
│   └── toggle-demo-data.sh  # Script to manage demo data
├── drizzle.config.ts     # Drizzle ORM configuration
└── README.md             # Project documentation
```

## Customization

### Adding Your Own Tables

1. Define your table schema in `lib/schema/postgres.ts`
2. Run migrations using Drizzle Kit:
   ```bash
   npx drizzle-kit push
   ```

### Extending Functionality

- Add new components in the `components/` directory
- Create new server actions in the `lib/actions/` directory
- Modify database logic in the `lib/services/database.ts` file

## License

This project is licensed under the MIT License - see the LICENSE file for details.
