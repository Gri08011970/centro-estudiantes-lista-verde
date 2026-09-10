/* global require, module */

const express = require("express");
const Transparencia = require("../models/Transparencia");
const verificarToken = require("../middleware/verificarToken");

const router = express.Router();

// ==========================================================
// PÚBLICO - OBTENER RENDICIONES PUBLICADAS
// ==========================================================

router.get("/rendiciones", async (req, res) => {
  try {
    const rendiciones = await Transparencia.find({
      tipo: "rendicion",
      publicado: true,
    }).sort({ fecha: -1, createdAt: -1 });

    res.json(rendiciones);
  } catch (error) {
    console.error("Error al obtener rendiciones públicas:", error);

    res.status(500).json({
      mensaje: "No se pudieron obtener las rendiciones.",
    });
  }
});

// ==========================================================
// PÚBLICO - OBTENER CONFIGURACIÓN DE COLABORACIÓN
// ==========================================================

router.get("/colaboracion", async (req, res) => {
  try {
    const colaboracion = await Transparencia.findOne({
      tipo: "colaboracion",
      mostrarColaboracion: true,
    });

    res.json(colaboracion);
  } catch (error) {
    console.error("Error al obtener colaboración:", error);

    res.status(500).json({
      mensaje: "No se pudo obtener la información de colaboración.",
    });
  }
});

// ==========================================================
// GESTIÓN - OBTENER TODAS LAS RENDICIONES
// ==========================================================

router.get("/gestion/rendiciones", verificarToken, async (req, res) => {
  try {
    const rendiciones = await Transparencia.find({
      tipo: "rendicion",
    }).sort({ fecha: -1, createdAt: -1 });

    res.json(rendiciones);
  } catch (error) {
    console.error("Error al obtener rendiciones:", error);

    res.status(500).json({
      mensaje: "No se pudieron obtener las rendiciones.",
    });
  }
});

// ==========================================================
// GESTIÓN - CREAR RENDICIÓN
// ==========================================================

router.post("/rendiciones", verificarToken, async (req, res) => {
  try {
    const { fecha, titulo, monto, destino, descripcion, publicado } = req.body;

    if (!fecha || !titulo?.trim() || !destino?.trim()) {
      return res.status(400).json({
        mensaje: "Completá fecha, actividad y destino.",
      });
    }

    const hoyArgentina = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (fecha > hoyArgentina) {
      return res.status(400).json({
        mensaje: "La fecha de una rendición no puede ser futura.",
      });
    }

    const nuevaRendicion = await Transparencia.create({
      tipo: "rendicion",
      fecha,
      titulo: titulo.trim(),
      monto: Number(monto) || 0,
      destino: destino.trim(),
      descripcion: descripcion?.trim() || "",
      publicado: Boolean(publicado),
    });

    return res.status(201).json(nuevaRendicion);
  } catch (error) {
    console.error("Error al crear rendición:", error);

    return res.status(500).json({
      mensaje: "No se pudo crear la rendición.",
    });
  }
});

// ==========================================================
// GESTIÓN - EDITAR RENDICIÓN
// ==========================================================

router.put("/rendiciones/:id", verificarToken, async (req, res) => {
  try {
    const { fecha, titulo, monto, destino, descripcion, publicado } = req.body;

    if (!fecha || !titulo?.trim() || !destino?.trim()) {
      return res.status(400).json({
        mensaje: "Completá fecha, actividad y destino.",
      });
    }

    const rendicionActualizada = await Transparencia.findOneAndUpdate(
      {
        _id: req.params.id,
        tipo: "rendicion",
      },
      {
        fecha,
        titulo: titulo.trim(),
        monto: Number(monto) || 0,
        destino: destino.trim(),
        descripcion: descripcion?.trim() || "",
        publicado: Boolean(publicado),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!rendicionActualizada) {
      return res.status(404).json({
        mensaje: "No se encontró la rendición.",
      });
    }

    return res.json(rendicionActualizada);
  } catch (error) {
    console.error("Error al actualizar rendición:", error);

    return res.status(500).json({
      mensaje: "No se pudo actualizar la rendición.",
    });
  }
});

// ==========================================================
// GESTIÓN - ELIMINAR RENDICIÓN
// ==========================================================

router.delete("/rendiciones/:id", verificarToken, async (req, res) => {
  try {
    const rendicionEliminada = await Transparencia.findOneAndDelete({
      _id: req.params.id,
      tipo: "rendicion",
    });

    if (!rendicionEliminada) {
      return res.status(404).json({
        mensaje: "No se encontró la rendición.",
      });
    }

    return res.json({
      mensaje: "Rendición eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error al eliminar rendición:", error);

    return res.status(500).json({
      mensaje: "No se pudo eliminar la rendición.",
    });
  }
});

// ==========================================================
// GESTIÓN - OBTENER CONFIGURACIÓN DE COLABORACIÓN
// ==========================================================

router.get("/gestion/colaboracion", verificarToken, async (req, res) => {
  try {
    const colaboracion = await Transparencia.findOne({
      tipo: "colaboracion",
    });

    return res.json(colaboracion);
  } catch (error) {
    console.error("Error al obtener configuración de colaboración:", error);

    return res.status(500).json({
      mensaje: "No se pudo obtener la configuración.",
    });
  }
});

// ==========================================================
// GESTIÓN - GUARDAR CONFIGURACIÓN DE COLABORACIÓN
// ==========================================================

router.put("/colaboracion", verificarToken, async (req, res) => {
  try {
    const { alias, emailComprobantes, mostrarColaboracion } = req.body;

    const colaboracion = await Transparencia.findOneAndUpdate(
      {
        tipo: "colaboracion",
      },
      {
        tipo: "colaboracion",
        alias: alias?.trim() || "",
        emailComprobantes: emailComprobantes?.trim() || "",
        mostrarColaboracion: Boolean(mostrarColaboracion),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return res.json(colaboracion);
  } catch (error) {
    console.error("Error al guardar configuración de colaboración:", error);

    return res.status(500).json({
      mensaje: "No se pudo guardar la configuración.",
    });
  }
});

module.exports = router;
