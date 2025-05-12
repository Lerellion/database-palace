CREATE TABLE IF NOT EXISTS database_connections (
    id SERIAL PRIMARY KEY,
    name TEXT,
    type TEXT,
    host TEXT,
    port TEXT,
    username TEXT,
    password TEXT,
    database TEXT,
    connection_string TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 