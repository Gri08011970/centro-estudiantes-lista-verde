/* global require, module, process */

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const enviarAvisoParticipacion = async ({
  curso,
  motivo,
  mensaje,
}) => {
  await transporter.sendMail({
    from: `"Lista Verde - Centro de Estudiantes" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_DESTINO,
    subject: `Nueva participación - ${curso} - ${motivo}`,
    text: `
Nueva participación recibida.

Curso: ${curso}
Motivo: ${motivo}

Mensaje:
${mensaje}

Ingresá al sistema de Gestión para organizar su seguimiento.
    `,
  });
};

module.exports = {
  enviarAvisoParticipacion,
};