/* global require, module */

const mongoose = require("mongoose");

const configuracionSchema = new mongoose.Schema(
  {
    clave: {
      type: String,
      required: true,
      unique: true,
    },

    siguienteNumeroRecibo: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Configuracion", configuracionSchema);