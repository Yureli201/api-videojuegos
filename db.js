const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
// Crear las tablas si no existen
const createTables = async () => {
    try {
        const connection = await pool.promise().getConnection();

        // Consulta para crear la tabla `players`
        const createPlayersTableQuery = `
            CREATE TABLE IF NOT EXISTS players (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                phone VARCHAR(20) UNIQUE,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Consulta para crear la tabla `game_progress`
        const createGameProgressTableQuery = `
            CREATE TABLE IF NOT EXISTS game_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                player_id INT,
                score INT DEFAULT 0,
                lives INT DEFAULT 3,
                time TIME DEFAULT '00:00:00',
                levels INT DEFAULT 1,
                last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
            );
        `;

        // Ejecutar las consultas para crear ambas tablas
        await connection.query(createPlayersTableQuery);
        console.log('Tabla `players` creada o ya existe');

        await connection.query(createGameProgressTableQuery);
        console.log('Tabla `game_progress` creada o ya existe');

        // Liberar la conexión
        connection.release();
    } catch (err) {
        console.error('Error al crear las tablas: ', err);
    }
};

createTables();

module.exports = pool.promise();

