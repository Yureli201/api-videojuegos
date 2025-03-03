const express = require("express");
const pool = require("../db.js");

const router = express.Router();

// Crear progreso de juego (C)
router.post("/", async (req, res) => {
  const { player_id, score, lives, time, levels } = req.body;
  try {
    const [result] = await pool.execute(
      "INSERT INTO game_progress (player_id, score, lives, time, levels) VALUES (?, ?, ?, ?, ?)",
      [player_id, score, lives, time, levels]
    );
    res.json({ id: result.insertId, message: "Progreso creado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener progreso de todos los jugadores (R)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM game_progress");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener progreso por ID (R)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute("SELECT * FROM game_progress WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Progreso no encontrado" });
    }

    res.json(rows[0]); // Devuelve el primer resultado encontrado
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Actualizar progreso de un jugador (U)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { score, lives, time, levels } = req.body;
  try {
    await pool.execute(
      "UPDATE game_progress SET score=?, lives=?, time=?, levels=?, last_update=NOW() WHERE id=?",
      [score, lives, time, levels, id]
    );
    res.json({ message: "Progreso actualizado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar progreso de un jugador (D)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute("DELETE FROM game_progress WHERE id=?", [id]);
    res.json({ message: "Progreso eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
