/* global require, process, __dirname */ 

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");


dotenv.config();

const movimientosRoutes = require("./routes/movimientos");
const authRoutes = require("./routes/auth");
const participacionesRoutes =
  require("./routes/participaciones");
const comunicadosRoutes = require("./routes/comunicados");  
const transparenciaRoutes = require("./routes/transparencia");
const galeriaRoutes = require("./routes/galeria");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/movimientos", movimientosRoutes);
app.use("/api/auth", authRoutes);
// Ruta de prueba

app.use("/api/participaciones", participacionesRoutes);
app.use("/api/comunicados", comunicadosRoutes);

app.use("/api/transparencia", transparenciaRoutes);

app.use("/api/galeria", galeriaRoutes);

// ========================================
// FRONTEND REACT
// ========================================

const frontendPath = path.join(__dirname, "../dist");

app.use(express.static(frontendPath));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

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