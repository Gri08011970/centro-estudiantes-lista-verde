/* global require, module */

const mongoose = require("mongoose");

const comunicadoSchema = new mongoose.Schema(
  {
    fecha: {
      type: String,
      required: true,
    },

    categoria: {
      type: String,
      required: true,
      trim: true,
    },

    titulo: {
      type: String,
      required: true,
      trim: true,
    },

    texto: {
      type: String,
      required: true,
      trim: true,
    },

    destacado: {
      type: Boolean,
      default: false,
    },

    publicado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Comunicado", comunicadoSchema);