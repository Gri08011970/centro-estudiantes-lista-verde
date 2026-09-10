/* global require, module */
const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["imagen", "video"],
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const galeriaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },

    fecha: {
      type: String,
      required: true,
    },

    descripcion: {
      type: String,
      default: "",
      trim: true,
    },

    categoria: {
      type: String,
      default: "Actividad",
      trim: true,
    },

    medios: {
      type: [mediaSchema],
      default: [],
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

module.exports = mongoose.model("Galeria", galeriaSchema);