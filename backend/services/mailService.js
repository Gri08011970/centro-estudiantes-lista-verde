/* global module, process */

const enviarAvisoParticipacion = async ({
  curso,
  motivo,
  mensaje,
}) => {
  const respuesta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Lista Verde - Centro de Estudiantes <onboarding@resend.dev>",
      to: [process.env.MAIL_DESTINO],
      subject: `Nueva participación - ${curso} - ${motivo}`,
      text: `
Nueva participación recibida.

Curso: ${curso}
Motivo: ${motivo}

Mensaje:
${mensaje}

Ingresá al sistema de Gestión para organizar su seguimiento.
      `,
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.message || "No se pudo enviar el aviso por Resend.",
    );
  }

  return datos;
};

module.exports = {
  enviarAvisoParticipacion,
};