/* global require, module */

const mongoose = require("mongoose");

const transparenciaSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      enum: ["rendicion", "colaboracion"],
    },

    // ==========================================
    // RENDICIONES
    // ==========================================

    fecha: {
      type: String,
      default: "",
    },

    titulo: {
      type: String,
      trim: true,
      default: "",
    },

    monto: {
      type: Number,
      default: 0,
    },

    destino: {
      type: String,
      trim: true,
      default: "",
    },

    descripcion: {
      type: String,
      trim: true,
      default: "",
    },

    publicado: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // COLABORÁ
    // ==========================================

    alias: {
      type: String,
      trim: true,
      default: "",
    },

    emailComprobantes: {
      type: String,
      trim: true,
      default: "",
    },

    mostrarColaboracion: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Transparencia", transparenciaSchema);