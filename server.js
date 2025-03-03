const express = require("express");
const cors = require("cors");
require("dotenv").config();

const playerRoutes = require("./Routes/playerRoutes");
const gameProgressRoutes = require("./Routes/gameProgressRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/players", playerRoutes);
app.use("/game_progress", gameProgressRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
