/* global require, module */

const mongoose = require("mongoose");

const avanceSchema = new mongoose.Schema(
  {
    fecha: {
      type: String,
      required: true,
    },
    texto: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const proyectoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },

    descripcion: {
      type: String,
      required: true,
      trim: true,
    },

    categoria: {
      type: String,
      default: "Otra",
      trim: true,
    },

    responsable: {
      type: String,
      default: "",
      trim: true,
    },

    estado: {
      type: String,
      enum: [
        "idea",
        "planificando",
        "en-marcha",
        "casi-listo",
        "logrado",
      ],
      default: "idea",
    },

    fechaInicio: {
      type: String,
      default: "",
    },

    proximoPaso: {
      type: String,
      default: "",
      trim: true,
    },

    publicado: {
      type: Boolean,
      default: false,
    },

    avances: {
      type: [avanceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Proyecto", proyectoSchema);