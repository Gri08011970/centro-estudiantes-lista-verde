/* global require, module, process */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const PASSWORD_HASH = process.env.GESTION_PASSWORD_HASH;

// Login
router.post("/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        mensaje: "Completá usuario y contraseña.",
      });
    }

    if (usuario !== process.env.GESTION_USUARIO) {
      return res.status(401).json({
        mensaje: "Usuario o contraseña incorrectos.",
      });
    }

    const coincide = await bcrypt.compare(password, PASSWORD_HASH);

    if (!coincide) {
      return res.status(401).json({
        mensaje: "Usuario o contraseña incorrectos.",
      });
    }

    const token = jwt.sign(
      {
        usuario,
        rol: "gestion",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.json({
      mensaje: "Acceso autorizado",
      token,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al iniciar sesión",
      error: error.message,
    });
  }
});

module.exports = router;