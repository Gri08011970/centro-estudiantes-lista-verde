/* global require, module */

const express = require("express");

const Proyecto = require("../models/Proyecto");
const verificarToken = require("../middleware/verificarToken");

const router = express.Router();

/* ========================================
   PROYECTOS PÚBLICOS
======================================== */

router.get("/", async (req, res) => {
  try {
    const proyectos = await Proyecto.find({ publicado: true }).sort({
      createdAt: -1,
    });

    res.json(proyectos);
  } catch (error) {
    console.error("Error al obtener proyectos públicos:", error);

    res.status(500).json({
      mensaje: "No se pudieron obtener los proyectos.",
    });
  }
});

/* ========================================
   PROYECTOS - GESTIÓN
======================================== */

router.get("/gestion", verificarToken, async (req, res) => {
  try {
    const proyectos = await Proyecto.find().sort({
      createdAt: -1,
    });

    res.json(proyectos);
  } catch (error) {
    console.error("Error al obtener proyectos de gestión:", error);

    res.status(500).json({
      mensaje: "No se pudieron obtener los proyectos de gestión.",
    });
  }
});

/* ========================================
   CREAR PROYECTO
======================================== */

router.post("/", verificarToken, async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      categoria,
      responsable,
      estado,
      fechaInicio,
      proximoPaso,
      publicado,
      avances,
    } = req.body;

    if (!titulo?.trim() || !descripcion?.trim()) {
      return res.status(400).json({
        mensaje: "El título y la descripción son obligatorios.",
      });
    }

    const nuevoProyecto = new Proyecto({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      categoria: categoria || "Otra",
      responsable: responsable || "",
      estado: estado || "idea",
      fechaInicio: fechaInicio || "",
      proximoPaso: proximoPaso || "",
      publicado: Boolean(publicado),
      avances: Array.isArray(avances) ? avances : [],
    });

    const proyectoGuardado = await nuevoProyecto.save();

    res.status(201).json(proyectoGuardado);
  } catch (error) {
    console.error("Error al crear proyecto:", error);

    res.status(500).json({
      mensaje: "No se pudo crear el proyecto.",
    });
  }
});

/* ========================================
   EDITAR PROYECTO
======================================== */

router.put("/:id", verificarToken, async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      categoria,
      responsable,
      estado,
      fechaInicio,
      proximoPaso,
      publicado,
      avances,
    } = req.body;

    if (!titulo?.trim() || !descripcion?.trim()) {
      return res.status(400).json({
        mensaje: "El título y la descripción son obligatorios.",
      });
    }

    const proyectoActualizado = await Proyecto.findByIdAndUpdate(
      req.params.id,
      {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria: categoria || "Otra",
        responsable: responsable || "",
        estado: estado || "idea",
        fechaInicio: fechaInicio || "",
        proximoPaso: proximoPaso || "",
        publicado: Boolean(publicado),
        avances: Array.isArray(avances) ? avances : [],
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!proyectoActualizado) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado.",
      });
    }

    res.json(proyectoActualizado);
  } catch (error) {
    console.error("Error al editar proyecto:", error);

    res.status(500).json({
      mensaje: "No se pudo editar el proyecto.",
    });
  }
});

/* ========================================
   ELIMINAR PROYECTO
======================================== */

router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const proyectoEliminado = await Proyecto.findByIdAndDelete(
      req.params.id,
    );

    if (!proyectoEliminado) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado.",
      });
    }

    res.json({
      mensaje: "Proyecto eliminado correctamente.",
      id: proyectoEliminado._id,
    });
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);

    res.status(500).json({
      mensaje: "No se pudo eliminar el proyecto.",
    });
  }
});

module.exports = router;