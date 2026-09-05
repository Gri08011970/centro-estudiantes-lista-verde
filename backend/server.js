/* global require, process */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const movimientosRoutes = require("./routes/movimientos");
const authRoutes = require("./routes/auth");
const participacionesRoutes =
  require("./routes/participaciones");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/movimientos", movimientosRoutes);
app.use("/api/auth", authRoutes);
// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🐢 API Lista Verde funcionando");
});
app.use("/api/participaciones", participacionesRoutes);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🐢 MongoDB CentroEstudiantes conectado");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor funcionando en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar MongoDB:", error.message);
  });