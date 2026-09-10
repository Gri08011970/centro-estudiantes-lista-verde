import { useEffect, useState } from "react";
import "./App.css";
import logoListaVerde from "./assets/logo-lista-verde.jpeg";

const seccionesValidas = [
  "inicio",
  "quienes-somos",
  "comunicados",
  "derechos",
  "proyectos",
  "participa",
  "estatuto",
  "manual",
  "galeria",
  "gestion",
  "tesoreria",
  "transparencia",
];

function App() {
  const hoy = new Date().toISOString().split("T")[0];
  const [comunicados, setComunicados] = useState([]);
  const [mostrarSubir, setMostrarSubir] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [siguienteNumeroRecibo, setSiguienteNumeroRecibo] = useState(1);
  const [movimientoEditandoId, setMovimientoEditandoId] = useState(null);
  const [mostrarIngresos, setMostrarIngresos] = useState(false);
  const [mostrarEgresos, setMostrarEgresos] = useState(false);
  const [participacion, setParticipacion] = useState({
    curso: "",
    motivo: "",
    mensaje: "",
  });
  const [participacionesGestion, setParticipacionesGestion] = useState([]);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [colaboracionGestion, setColaboracionGestion] = useState({
    alias: "",
    emailComprobantes: "",
    mostrarColaboracion: false,
  });

  const [guardandoColaboracion, setGuardandoColaboracion] = useState(false);
  const [galeriaGestion, setGaleriaGestion] = useState([]);
  const [galeriaPublica, setGaleriaPublica] = useState([]);
  const [momentoGaleriaEditando, setMomentoGaleriaEditando] = useState(null);

  const [historialRendicionesAbierto, setHistorialRendicionesAbierto] =
    useState(false);
  const [mensajeParticipacion, setMensajeParticipacion] = useState("");
  const [errorParticipacion, setErrorParticipacion] = useState("");
  const comunicadoDestacado = comunicados.find(
    (comunicado) => comunicado.destacado,
  );

  const [formGaleria, setFormGaleria] = useState({
    fecha: "",
    categoria: "Actividad",
    titulo: "",
    descripcion: "",
    publicado: false,
  });

  const [rendicionesGestion, setRendicionesGestion] = useState([]);

  const [nuevaRendicion, setNuevaRendicion] = useState({
    fecha: hoy,
    titulo: "",
    monto: "",
    destino: "",
    descripcion: "",
    publicado: false,
  });

  const [rendicionEditando, setRendicionEditando] = useState(null);

  const comunicadosSecundarios = comunicados.filter(
    (comunicado) => !comunicado.destacado,
  );
  const [rendiciones, setRendiciones] = useState([]);

  const [tarjetaColaboracionActiva, setTarjetaColaboracionActiva] =
    useState(null);

  const [colaboracion, setColaboracion] = useState(null);
  const [nuevoComunicado, setNuevoComunicado] = useState({
    fecha: hoy,
    categoria: "",
    titulo: "",
    texto: "",
    destacado: false,
    publicado: false,
  });

  const [comunicadosGestion, setComunicadosGestion] = useState([]);
  const [rendicionCambiandoPublicacion, setRendicionCambiandoPublicacion] =
    useState(null);
  const [moduloGestionActivo, setModuloGestionActivo] = useState(null);
  const obtenerSeccionInicial = () => {
    const hash = window.location.hash.replace("#", "");

    return seccionesValidas.includes(hash) ? hash : "inicio";
  };

  const [seccionActiva, setSeccionActiva] = useState(obtenerSeccionInicial);

  const [gestionAutorizada, setGestionAutorizada] = useState(() => {
    return Boolean(sessionStorage.getItem("gestionToken"));
  });

  const [loginGestion, setLoginGestion] = useState({
    usuario: "",
    password: "",
  });

  const [errorLogin, setErrorLogin] = useState("");

  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    tipo: "Ingreso",
    fecha: "",
    monto: "",
    concepto: "",
    medioPago: "",
    observaciones: "",
  });

  const actualizarMovimiento = (campo, valor) => {
    setNuevoMovimiento({
      ...nuevoMovimiento,
      [campo]: valor,
    });
  };

  const limpiarFormularioMovimiento = () => {
    setNuevoMovimiento({
      tipo: "Ingreso",
      fecha: "",
      monto: "",
      concepto: "",
      medioPago: "",
      observaciones: "",
    });
    setMovimientoEditandoId(null);
  };

  const guardarMovimiento = async () => {
    if (
      !nuevoMovimiento.fecha ||
      !nuevoMovimiento.monto ||
      !nuevoMovimiento.concepto ||
      !nuevoMovimiento.medioPago
    ) {
      alert("Completá fecha, monto, concepto y medio de pago.");
      return;
    }

    if (nuevoMovimiento.fecha > hoy) {
      alert("La fecha no puede ser futura.");
      return;
    }

    if (
      Number(nuevoMovimiento.monto) <= 0 ||
      !Number.isInteger(Number(nuevoMovimiento.monto))
    ) {
      alert("Ingresá un monto válido, sin centavos.");
      return;
    }

    if (movimientoEditandoId !== null) {
      try {
        const respuesta = await fetch(
          `https://centro-estudiantes-lista-verde.onrender.com/api/movimientos/${movimientoEditandoId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("gestionToken")}`,
            },
            body: JSON.stringify({
              fecha: nuevoMovimiento.fecha,
              monto: Number(nuevoMovimiento.monto),
              concepto: nuevoMovimiento.concepto,
              medioPago: nuevoMovimiento.medioPago,
              observaciones: nuevoMovimiento.observaciones,
            }),
          },
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo editar el movimiento.");
        }

        const movimientoActualizado = await respuesta.json();

        setMovimientos((movimientosActuales) =>
          movimientosActuales.map((movimiento) =>
            (movimiento._id || movimiento.id) === movimientoEditandoId
              ? movimientoActualizado
              : movimiento,
          ),
        );

        limpiarFormularioMovimiento();
        return;
      } catch (error) {
        console.error("Error al editar movimiento:", error);
        alert("No se pudo editar el movimiento.");
        return;
      }
    }

    const esEgreso = nuevoMovimiento.tipo === "Egreso";

    const movimiento = {
      id: Date.now(),
      ...nuevoMovimiento,
      monto: Number(nuevoMovimiento.monto),
      recibo: esEgreso ? `${siguienteNumeroRecibo}/26` : null,
      anulado: false,
    };

    try {
      const respuesta = await fetch(
        "https://centro-estudiantes-lista-verde.onrender.com/api/movimientos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("gestionToken")}`,
          },
          body: JSON.stringify(movimiento),
        },
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo guardar el movimiento.");
      }

      const movimientoGuardado = await respuesta.json();

      setMovimientos((movimientosActuales) => [
        ...movimientosActuales,
        movimientoGuardado,
      ]);

      if (esEgreso) {
        setSiguienteNumeroRecibo((numeroActual) => numeroActual + 1);
      }

      limpiarFormularioMovimiento();
    } catch (error) {
      console.error("Error al guardar movimiento:", error);
      alert("No se pudo guardar el movimiento.");
    }
  };

  const editarMovimiento = (movimiento) => {
    if (movimiento.anulado) {
      alert("Un movimiento anulado no se puede editar.");
      return;
    }

    setMovimientoEditandoId(movimiento._id || movimiento.id);

    setNuevoMovimiento({
      tipo: movimiento.tipo,
      fecha: movimiento.fecha,
      monto: String(movimiento.monto),
      concepto: movimiento.concepto,
      medioPago: movimiento.medioPago,
      observaciones: movimiento.observaciones || "",
    });

    document
      .getElementById("tesoreria")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelarEdicion = () => {
    limpiarFormularioMovimiento();
  };

  const eliminarMovimiento = async (id) => {
    const movimiento = movimientos.find((item) => (item._id || item.id) === id);

    if (!movimiento) return;

    const mensaje =
      movimiento.tipo === "Egreso" && movimiento.recibo
        ? `¿Eliminar el egreso "${movimiento.concepto}"?\n\nEl recibo ${movimiento.recibo} quedará reservado y NO volverá a utilizarse.`
        : `¿Eliminar el ingreso "${movimiento.concepto}"?\n\nEsta acción no se puede deshacer.`;

    const confirmar = window.confirm(mensaje);

    if (!confirmar) return;

    try {
      const respuesta = await fetch(
        `https://centro-estudiantes-lista-verde.onrender.com/api/movimientos/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("gestionToken")}`,
          },
        },
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo eliminar el movimiento.");
      }

      setMovimientos((movimientosActuales) =>
        movimientosActuales.filter((item) => (item._id || item.id) !== id),
      );

      if (movimientoEditandoId === id) {
        limpiarFormularioMovimiento();
      }
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
      alert("No se pudo eliminar el movimiento.");
    }
  };

  const anularMovimiento = async (id) => {
    const movimiento = movimientos.find((item) => (item._id || item.id) === id);

    if (!movimiento || movimiento.tipo !== "Egreso" || movimiento.anulado) {
      return;
    }

    const confirmar = window.confirm(
      `¿Anular el egreso "${movimiento.concepto}" con recibo ${movimiento.recibo}? El número de recibo quedará reservado y no volverá a utilizarse.`,
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(
        `https://centro-estudiantes-lista-verde.onrender.com/api/movimientos/${id}/anular`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("gestionToken")}`,
          },
        },
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo anular el movimiento.");
      }

      const movimientoAnulado = await respuesta.json();

      setMovimientos((movimientosActuales) =>
        movimientosActuales.map((item) =>
          (item._id || item.id) === id ? movimientoAnulado : item,
        ),
      );

      if (movimientoEditandoId === id) {
        limpiarFormularioMovimiento();
      }
    } catch (error) {
      console.error("Error al anular movimiento:", error);
      alert("No se pudo anular el movimiento.");
    }
  };

  const movimientosIngresos = movimientos.filter(
    (movimiento) => movimiento.tipo === "Ingreso",
  );

  const movimientosEgresos = movimientos.filter(
    (movimiento) => movimiento.tipo === "Egreso",
  );

  const totalIngresos = movimientos
    .filter(
      (movimiento) => movimiento.tipo === "Ingreso" && !movimiento.anulado,
    )
    .reduce((total, movimiento) => total + movimiento.monto, 0);

  const totalEgresos = movimientos
    .filter((movimiento) => movimiento.tipo === "Egreso" && !movimiento.anulado)
    .reduce((total, movimiento) => total + movimiento.monto, 0);

  const balance = totalIngresos - totalEgresos;

  const ingresosEfectivo = movimientos
    .filter(
      (movimiento) =>
        movimiento.tipo === "Ingreso" &&
        movimiento.medioPago === "Efectivo" &&
        !movimiento.anulado,
    )
    .reduce((total, movimiento) => total + movimiento.monto, 0);

  const ingresosTransferencia = movimientos
    .filter(
      (movimiento) =>
        movimiento.tipo === "Ingreso" &&
        movimiento.medioPago === "Transferencia" &&
        !movimiento.anulado,
    )
    .reduce((total, movimiento) => total + movimiento.monto, 0);

  const egresosEfectivo = movimientos
    .filter(
      (movimiento) =>
        movimiento.tipo === "Egreso" &&
        movimiento.medioPago === "Efectivo" &&
        !movimiento.anulado,
    )
    .reduce((total, movimiento) => total + movimiento.monto, 0);

  const egresosTransferencia = movimientos
    .filter(
      (movimiento) =>
        movimiento.tipo === "Egreso" &&
        movimiento.medioPago === "Transferencia" &&
        !movimiento.anulado,
    )
    .reduce((total, movimiento) => total + movimiento.monto, 0);

  const proximoRecibo = `${siguienteNumeroRecibo}/26`;

  const movimientosConRecibo = movimientos.filter(
    (movimiento) => movimiento.recibo,
  );

  const ultimoRecibo =
    movimientosConRecibo.length > 0
      ? movimientosConRecibo[movimientosConRecibo.length - 1].recibo
      : "—";

  useEffect(() => {
    if (seccionActiva !== "galeria") {
      return;
    }

    const cargarGaleriaPublica = async () => {
      try {
        const apiGaleria =
          window.location.hostname === "localhost"
            ? "http://localhost:5000/api/galeria"
            : "/api/galeria";

        const respuesta = await fetch(apiGaleria);

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.mensaje || "No se pudo cargar la galería.");
        }

        setGaleriaPublica(datos);
      } catch (error) {
        console.error("Error al cargar galería pública:", error);
      }
    };

    cargarGaleriaPublica();
  }, [seccionActiva]);

  useEffect(() => {
    if (moduloGestionActivo !== "transparencia") {
      return;
    }

    const cargarRendicionesGestion = async () => {
      try {
        const token = sessionStorage.getItem("gestionToken");

        const respuesta = await fetch(
          "https://centro-estudiantes-lista-verde.onrender.com/api/transparencia/gestion/rendiciones",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.mensaje || "No se pudieron cargar las rendiciones.",
          );
        }

        setRendicionesGestion(datos);
      } catch (error) {
        console.error("Error al cargar rendiciones de Gestión:", error);
      }
    };

    cargarRendicionesGestion();
  }, [moduloGestionActivo]);

  useEffect(() => {
    if (moduloGestionActivo !== "transparencia") {
      return;
    }

    const cargarColaboracionGestion = async () => {
      try {
        const token = sessionStorage.getItem("gestionToken");

        const respuesta = await fetch(
          "https://centro-estudiantes-lista-verde.onrender.com/api/transparencia/gestion/colaboracion",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.mensaje ||
              "No se pudo cargar la configuración de colaboración.",
          );
        }

        if (datos) {
          setColaboracionGestion({
            alias: datos.alias || "",
            emailComprobantes: datos.emailComprobantes || "",
            mostrarColaboracion: Boolean(datos.mostrarColaboracion),
          });
        }
      } catch (error) {
        console.error("Error al cargar configuración de colaboración:", error);
      }
    };

    cargarColaboracionGestion();
  }, [moduloGestionActivo]);

  useEffect(() => {
    const cargarComunicados = async () => {
      try {
        const respuesta = await fetch(
          "https://centro-estudiantes-lista-verde.onrender.com/api/comunicados",
        );

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los comunicados.");
        }

        const datos = await respuesta.json();
        setComunicados(datos);
      } catch (error) {
        console.error("Error al cargar comunicados:", error);
      }
    };

    cargarComunicados();
  }, []);
  const [comunicadoEditando, setComunicadoEditando] = useState(null);

  useEffect(() => {
    const cargarTransparencia = async () => {
      try {
        const [respuestaRendiciones, respuestaColaboracion] = await Promise.all(
          [
            fetch(
              "https://centro-estudiantes-lista-verde.onrender.com/api/transparencia/rendiciones",
            ),
            fetch(
              "https://centro-estudiantes-lista-verde.onrender.com/api/transparencia/colaboracion",
            ),
          ],
        );

        if (!respuestaRendiciones.ok) {
          throw new Error("No se pudieron cargar las rendiciones.");
        }

        if (!respuestaColaboracion.ok) {
          throw new Error("No se pudo cargar la información de colaboración.");
        }

        const datosRendiciones = await respuestaRendiciones.json();
        const datosColaboracion = await respuestaColaboracion.json();

        setRendiciones(datosRendiciones);
        setColaboracion(datosColaboracion);
      } catch (error) {
        console.error("Error al cargar Transparencia:", error);
      }
    };

    cargarTransparencia();
  }, []);

  useEffect(() => {
    const manejarCambioHash = () => {
      const hash = window.location.hash.replace("#", "");

      setSeccionActiva(seccionesValidas.includes(hash) ? hash : "inicio");
    };

    window.addEventListener("hashchange", manejarCambioHash);

    return () => {
      window.removeEventListener("hashchange", manejarCambioHash);
    };
  }, []);

  useEffect(() => {
    if (!gestionAutorizada) {
      return;
    }

    const cargarTesoreria = async () => {
      try {
        const token = sessionStorage.getItem("gestionToken");

        const opciones = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [respuestaMovimientos, respuestaConfiguracion] =
          await Promise.all([
            fetch(
              "https://centro-estudiantes-lista-verde.onrender.com/api/movimientos",
              opciones,
            ),
            fetch(
              "https://centro-estudiantes-lista-verde.onrender.com/api/movimientos/configuracion/tesoreria",
              opciones,
            ),
          ]);

        if (!respuestaMovimientos.ok || !respuestaConfiguracion.ok) {
          throw new Error("No se pudo cargar Tesorería.");
        }

        const datosMovimientos = await respuestaMovimientos.json();

        const configuracion = await respuestaConfiguracion.json();

        setMovimientos(datosMovimientos);

        setSiguienteNumeroRecibo(configuracion.siguienteNumeroRecibo);
      } catch (error) {
        console.error("Error al cargar Tesorería:", error);
      }
    };

    cargarTesoreria();
  }, [gestionAutorizada]);

  useEffect(() => {
    if (!gestionAutorizada) return;

    const cargarParticipaciones = async () => {
      try {
        const token = sessionStorage.getItem("gestionToken");

        const respuesta = await fetch(
          "https://centro-estudiantes-lista-verde.onrender.com/api/participaciones",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las participaciones.");
        }

        const datos = await respuesta.json();

        setParticipacionesGestion(datos);
      } catch (error) {
        console.error("Error al cargar participaciones:", error);
      }
    };

    cargarParticipaciones();
  }, [gestionAutorizada]);

  useEffect(() => {
    const controlarScroll = () => {
      setMostrarSubir(window.scrollY > 500);
    };

    window.addEventListener("scroll", controlarScroll);

    return () => {
      window.removeEventListener("scroll", controlarScroll);
    };
  }, []);

  const volverArriba = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const imprimirTesoreria = () => {
    window.print();
  };

  const iniciarSesionGestion = async (e) => {
    e.preventDefault();

    setErrorLogin("");

    try {
      const respuesta = await fetch(
        "https://centro-estudiantes-lista-verde.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginGestion),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setErrorLogin(datos.mensaje || "No se pudo iniciar sesión.");
        return;
      }

      sessionStorage.setItem("gestionToken", datos.token);

      setGestionAutorizada(true);

      setLoginGestion({
        usuario: "",
        password: "",
      });

      setErrorLogin("");
    } catch (error) {
      console.error("Error de login:", error);

      setErrorLogin("No se pudo conectar con el servidor.");
    }
  };
  const descargarTesoreria = () => {
    if (movimientos.length === 0) {
      alert("Todavía no hay movimientos para descargar.");
      return;
    }

    const encabezados = [
      "Fecha",
      "Tipo",
      "Concepto",
      "Medio de pago",
      "Monto",
      "Recibo",
      "Estado",
      "Observaciones",
    ];

    const escaparCSV = (valor) => {
      const texto = String(valor ?? "").replace(/"/g, '""');
      return `"${texto}"`;
    };

    const filas = movimientos.map((movimiento) => [
      movimiento.fecha
        ? new Date(`${movimiento.fecha}T00:00:00`).toLocaleDateString("es-AR")
        : "",
      movimiento.tipo,
      movimiento.concepto,
      movimiento.medioPago,
      movimiento.monto,
      movimiento.recibo || "",
      movimiento.anulado ? "ANULADO" : "ACTIVO",
      movimiento.observaciones || "",
    ]);

    const contenidoCSV = [
      encabezados.map(escaparCSV).join(";"),
      ...filas.map((fila) => fila.map(escaparCSV).join(";")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + contenidoCSV], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = `tesoreria-centro-estudiantes-${hoy}.csv`;

    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    URL.revokeObjectURL(url);
  };

  const cerrarSesionGestion = () => {
    sessionStorage.removeItem("gestionToken");
    setGestionAutorizada(false);
    setErrorLogin("");

    window.location.hash = "gestion";
  };

  const cantidadMensajesNuevos = participacionesGestion.filter(
    (participacion) => participacion.estado === "Nuevo",
  ).length;

  const enviarParticipacion = async (e) => {
    e.preventDefault();

    setMensajeParticipacion("");
    setErrorParticipacion("");

    if (
      !participacion.curso ||
      !participacion.motivo ||
      !participacion.mensaje.trim()
    ) {
      setErrorParticipacion("Completá curso, motivo y mensaje.");
      return;
    }

    try {
      const respuesta = await fetch(
        "https://centro-estudiantes-lista-verde.onrender.com/api/participaciones",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(participacion),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setErrorParticipacion(
          datos.mensaje || "No se pudo enviar tu participación.",
        );
        return;
      }

      setMensajeParticipacion(
        "¡Gracias! Tu mensaje fue enviado al Centro de Estudiantes. 💚",
      );

      setParticipacion({
        curso: "",
        motivo: "",
        mensaje: "",
      });
    } catch (error) {
      console.error("Error al enviar participación:", error);

      setErrorParticipacion("No se pudo conectar con el servidor.");
    }
  };

  const cambiarEstadoParticipacion = async (id, nuevoEstado) => {
    try {
      const respuesta = await fetch(
        `https://centro-estudiantes-lista-verde.onrender.com/api/participaciones/${id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("gestionToken")}`,
          },
          body: JSON.stringify({
            estado: nuevoEstado,
          }),
        },
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo cambiar el estado.");
      }

      const participacionActualizada = await respuesta.json();

      setParticipacionesGestion((actuales) =>
        actuales.map((participacion) =>
          participacion._id === id ? participacionActualizada : participacion,
        ),
      );
    } catch (error) {
      console.error("Error al cambiar estado:", error);

      alert("No se pudo actualizar el mensaje.");
    }
  };

  const eliminarParticipacion = async (id) => {
    const confirmar = window.confirm(
      "¿Eliminar este mensaje del Buzón? Esta acción no se puede deshacer.",
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(
        `https://centro-estudiantes-lista-verde.onrender.com/api/participaciones/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("gestionToken")}`,
          },
        },
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo eliminar el mensaje.");
      }

      setParticipacionesGestion((actuales) =>
        actuales.filter((participacion) => participacion._id !== id),
      );

      alert("Mensaje eliminado correctamente. ✅");
    } catch (error) {
      console.error("Error al eliminar participación:", error);
      alert("No se pudo eliminar el mensaje.");
    }
  };

  const guardarComunicado = async () => {
    if (
      !nuevoComunicado.fecha ||
      !nuevoComunicado.categoria.trim() ||
      !nuevoComunicado.titulo.trim() ||
      !nuevoComunicado.texto.trim()
    ) {
      alert("Completá fecha, categoría, título y texto.");
      return;
    }

    try {
      const token = sessionStorage.getItem("gestionToken");

      const url = comunicadoEditando
        ? `https://centro-estudiantes-lista-verde.onrender.com/api/comunicados/${comunicadoEditando}`
        : "https://centro-estudiantes-lista-verde.onrender.com/api/comunicados";

      const respuesta = await fetch(url, {
        method: comunicadoEditando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoComunicado),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            (comunicadoEditando
              ? "No se pudo actualizar el comunicado."
              : "No se pudo guardar el comunicado."),
        );
      }

      if (comunicadoEditando) {
        setComunicadosGestion((anteriores) =>
          anteriores.map((comunicado) => {
            if (comunicado._id === datos._id) {
              return datos;
            }

            if (datos.destacado) {
              return {
                ...comunicado,
                destacado: false,
              };
            }

            return comunicado;
          }),
        );

        setComunicados((anteriores) => {
          let actualizados = datos.destacado
            ? anteriores.map((comunicado) => ({
                ...comunicado,
                destacado: false,
              }))
            : anteriores;

          if (!datos.publicado) {
            return actualizados.filter(
              (comunicado) => comunicado._id !== datos._id,
            );
          }

          const yaExiste = actualizados.some(
            (comunicado) => comunicado._id === datos._id,
          );

          if (yaExiste) {
            return actualizados.map((comunicado) =>
              comunicado._id === datos._id ? datos : comunicado,
            );
          }

          return [datos, ...actualizados];
        });
        alert("Comunicado actualizado correctamente.");
      } else {
        setComunicadosGestion((anteriores) => {
          const anterioresActualizados = datos.destacado
            ? anteriores.map((comunicado) => ({
                ...comunicado,
                destacado: false,
              }))
            : anteriores;

          return [datos, ...anterioresActualizados];
        });

        setComunicados((anteriores) => {
          const anterioresActualizados = datos.destacado
            ? anteriores.map((comunicado) => ({
                ...comunicado,
                destacado: false,
              }))
            : anteriores;

          if (datos.publicado) {
            return [datos, ...anterioresActualizados];
          }

          return anterioresActualizados;
        });

        alert("Comunicado guardado correctamente.");
      }

      setNuevoComunicado({
        fecha: hoy,
        categoria: "",
        titulo: "",
        texto: "",
        destacado: false,
        publicado: false,
      });

      setComunicadoEditando(null);
    } catch (error) {
      console.error("Error al guardar comunicado:", error);
      alert(error.message);
    }
  };
  const cargarComunicadosGestion = async () => {
    try {
      const token = sessionStorage.getItem("gestionToken");

      const respuesta = await fetch(
        "https://centro-estudiantes-lista-verde.onrender.com/api/comunicados/gestion",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudieron cargar los comunicados.",
        );
      }

      setComunicadosGestion(datos);
    } catch (error) {
      console.error("Error al cargar comunicados de Gestión:", error);
    }
  };

  const eliminarComunicado = async (id) => {
    const confirmar = window.confirm("¿Querés eliminar este comunicado?");

    if (!confirmar) {
      return;
    }

    try {
      const token = sessionStorage.getItem("gestionToken");

      const respuesta = await fetch(
        `https://centro-estudiantes-lista-verde.onrender.com/api/comunicados/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo eliminar el comunicado.");
      }

      setComunicadosGestion((anteriores) =>
        anteriores.filter((comunicado) => comunicado._id !== id),
      );

      setComunicados((anteriores) =>
        anteriores.filter((comunicado) => comunicado._id !== id),
      );

      alert("Comunicado eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar comunicado:", error);
      alert(error.message);
    }
  };

  const editarComunicado = (comunicado) => {
    setComunicadoEditando(comunicado._id);

    setNuevoComunicado({
      fecha: comunicado.fecha,
      categoria: comunicado.categoria,
      titulo: comunicado.titulo,
      texto: comunicado.texto,
      destacado: comunicado.destacado,
      publicado: comunicado.publicado,
    });

    setTimeout(() => {
      document.getElementById("formulario-comunicado")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const cancelarEdicionComunicado = () => {
    setComunicadoEditando(null);

    setNuevoComunicado({
      fecha: hoy,
      categoria: "",
      titulo: "",
      texto: "",
      destacado: false,
      publicado: false,
    });
  };

  const cambiarPublicacionComunicado = async (comunicado) => {
    try {
      const token = sessionStorage.getItem("gestionToken");

      const comunicadoActualizado = {
        fecha: comunicado.fecha,
        categoria: comunicado.categoria,
        titulo: comunicado.titulo,
        texto: comunicado.texto,
        destacado: comunicado.destacado,
        publicado: !comunicado.publicado,
      };

      const respuesta = await fetch(
        `https://centro-estudiantes-lista-verde.onrender.com/api/comunicados/${comunicado._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(comunicadoActualizado),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo cambiar la publicación.");
      }

      setComunicadosGestion((anteriores) =>
        anteriores.map((item) => (item._id === datos._id ? datos : item)),
      );

      setComunicados((anteriores) => {
        if (!datos.publicado) {
          return anteriores.filter((item) => item._id !== datos._id);
        }

        const yaExiste = anteriores.some((item) => item._id === datos._id);

        if (yaExiste) {
          return anteriores.map((item) =>
            item._id === datos._id ? datos : item,
          );
        }

        return [datos, ...anteriores];
      });
    } catch (error) {
      console.error("Error al cambiar publicación:", error);
      alert(error.message);
    }
  };

  const cambiarDestacadoComunicado = async (comunicado) => {
    try {
      const token = sessionStorage.getItem("gestionToken");

      const comunicadoActualizado = {
        fecha: comunicado.fecha,
        categoria: comunicado.categoria,
        titulo: comunicado.titulo,
        texto: comunicado.texto,
        destacado: !comunicado.destacado,
        publicado: comunicado.publicado,
      };

      const respuesta = await fetch(
        `https://centro-estudiantes-lista-verde.onrender.com/api/comunicados/${comunicado._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(comunicadoActualizado),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo cambiar el destacado.");
      }

      setComunicadosGestion((anteriores) =>
        anteriores.map((item) => {
          if (item._id === datos._id) {
            return datos;
          }

          if (datos.destacado) {
            return {
              ...item,
              destacado: false,
            };
          }

          return item;
        }),
      );

      setComunicados((anteriores) =>
        anteriores.map((item) => {
          if (item._id === datos._id) {
            return datos;
          }

          if (datos.destacado) {
            return {
              ...item,
              destacado: false,
            };
          }

          return item;
        }),
      );
    } catch (error) {
      console.error("Error al cambiar destacado:", error);
      alert(error.message);
    }
  };

  const copiarDatoColaboracion = async (texto, nombre) => {
    try {
      await navigator.clipboard.writeText(texto);
      alert(`${nombre} copiado correctamente.`);
    } catch (error) {
      console.error("Error al copiar:", error);
      alert("No se pudo copiar el dato.");
    }
  };

  const guardarRendicion = async () => {
    if (
      !nuevaRendicion.fecha ||
      !nuevaRendicion.titulo.trim() ||
      !nuevaRendicion.destino.trim()
    ) {
      alert("Completá fecha, actividad y destino de los fondos.");
      return;
    }

    try {
      const token = sessionStorage.getItem("gestionToken");

      const url = rendicionEditando
        ? `https://centro-estudiantes-lista-verde.onrender.com/api/transparencia/rendiciones/${rendicionEditando}`
        : "https://centro-estudiantes-lista-verde.onrender.com/api/transparencia/rendiciones";

      const respuesta = await fetch(url, {
        method: rendicionEditando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaRendicion),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            (rendicionEditando
              ? "No se pudo actualizar la rendición."
              : "No se pudo guardar la rendición."),
        );
      }

      if (rendicionEditando) {
        setRendicionesGestion((anteriores) =>
          anteriores.map((rendicion) =>
            rendicion._id === datos._id ? datos : rendicion,
          ),
        );
      } else {
        setRendicionesGestion((anteriores) => [datos, ...anteriores]);
      }

      setRendiciones((anteriores) => {
        if (!datos.publicado) {
          return anteriores.filter((rendicion) => rendicion._id !== datos._id);
        }

        const yaExiste = anteriores.some(
          (rendicion) => rendicion._id === datos._id,
        );

        if (yaExiste) {
          return anteriores.map((rendicion) =>
            rendicion._id === datos._id ? datos : rendicion,
          );
        }

        return [datos, ...anteriores];
      });

      setNuevaRendicion({
        fecha: hoy,
        titulo: "",
        monto: "",
        destino: "",
        descripcion: "",
        publicado: false,
      });

      setRendicionEditando(null);

      alert(
        rendicionEditando
          ? "Rendición actualizada correctamente."
          : "Rendición guardada correctamente.",
      );
    } catch (error) {
      console.error("Error al guardar rendición:", error);
      alert(error.message);
    }
  };

  const cambiarPublicacionRendicion = async (rendicion) => {
    setRendicionCambiandoPublicacion(rendicion._id);

    try {
      const token = sessionStorage.getItem("gestionToken");

      const rendicionActualizada = {
        fecha: rendicion.fecha,
        titulo: rendicion.titulo,
        monto: rendicion.monto,
        destino: rendicion.destino,
        descripcion: rendicion.descripcion,
        publicado: !rendicion.publicado,
      };

      const respuesta = await fetch(
        `https://centro-estudiantes-lista-verde.onrender.com/api/transparencia/rendiciones/${rendicion._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(rendicionActualizada),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo cambiar la publicación.");
      }

      setRendicionesGestion((anteriores) =>
        anteriores.map((item) => (item._id === datos._id ? datos : item)),
      );

      setRendiciones((anteriores) => {
        if (!datos.publicado) {
          return anteriores.filter((item) => item._id !== datos._id);
        }

        const yaExiste = anteriores.some((item) => item._id === datos._id);

        if (yaExiste) {
          return anteriores.map((item) =>
            item._id === datos._id ? datos : item,
          );
        }

        return [datos, ...anteriores];
      });
    } catch (error) {
      console.error("Error al cambiar publicación:", error);
      alert(error.message);
    } finally {
      setRendicionCambiandoPublicacion(null);
    }
  };

  const eliminarRendicion = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar esta rendición?",
    );

    if (!confirmar) {
      return;
    }

    try {
      const token = sessionStorage.getItem("gestionToken");

      const respuesta = await fetch(
        `https://centro-estudiantes-lista-verde.onrender.com/api/transparencia/rendiciones/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo eliminar la rendición.");
      }

      setRendicionesGestion((anteriores) =>
        anteriores.filter((item) => item._id !== id),
      );

      setRendiciones((anteriores) =>
        anteriores.filter((item) => item._id !== id),
      );

      alert("Rendición eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar rendición:", error);
      alert(error.message);
    }
  };

  const cargarGaleriaGestion = async () => {
    try {
      const token = sessionStorage.getItem("gestionToken");

      const apiGaleriaGestion =
        window.location.hostname === "localhost"
          ? "http://localhost:5000/api/galeria/gestion"
          : "/api/galeria/gestion";

      const respuesta = await fetch(apiGaleriaGestion, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudo cargar la galería de gestión.",
        );
      }

      setGaleriaGestion(datos);
    } catch (error) {
      console.error("Error al cargar galería de gestión:", error);
      alert(error.message);
    }
  };

  const editarMomentoGaleria = (momento) => {
    setMomentoGaleriaEditando(momento._id);

    setFormGaleria({
      fecha: momento.fecha,
      categoria: momento.categoria || "Actividad",
      titulo: momento.titulo,
      descripcion: momento.descripcion || "",
      publicado: momento.publicado,
    });

    setTimeout(() => {
      document.getElementById("formulario-galeria")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const guardarMomentoGaleria = async () => {
    if (!formGaleria.fecha || !formGaleria.titulo.trim()) {
      alert("Completá la fecha y el título del momento.");
      return;
    }

    try {
      const token = sessionStorage.getItem("gestionToken");

      const apiGaleria =
        window.location.hostname === "localhost"
          ? "http://localhost:5000/api/galeria"
          : "/api/galeria";

      const url = momentoGaleriaEditando
        ? `${apiGaleria}/${momentoGaleriaEditando}`
        : apiGaleria;

      const respuesta = await fetch(url, {
        method: momentoGaleriaEditando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fecha: formGaleria.fecha,
          titulo: formGaleria.titulo,
          descripcion: formGaleria.descripcion,
          categoria: formGaleria.categoria,
          medios: [],
          publicado: formGaleria.publicado,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            (momentoGaleriaEditando
              ? "No se pudo actualizar el momento."
              : "No se pudo guardar el momento."),
        );
      }

      if (momentoGaleriaEditando) {
        setGaleriaGestion((anteriores) =>
          anteriores.map((momento) =>
            momento._id === datos._id ? datos : momento,
          ),
        );
      } else {
        setGaleriaGestion((anteriores) => [datos, ...anteriores]);
      }

      setFormGaleria({
        fecha: "",
        categoria: "Actividad",
        titulo: "",
        descripcion: "",
        publicado: false,
      });

      setMomentoGaleriaEditando(null);

      alert(
        momentoGaleriaEditando
          ? "Momento actualizado correctamente."
          : "Momento guardado correctamente.",
      );
    } catch (error) {
      console.error("Error al guardar momento de galería:", error);
      alert(error.message);
    }
  };

  const cambiarPublicacionMomentoGaleria = async (momento) => {
    try {
      const token = sessionStorage.getItem("gestionToken");

      const apiGaleria =
        window.location.hostname === "localhost"
          ? "http://localhost:5000/api/galeria"
          : "/api/galeria";

      const momentoActualizado = {
        fecha: momento.fecha,
        titulo: momento.titulo,
        descripcion: momento.descripcion,
        categoria: momento.categoria,
        medios: momento.medios || [],
        publicado: !momento.publicado,
      };

      const respuesta = await fetch(`${apiGaleria}/${momento._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(momentoActualizado),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudo cambiar la publicación del momento.",
        );
      }

      setGaleriaGestion((anteriores) =>
        anteriores.map((item) => (item._id === datos._id ? datos : item)),
      );
    } catch (error) {
      console.error("Error al cambiar publicación del momento:", error);

      alert(error.message);
    }
  };

  const eliminarMomentoGaleria = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este momento de la galería?",
    );

    if (!confirmar) {
      return;
    }

    try {
      const token = sessionStorage.getItem("gestionToken");

      const apiGaleria =
        window.location.hostname === "localhost"
          ? "http://localhost:5000/api/galeria"
          : "/api/galeria";

      const respuesta = await fetch(`${apiGaleria}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo eliminar el momento.");
      }

      setGaleriaGestion((anteriores) =>
        anteriores.filter((momento) => momento._id !== id),
      );

      alert("Momento eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar momento de galería:", error);
      alert(error.message);
    }
  };

  const guardarColaboracion = async () => {
    if (
      !colaboracionGestion.alias.trim() ||
      !colaboracionGestion.emailComprobantes.trim()
    ) {
      alert("Completá el alias y el mail para comprobantes.");
      return;
    }

    try {
      setGuardandoColaboracion(true);

      const token = sessionStorage.getItem("gestionToken");

      const respuesta = await fetch(
        "https://centro-estudiantes-lista-verde.onrender.com/api/transparencia/colaboracion",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(colaboracionGestion),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudieron guardar los datos de colaboración.",
        );
      }

      setColaboracionGestion({
        alias: datos.alias || "",
        emailComprobantes: datos.emailComprobantes || "",
        mostrarColaboracion: Boolean(datos.mostrarColaboracion),
      });

      setColaboracion(datos.mostrarColaboracion ? datos : null);

      alert("Datos de colaboración guardados correctamente.");
    } catch (error) {
      console.error("Error al guardar colaboración:", error);
      alert(error.message);
    } finally {
      setGuardandoColaboracion(false);
    }
  };

  const editarRendicion = (rendicion) => {
    setRendicionEditando(rendicion._id);

    setNuevaRendicion({
      fecha: rendicion.fecha,
      titulo: rendicion.titulo,
      monto: rendicion.monto,
      destino: rendicion.destino,
      descripcion: rendicion.descripcion || "",
      publicado: rendicion.publicado,
    });

    setTimeout(() => {
      document
        .querySelector(".gestion-transparencia-rendiciones")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const [anio, mes, dia] = fecha.split("-");

    return `${dia}/${mes}/${anio}`;
  };

  return (
    <main className="pagina">
      <section
        className={`hero ${seccionActiva !== "inicio" ? "hero-solo-menu" : ""}`}
        id="inicio"
      >
        <header className="barra-superior">
          <div className="marca">
            <img src={logoListaVerde} alt="Logo Lista Verde" />
            <span>LISTA VERDE</span>
          </div>

          <button
            type="button"
            className="menu-hamburguesa"
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            aria-label="Abrir menú"
          >
            {menuMovilAbierto ? "✕" : "☰"}
          </button>

          <nav className={`menu ${menuMovilAbierto ? "menu-abierto" : ""}`}>
            <a
              href="#inicio"
              onClick={() => {
                setSeccionActiva("inicio");
                setMenuMovilAbierto(false);
              }}
            >
              Inicio
            </a>

            <a
              href="#quienes-somos"
              onClick={() => {
                setSeccionActiva("quienes-somos");
                setMenuMovilAbierto(false);
              }}
            >
              Quiénes somos
            </a>

            <a
              href="#comunicados"
              onClick={() => {
                setSeccionActiva("comunicados");
                setMenuMovilAbierto(false);
              }}
            >
              Comunicados
            </a>

            <a
              href="#transparencia"
              className={seccionActiva === "transparencia" ? "menu-activo" : ""}
              onClick={() => {
                setSeccionActiva("transparencia");
                setMenuMovilAbierto(false);
              }}
            >
              Transparencia
            </a>

            <a
              href="#participa"
              onClick={() => {
                setSeccionActiva("participa");
                setMenuMovilAbierto(false);
              }}
            >
              Participá
            </a>

            <div className="menu-mas">
              <button type="button" className="menu-mas-boton">
                <span>Más</span>
                <span className="menu-mas-flecha">⌄</span>
              </button>

              <div className="submenu submenu-setlist">
                <div className="submenu-encabezado">
                  <span>MÁS PARA EXPLORAR</span>
                  <small>SETLIST · LISTA VERDE</small>
                </div>

                <a
                  href="#derechos"
                  onClick={() => {
                    setSeccionActiva("derechos");
                    setMenuMovilAbierto(false);
                  }}
                >
                  <span className="submenu-numero">01</span>

                  <span className="submenu-texto">
                    <strong>Derechos</strong>
                    <small>Conocé tus derechos como estudiante</small>
                  </span>

                  <span className="submenu-flecha">→</span>
                </a>

                <a
                  href="#proyectos"
                  onClick={() => {
                    setSeccionActiva("proyectos");
                    setMenuMovilAbierto(false);
                  }}
                >
                  <span className="submenu-numero">02</span>

                  <span className="submenu-texto">
                    <strong>Proyectos</strong>
                    <small>Ideas que se convierten en acción</small>
                  </span>

                  <span className="submenu-flecha">→</span>
                </a>

                <a
                  href="#estatuto"
                  onClick={() => {
                    setSeccionActiva("estatuto");
                    setMenuMovilAbierto(false);
                  }}
                >
                  <span className="submenu-numero">03</span>

                  <span className="submenu-texto">
                    <strong>Estatuto</strong>
                    <small>Nuestras reglas y organización</small>
                  </span>

                  <span className="submenu-flecha">→</span>
                </a>

                <a
                  href="#manual"
                  onClick={() => {
                    setSeccionActiva("manual");
                    setMenuMovilAbierto(false);
                  }}
                >
                  <span className="submenu-numero">04</span>

                  <span className="submenu-texto">
                    <strong>Manual Digital</strong>
                    <small>Una guía hecha por estudiantes</small>
                  </span>

                  <span className="submenu-flecha">→</span>
                </a>

                <a
                  href="#galeria"
                  onClick={() => {
                    setSeccionActiva("galeria");
                    setMenuMovilAbierto(false);
                  }}
                >
                  <span className="submenu-numero">05</span>

                  <span className="submenu-texto">
                    <strong>Galería</strong>
                    <small>Momentos que construyen historia</small>
                  </span>

                  <span className="submenu-flecha">→</span>
                </a>

                <div className="submenu-pie">
                  <span>♫</span>
                  <span>hecho por y para estudiantes</span>
                </div>
              </div>
            </div>
          </nav>

          <a
            href="#gestion"
            className="boton-gestion"
            onClick={() => {
              setSeccionActiva("gestion");
              setMenuMovilAbierto(false);
            }}
          >
            🔒 Gestión
          </a>
        </header>

        {seccionActiva === "inicio" && (
          <>
            <div className="forma forma-1"></div>
            <div className="forma forma-2"></div>
            <div className="forma forma-3"></div>

            <div className="hero-contenido">
              <img
                src={logoListaVerde}
                alt="Logo Centro de Estudiantes Lista Verde"
                className="logo-principal"
              />

              <p className="etiqueta">CENTRO DE ESTUDIANTES</p>

              <h1>E.E.S. N.º 50</h1>

              <h2>“Luis Alberto Spinetta”</h2>

              <p className="ubicacion">Morón · Orientación en Música</p>

              <p className="frase">
                Una escuela también se construye con la voz de sus estudiantes.
              </p>

              <a
                className="scroll"
                href="#quienes-somos"
                onClick={() => {
                  setSeccionActiva("quienes-somos");
                  setMenuMovilAbierto(false);
                }}
              >
                ↓<span>DESLIZÁ PARA DESCUBRIR</span>
              </a>
            </div>

            <div className="mensaje-lateral mensaje-izq">
              misma escuela
              <br />
              más voces ♡
            </div>

            <div className="mensaje-lateral mensaje-der">
              IDEAS
              <br />
              ESTUDIANTES
              <br />
              ACCIONES
              <br />
              REALES ♡
            </div>

            <div className="musica">♫ ♪ ♬</div>

            <div className="redes">
              <a
                href="https://www.instagram.com/ListaVerde_ees50"
                target="_blank"
                rel="noreferrer"
              >
                ◎ ListaVerde_ees50
              </a>

              <a href="mailto:listaverde.eesn50@gmail.com">
                ✉ listaverde.eesn50@gmail.com
              </a>
            </div>

            <div className="palabras">
              CULTURA · MÚSICA · ENCUENTRO · COMUNIDAD
            </div>
          </>
        )}
      </section>

      {seccionActiva === "quienes-somos" && (
        <section className="quienes" id="quienes-somos">
          <div className="quienes-encabezado">
            <span className="mini-titulo">NUESTRO CENTRO</span>

            <h2>Quiénes somos</h2>

            <p>
              Somos estudiantes de la E.E.S. N.º 50 “Luis Alberto Spinetta” que
              elegimos participar, escuchar y transformar nuestras ideas en
              acciones para toda la comunidad estudiantil.
            </p>
          </div>

          <div className="comision">
            <article className="integrante presidenta">
              <span className="cargo">PRESIDENTA</span>
              <h3>Flores Sarah</h3>
              <p>5° A</p>
            </article>

            <article className="integrante vicepresidenta">
              <span className="cargo">VICEPRESIDENTA</span>
              <h3>Noir Marlene</h3>
              <p>5° A</p>
            </article>

            <article className="integrante">
              <span className="cargo">SECRETARIO</span>
              <h3>Tortorello Ashley</h3>
              <p>5° B</p>
            </article>

            <article className="integrante">
              <span className="cargo">TESORERA</span>
              <h3>Jimenez Sofía</h3>
              <p>5° A</p>
            </article>
          </div>

          <div className="vocales-bloque">
            <h3>Vocales</h3>

            <div className="vocales">
              <article className="vocal">
                <h4>Ortiz Blanca</h4>
                <p>5° A</p>
              </article>

              <article className="vocal">
                <h4>Montenegro Bianca</h4>
                <p>4° A</p>
              </article>

              <article className="vocal">
                <h4>Escobar Martina</h4>
                <p>5° B</p>
              </article>
            </div>
          </div>

          <p className="lema-equipo">Distintas voces. Un mismo Centro. 💚</p>
        </section>
      )}
      {seccionActiva === "comunicados" && (
        <section className="comunicados" id="comunicados">
          <div className="comunicados-encabezado">
            <span className="mini-titulo">LO ÚLTIMO DEL CENTRO</span>

            <h2>Comunicados & Novedades</h2>

            <p>
              Todo lo que está pasando, lo que se viene y lo que queremos
              compartir con la comunidad estudiantil.
            </p>
          </div>

          {comunicados.length === 0 ? (
            <div className="historial-vacio">
              <span className="historial-icono">📣</span>

              <h4>Todavía no hay comunicados publicados</h4>

              <p>Cuando el Centro publique una novedad, va a aparecer acá.</p>
            </div>
          ) : (
            <>
              {comunicadoDestacado && (
                <article className="novedad-destacada">
                  <div className="novedad-destacada-contenido">
                    <div className="novedad-meta">
                      <span>
                        {new Date(`${comunicadoDestacado.fecha}T00:00:00`)
                          .toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          .toUpperCase()}
                      </span>

                      <span>·</span>

                      <span>{comunicadoDestacado.categoria.toUpperCase()}</span>
                    </div>

                    <h3>{comunicadoDestacado.titulo}</h3>

                    <p>{comunicadoDestacado.texto}</p>

                    <span className="etiqueta-novedad">DESTACADA</span>
                  </div>

                  <div className="novedad-decoracion">📣</div>
                </article>
              )}

              {comunicadosSecundarios.length > 0 && (
                <div className="novedades-grid">
                  {comunicadosSecundarios.map((comunicado) => (
                    <article className="novedad-card" key={comunicado._id}>
                      <div className="novedad-meta">
                        <span>
                          {new Date(`${comunicado.fecha}T00:00:00`)
                            .toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            .toUpperCase()}
                        </span>

                        <span>·</span>

                        <span>{comunicado.categoria.toUpperCase()}</span>
                      </div>

                      <h3>{comunicado.titulo}</h3>

                      <p>{comunicado.texto}</p>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {seccionActiva === "estatuto" && (
        <section className="estatuto" id="estatuto">
          <div className="estatuto-encabezado">
            <span className="mini-titulo">
              NUESTRAS REGLAS · NUESTRO ESPACIO
            </span>

            <h2>Estatuto</h2>

            <p>
              El Estatuto establece cómo se organiza y funciona nuestro Centro
              de Estudiantes, cuáles son sus objetivos y de qué manera podemos
              participar.
            </p>
          </div>

          <div className="estatuto-grid">
            <article className="estatuto-card">
              <span className="estatuto-icono">✦</span>
              <h3>Participar</h3>
              <p>
                Crear un espacio de acción, participación y representación para
                los estudiantes.
              </p>
            </article>

            <article className="estatuto-card">
              <span className="estatuto-icono">♡</span>
              <h3>Representar</h3>
              <p>
                Escuchar necesidades, inquietudes, propuestas y problemáticas de
                la comunidad estudiantil.
              </p>
            </article>

            <article className="estatuto-card">
              <span className="estatuto-icono">✓</span>
              <h3>Elegir</h3>
              <p>
                Todos los estudiantes regulares tienen derecho a participar y
                ejercer su voto según lo establecido en el Estatuto.
              </p>
            </article>

            <article className="estatuto-card">
              <span className="estatuto-icono">$</span>
              <h3>Ser transparentes</h3>
              <p>
                Los ingresos y egresos del Centro deben registrarse y
                presentarse en un balance.
              </p>
            </article>
          </div>

          <div className="estatuto-documento">
            <div>
              <span className="documento-etiqueta">DOCUMENTO OFICIAL</span>

              <h3>Estatuto del Centro de Estudiantes</h3>

              <p>E.E.S. N.º 50 · Morón</p>
            </div>

            <div className="estatuto-botones">
              <a
                href="/documentos/estatuto-centro-estudiantes.pdf"
                target="_blank"
                rel="noreferrer"
                className="boton-estatuto principal"
              >
                📖 Leer Estatuto
              </a>

              <a
                href="/documentos/estatuto-centro-estudiantes.pdf"
                download
                className="boton-estatuto"
              >
                ↓ Descargar PDF
              </a>
            </div>
          </div>
        </section>
      )}

      {seccionActiva === "derechos" && (
        <section className="derechos" id="derechos">
          <div className="derechos-encabezado">
            <span className="mini-titulo">
              CONOCER · PARTICIPAR · HACER VALER
            </span>

            <h2>Derechos del estudiante</h2>

            <p>
              Conocer nuestros derechos también es una forma de participar,
              cuidarnos y construir una escuela más justa.
            </p>
          </div>

          <div className="derechos-grid">
            <article className="derecho-card">
              <span className="derecho-icono">💬</span>
              <h3>Ser escuchado</h3>
              <p>
                Poder expresar opiniones, propuestas, dudas e inquietudes dentro
                de la comunidad educativa.
              </p>
            </article>

            <article className="derecho-card">
              <span className="derecho-icono">🤝</span>
              <h3>Recibir un trato respetuoso</h3>
              <p>Ser tratado con respeto, sin discriminación ni violencia.</p>
            </article>

            <article className="derecho-card">
              <span className="derecho-icono">📚</span>
              <h3>Aprender</h3>
              <p>
                Acceder a una educación que acompañe, enseñe y favorezca la
                continuidad de las trayectorias escolares.
              </p>
            </article>

            <article className="derecho-card">
              <span className="derecho-icono">✋</span>
              <h3>Participar</h3>
              <p>
                Formar parte de actividades, proyectos, elecciones y espacios de
                participación estudiantil.
              </p>
            </article>

            <article className="derecho-card">
              <span className="derecho-icono">🗳️</span>
              <h3>Elegir representantes</h3>
              <p>
                Participar en la vida democrática del Centro de Estudiantes y
                ejercer el derecho al voto.
              </p>
            </article>

            <article className="derecho-card">
              <span className="derecho-icono">🌱</span>
              <h3>Convivir en un ambiente cuidado</h3>
              <p>
                Aprender y participar en un entorno que promueva el respeto, la
                convivencia y el bienestar.
              </p>
            </article>
          </div>

          <div className="derechos-destacado">
            <div>
              <span className="documento-etiqueta">
                UN DERECHO TAMBIÉN ES UNA VOZ
              </span>

              <h3>¿Tenés una duda o querés contar algo?</h3>

              <p>
                Podés usar nuestro espacio de participación para acercar
                preguntas, ideas, propuestas o inquietudes.
              </p>
            </div>

            <a
              href="#participa"
              className="boton-derechos"
              onClick={() => {
                setSeccionActiva("participa");
                setMenuMovilAbierto(false);
              }}
            >
              Ir a Participá →
            </a>
          </div>
        </section>
      )}

      {seccionActiva === "proyectos" && (
        <section className="proyectos" id="proyectos">
          <div className="proyectos-encabezado">
            <span className="mini-titulo">DE LAS IDEAS A LA ACCIÓN</span>

            <h2>Proyectos</h2>

            <p>
              Acá vamos a mostrar las propuestas del Centro, en qué etapa están
              y cómo van avanzando.
            </p>
          </div>

          <div className="proyectos-etapas">
            <div className="etapa">
              <span className="etapa-icono">💡</span>
              <strong>Idea</strong>
              <span>Todo empieza con una propuesta.</span>
            </div>

            <div className="etapa">
              <span className="etapa-icono">📝</span>
              <strong>Planificación</strong>
              <span>Organizamos tareas, tiempos y responsables.</span>
            </div>

            <div className="etapa">
              <span className="etapa-icono">🟡</span>
              <strong>En marcha</strong>
              <span>La propuesta ya se está realizando.</span>
            </div>

            <div className="etapa">
              <span className="etapa-icono">✅</span>
              <strong>Realizado</strong>
              <span>Proyecto terminado y compartido.</span>
            </div>
          </div>

          <div className="proyectos-grid">
            <article className="proyecto-card">
              <div className="proyecto-estado estado-en-marcha">
                🟡 EN MARCHA
              </div>

              <h3>Manual Digital del Estudiante</h3>

              <p>
                Un espacio pensado donde accedés a un manual para armar/desarmar
                cada instrumento y equipo de sonido
              </p>

              <div className="proyecto-pie">
                <span>Responsable</span>
                <strong>Ashley Tortorello</strong>
              </div>
            </article>

            <article className="proyecto-card">
              <div className="proyecto-estado estado-idea">💡 IDEA</div>

              <h3>Nuevas propuestas estudiantiles</h3>

              <p>
                Las ideas que surjan de estudiantes y cursos podrán convertirse
                en nuevos proyectos del Centro.
              </p>

              <div className="proyecto-pie">
                <span>Participación</span>
                <strong>Abierta a toda la escuela</strong>
              </div>
            </article>

            <article className="proyecto-card proyecto-vacio">
              <span className="proyecto-mas">＋</span>

              <h3>Próximo proyecto</h3>

              <p>
                Este espacio se irá completando con las nuevas iniciativas del
                Centro de Estudiantes.
              </p>
            </article>
          </div>

          <div className="proyectos-frase">
            <span>IDEAS</span>
            <span>+</span>
            <span>ORGANIZACIÓN</span>
            <span>+</span>
            <span>PARTICIPACIÓN</span>
            <span>=</span>
            <strong>ACCIÓN</strong>
          </div>
        </section>
      )}
      {seccionActiva === "transparencia" && (
        <section id="transparencia" className="transparencia seccion">
          <div className="transparencia-encabezado">
            <span className="transparencia-etiqueta">CUENTAS CLARAS</span>

            <h2>Transparencia</h2>

            <p>
              Queremos que todos los estudiantes sepan cómo se utilizan los
              recursos del Centro de Estudiantes.
            </p>
          </div>
          <div className="transparencia-volver">
            <a href="#inicio" onClick={() => setSeccionActiva("inicio")}>
              ← Volver al inicio
            </a>
          </div>
          <div className="transparencia-contenido-grid">
            {rendiciones.length === 0 ? (
              <div className="transparencia-vacio">
                <span className="transparencia-vacio-icono">📋</span>

                <h3>Próximamente vas a encontrar acá nuestras rendiciones</h3>

                <p>
                  Publicaremos de manera clara las actividades realizadas, los
                  fondos recaudados y el destino de los recursos.
                </p>

                <small>
                  Los comprobantes y el detalle completo estarán disponibles
                  para consulta en el Centro de Estudiantes.
                </small>
              </div>
            ) : (
              <div className="transparencia-rendiciones">
                {rendiciones.map((rendicion) => (
                  <article
                    key={rendicion._id}
                    className="transparencia-rendicion-card"
                  >
                    <div className="transparencia-rendicion-fecha">
                      📅 {formatearFecha(rendicion.fecha)}
                    </div>

                    <h3>{rendicion.titulo}</h3>

                    <div className="transparencia-rendicion-datos">
                      <div>
                        <span>RECAUDADO</span>
                        <strong>
                          ${Number(rendicion.monto).toLocaleString("es-AR")}
                        </strong>
                      </div>

                      <div>
                        <span>DESTINO</span>
                        <strong>{rendicion.destino}</strong>
                      </div>
                    </div>

                    {rendicion.descripcion && <p>{rendicion.descripcion}</p>}

                    <small>
                      Los comprobantes y el detalle completo están disponibles
                      para consulta en el Centro de Estudiantes.
                    </small>
                  </article>
                ))}
              </div>
            )}
            <div className="transparencia-colabora">
              <span className="transparencia-colabora-etiqueta">
                COLABORÁ CON EL CENTRO
              </span>

              <h3>La escuela también se construye entre todos.</h3>

              <p>
                Cada aporte nos ayuda a transformar ideas en acciones para
                nuestra escuela.
                <strong> Elegí una opción y tocá la tarjeta.</strong>
              </p>

              {colaboracion?.mostrarColaboracion ? (
                <div className="transparencia-colabora-tarjetas">
                  <div
                    className={`tarjeta-colaboracion ${
                      tarjetaColaboracionActiva === "alias" ? "activa" : ""
                    }`}
                    onClick={() =>
                      setTarjetaColaboracionActiva(
                        tarjetaColaboracionActiva === "alias" ? null : "alias",
                      )
                    }
                  >
                    <div className="tarjeta-colaboracion-inner">
                      <div className="tarjeta-colaboracion-frente tarjeta-colaboracion-frente-alias">
                        <img
                          src="/tortuga-colabora.png"
                          alt=""
                          className="tarjeta-colaboracion-tortuga"
                        />

                        <span className="tarjeta-colaboracion-etiqueta">
                          ALIAS PARA DONACIÓN
                        </span>

                        <h4>Transferí de manera simple</h4>

                        <p>Tocá para ver</p>
                      </div>

                      <div className="tarjeta-colaboracion-dorso tarjeta-colaboracion-dorso-alias">
                        <span className="tarjeta-colaboracion-etiqueta">
                          ALIAS
                        </span>

                        <strong>{colaboracion.alias}</strong>

                        <button
                          type="button"
                          onClick={(evento) => {
                            evento.stopPropagation();
                            copiarDatoColaboracion(colaboracion.alias, "Alias");
                          }}
                        >
                          📋 Copiar alias
                        </button>

                        <small>¡Gracias por ser parte! ♡</small>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`tarjeta-colaboracion ${
                      tarjetaColaboracionActiva === "mail" ? "activa" : ""
                    }`}
                    onClick={() =>
                      setTarjetaColaboracionActiva(
                        tarjetaColaboracionActiva === "mail" ? null : "mail",
                      )
                    }
                  >
                    <div className="tarjeta-colaboracion-inner">
                      <div className="tarjeta-colaboracion-frente tarjeta-colaboracion-frente-mail">
                        <img
                          src="/tortuga-colabora.png"
                          alt=""
                          className="tarjeta-colaboracion-tortuga"
                        />

                        <span className="tarjeta-colaboracion-etiqueta">
                          MAIL PARA COMPROBANTES
                        </span>

                        <h4>Enviá tu comprobante</h4>

                        <p>Tocá para ver</p>
                      </div>

                      <div className="tarjeta-colaboracion-dorso tarjeta-colaboracion-dorso-mail">
                        <span className="tarjeta-colaboracion-etiqueta">
                          MAIL
                        </span>

                        <strong>{colaboracion.emailComprobantes}</strong>

                        <button
                          type="button"
                          onClick={(evento) => {
                            evento.stopPropagation();
                            copiarDatoColaboracion(
                              colaboracion.emailComprobantes,
                              "Mail",
                            );
                          }}
                        >
                          ✉️ Copiar mail
                        </button>

                        <small>Enviá aquí tus comprobantes ♡</small>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="transparencia-colabora-datos">
                  <p>
                    Los datos para colaborar estarán disponibles próximamente.
                  </p>
                </div>
              )}

              <small>
                Cada aporte y su destino serán informados en esta sección de
                Transparencia.
              </small>
            </div>
          </div>
        </section>
      )}

      {seccionActiva === "participa" && (
        <section className="participa" id="participa">
          <div className="participa-encabezado">
            <span className="mini-titulo">ESTE ESPACIO TAMBIÉN ES TUYO</span>

            <h2>Participá</h2>

            <p>
              ¿Tenés una idea, una pregunta, una propuesta o algo que te
              preocupa? Este es un espacio para que puedas hacerlo llegar al
              Centro de Estudiantes.
            </p>
          </div>

          <div className="participa-contenido">
            <div className="participa-info">
              <span className="participa-sello">TU VOZ CUENTA ♡</span>

              <h3>Te escuchamos.</h3>

              <p>
                No necesitás poner tu nombre. Elegí tu curso, contanos qué tipo
                de mensaje querés dejar y escribí lo que necesites decir.
              </p>

              <div className="participa-opciones">
                <span>💡 Idea</span>
                <span>❓ Pregunta</span>
                <span>💬 Sugerencia</span>
                <span>📣 Propuesta</span>
                <span>⚠️ Queja / inquietud</span>
              </div>

              <p className="participa-aclaracion">
                El mensaje será recibido por el Centro de Estudiantes.
              </p>
            </div>

            <form className="buzon-formulario" onSubmit={enviarParticipacion}>
              <div className="campo-formulario">
                <label htmlFor="curso">¿De qué curso sos?</label>

                <select
                  id="curso"
                  name="curso"
                  value={participacion.curso}
                  onChange={(e) =>
                    setParticipacion({
                      ...participacion,
                      curso: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Elegí tu curso
                  </option>

                  <option value="1° A">1° A</option>
                  <option value="1° B">1° B</option>
                  <option value="2° A">2° A</option>
                  <option value="2° B">2° B</option>
                  <option value="3° A">3° A</option>
                  <option value="3° B">3° B</option>
                  <option value="4° A">4° A</option>
                  <option value="4° B">4° B</option>
                  <option value="5° A">5° A</option>
                  <option value="5° B">5° B</option>
                  <option value="6° A">6° A</option>
                  <option value="6° B">6° B</option>
                </select>
              </div>

              <div className="campo-formulario">
                <label htmlFor="tipoMensaje">¿Qué querés compartir?</label>

                <select
                  id="tipoMensaje"
                  name="tipoMensaje"
                  value={participacion.motivo}
                  onChange={(e) =>
                    setParticipacion({
                      ...participacion,
                      motivo: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Elegí una opción
                  </option>

                  <option value="Idea">Idea</option>
                  <option value="Pregunta">Pregunta</option>
                  <option value="Sugerencia">Sugerencia</option>
                  <option value="Propuesta">Propuesta</option>
                  <option value="Queja / inquietud">Queja / inquietud</option>
                </select>
              </div>

              <div className="campo-formulario">
                <label htmlFor="mensaje">Escribí tu mensaje</label>

                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows="6"
                  placeholder="Este espacio es para vos..."
                  value={participacion.mensaje}
                  onChange={(e) =>
                    setParticipacion({
                      ...participacion,
                      mensaje: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              {errorParticipacion && (
                <p className="participa-error">{errorParticipacion}</p>
              )}

              {mensajeParticipacion && (
                <p className="participa-exito">{mensajeParticipacion}</p>
              )}

              <button type="submit" className="boton-enviar-mensaje">
                Enviar al Centro
                <span>→</span>
              </button>

              <p className="formulario-nota">
                No te pedimos nombre ni datos personales.
              </p>
            </form>
          </div>

          <div className="participa-frase">
            <span>ESCUCHAR</span>
            <span>·</span>
            <span>PROPONER</span>
            <span>·</span>
            <span>PARTICIPAR</span>
            <span>·</span>
            <strong>CONSTRUIR</strong>
          </div>
        </section>
      )}

      {seccionActiva === "manual" && (
        <section className="manual" id="manual">
          <div className="manual-encabezado">
            <span className="mini-titulo">UNA GUÍA HECHA POR ESTUDIANTES</span>

            <h2>Manual Digital</h2>

            <p>
              Un espacio pensado para reunir información útil, clara y accesible
              para toda la comunidad estudiantil.
            </p>
          </div>

          <div className="manual-destacado">
            <div className="manual-destacado-texto">
              <span className="manual-sello">EN CONSTRUCCIÓN</span>

              <h4>
                MANUAL DIGITAL PARA EL CUIDADO Y MANTENIMIENTO DE INSTRUMENTOS
                MUSICALES
              </h4>

              <p>
                Este proyecto es una guía para estudiantes y profesores
                destinada a los instrumentos musicales y la organización del
                pañol.
              </p>

              <div className="manual-autoria">
                <span>Proyecto impulsado por</span>
                <strong>Ashley Tortorello · Secretarío</strong>
              </div>
            </div>

            <div className="manual-icono-grande">📖</div>
          </div>

          <div className="manual-capitulos">
            <article className="manual-card activo">
              <span className="manual-numero">01</span>
              <h3>El Centro de Estudiantes</h3>
              <p>Qué es, para qué sirve y cómo podés participar.</p>
              <span className="manual-estado">Próximamente</span>
            </article>

            <article className="manual-card">
              <span className="manual-numero">02</span>
              <h3>Derechos del estudiante</h3>
              <p>Información clara para conocer y ejercer tus derechos.</p>
              <span className="manual-estado">Próximamente</span>
            </article>

            <article className="manual-card">
              <span className="manual-numero">03</span>
              <h3>Participación</h3>
              <p>
                Delegados, asambleas, propuestas y espacios para hacer escuchar
                tu voz.
              </p>
              <span className="manual-estado">Próximamente</span>
            </article>

            <article className="manual-card">
              <span className="manual-numero">04</span>
              <h3>Convivencia</h3>
              <p>
                Acuerdos, respeto y herramientas para una mejor vida escolar.
              </p>
              <span className="manual-estado">Próximamente</span>
            </article>

            <article className="manual-card">
              <span className="manual-numero">05</span>
              <h3>¿A quién recurro?</h3>
              <p>
                Orientaciones para saber dónde acudir ante dudas o situaciones
                escolares.
              </p>
              <span className="manual-estado">Próximamente</span>
            </article>

            <article className="manual-card">
              <span className="manual-numero">06</span>
              <h3>Información útil</h3>
              <p>Recursos, contactos y herramientas que iremos sumando.</p>
              <span className="manual-estado">Próximamente</span>
            </article>
          </div>
        </section>
      )}

      {seccionActiva === "galeria" && (
        <section className="galeria" id="galeria">
          <div className="galeria-encabezado">
            <span className="mini-titulo">
              MOMENTOS QUE CONSTRUYEN HISTORIA
            </span>

            <h2>Galería</h2>

            <p>
              Fotos, videos y recuerdos de las actividades del Centro de
              Estudiantes.
            </p>
          </div>

          <div className="galeria-grid">
            {galeriaPublica.length === 0 ? (
              <article className="galeria-card">
                <div className="galeria-imagen galeria-imagen-1">
                  <span>PRÓXIMAMENTE</span>
                </div>

                <div className="galeria-contenido">
                  <h3>La historia recién empieza</h3>

                  <p>
                    Muy pronto vas a encontrar acá las actividades y momentos
                    del Centro de Estudiantes.
                  </p>
                </div>
              </article>
            ) : (
              galeriaPublica.map((momento, index) => {
                const fechaFormateada = momento.fecha.includes("-")
                  ? momento.fecha.split("-").reverse().join("/")
                  : momento.fecha;

                const claseImagen = `galeria-imagen-${(index % 3) + 1}`;

                return (
                  <article key={momento._id} className="galeria-card">
                    <div className={`galeria-imagen ${claseImagen}`}>
                      <span>
                        {momento.categoria?.toUpperCase() || "ACTIVIDAD"}
                      </span>
                    </div>

                    <div className="galeria-contenido">
                      <div className="galeria-meta">
                        <span>{fechaFormateada}</span>

                        <span>·</span>

                        <span>
                          {momento.categoria?.toUpperCase() || "ACTIVIDAD"}
                        </span>
                      </div>

                      <h3>{momento.titulo}</h3>

                      {momento.descripcion && <p>{momento.descripcion}</p>}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="galeria-destacado">
            <div>
              <span className="documento-etiqueta">
                UNA HISTORIA QUE RECIÉN EMPIEZA
              </span>

              <h3>Cada proyecto también deja recuerdos.</h3>

              <p>
                Esta galería va a crecer con cada actividad, encuentro y
                propuesta del Centro.
              </p>
            </div>

            <span className="galeria-icono">📷</span>
          </div>
        </section>
      )}

      {seccionActiva === "gestion" && (
        <section className="gestion" id="gestion">
          <div className="gestion-encabezado">
            <span className="gestion-etiqueta">
              🔒 ESPACIO DE ADMINISTRACIÓN
            </span>
            {gestionAutorizada && (
              <button
                type="button"
                className="gestion-cerrar-superior"
                onClick={cerrarSesionGestion}
              >
                🔓 Cerrar sesión
              </button>
            )}

            <h2>Gestión</h2>

            <p>
              Desde acá el Centro de Estudiantes podrá administrar el contenido
              de la página y llevar adelante su organización interna.
            </p>
          </div>

          {!gestionAutorizada ? (
            <div className="gestion-login">
              <div className="gestion-login-icono">🔐</div>

              <span className="gestion-login-etiqueta">ACCESO PRIVADO</span>

              <h3>Ingresar a Gestión</h3>

              <p>
                Este espacio es exclusivo para integrantes autorizados del
                Centro de Estudiantes.
              </p>

              <form
                className="gestion-login-form"
                onSubmit={iniciarSesionGestion}
              >
                <div className="gestion-login-campo">
                  <label htmlFor="usuarioGestion">Usuario</label>

                  <input
                    id="usuarioGestion"
                    type="text"
                    value={loginGestion.usuario}
                    onChange={(e) =>
                      setLoginGestion({
                        ...loginGestion,
                        usuario: e.target.value,
                      })
                    }
                    autoComplete="username"
                    placeholder="Usuario de Gestión"
                  />
                </div>

                <div className="gestion-login-campo">
                  <label htmlFor="passwordGestion">Contraseña</label>

                  <div className="password-contenedor">
                    <input
                      id="passwordGestion"
                      type={mostrarPassword ? "text" : "password"}
                      value={loginGestion.password}
                      onChange={(e) =>
                        setLoginGestion({
                          ...loginGestion,
                          password: e.target.value,
                        })
                      }
                      autoComplete="current-password"
                      placeholder="Contraseña"
                    />

                    <button
                      type="button"
                      className="password-ojo"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      aria-label={
                        mostrarPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      title={
                        mostrarPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {mostrarPassword ? "👀" : "🙈"}
                    </button>
                  </div>
                </div>

                {errorLogin && (
                  <p className="gestion-login-error">{errorLogin}</p>
                )}

                <button type="submit" className="gestion-login-boton">
                  Entrar a Gestión
                  <span>→</span>
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="gestion-aviso">
                <div className="gestion-aviso-icono">🐢</div>

                <div>
                  <span>ÁREA PRIVADA</span>

                  <h3>Panel del Centro de Estudiantes</h3>

                  <p>
                    Este espacio será de acceso exclusivo para las personas
                    autorizadas del Centro.
                  </p>
                </div>
              </div>

              {moduloGestionActivo === null && (
                <div className="gestion-grid">
                  <article className="gestion-card">
                    <span className="gestion-icono">📣</span>

                    <div>
                      <span className="gestion-numero">01</span>

                      <h3>Comunicados</h3>

                      <p>
                        Crear, editar, destacar o retirar novedades de la
                        página.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setModuloGestionActivo("comunicados");
                        cargarComunicadosGestion();
                      }}
                    >
                      Administrar →
                    </button>
                  </article>

                  <article className="gestion-card">
                    <span className="gestion-icono">💡</span>

                    <div>
                      <span className="gestion-numero">02</span>

                      <h3>Proyectos</h3>

                      <p>
                        Registrar proyectos y actualizar su estado y avances.
                      </p>
                    </div>

                    <button type="button">Administrar →</button>
                  </article>

                  <article className="gestion-card">
                    <div className="gestion-icono-con-aviso">
                      <span className="gestion-icono">💬</span>

                      {cantidadMensajesNuevos > 0 && (
                        <span className="gestion-notificacion">
                          {cantidadMensajesNuevos}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="gestion-numero">03</span>

                      <h3>Buzón estudiantil</h3>

                      <p>Leer mensajes y organizar su seguimiento.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setModuloGestionActivo("buzon")}
                    >
                      Ver mensajes →
                    </button>
                  </article>
                  <article className="gestion-card">
                    <span className="gestion-icono">📸</span>

                    <div>
                      <span className="gestion-numero">04</span>

                      <h3>Galería</h3>

                      <p>
                        Crear y administrar momentos, fotos y videos de la
                        historia del Centro de Estudiantes.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setModuloGestionActivo("galeria");
                        cargarGaleriaGestion();
                      }}
                    >
                      Administrar →
                    </button>
                  </article>

                  <article className="gestion-card">
                    <span className="gestion-icono">📖</span>

                    <div>
                      <span className="gestion-numero">05</span>

                      <h3>Manual Digital</h3>

                      <p>Incorporar y actualizar los capítulos del Manual.</p>
                    </div>

                    <button type="button">Administrar →</button>
                  </article>

                  <article className="gestion-card gestion-card-tesoreria">
                    <span className="gestion-icono">💰</span>

                    <div>
                      <span className="gestion-numero">06</span>

                      <h3>Tesorería</h3>

                      <p>
                        Registrar ingresos y egresos, emitir recibos y consultar
                        el balance del Centro.
                      </p>

                      <div className="gestion-mini-datos">
                        <span>INGRESOS</span>
                        <span>EGRESOS</span>
                        <span>BALANCE</span>
                        <span>RECIBOS</span>
                      </div>
                    </div>

                    <a
                      href="#tesoreria"
                      className="boton-ir-tesoreria"
                      onClick={() => {
                        setSeccionActiva("tesoreria");
                        setMenuMovilAbierto(false);
                      }}
                    >
                      Ir a Tesorería →
                    </a>
                  </article>

                  <article className="gestion-card">
                    <span className="gestion-icono">📊</span>

                    <div>
                      <span className="gestion-numero">07</span>

                      <h3>Transparencia</h3>

                      <p>
                        Publicar rendiciones y administrar los datos de
                        colaboración.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setModuloGestionActivo("transparencia")}
                    >
                      Administrar →
                    </button>
                  </article>
                </div>
              )}

              {moduloGestionActivo === "comunicados" && (
                <section className="gestion-comunicados">
                  <div className="gestion-comunicados-header">
                    <div>
                      <span className="gestion-etiqueta">
                        📣 ADMINISTRAR COMUNICADOS
                      </span>

                      <h3>Comunicados & Novedades</h3>

                      <p>
                        Desde acá podrán crear, editar, destacar, publicar o
                        retirar novedades de la página.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="boton-volver-gestion"
                      onClick={() => setModuloGestionActivo(null)}
                    >
                      ← Volver al panel
                    </button>
                  </div>
                  <form
                    id="formulario-comunicado"
                    className="gestion-comunicados-formulario"
                  >
                    <div className="campo-tesoreria">
                      <label htmlFor="fechaComunicado">Fecha</label>

                      <input
                        id="fechaComunicado"
                        type="date"
                        max={hoy}
                        value={nuevoComunicado.fecha}
                        onChange={(e) =>
                          setNuevoComunicado({
                            ...nuevoComunicado,
                            fecha: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="campo-tesoreria">
                      <label htmlFor="categoriaComunicado">Categoría</label>

                      <input
                        id="categoriaComunicado"
                        type="text"
                        placeholder="Ej: Centro de Estudiantes"
                        value={nuevoComunicado.categoria}
                        onChange={(e) =>
                          setNuevoComunicado({
                            ...nuevoComunicado,
                            categoria: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="campo-tesoreria">
                      <label htmlFor="tituloComunicado">Título</label>

                      <input
                        id="tituloComunicado"
                        type="text"
                        placeholder="Ej: ¡Tenemos nueva página!"
                        value={nuevoComunicado.titulo}
                        onChange={(e) =>
                          setNuevoComunicado({
                            ...nuevoComunicado,
                            titulo: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="campo-tesoreria">
                      <label htmlFor="textoComunicado">Texto</label>

                      <textarea
                        id="textoComunicado"
                        rows="5"
                        placeholder="Escribí el comunicado..."
                        value={nuevoComunicado.texto}
                        onChange={(e) =>
                          setNuevoComunicado({
                            ...nuevoComunicado,
                            texto: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>

                    <div className="gestion-comunicados-opciones">
                      <label>
                        <input
                          type="checkbox"
                          checked={nuevoComunicado.destacado}
                          onChange={(e) =>
                            setNuevoComunicado({
                              ...nuevoComunicado,
                              destacado: e.target.checked,
                            })
                          }
                        />
                        Destacar comunicado
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={nuevoComunicado.publicado}
                          onChange={(e) =>
                            setNuevoComunicado({
                              ...nuevoComunicado,
                              publicado: e.target.checked,
                            })
                          }
                        />
                        Publicar en la página
                      </label>
                    </div>

                    <div className="acciones-formulario-comunicado">
                      <button
                        type="button"
                        className="boton-guardar-movimiento"
                        onClick={guardarComunicado}
                      >
                        {comunicadoEditando
                          ? "Guardar cambios"
                          : "Guardar comunicado"}
                        <span>→</span>
                      </button>

                      {comunicadoEditando && (
                        <button
                          type="button"
                          className="boton-cancelar-edicion"
                          onClick={cancelarEdicionComunicado}
                        >
                          ✖ Cancelar edición
                        </button>
                      )}
                    </div>
                  </form>
                  <div className="comunicados-gestion-listado">
                    <div className="comunicados-gestion-listado-header">
                      <span>📋 COMUNICADOS CARGADOS</span>
                      <strong>{comunicadosGestion.length}</strong>
                    </div>

                    {comunicadosGestion.length === 0 ? (
                      <div className="comunicados-gestion-vacio">
                        <p>Todavía no hay comunicados cargados.</p>
                      </div>
                    ) : (
                      <div className="comunicados-gestion-tarjetas">
                        {comunicadosGestion.map((comunicado) => (
                          <article
                            className="comunicado-gestion-card"
                            key={comunicado._id}
                          >
                            <div className="comunicado-gestion-meta">
                              <span>
                                {new Date(
                                  `${comunicado.fecha}T00:00:00`,
                                ).toLocaleDateString("es-AR")}
                              </span>

                              <span>·</span>

                              <span>{comunicado.categoria}</span>
                            </div>

                            <h4>{comunicado.titulo}</h4>

                            <p>{comunicado.texto}</p>

                            <div className="comunicado-gestion-estados">
                              <span>
                                {comunicado.publicado
                                  ? "🟢 PUBLICADO"
                                  : "⚪ BORRADOR"}
                              </span>

                              {comunicado.destacado && (
                                <span>⭐ DESTACADO</span>
                              )}
                            </div>
                            <div className="comunicado-gestion-acciones">
                              <button
                                type="button"
                                onClick={() => editarComunicado(comunicado)}
                              >
                                ✏️ Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  cambiarPublicacionComunicado(comunicado)
                                }
                              >
                                {comunicado.publicado
                                  ? "📤 Retirar de la página"
                                  : "🌐 Publicar en la página"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  cambiarDestacadoComunicado(comunicado)
                                }
                              >
                                {comunicado.destacado
                                  ? "☆ Quitar destacado"
                                  : "⭐ Destacar"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  eliminarComunicado(comunicado._id)
                                }
                              >
                                🗑 Eliminar
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {moduloGestionActivo === "galeria" && (
                <section className="gestion-modulo">
                  <button
                    type="button"
                    className="boton-volver-gestion"
                    onClick={() => setModuloGestionActivo(null)}
                  >
                    ← Volver al panel
                  </button>

                  <div className="gestion-modulo-encabezado">
                    <span className="mini-titulo">GALERÍA</span>

                    <h2>Momentos del Centro de Estudiantes</h2>

                    <p>
                      Desde acá van a poder crear y administrar fotos, videos y
                      recuerdos de las actividades del Centro.
                    </p>
                  </div>

                  <div className="gestion-formulario" id="formulario-galeria">
                    <h3>
                      {momentoGaleriaEditando
                        ? "Editar momento"
                        : "Nuevo momento"}
                    </h3>

                    <div className="gestion-transparencia-fila">
                      <label>
                        Fecha
                        <input
                          type="date"
                          Max={hoy}
                          value={formGaleria.fecha}
                          onChange={(e) =>
                            setFormGaleria({
                              ...formGaleria,
                              fecha: e.target.value,
                            })
                          }
                        />
                      </label>

                      <label>
                        Categoría
                        <input
                          type="text"
                          placeholder="Ej.: Actividad, Música, Proyecto"
                          value={formGaleria.categoria}
                          onChange={(e) =>
                            setFormGaleria({
                              ...formGaleria,
                              categoria: e.target.value,
                            })
                          }
                        />
                      </label>
                    </div>

                    <label>
                      Título
                      <input
                        type="text"
                        placeholder="Ej.: Jornada cultural"
                        value={formGaleria.titulo}
                        onChange={(e) =>
                          setFormGaleria({
                            ...formGaleria,
                            titulo: e.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Descripción
                      <textarea
                        rows="3"
                        placeholder="Contá brevemente qué pasó en esta actividad..."
                        value={formGaleria.descripcion}
                        onChange={(e) =>
                          setFormGaleria({
                            ...formGaleria,
                            descripcion: e.target.value,
                          })
                        }
                      />
                    </label>

                    <label className="gestion-checkbox">
                      <input
                        type="checkbox"
                        checked={formGaleria.publicado}
                        onChange={(e) =>
                          setFormGaleria({
                            ...formGaleria,
                            publicado: e.target.checked,
                          })
                        }
                      />
                      Publicar en la galería
                    </label>
                    <button type="button" onClick={guardarMomentoGaleria}>
                      {momentoGaleriaEditando
                        ? "Guardar cambios"
                        : "Guardar momento"}
                    </button>
                  </div>
                  <div className="gestion-galeria-historial">
                    <h3>Momentos cargados</h3>

                    {galeriaGestion.length === 0 ? (
                      <p>No hay momentos cargados todavía.</p>
                    ) : (
                      <div className="gestion-galeria-lista">
                        {galeriaGestion.map((momento) => {
                          const fechaFormateada = momento.fecha.includes("-")
                            ? momento.fecha.split("-").reverse().join("/")
                            : momento.fecha;

                          return (
                            <article
                              key={momento._id}
                              className="gestion-galeria-item"
                            >
                              <div className="gestion-galeria-item-contenido">
                                <div className="gestion-galeria-item-superior">
                                  <span className="gestion-galeria-fecha">
                                    {fechaFormateada}
                                  </span>

                                  <span
                                    className={`gestion-galeria-estado ${
                                      momento.publicado
                                        ? "publicado"
                                        : "borrador"
                                    }`}
                                  >
                                    {momento.publicado
                                      ? "Publicado"
                                      : "Borrador"}
                                  </span>
                                </div>

                                <h4>{momento.titulo}</h4>

                                {momento.descripcion && (
                                  <p>{momento.descripcion}</p>
                                )}

                                <span className="gestion-galeria-categoria">
                                  {momento.categoria}
                                </span>
                              </div>

                              <div className="gestion-galeria-acciones">
                                <button
                                  type="button"
                                  className="boton-editar"
                                  onClick={() => editarMomentoGaleria(momento)}
                                >
                                  ✏️ Editar
                                </button>

                                <button
                                  type="button"
                                  className="boton-publicar"
                                  onClick={() =>
                                    cambiarPublicacionMomentoGaleria(momento)
                                  }
                                >
                                  {momento.publicado ? "Retirar" : "Publicar"}
                                </button>

                                <button
                                  type="button"
                                  className="boton-eliminar"
                                  onClick={() =>
                                    eliminarMomentoGaleria(momento._id)
                                  }
                                >
                                  🗑️ Eliminar
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {moduloGestionActivo === "transparencia" && (
                <div className="gestion-comunicados">
                  <button
                    type="button"
                    className="boton-volver-gestion"
                    onClick={() => setModuloGestionActivo(null)}
                  >
                    ← Volver al panel
                  </button>

                  <div>
                    <span>📊 ÁREA DE TRANSPARENCIA</span>

                    <h2>Transparencia</h2>

                    <p>
                      Desde acá podrán administrar las rendiciones públicas y
                      los datos de colaboración del Centro de Estudiantes.
                    </p>
                    <section className="gestion-transparencia-rendiciones">
                      <div className="gestion-transparencia-titulo">
                        <span>📋 RENDICIONES</span>

                        <h3>
                          {rendicionEditando
                            ? "Editar rendición"
                            : "Nueva rendición"}
                        </h3>

                        <p>
                          Registrá una actividad para comunicar de manera clara
                          cuánto se recaudó y cuál fue el destino de los fondos.
                        </p>
                      </div>

                      <div className="gestion-transparencia-formulario">
                        <div className="gestion-transparencia-fila gestion-transparencia-fila-corta">
                          <div className="campo-tesoreria">
                            <label htmlFor="fechaRendicion">Fecha</label>

                            <input
                              id="fechaRendicion"
                              type="date"
                              max={hoy}
                              value={nuevaRendicion.fecha}
                              onChange={(e) =>
                                setNuevaRendicion({
                                  ...nuevaRendicion,
                                  fecha: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="campo-tesoreria">
                            <label htmlFor="montoRendicion">
                              Monto recaudado
                            </label>

                            <input
                              id="montoRendicion"
                              type="number"
                              min="0"
                              placeholder="0"
                              value={nuevaRendicion.monto}
                              onChange={(e) =>
                                setNuevaRendicion({
                                  ...nuevaRendicion,
                                  monto: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="gestion-transparencia-fila">
                          <div className="campo-tesoreria">
                            <label htmlFor="tituloRendicion">
                              Actividad / título
                            </label>

                            <input
                              id="tituloRendicion"
                              type="text"
                              placeholder="Ej.: Festival del Centro de Estudiantes"
                              value={nuevaRendicion.titulo}
                              onChange={(e) =>
                                setNuevaRendicion({
                                  ...nuevaRendicion,
                                  titulo: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="campo-tesoreria">
                            <label htmlFor="destinoRendicion">
                              Destino de los fondos
                            </label>

                            <input
                              id="destinoRendicion"
                              type="text"
                              placeholder="Ej.: Compra de materiales para..."
                              value={nuevaRendicion.destino}
                              onChange={(e) =>
                                setNuevaRendicion({
                                  ...nuevaRendicion,
                                  destino: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="campo-tesoreria">
                          <label htmlFor="descripcionRendicion">
                            Descripción breve
                          </label>

                          <textarea
                            id="descripcionRendicion"
                            rows="3"
                            placeholder="Contá brevemente qué actividad se realizó..."
                            value={nuevaRendicion.descripcion}
                            onChange={(e) =>
                              setNuevaRendicion({
                                ...nuevaRendicion,
                                descripcion: e.target.value,
                              })
                            }
                          />
                        </div>

                        <label className="gestion-transparencia-publicar">
                          <input
                            type="checkbox"
                            checked={nuevaRendicion.publicado}
                            onChange={(e) =>
                              setNuevaRendicion({
                                ...nuevaRendicion,
                                publicado: e.target.checked,
                              })
                            }
                          />

                          <span>🌐 Publicar esta rendición en la página</span>
                        </label>

                        <button
                          type="button"
                          className="boton-guardar-movimiento"
                          onClick={guardarRendicion}
                        >
                          {rendicionEditando
                            ? "Guardar cambios"
                            : "Guardar rendición"}
                        </button>
                      </div>
                    </section>

                    <section className="gestion-transparencia-colaboracion">
                      <div className="gestion-transparencia-titulo">
                        <span>🤝 COLABORÁ</span>

                        <h3>Datos para donaciones</h3>

                        <p>
                          Administrá el alias y el mail que se mostrarán
                          públicamente para recibir colaboraciones y
                          comprobantes.
                        </p>
                      </div>

                      <div className="gestion-transparencia-formulario">
                        <div className="gestion-transparencia-fila">
                          <div className="campo-tesoreria">
                            <label htmlFor="aliasColaboracion">
                              Alias para transferencia
                            </label>

                            <input
                              id="aliasColaboracion"
                              type="text"
                              placeholder="Ej.: Listaverde.27"
                              value={colaboracionGestion.alias}
                              onChange={(e) =>
                                setColaboracionGestion({
                                  ...colaboracionGestion,
                                  alias: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="campo-tesoreria">
                            <label htmlFor="mailColaboracion">
                              Mail para comprobantes
                            </label>

                            <input
                              id="mailColaboracion"
                              type="email"
                              placeholder="Ej.: Listaverde.eesn50@gmail.com"
                              value={colaboracionGestion.emailComprobantes}
                              onChange={(e) =>
                                setColaboracionGestion({
                                  ...colaboracionGestion,
                                  emailComprobantes: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <label className="gestion-transparencia-publicar">
                          <input
                            type="checkbox"
                            checked={colaboracionGestion.mostrarColaboracion}
                            onChange={(e) =>
                              setColaboracionGestion({
                                ...colaboracionGestion,
                                mostrarColaboracion: e.target.checked,
                              })
                            }
                          />

                          <span>
                            👁 Mostrar la sección Colaborá en la página
                          </span>
                        </label>

                        <button
                          type="button"
                          className="boton-guardar-movimiento"
                          disabled={guardandoColaboracion}
                          onClick={guardarColaboracion}
                        >
                          {guardandoColaboracion
                            ? "Guardando..."
                            : "Guardar datos de colaboración"}
                        </button>
                      </div>
                    </section>
                    <section className="gestion-transparencia-listado">
                      <button
                        type="button"
                        className="gestion-transparencia-historial-toggle"
                        onClick={() =>
                          setHistorialRendicionesAbierto(
                            !historialRendicionesAbierto,
                          )
                        }
                      >
                        <div>
                          <span>📚 RENDICIONES CARGADAS</span>

                          <strong>
                            {rendicionesGestion.length}{" "}
                            {rendicionesGestion.length === 1
                              ? "registro"
                              : "registros"}
                          </strong>
                        </div>

                        <span>{historialRendicionesAbierto ? "▲" : "▼"}</span>
                      </button>

                      {historialRendicionesAbierto && (
                        <>
                          {rendicionesGestion.length === 0 ? (
                            <div className="gestion-transparencia-vacio">
                              Todavía no hay rendiciones cargadas.
                            </div>
                          ) : (
                            <div className="gestion-transparencia-tarjetas">
                              {rendicionesGestion.map((rendicion) => (
                                <article
                                  key={rendicion._id}
                                  className="gestion-transparencia-card"
                                >
                                  <div className="gestion-transparencia-card-meta">
                                    <span>
                                      📅 {formatearFecha(rendicion.fecha)}
                                    </span>

                                    <span>
                                      {rendicion.publicado
                                        ? "🟢 PUBLICADO"
                                        : "🟡 BORRADOR"}
                                    </span>
                                  </div>

                                  <h4>{rendicion.titulo}</h4>

                                  <div className="gestion-transparencia-card-datos">
                                    <p>
                                      <strong>Monto:</strong> $
                                      {Number(rendicion.monto).toLocaleString(
                                        "es-AR",
                                      )}
                                    </p>

                                    <p>
                                      <strong>Destino:</strong>{" "}
                                      {rendicion.destino}
                                    </p>
                                  </div>

                                  {rendicion.descripcion && (
                                    <p className="gestion-transparencia-card-descripcion">
                                      {rendicion.descripcion}
                                    </p>
                                  )}

                                  <div className="gestion-transparencia-card-acciones">
                                    <button
                                      type="button"
                                      onClick={() => editarRendicion(rendicion)}
                                    >
                                      ✏️ Editar
                                    </button>

                                    <button
                                      type="button"
                                      disabled={
                                        rendicionCambiandoPublicacion ===
                                        rendicion._id
                                      }
                                      onClick={() =>
                                        cambiarPublicacionRendicion(rendicion)
                                      }
                                    >
                                      {rendicionCambiandoPublicacion ===
                                      rendicion._id
                                        ? rendicion.publicado
                                          ? "⏳ Retirando..."
                                          : "⏳ Publicando..."
                                        : rendicion.publicado
                                          ? "📤 Retirar de la página"
                                          : "🌐 Publicar en la página"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        eliminarRendicion(rendicion._id)
                                      }
                                    >
                                      🗑 Eliminar
                                    </button>
                                  </div>
                                </article>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </section>
                  </div>
                </div>
              )}

              {moduloGestionActivo === "buzon" && (
                <section className="buzon-gestion" id="buzon-gestion">
                  <div className="buzon-gestion-header">
                    <div>
                      <span className="buzon-gestion-etiqueta">
                        💬 PARTICIPÁ
                      </span>

                      <h3>Buzón estudiantil</h3>

                      <p>
                        Mensajes enviados por estudiantes para que el Centro
                        pueda leerlos y organizar su seguimiento.
                      </p>
                    </div>

                    <span className="buzon-total">
                      {participacionesGestion.length} mensajes
                    </span>
                    <button
                      type="button"
                      className="boton-volver-gestion"
                      onClick={() => setModuloGestionActivo(null)}
                    >
                      ← Volver al panel
                    </button>
                  </div>

                  {participacionesGestion.length === 0 ? (
                    <div className="buzon-vacio">
                      <span>🐢</span>
                      <h4>No hay mensajes todavía</h4>
                      <p>
                        Cuando un estudiante participe, su mensaje aparecerá
                        acá.
                      </p>
                    </div>
                  ) : (
                    <div className="buzon-tarjetas">
                      {participacionesGestion.map((participacion) => (
                        <article
                          className="buzon-mensaje-card"
                          key={participacion._id}
                        >
                          <div className="buzon-mensaje-superior">
                            <div className="buzon-tags">
                              <span className="buzon-curso">
                                🎓 {participacion.curso}
                              </span>

                              <span className="buzon-motivo">
                                {participacion.motivo}
                              </span>
                            </div>

                            <span
                              className={`buzon-estado estado-${participacion.estado
                                .toLowerCase()
                                .replaceAll(" ", "-")
                                .replace("í", "i")}`}
                            >
                              {participacion.estado === "Nuevo"
                                ? "No leído"
                                : participacion.estado}
                            </span>
                          </div>

                          <div className="buzon-texto">
                            <p>{participacion.mensaje}</p>
                          </div>

                          <div className="buzon-estado-acciones">
                            <button
                              type="button"
                              onClick={() =>
                                cambiarEstadoParticipacion(
                                  participacion._id,
                                  "Nuevo",
                                )
                              }
                            >
                              ↩ No leído
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                cambiarEstadoParticipacion(
                                  participacion._id,
                                  "Leído",
                                )
                              }
                            >
                              👁 Leído
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                cambiarEstadoParticipacion(
                                  participacion._id,
                                  "En tratamiento",
                                )
                              }
                            >
                              ⚙ En tratamiento
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                cambiarEstadoParticipacion(
                                  participacion._id,
                                  "Resuelto",
                                )
                              }
                            >
                              ✅ Resuelto
                            </button>
                          </div>
                          <div className="buzon-eliminar-contenedor">
                            <button
                              type="button"
                              className="buzon-eliminar"
                              onClick={() =>
                                eliminarParticipacion(participacion._id)
                              }
                            >
                              🗑️ Eliminar mensaje
                            </button>
                          </div>

                          <div className="buzon-mensaje-pie">
                            <div className="buzon-tortuguita">
                              🐢
                              <span>¡Gracias por participar!</span>
                            </div>

                            <small>
                              {new Date(participacion.createdAt).toLocaleString(
                                "es-AR",
                              )}
                            </small>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <div className="gestion-sesion">
                <span>🔓 Sesión de Gestión iniciada</span>
              </div>
            </>
          )}
        </section>
      )}

      {seccionActiva === "tesoreria" && gestionAutorizada && (
        <section className="tesoreria" id="tesoreria">
          <div className="tesoreria-encabezado">
            <span className="tesoreria-etiqueta">
              💰 ADMINISTRACIÓN DE FONDOS
            </span>

            <h2>Tesorería</h2>

            <p>
              Registro de ingresos y egresos del Centro de Estudiantes, con
              control de recibos y balance automático.
            </p>

            <button
              type="button"
              className="boton-volver-gestion"
              onClick={() => {
                setSeccionActiva("gestion");
                setModuloGestionActivo(null);
                window.location.hash = "gestion";
              }}
            >
              ← Volver al panel
            </button>
          </div>

          <div className="tesoreria-resumen">
            <div className="resumen-con-desglose">
              <article className="tesoreria-resumen-card">
                <span>INGRESOS</span>
                <strong>$ {totalIngresos.toLocaleString("es-AR")}</strong>
                <small>Total registrado</small>
              </article>

              <div className="mini-resumen-grid">
                <div className="mini-resumen">
                  <span>EFECTIVO</span>
                  <strong>$ {ingresosEfectivo.toLocaleString("es-AR")}</strong>
                </div>

                <div className="mini-resumen">
                  <span>TRANSFERENCIA</span>
                  <strong>
                    $ {ingresosTransferencia.toLocaleString("es-AR")}
                  </strong>
                </div>
              </div>
            </div>

            <div className="resumen-con-desglose">
              <article className="tesoreria-resumen-card">
                <span>EGRESOS</span>
                <strong>$ {totalEgresos.toLocaleString("es-AR")}</strong>
                <small>Total registrado</small>
              </article>

              <div className="mini-resumen-grid">
                <div className="mini-resumen">
                  <span>EFECTIVO</span>
                  <strong>$ {egresosEfectivo.toLocaleString("es-AR")}</strong>
                </div>

                <div className="mini-resumen">
                  <span>TRANSFERENCIA</span>
                  <strong>
                    $ {egresosTransferencia.toLocaleString("es-AR")}
                  </strong>
                </div>
              </div>
            </div>

            <article className="tesoreria-resumen-card balance">
              <span>BALANCE</span>
              <strong>$ {balance.toLocaleString("es-AR")}</strong>
              <small>Fondos disponibles</small>
            </article>

            <article className="tesoreria-resumen-card">
              <span>ÚLTIMO RECIBO</span>
              <strong>{ultimoRecibo}</strong>
              <small>Numeración anual</small>
            </article>
          </div>

          <div className="tesoreria-contenido">
            <form className="tesoreria-formulario">
              <div className="tesoreria-form-header">
                <span>
                  {movimientoEditandoId !== null
                    ? "EDITANDO MOVIMIENTO"
                    : "NUEVO MOVIMIENTO"}
                </span>
                <h3>
                  {movimientoEditandoId !== null
                    ? "Corregir operación"
                    : "Registrar operación"}
                </h3>
              </div>

              <div className="tesoreria-tipo">
                <label className="tipo-opcion">
                  <input
                    type="radio"
                    name="tipo"
                    value="Ingreso"
                    checked={nuevoMovimiento.tipo === "Ingreso"}
                    onChange={() => actualizarMovimiento("tipo", "Ingreso")}
                    disabled={movimientoEditandoId !== null}
                  />
                  <span>＋ Ingreso</span>
                </label>

                <label className="tipo-opcion">
                  <input
                    type="radio"
                    name="tipo"
                    value="Egreso"
                    checked={nuevoMovimiento.tipo === "Egreso"}
                    onChange={() => actualizarMovimiento("tipo", "Egreso")}
                    disabled={movimientoEditandoId !== null}
                  />
                  <span>− Egreso</span>
                </label>
              </div>

              <div className="tesoreria-campos-grid">
                <div className="campo-tesoreria">
                  <label htmlFor="fechaMovimiento">Fecha</label>

                  <input
                    id="fechaMovimiento"
                    type="date"
                    max={hoy}
                    value={nuevoMovimiento.fecha}
                    onChange={(e) =>
                      actualizarMovimiento("fecha", e.target.value)
                    }
                  />
                </div>

                <div className="campo-tesoreria">
                  <label htmlFor="montoMovimiento">Monto</label>

                  <input
                    id="montoMovimiento"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="$ 0"
                    value={nuevoMovimiento.monto}
                    onChange={(e) =>
                      actualizarMovimiento("monto", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="campo-tesoreria">
                <label htmlFor="conceptoMovimiento">Concepto</label>

                <input
                  id="conceptoMovimiento"
                  type="text"
                  placeholder="Ej: materiales para jornada..."
                  value={nuevoMovimiento.concepto}
                  onChange={(e) =>
                    actualizarMovimiento("concepto", e.target.value)
                  }
                />
              </div>

              <div className="tesoreria-campos-grid">
                <div className="campo-tesoreria">
                  <label htmlFor="medioPago">Medio de pago</label>

                  <select
                    id="medioPago"
                    value={nuevoMovimiento.medioPago}
                    onChange={(e) =>
                      actualizarMovimiento("medioPago", e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Seleccionar
                    </option>

                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>

                <div className="campo-tesoreria">
                  <label>
                    {movimientoEditandoId !== null
                      ? "Recibo asignado"
                      : "Próximo recibo"}
                  </label>

                  <div className="recibo-previo">
                    {nuevoMovimiento.tipo === "Egreso"
                      ? movimientoEditandoId !== null
                        ? movimientos.find(
                            (movimiento) =>
                              movimiento.id === movimientoEditandoId,
                          )?.recibo || "—"
                        : proximoRecibo
                      : "Solo egresos"}
                  </div>
                </div>
              </div>

              <div className="campo-tesoreria">
                <label htmlFor="observacionesMovimiento">
                  Observaciones
                  <span> · opcional</span>
                </label>

                <textarea
                  id="observacionesMovimiento"
                  rows="4"
                  placeholder="Información adicional..."
                  value={nuevoMovimiento.observaciones}
                  onChange={(e) =>
                    actualizarMovimiento("observaciones", e.target.value)
                  }
                ></textarea>
              </div>

              <button
                type="button"
                className="boton-guardar-movimiento"
                onClick={guardarMovimiento}
              >
                {movimientoEditandoId !== null
                  ? "Guardar cambios"
                  : "Guardar movimiento"}
                <span>→</span>
              </button>

              {movimientoEditandoId !== null && (
                <button
                  type="button"
                  className="boton-cancelar-edicion"
                  onClick={cancelarEdicion}
                >
                  Cancelar edición
                </button>
              )}
            </form>

            <div className="tesoreria-historial">
              <div className="historial-header">
                <div>
                  <span>MOVIMIENTOS</span>
                  <h3>Historial</h3>
                </div>

                <div className="historial-acciones">
                  <button type="button" onClick={imprimirTesoreria}>
                    🖨️ Imprimir
                  </button>

                  <button type="button" onClick={descargarTesoreria}>
                    ↓ Descargar
                  </button>
                </div>
              </div>

              {movimientos.length === 0 ? (
                <div className="historial-vacio">
                  <span className="historial-icono">🧾</span>

                  <h4>Todavía no hay movimientos</h4>

                  <p>
                    Cuando se registren ingresos o egresos, van a aparecer acá.
                  </p>
                </div>
              ) : (
                <div className="historial-acordeones">
                  <div className="historial-grupo">
                    <button
                      type="button"
                      className="historial-grupo-boton"
                      onClick={() => setMostrarIngresos(!mostrarIngresos)}
                    >
                      <div>
                        <span className="historial-grupo-icono">
                          {mostrarIngresos ? "▼" : "▶"}
                        </span>

                        <strong>Ingresos</strong>

                        <span className="historial-grupo-cantidad">
                          {movimientosIngresos.length}
                        </span>
                      </div>

                      <span>$ {totalIngresos.toLocaleString("es-AR")}</span>
                    </button>

                    {mostrarIngresos && (
                      <div className="lista-movimientos">
                        {movimientosIngresos.map((movimiento) => (
                          <article
                            className={`movimiento-item ingreso ${
                              movimiento.anulado ? "anulado" : ""
                            }`}
                            key={movimiento._id || movimiento.id}
                          >
                            <div className="movimiento-principal">
                              <div>
                                <span className="movimiento-tipo">
                                  {movimiento.tipo}
                                </span>

                                <h4>{movimiento.concepto}</h4>

                                <p>
                                  {new Date(
                                    `${movimiento.fecha}T00:00:00`,
                                  ).toLocaleDateString("es-AR")}
                                  {" · "}
                                  {movimiento.medioPago}
                                </p>
                              </div>

                              <strong>
                                +$ {movimiento.monto.toLocaleString("es-AR")}
                              </strong>
                            </div>

                            <div className="movimiento-detalle">
                              {movimiento.observaciones && (
                                <span>{movimiento.observaciones}</span>
                              )}
                            </div>

                            <div className="movimiento-acciones">
                              <button
                                type="button"
                                className="accion-editar"
                                onClick={() => editarMovimiento(movimiento)}
                              >
                                ✏️ Editar
                              </button>

                              <button
                                type="button"
                                className="accion-eliminar"
                                onClick={() =>
                                  eliminarMovimiento(
                                    movimiento._id || movimiento.id,
                                  )
                                }
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="historial-grupo">
                    <button
                      type="button"
                      className="historial-grupo-boton"
                      onClick={() => setMostrarEgresos(!mostrarEgresos)}
                    >
                      <div>
                        <span className="historial-grupo-icono">
                          {mostrarEgresos ? "▼" : "▶"}
                        </span>

                        <strong>Egresos</strong>

                        <span className="historial-grupo-cantidad">
                          {movimientosEgresos.length}
                        </span>
                      </div>

                      <span>$ {totalEgresos.toLocaleString("es-AR")}</span>
                    </button>

                    {mostrarEgresos && (
                      <div className="lista-movimientos">
                        {movimientosEgresos.map((movimiento) => (
                          <article
                            className={`movimiento-item egreso ${
                              movimiento.anulado ? "anulado" : ""
                            }`}
                            key={movimiento._id || movimiento.id}
                          >
                            <div className="movimiento-principal">
                              <div>
                                <span className="movimiento-tipo">
                                  {movimiento.tipo}
                                </span>

                                {movimiento.anulado && (
                                  <span className="movimiento-anulado-etiqueta">
                                    ANULADO
                                  </span>
                                )}

                                <h4>{movimiento.concepto}</h4>

                                <p>
                                  {new Date(
                                    `${movimiento.fecha}T00:00:00`,
                                  ).toLocaleDateString("es-AR")}
                                  {" · "}
                                  {movimiento.medioPago}
                                </p>
                              </div>

                              <strong>
                                -$ {movimiento.monto.toLocaleString("es-AR")}
                              </strong>
                            </div>

                            <div className="movimiento-detalle">
                              {movimiento.recibo && (
                                <span>
                                  Recibo <strong>{movimiento.recibo}</strong>
                                </span>
                              )}

                              {movimiento.observaciones && (
                                <span>{movimiento.observaciones}</span>
                              )}
                            </div>

                            <div className="movimiento-acciones">
                              {!movimiento.anulado && (
                                <button
                                  type="button"
                                  className="accion-editar"
                                  onClick={() => editarMovimiento(movimiento)}
                                >
                                  ✏️ Editar
                                </button>
                              )}

                              {!movimiento.anulado && (
                                <button
                                  type="button"
                                  className="accion-eliminar"
                                  onClick={() =>
                                    eliminarMovimiento(
                                      movimiento._id || movimiento.id,
                                    )
                                  }
                                >
                                  🗑️ Eliminar
                                </button>
                              )}

                              {!movimiento.anulado && (
                                <button
                                  type="button"
                                  className="accion-anular"
                                  onClick={() =>
                                    anularMovimiento(
                                      movimiento._id || movimiento.id,
                                    )
                                  }
                                >
                                  ⛔ Anular
                                </button>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="tesoreria-info-recibos">
            <div className="tesoreria-info-icono">#</div>

            <div>
              <span>CONTROL DE RECIBOS</span>

              <h3>Numeración consecutiva automática</h3>

              <p>
                Los comprobantes seguirán la misma numeración del talonario
                físico:
                <strong> 1/26 · 2/26 · 3/26 · 4/26...</strong>
              </p>
            </div>
          </div>
        </section>
      )}

      {mostrarSubir ? (
        <button
          className="volver-arriba"
          onClick={volverArriba}
          aria-label="Volver al inicio"
          title="Volver arriba"
        >
          ↑
        </button>
      ) : null}
    </main>
  );
}

export default App;
