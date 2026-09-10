/* global require, module */

const express = require("express");
const Galeria = require("../models/Galeria");
const verificarToken = require("../middleware/verificarToken");

const router = express.Router();

/* ========================================
   GALERÍA PÚBLICA
======================================== */

router.get("/", async (req, res) => {
  try {
    const publicaciones = await Galeria.find({ publicado: true }).sort({
      fecha: -1,
      createdAt: -1,
    });

    res.json(publicaciones);
  } catch (error) {
    console.error("Error al obtener la galería pública:", error);

    res.status(500).json({
      mensaje: "No se pudo obtener la galería.",
    });
  }
});

/* ========================================
   GALERÍA - GESTIÓN
======================================== */

router.get("/gestion", verificarToken, async (req, res) => {
  try {
    const publicaciones = await Galeria.find().sort({
      fecha: -1,
      createdAt: -1,
    });

    res.json(publicaciones);
  } catch (error) {
    console.error("Error al obtener la galería de gestión:", error);

    res.status(500).json({
      mensaje: "No se pudo obtener la galería de gestión.",
    });
  }
});
/* ========================================
   CREAR PUBLICACIÓN
======================================== */

router.post("/", verificarToken, async (req, res) => {
  try {
    const {
      fecha,
      titulo,
      descripcion,
      categoria,
      medios,
      publicado,
    } = req.body;

    if (!fecha || !titulo) {
      return res.status(400).json({
        mensaje: "La fecha y el título son obligatorios.",
      });
    }

    const nuevaPublicacion = new Galeria({
      fecha,
      titulo,
      descripcion: descripcion || "",
      categoria: categoria || "Actividad",
      medios: Array.isArray(medios) ? medios : [],
      publicado: Boolean(publicado),
    });

    const publicacionGuardada = await nuevaPublicacion.save();

    res.status(201).json(publicacionGuardada);
  } catch (error) {
    console.error("Error al crear publicación de galería:", error);

    res.status(500).json({
      mensaje: "No se pudo crear la publicación.",
    });
  }
});
/* ========================================
   EDITAR PUBLICACIÓN
======================================== */

router.put("/:id", verificarToken, async (req, res) => {
  try {
    const {
      fecha,
      titulo,
      descripcion,
      categoria,
      medios,
      publicado,
    } = req.body;

    if (!fecha || !titulo) {
      return res.status(400).json({
        mensaje: "La fecha y el título son obligatorios.",
      });
    }

    const publicacionActualizada = await Galeria.findByIdAndUpdate(
      req.params.id,
      {
        fecha,
        titulo,
        descripcion: descripcion || "",
        categoria: categoria || "Actividad",
        medios: Array.isArray(medios) ? medios : [],
        publicado: Boolean(publicado),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!publicacionActualizada) {
      return res.status(404).json({
        mensaje: "Publicación no encontrada.",
      });
    }

    res.json(publicacionActualizada);
  } catch (error) {
    console.error("Error al editar publicación de galería:", error);

    res.status(500).json({
      mensaje: "No se pudo editar la publicación.",
    });
  }
});
/* ========================================
   ELIMINAR PUBLICACIÓN
======================================== */

router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const publicacionEliminada = await Galeria.findByIdAndDelete(
      req.params.id,
    );

    if (!publicacionEliminada) {
      return res.status(404).json({
        mensaje: "Publicación no encontrada.",
      });
    }

    res.json({
      mensaje: "Publicación eliminada correctamente.",
      id: publicacionEliminada._id,
    });
  } catch (error) {
    console.error("Error al eliminar publicación de galería:", error);

    res.status(500).json({
      mensaje: "No se pudo eliminar la publicación.",
    });
  }
});
module.exports = router;