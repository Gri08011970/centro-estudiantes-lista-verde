/* global require, module */

const express = require("express");
const multer = require("multer");

const Galeria = require("../models/Galeria");
const verificarToken = require("../middleware/verificarToken");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

/* ========================================
   SUBIR ARCHIVO A CLOUDINARY
======================================== */

router.post(
  "/upload",
  verificarToken,
  upload.single("archivo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          mensaje: "No se recibió ningún archivo.",
        });
      }

      const tipo = req.file.mimetype.startsWith("video/")
        ? "video"
        : "imagen";

      const resultado = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "centro-estudiantes/galeria",
            resource_type: "auto",
          },
          (error, resultadoCloudinary) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(resultadoCloudinary);
          },
        );

        stream.end(req.file.buffer);
      });

      res.status(201).json({
        tipo,
        url: resultado.secure_url,
        publicId: resultado.public_id,
      });
    } catch (error) {
      console.error("Error al subir archivo a Cloudinary:", error);

      res.status(500).json({
        mensaje: "No se pudo subir el archivo.",
      });
    }
  },
);

/* ========================================
   ELIMINAR ARCHIVO DE CLOUDINARY
======================================== */

router.delete("/media", verificarToken, async (req, res) => {
  try {
    const { publicId, tipo } = req.body;

    if (!publicId) {
      return res.status(400).json({
        mensaje: "Falta el identificador del archivo.",
      });
    }

    const resultado = await cloudinary.uploader.destroy(publicId, {
      resource_type: tipo === "video" ? "video" : "image",
    });

    if (resultado.result !== "ok" && resultado.result !== "not found") {
      return res.status(500).json({
        mensaje: "Cloudinary no pudo eliminar el archivo.",
        resultado,
      });
    }

    res.json({
      mensaje:
        resultado.result === "not found"
          ? "El archivo ya no existía en Cloudinary."
          : "Archivo eliminado de Cloudinary.",
      resultado,
    });
  } catch (error) {
    console.error("Error al eliminar archivo de Cloudinary:", error);

    res.status(500).json({
      mensaje: "No se pudo eliminar el archivo de Cloudinary.",
    });
  }
});

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

    const hoy = new Date().toISOString().split("T")[0];

    if (fecha > hoy) {
      return res.status(400).json({
        mensaje: "La fecha del momento no puede ser futura.",
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

    const hoy = new Date().toISOString().split("T")[0];

    if (fecha > hoy) {
      return res.status(400).json({
        mensaje: "La fecha del momento no puede ser futura.",
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
    const publicacion = await Galeria.findById(req.params.id);

    if (!publicacion) {
      return res.status(404).json({
        mensaje: "Publicación no encontrada.",
      });
    }

    const mediosAEliminar = Array.isArray(publicacion.medios)
      ? [...publicacion.medios]
      : [];

    await Galeria.findByIdAndDelete(req.params.id);

    const resultadosCloudinary = await Promise.allSettled(
      mediosAEliminar
        .filter((medio) => medio.publicId)
        .map((medio) =>
          cloudinary.uploader.destroy(medio.publicId, {
            resource_type: medio.tipo === "video" ? "video" : "image",
          }),
        ),
    );

    const archivosNoEliminados = resultadosCloudinary.filter(
      (resultado) => resultado.status === "rejected",
    );

    if (archivosNoEliminados.length > 0) {
      console.warn(
        `${archivosNoEliminados.length} archivo(s) no pudieron eliminarse de Cloudinary.`,
      );
    }

    res.json({
      mensaje:
        archivosNoEliminados.length > 0
          ? "Momento eliminado. Algunos archivos no pudieron limpiarse de Cloudinary."
          : "Momento eliminado correctamente.",
      id: publicacion._id,
      archivosNoEliminados: archivosNoEliminados.length,
    });
  } catch (error) {
    console.error("Error al eliminar publicación de galería:", error);

    res.status(500).json({
      mensaje: "No se pudo eliminar la publicación.",
    });
  }
});

module.exports = router;