/* global require, module */

const mongoose = require("mongoose");

const participacionSchema = new mongoose.Schema(
  {
    curso: {
      type: String,
      required: true,
      trim: true,
    },

    motivo: {
      type: String,
      required: true,
      enum: [
        "Idea",
        "Pregunta",
        "Sugerencia",
        "Propuesta",
         "Queja / inquietud",
      ],
    },

    mensaje: {
      type: String,
      required: true,
      trim: true,
    },

    estado: {
      type: String,
      enum: [
        "Nuevo",
        "Leído",
        "En tratamiento",
        "Resuelto",
      ],
      default: "Nuevo",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Participacion",
  participacionSchema
);