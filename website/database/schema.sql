-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Factories
CREATE TABLE factories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE camera_status AS ENUM ('active', 'inactive', 'offline');
CREATE TABLE cameras (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    stream_url TEXT,
    status camera_status DEFAULT 'active',
    location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workers
CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    employee_id TEXT UNIQUE,
    department TEXT,
    factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Violations
CREATE TABLE violations (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    violation_type TEXT NOT NULL,
    image_url TEXT,
    camera_id INTEGER NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
);