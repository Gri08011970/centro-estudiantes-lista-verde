/* global require, module, process */

const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
    return res.status(401).json({
      mensaje: "Acceso no autorizado.",
    });
  }

  const token = autorizacion.split(" ")[1];

  try {
    const datosToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuarioGestion = datosToken;

    next();
  } catch {
    return res.status(401).json({
      mensaje: "La sesión venció o no es válida.",
    });
  }
};

module.exports = verificarToken;