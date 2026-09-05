/* global require, module */

const express = require("express");
const Movimiento = require("../models/Movimiento");
const Configuracion = require("../models/Configuracion");
const verificarToken = require("../middleware/verificarToken");

const router = express.Router();

router.use(verificarToken);

// ========================================
// OBTENER TODOS LOS MOVIMIENTOS
// ========================================
router.get("/", async (req, res) => {
  try {
    const movimientos = await Movimiento.find().sort({
      fecha: -1,
      createdAt: -1,
    });

    res.json(movimientos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los movimientos",
      error: error.message,
    });
  }
});

// ========================================
// OBTENER CONFIGURACIÓN DE TESORERÍA
// ========================================
router.get("/configuracion/tesoreria", async (req, res) => {
  try {
    let configuracion = await Configuracion.findOne({
      clave: "tesoreria",
    });

    if (!configuracion) {
      configuracion = await Configuracion.create({
        clave: "tesoreria",
        siguienteNumeroRecibo: 1,
      });
    }

    res.json(configuracion);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener la configuración de Tesorería",
      error: error.message,
    });
  }
});

// ========================================
// CREAR MOVIMIENTO
// ========================================
router.post("/", async (req, res) => {
  try {
    const datosMovimiento = {
      ...req.body,
    };

    if (datosMovimiento.tipo === "Egreso") {
      const configuracion = await Configuracion.findOneAndUpdate(
        { clave: "tesoreria" },
        {
          $inc: {
            siguienteNumeroRecibo: 1,
          },
        },
        {
          new: false,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      const numeroRecibo =
        configuracion?.siguienteNumeroRecibo || 1;

      datosMovimiento.recibo = `${numeroRecibo}/26`;
    } else {
      datosMovimiento.recibo = null;
    }

    const nuevoMovimiento = new Movimiento(datosMovimiento);

    const movimientoGuardado = await nuevoMovimiento.save();

    res.status(201).json(movimientoGuardado);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al guardar el movimiento",
      error: error.message,
    });
  }
});

// ========================================
// SINCRONIZAR CONTADOR DE RECIBOS
// ========================================
router.patch("/configuracion/tesoreria/sincronizar", async (req, res) => {
  try {
    const egresos = await Movimiento.find({
      tipo: "Egreso",
      recibo: { $ne: null },
    });

    let numeroMasAlto = 0;

    egresos.forEach((movimiento) => {
      if (!movimiento.recibo) return;

      const numero = Number(movimiento.recibo.split("/")[0]);

      if (!Number.isNaN(numero) && numero > numeroMasAlto) {
        numeroMasAlto = numero;
      }
    });

    const siguienteNumeroRecibo = numeroMasAlto + 1;

    const configuracion = await Configuracion.findOneAndUpdate(
      { clave: "tesoreria" },
      { siguienteNumeroRecibo },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json(configuracion);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al sincronizar el contador de recibos",
      error: error.message,
    });
  }
});

// ========================================
// EDITAR MOVIMIENTO
// ========================================
router.put("/:id", async (req, res) => {
  try {
    const movimientoActualizado = await Movimiento.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!movimientoActualizado) {
      return res.status(404).json({
        mensaje: "Movimiento no encontrado",
      });
    }

    res.json(movimientoActualizado);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al editar el movimiento",
      error: error.message,
    });
  }
});

// ========================================
// ELIMINAR MOVIMIENTO
// ========================================
router.delete("/:id", async (req, res) => {
  try {
    const movimientoEliminado =
      await Movimiento.findByIdAndDelete(req.params.id);

    if (!movimientoEliminado) {
      return res.status(404).json({
        mensaje: "Movimiento no encontrado",
      });
    }

    res.json({
      mensaje: "Movimiento eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar el movimiento",
      error: error.message,
    });
  }
});

// ========================================
// ANULAR EGRESO
// ========================================
router.patch("/:id/anular", async (req, res) => {
  try {
    const movimiento = await Movimiento.findById(req.params.id);

    if (!movimiento) {
      return res.status(404).json({
        mensaje: "Movimiento no encontrado",
      });
    }

    if (movimiento.tipo !== "Egreso") {
      return res.status(400).json({
        mensaje: "Solo los egresos pueden anularse",
      });
    }

    movimiento.anulado = true;

    const movimientoAnulado = await movimiento.save();

    res.json(movimientoAnulado);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al anular el movimiento",
      error: error.message,
    });
  }
});

module.exports = router;