/* global require, module */

const express = require("express");
const Comunicado = require("../models/Comunicado");
const verificarToken = require("../middleware/verificarToken");

const router = express.Router();

// ========================================
// VER COMUNICADOS PUBLICADOS
// PÚBLICA - NO REQUIERE LOGIN
// ========================================
router.get("/", async (req, res) => {
  try {
    const comunicados = await Comunicado.find({
      publicado: true,
    }).sort({
      fecha: -1,
      createdAt: -1,
    });

    res.json(comunicados);
  } catch (error) {
    res.status(500).json({
      mensaje: "No se pudieron obtener los comunicados.",
      error: error.message,
    });
  }
});

// ========================================
// VER TODOS LOS COMUNICADOS
// PRIVADA - SOLO GESTIÓN
// ========================================
router.get("/gestion", verificarToken, async (req, res) => {
  try {
    const comunicados = await Comunicado.find().sort({
      fecha: -1,
      createdAt: -1,
    });

    res.json(comunicados);
  } catch (error) {
    res.status(500).json({
      mensaje: "No se pudieron obtener los comunicados.",
      error: error.message,
    });
  }
});

// ========================================
// CREAR COMUNICADO
// PRIVADA - SOLO GESTIÓN
// ========================================
router.post("/", verificarToken, async (req, res) => {
  try {
    const {
      fecha,
      categoria,
      titulo,
      texto,
      destacado,
      publicado,
    } = req.body;

    if (!fecha || !categoria || !titulo || !texto) {
      return res.status(400).json({
        mensaje:
          "Completá fecha, categoría, título y texto.",
      });
    }

    const nuevoComunicado = await Comunicado.create({
      fecha,
      categoria,
      titulo,
      texto,
      destacado: Boolean(destacado),
      publicado: Boolean(publicado),
    });

    res.status(201).json(nuevoComunicado);
  } catch (error) {
    res.status(400).json({
      mensaje: "No se pudo crear el comunicado.",
      error: error.message,
    });
  }
});

// ========================================
// EDITAR COMUNICADO
// PRIVADA - SOLO GESTIÓN
// ========================================
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const {
      fecha,
      categoria,
      titulo,
      texto,
      destacado,
      publicado,
    } = req.body;

    if (!fecha || !categoria || !titulo || !texto) {
      return res.status(400).json({
        mensaje:
          "Completá fecha, categoría, título y texto.",
      });
    }

    const comunicadoActualizado =
      await Comunicado.findByIdAndUpdate(
        req.params.id,
        {
          fecha,
          categoria,
          titulo,
          texto,
          destacado: Boolean(destacado),
          publicado: Boolean(publicado),
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!comunicadoActualizado) {
      return res.status(404).json({
        mensaje: "Comunicado no encontrado.",
      });
    }

    res.json(comunicadoActualizado);
  } catch (error) {
    res.status(500).json({
      mensaje: "No se pudo actualizar el comunicado.",
      error: error.message,
    });
  }
});

// ========================================
// ELIMINAR COMUNICADO
// PRIVADA - SOLO GESTIÓN
// ========================================
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const comunicadoEliminado =
      await Comunicado.findByIdAndDelete(req.params.id);

    if (!comunicadoEliminado) {
      return res.status(404).json({
        mensaje: "Comunicado no encontrado.",
      });
    }

    res.json({
      mensaje: "Comunicado eliminado correctamente.",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "No se pudo eliminar el comunicado.",
      error: error.message,
    });
  }
});

module.exports = router;