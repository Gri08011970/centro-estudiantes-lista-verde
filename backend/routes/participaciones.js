/* global require, module */

const express = require("express");
const Participacion = require("../models/Participacion");
const verificarToken = require("../middleware/verificarToken");

const {
  enviarAvisoParticipacion,
} = require("../services/mailService");

const router = express.Router();

// ========================================
// ENVIAR PARTICIPACIÓN
// PÚBLICA - NO REQUIERE LOGIN
// ========================================
router.post("/", async (req, res) => {
  try {
    const { curso, motivo, mensaje } = req.body;

    if (!curso || !motivo || !mensaje) {
      return res.status(400).json({
        mensaje: "Completá curso, motivo y mensaje.",
      });
    }

    const nuevaParticipacion = await Participacion.create({
      curso,
      motivo,
      mensaje,
    });

    // Respondemos inmediatamente al formulario.
    // El envío del mail continúa aparte para no bloquear al estudiante.
    res.status(201).json({
      mensaje: "Tu participación fue enviada correctamente.",
      participacion: nuevaParticipacion,
    });

    enviarAvisoParticipacion({
      curso,
      motivo,
      mensaje,
    }).catch((errorMail) => {
      console.error(
        "No se pudo enviar el aviso por mail:",
        errorMail.message,
      );
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "No se pudo guardar la participación.",
      error: error.message,
    });
  }
});

// ========================================
// VER PARTICIPACIONES
// PRIVADA - SOLO GESTIÓN
// ========================================
router.get("/", verificarToken, async (req, res) => {
  try {
    const participaciones = await Participacion.find().sort({
      createdAt: -1,
    });

    res.json(participaciones);
  } catch (error) {
    res.status(500).json({
      mensaje: "No se pudieron obtener las participaciones.",
      error: error.message,
    });
  }
});

// ========================================
// CAMBIAR ESTADO DE UNA PARTICIPACIÓN
// PRIVADA - SOLO GESTIÓN
// ========================================
router.patch("/:id/estado", verificarToken, async (req, res) => {
  try {
    const { estado } = req.body;

    const estadosPermitidos = [
      "Nuevo",
      "Leído",
      "En tratamiento",
      "Resuelto",
    ];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        mensaje: "Estado no válido.",
      });
    }

    const participacionActualizada =
      await Participacion.findByIdAndUpdate(
        req.params.id,
        { estado },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!participacionActualizada) {
      return res.status(404).json({
        mensaje: "Participación no encontrada.",
      });
    }

    res.json(participacionActualizada);
  } catch (error) {
    res.status(500).json({
      mensaje: "No se pudo actualizar el estado.",
      error: error.message,
    });
  }
});

module.exports = router;