const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../db.js");

const router = express.Router();

// Crear un jugador (C)
router.post("/", async (req, res) => {
  const { first_name, last_name, email, phone, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.execute(
      "INSERT INTO players (first_name, last_name, email, phone, username, password) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, phone, username, hashedPassword]
    );
    res.json({ id: result.insertId, message: "Jugador creado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los jugadores (R)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM players");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un jugador por ID (R)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute("SELECT * FROM players WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    res.json(rows[0]); // Devuelve el primer resultado encontrado
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para login (Autenticación)
router.post("/login", async (req, res) => {
  const { username, password } = req.body; // Esperamos que el cliente envíe el 'username' y 'password'

  try {
    // Buscar el jugador en la base de datos por el 'username'
    const [rows] = await pool.execute("SELECT * FROM players WHERE username = ?", [username]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    const player = rows[0];

    // Comparar la contraseña proporcionada con la almacenada
    const isPasswordCorrect = await bcrypt.compare(password, player.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Si la contraseña es correcta, generamos un token JWT
    const payload = { id: player.id, username: player.username };
    const token = jwt.sign(payload, "tu_secreto_jwt", { expiresIn: "1h" }); // Puedes cambiar la clave secreta y el tiempo de expiración

    // Enviamos el token al cliente
    res.json({
      message: "Inicio de sesión exitoso",
      token: token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// Actualizar un jugador (U)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, username } = req.body;
  try {
    await pool.execute(
      "UPDATE players SET first_name=?, last_name=?, email=?, phone=?, username=? WHERE id=?",
      [first_name, last_name, email, phone, username, id]
    );
    res.json({ message: "Jugador actualizado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un jugador (D)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute("DELETE FROM players WHERE id=?", [id]);
    res.json({ message: "Jugador eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;