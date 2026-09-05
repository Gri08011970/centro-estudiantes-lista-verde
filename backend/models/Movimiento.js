/* global require, module */

const mongoose = require("mongoose");

const movimientoSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["Ingreso", "Egreso"],
      required: true,
    },

    fecha: {
      type: String,
      required: true,
    },

    monto: {
      type: Number,
      required: true,
      min: 1,
    },

    concepto: {
      type: String,
      required: true,
      trim: true,
    },

    medioPago: {
      type: String,
      enum: ["Efectivo", "Transferencia"],
      required: true,
    },

    recibo: {
      type: String,
      default: null,
    },

    observaciones: {
      type: String,
      default: "",
      trim: true,
    },

    anulado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Movimiento", movimientoSchema);