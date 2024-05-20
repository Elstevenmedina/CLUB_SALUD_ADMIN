const router = require("express").Router();
const fs = require("fs");
const passport = require("passport");
const nodemailer = require("nodemailer");
const personalDB = require("../models/data/personal");
const medicoDB = require("../models/data/medico");
const usersDB = require("../models/data/users");
const pacienteDB = require("../models/data/paciente");
const examenDB = require("../models/data/examenes");
const chatDB = require("../models/data/chat");
const notificacionDB = require("../models/herramientas/notificaciones");
const { isAuthenticated } = require("../helpers/auth");
const {
  isAuthenticatedMaster,
  isAuthenticatedSubMaster,
  isAuthenticatedRed,
  isAuthenticatedSoporte,
  isAuthenticatedServicios,
  isAuthenticatedData,
  isAuthenticatedHerramientas,
  isAuthenticatedMedico,
  isAuthenticatedPaciente,
} = require("../helpers/auth");
const { sendEmail } = require("../email/email");
const examenesSDB = require("../models/servicios/examenes");
const calendarioDB = require("../models/herramientas/calendario");
const historialPuntosDB = require("../models/servicios/historialPuntos");
const historialExamenesDB = require("../models/servicios/historialExamenes");
const historialActividadDB = require("../models/servicios/historialActividad");
const historialIngresoDB = require("../models/servicios/historialIngresos");
const examenesIndicadoresDB = require("../models/indicadores/examenesIndicadores");
const puntosComisionesIndicadoresDB = require("../models/indicadores/puntosComisionesIndicadores");
const puntosGeneralesIndicadoresDB = require("../models/indicadores/puntosGeneralesIndicadores");
const puntosSemanelesIndicadoresDB = require("../models/indicadores/puntosSemanalesIndicadores");
const medicosIndicadoresDB = require("../models/indicadores/medicosIndicadores");
const pacientesIndicadoresDB = require("../models/indicadores/pacientesIndicadores");
const visitasIndicadoresDB = require("../models/indicadores/visitasIndicadores");
const examenesIndicadoresMedicoDB = require("../models/indicadores/medico/examenesIndicadoresMedico");
const pacientesIndicadoresMedicoDB = require("../models/indicadores/medico/pacientesIndicadoresMedico");
const puntosIndicadoresMedicoDB = require("../models/indicadores/medico/puntosIndicadoresMedico");
const puntosSemanalesIndicadoresMedicoDB = require("../models/indicadores/medico/puntosSemanalesIndicadoresMedico");
const categoriasDB = require("../models/soporte/categorias");
const subcategoriasDB = require("../models/soporte/subcategorias");
const ticketDB = require("../models/soporte/ticket");
const constanciasCanjeDB = require("../models/servicios/constancias-canje");
const mensajesWhatsappDB = require("../models/herramientas/mensajes-whatsapp");
const tiposCanjesDB = require("../models/data/tipo-canjes");
const perfilesDB = require("../models/data/perfiles");
const solicitudCanjeDB = require("../models/servicios/solicitud-canje");
const sucursalDB = require("../models/data/sucursal");
const medallasDB = require("../models/data/medallas");
const xl = require("excel4node");
const serviciosDB = require("../models/data/servicios");
const afiliadosDB = require("../models/data/afiliado");
const tipoDocumentoDB = require("../models/data/tipo-documento");
const afiliadosFichaDB = require("../models/data/afiliado_ficha");
const otrosServiciosDB = require("../models/servicios/otros-servicios");
const { generateToken, verifyToken } = require("../utils/token");

const cloudinary = require("cloudinary");
const tipoExamenDB = require("../models/data/tipoExamen");
const especialidadesDB = require("../models/data/especialidades");
const XLSX = require("xlsx");
const errorDB = require("../models/soporte/errores");
const path = require("path");
const moment = require("moment-timezone");
moment.tz.setDefault("America/Caracas");
moment.locale("es");

const multer = require("multer");
const subcategorias = require("../models/soporte/subcategorias");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "controles"),
  filename: function (req, file, cb) {
    cb("", "control.xlsx");
  },
});

const upload2 = multer({
  storage: storage,
});

const upload = multer({
  storage: multer.diskStorage({
    destination: "src/public/images/profile_pictures",
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      let data = {
        status: "error",
        msg: "Ocurrio en error al cargar la imagen, solo se permiten imagenes con formato png, jpg o jpeg",
      };
    }
  },
});

const uploadFile = multer({
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
      let data = {
        status: "error",
        msg: "Ocurrio en error al cargar el documento. Solo se permiten documentos formato .pdf",
      };
    }
  },
  storage: multer.diskStorage({
    destination: "src/public/resultados",
    filename: (req, file, cb) => {
      if (
        fs.existsSync(
          path.join(
            "src/public/resultados",
            file.originalname.substring(0, file.originalname.length - 4) +
              path.extname(file.originalname)
          )
        )
      ) {
        cb(
          null,
          file.originalname.substring(0, file.originalname.length - 4) +
            "-" +
            Date.now() +
            path.extname(file.originalname)
        );
      } else {
        cb(
          null,
          file.originalname.substring(0, file.originalname.length - 4) +
            path.extname(file.originalname)
        );
      }
    },
  }),
});

cloudinary.config({
  cloud_name: "testrps",
  api_key: "329682633831313",
  api_secret: process.env.SECRET_CLOUDINARY,
});

const transporter = nodemailer.createTransport({
  host: "business102.web-hosting.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SUPPORT_EMAIL,
    pass: process.env.PASSWORD_SUPPORT_EMAIL,
  },
  tls: {
    rejectUnauthorized: false,
  },
  from: "no-reply@clubsaludve.com",
});

router.get("/", (req, res) => {
  const user = req.user;
  if (user) {
    res.redirect("/inicio");
  } else {
    res.render("login/inicio-sesion", {
      layout: "login",
    });
  }
});

router.post(
  "/iniciar-sesion",
  passport.authenticate("local", {
    successRedirect: "/inicio",
    failureRedirect: "/",
    failureFlash: true,
  })
);

router.get("/cerrar-sesion", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/inicio", isAuthenticated, async (req, res, next) => {
  try {
    if (req.user.TipoUsuario == "Medico") {
      let medico = await medicoDB.findOne({ Cedula: req.user.Cedula });

      let medallaBronce = await medallasDB.findOne({ Nombre: "Bronce" });
      let medallaPlata = await medallasDB.findOne({ Nombre: "Plata" });
      let medallaOro = await medallasDB.findOne({ Nombre: "Oro" });
      let medallaPlatino = await medallasDB.findOne({ Nombre: "Platino" });

      let rutaMedalla1 = "/assets/images/medals/bronze.png";
      let rutaMedalla2 = "/assets/images/medals/silver.png";
      let nombreMedalla1 = "Bronce";
      let nombreMedalla2 = "Plata";
      let puntosMedalla1 = medallaBronce.Desde;
      let puntosMedalla2 = medallaBronce.Hasta;

      if (medico.Medalla == "Plata") {
        rutaMedalla1 = "/assets/images/medals/silver.png";
        rutaMedalla2 = "/assets/images/medals/gold.png";
        puntosMedalla1 = medallaPlata.Desde;
        puntosMedalla2 = medallaPlata.Hasta;
        nombreMedalla1 = "Plata";
        nombreMedalla2 = "Oro";
      }
      if (medico.Medalla == "Oro") {
        rutaMedalla1 = "/assets/images/medals/gold.png";
        rutaMedalla2 = "/images/icons/icon.png";
        puntosMedalla1 = medallaOro.Desde;
        nombreMedalla2 = "∞";
        nombreMedalla1 = "Oro";
        nombreMedalla2 = "Club Salud";
      }
      if (medico.Medalla == "Platino") {
        rutaMedalla1 = "/assets/images/medals/platino.png";
        rutaMedalla2 = "/images/icons/icon.png";
        puntosMedalla1 = medallaPlatino.Desde;
        nombreMedalla2 = "∞";
        nombreMedalla1 = "Platino";
        nombreMedalla2 = "Club Salud";
      }

      let dataPuntos = {
        rutaMedalla1,
        rutaMedalla2,
        nombreMedalla1,
        nombreMedalla2,
        puntosMedalla1,
        puntosMedalla2,
      };

      let examenes = await examenesSDB
        .find({ $and: [{ _idMedico: medico._id }, { Estado: "Procesado" }] })
        .sort({ Numero: -1 })
        .limit(5);
      examenes = examenes.map((data) => {
        return {
          Paciente: data.Paciente,
          FechaAtencion: data.FechaAtencion,
          PuntosTotales: data.PuntosTotales,
          Comision: data.Comision,
          PuntosMedico: data.PuntosMedico,
        };
      });

      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5);
      notificaciones = notificaciones.map((data) => {
        return {
          _idUsuario: data._idUsuario,
          Timestamp: data.Timestamp,
          Fecha: data.Fecha,
          Titulo: data.Titulo,
          Mensaje: data.Mensaje,
          Imagen: data.Imagen,
          Notificacion: data.Notificacion,
          idSocket: data.idSocket,
          Tipo: data.Tipo,
          link: data.link,
        };
      });
      res.render("medicos/inicio.hbs", {
        layout: "medico.hbs",
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        examenes,
        dataPuntos,
        RutaImage: req.user.RutaImage,
      });
    } else if (req.user.TipoUsuario == "Personal") {
      let examenes = await examenesSDB.find().sort({});
      let examenesTotales = examenes.length;
      let examenesAtendidos = examenes.filter(
        (data) => data.Estado == "Procesado"
      ).length;
      let examenesRechazados = examenes.filter(
        (data) => data.Estado == "Rechazado"
      ).length;
      let examenesPendientes = examenes.filter(
        (data) => data.Estado == "Pendiente"
      ).length;
      let dataExamenes = {
        examenesTotales,
        examenesAtendidos,
        examenesRechazados,
        examenesPendientes,
      };
      let examenesList = await examenesSDB
        .find()
        .sort({ Timestamp: -1 })
        .limit(5);
      examenesList = examenesList.map((data) => {
        let color = "warning";
        if (data.Estado == "Procesado") {
          color = "success";
        }
        if (data.Estado == "Rechazado") {
          color = "danger";
        }
        return {
          Numero: data.Numero,
          Fecha: data.Fecha,
          Estado: data.Estado,
          Medico: data.Medico,
          PuntosTotales: data.PuntosTotales,
          Color: color,
        };
      });

      let numero = examenesList.length;
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();
      res.render("content/index.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        dataExamenes,
        examenesList,
        numero,
        RutaImage: req.user.RutaImage,
      });
    } else if (req.user.TipoUsuario == "Afiliado") {
      let afiliado = await afiliadosFichaDB.findOne({ email: req.user.email });

      let servicios = await otrosServiciosDB
        .find({ _idAfiliado: afiliado._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();
      let atendidos = servicios.filter(
        (data) => data.Estado == "Atendido"
      ).length;
      let pendientes = servicios.filter(
        (data) => data.Estado != "Atendido" && data.Estado != "Rechazado"
      ).length;
      let rechazado = servicios.filter(
        (data) => data.Estado == "Rechazado"
      ).length;

      let dataExamenes = {
        examenesTotales: servicios.length,
        examenesAtendidos: atendidos,
        examenesRechazados: rechazado,
        examenesPendientes: pendientes,
      };

      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      res.render("afiliado/inicio", {
        layout: "afiliado.hbs",
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
        dataExamenes,
      });
    }
  } catch (err) {
    console.log(err);
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    next();
  }
});

router.get("/registro-personal", isAuthenticatedData, async (req, res) => {
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();
  let sucursales = await sucursalDB.find().sort({ Nombre: 1 }).lean();

  res.render("content/registro/registro-personal.hbs", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    RutaImage: req.user.RutaImage,
    sucursales,
  });
});
router.get("/mi-cuenta", isAuthenticated, async (req, res) => {
  let usuario = await usersDB.findOne({ email: req.user.email });
  let personal = await personalDB.findOne({ Cedula: usuario.Cedula });
  let Historial = [];
  let historial = await historialActividadDB.findOne({
    _idUsuario: req.user._id,
  });
  if (historial) {
    Historial = historial.Historial;
  }
  Historial = Historial.map((data) => {
    return {
      Fecha: data.Fecha,
      Seccion: data.Seccion,
      Timestamp: data.Timestamp,
      Accion: data.Accion,
    };
  });
  let roles = "";
  usuario.Role.forEach((element) => {
    roles += element + " ";
  });
  usuario = {
    Nombres: usuario.Nombres,
    Apellidos: usuario.Apellidos,
    email: usuario.email,
    password: usuario.password,
    status: usuario.status,
    RutaImage: usuario.RutaImage,
    roles: roles,
    Fecha_Registro: usuario.Fecha_Registro,
    Fecha_Modificacion: usuario.Fecha_Modificacion,
    Fecha_Ultimo_Acceso: usuario.Fecha_Ultimo_Acceso,
    _id: personal._id,
    Cedula: personal.Cedula,
    Direccion: personal.Direccion,
  };
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  res.render("content/mi-cuenta", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    RutaImage: req.user.RutaImage,
    Historial,
    usuario,
  });
});

router.post("/registro/nuevo-personal", isAuthenticated, async (req, res) => {
  let {
    Nombres,
    Apellidos,
    Cedula,
    Direccion,
    email,
    password,
    Role,
    FechaNacimiento,
    Cargo,
    Sucursal,
  } = req.body;
  let timestamp = Date.now();
  let Fecha = new Date();
  let dia;
  let mes;
  let año = Fecha.getFullYear();
  if (Fecha.getDate() < 10) {
    dia = `0${Fecha.getDate()}`;
  } else {
    dia = Fecha.getDate();
  }
  if (Fecha.getMonth() + 1 < 10) {
    mes = `0${Fecha.getMonth() + 1}`;
  } else {
    mes = Fecha.getMonth() + 1;
  }
  let Fecha_Registro = `${dia}/${mes}/${año}`;
  if (await personalDB.findOne({ Email: email })) {
    let data = {
      status: "error",
      msg: "El correo electrónico ingresado ya está registrado",
    };
    res.send(JSON.stringify(data)).status(200);
  } else if (await personalDB.findOne({ Cedula })) {
    let data = {
      status: "error",
      msg: "La cedula ingresada ya se encuentra registrada",
    };
    res.send(JSON.stringify(data)).status(200);
  } else {
    let validacionHistorial = await historialActividadDB.findOne({
      _idUsuario: req.user._id,
    });
    if (validacionHistorial) {
      let dataHistorial = {
        Fecha: Fecha_Registro,
        Seccion: "Data - Registro - Personal administrativo",
        Timestamp: timestamp,
        Accion: `Registro de Personal administrativo ${Nombres} ${Apellidos}`,
      };
      await historialActividadDB.findByIdAndUpdate(validacionHistorial._id, {
        $push: { Historial: dataHistorial },
      });
    } else {
      let dataHistorial = {
        Fecha: Fecha_Registro,
        Seccion: "Data - Registro - Personal administrativo",
        Timestamp: timestamp,
        Accion: `Registro de Personal administrativo ${Nombres}  ${Apellidos}`,
      };
      let nuevoHistorialActividad = new historialActividadDB({
        Nombre: `${req.user.Nombres} ${req.user.Apellidos}`,
        _idUsuario: req.user._id,
        Historial: [dataHistorial],
      });
      await nuevoHistorialActividad.save();
    }
    let nuevoPersonal = new personalDB({
      Nombres,
      Apellidos,
      Cedula,
      Direccion,
      Role,
      FechaNacimiento,
      Cargo,
      Email: email.toLowerCase(),
      password,
      Sucursal,
      Fecha_Registro,
    });
    let id = nuevoPersonal._id;

    email = email.toLowerCase();
    let nuevoUsuario = new usersDB({
      Nombres,
      Apellidos,
      Cedula,
      TipoUsuario: "Personal",
      email,
      Role: Role,
      status: "activo",
      Fecha_Registro,
      Fecha_Ultimo_Acceso: Fecha_Registro,
      Fecha_Ultima_Modificacion: Fecha_Registro,
      Fecha_Ultimo_Cambio_Password: Fecha_Registro,
      Usuario_Registro: `${req.user.Nombres} ${req.user.Apellidos}`,
      Usuario_Ultimo_Cambio_Password: `${req.user.Nombres} ${req.user.Apellidos}`,
      Usuario_Ultima_Modificacion: `${req.user.Nombres} ${req.user.Apellidos}`,
      Sucursal,
    });
    nuevoUsuario.password = await nuevoUsuario.encryptPassword(password);
    await nuevoUsuario.save();
    await nuevoPersonal.save();

    let footer = "Gracias por formar parte de la familia Club Salud",
      btnTexto = "Iniciar sesión",
      btnUrl = "https://app.clubsaludve.com/",
      content = `
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            Ahora eres parte de la familia de Club Salud. Estos son tus datos para ingresar a la plataforma
        </p> </br>
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            Correo: ${email}
        </p> </br>
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            Contraseña: ${password}
        </p> </br>
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            No compartas este correo ni la información del mismo con nadie.
        </p> </br>`,
      titulo = `Bienvenido a la familia Club Salud ${Nombres} ${Apellidos}`;
    const htmlContent = sendEmail(footer, btnTexto, btnUrl, content, titulo);
    let msg = "El personal se registró correctamente";
    const info = transporter
      .sendMail({
        from: "<no-reply@clubsaludve.com>",
        to: email,
        subject: `Nuevo Registro - ${Nombres} ${Apellidos}`,
        html: htmlContent,
      })
      .then((data) => {})
      .catch((err) => {
        console.log(err);
        msg = `El personal se registró correctamente, pero no se pudo enviar el correo ya que el dominio no existe. 
            Por favor, valide el correo electrónico y proceda a editarlo en el siguiente enlace: 
            <a class="text-info" href="/edicion/editar-personal/${id}">Editar personal</a>.`;
      });

    let data = {
      status: "ok",
      msg: msg,
    };
    res.send(JSON.stringify(data)).status(200);
  }
});

router.get("/registro-medico", isAuthenticatedData, async (req, res) => {
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();
  let medallas = await medallasDB.find({}).lean();

  res.render("content/registro/registro-medico", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    RutaImage: req.user.RutaImage,
    medallas,
  });
});

router.post("/registro/nuevo-medico", isAuthenticated, async (req, res) => {
  let {
    Nombres,
    Apellidos,
    Cedula,
    Direccion,
    email,
    Telefono,
    Especialidad,
    FechaNacimiento,
    Cuenta,
    Medalla,
    numeroCIV,
    grupoSanguineo,
  } = req.body;
  let timestamp = Date.now();
  let Fecha = new Date();
  let dia;
  let mes;
  let año = Fecha.getFullYear();

  let medallaBase = await medallasDB.findOne({ Nombre: Medalla });

  if (Fecha.getDate() < 10) {
    dia = `0${Fecha.getDate()}`;
  } else {
    dia = Fecha.getDate();
  }
  if (Fecha.getMonth() + 1 < 10) {
    mes = `0${Fecha.getMonth() + 1}`;
  } else {
    mes = Fecha.getMonth() + 1;
  }
  let Fecha_Registro = `${dia}/${mes}/${año}`;
  if (await usersDB.findOne({ email: email })) {
    let data = {
      status: "error",
      msg: "El correo electrónico ingresado ya está registrado",
    };
    res.send(JSON.stringify(data)).status(200);
    return;
  } else if (await medicoDB.findOne({ Cedula })) {
    let data = {
      status: "error",
      msg: "La cedula ingresada ya se encuentra registrada",
    };
    res.send(JSON.stringify(data)).status(200);
    return;
  } else {
    let validacionHistorial = await historialActividadDB.findOne({
      _idUsuario: req.user._id,
    });
    if (validacionHistorial) {
      let dataHistorial = {
        Fecha: Fecha_Registro,
        Seccion: "Data - Registro - Médicos",
        Timestamp: timestamp,
        Accion: `Registro de médico ${Nombres} ${Apellidos}`,
      };
      await historialActividadDB.findByIdAndUpdate(validacionHistorial._id, {
        $push: { Historial: dataHistorial },
      });
    } else {
      let dataHistorial = {
        Fecha: Fecha_Registro,
        Seccion: "Data - Registro - Médicos",
        Timestamp: timestamp,
        Accion: `Registro de médico ${Nombres} ${Apellidos}`,
      };
      let nuevoHistorialActividad = new historialActividadDB({
        Nombre: `${req.user.Nombres} ${req.user.Apellidos}`,
        _idUsuario: req.user._id,
        Historial: [dataHistorial],
      });
      await nuevoHistorialActividad.save();
    }
    //Creacion de indicadores de medicos registrados
    let Mes = "";
    switch (mes) {
      case "01":
        Mes = "Enero";
        break;
      case "02":
        Mes = "Febrero";
        break;
      case "03":
        Mes = "Marzo";
        break;
      case "04":
        Mes = "Abril";
        break;
      case "05":
        Mes = "Mayo";
        break;
      case "06":
        Mes = "Junio";
        break;
      case "07":
        Mes = "Julio";
        break;
      case "08":
        Mes = "Agosto";
        break;
      case "09":
        Mes = "Septiembre";
        break;
      case "10":
        Mes = "Octubre";
        break;
      case "11":
        Mes = "Noviembre";
        break;
      case "12":
        Mes = "Diciembre";
    }
    let validacion = await medicosIndicadoresDB.findOne({
      $and: [{ NumeroMes: mes }, { Anio: año }],
    });
    if (validacion) {
      let Cantidad = (+validacion.Cantidad + 1).toFixed(2);
      await medicosIndicadoresDB.findByIdAndUpdate(validacion._id, {
        Cantidad: Cantidad,
      });
    } else {
      let nuevopuntosComisionesIndicadores = new medicosIndicadoresDB({
        Mes: Mes,
        NumeroMes: mes,
        Cantidad: 1,
        Anio: año,
      });
      await nuevopuntosComisionesIndicadores.save();
    }

    //cierre de indicadores de medicos registrados

    let ultimoMedico = await medicoDB.findOne().sort({ NroAfiliado: -1 });
    let NroAfiliado = 1;
    NroAfiliado = ultimoMedico ? +ultimoMedico.NroAfiliado + 1 : NroAfiliado;

    let newMedico = new medicoDB({
      Nombres: Nombres.toUpperCase(),
      NroAfiliado,
      Apellidos: Apellidos.toUpperCase(),
      Medalla,
      Cedula,
      Direccion,
      Email: email.toLowerCase(),
      Estado: "Por activar",
      Fecha_Registro,
      Fecha_Modificacion: Fecha_Registro,
      Fecha_Eliminacion: Fecha_Registro,
      Telefono,
      Especialidad,
      NumeroCIV: numeroCIV,
      GrupoSanguineo: grupoSanguineo,
      FechaNacimiento,
      Comision: medallaBase.Comision,
      Cuenta,
      Usuario_Registro: `${req.user.Nombres} ${req.user.Apellidos}`,
    });
    let id = newMedico._id;

    await newMedico.save();

    let footer = "Gracias por formar parte de la familia Club Salud",
      btnTexto = "Activar cuenta",
      btnUrl = `https://app.clubsaludve.com/activar-cuenta/${newMedico._id}`,
      content = `
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
        Ya eres parte de Club Salud, la mejor plataforma de salud del país. Te damos una grata bienvenida y esperamos que tu experencia dentro de la plataforma sea la mejor.
        </p> </br>
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            Solo falta que actives tu cuenta para poder ingresar.
        </p> </br>`,
      titulo = `Hola ${Nombres} ${Apellidos}. ¡Bienvenido a Club Salud!`;
    const htmlContent = sendEmail(footer, btnTexto, btnUrl, content, titulo);
    let msg = "El médico se registró correctamente";
    transporter
      .sendMail({
        from: "<no-reply@clubsaludve.com>",
        to: email,
        subject: `Bienvenido ${Nombres} ${Apellidos}.`,
        html: htmlContent,
      })
      .then((data) => {})
      .catch((err) => {
        msg = `El médico se registró correctamente, pero no se pudo enviar el correo ya que el dominio no existe. 
            Por favor, valide el correo electrónico y proceda a editarlo en el siguiente enlace: 
            <a class="text-info" href="/edicion/editar-medico/${id}">Editar Médico</a>.`;
      });

    let data = {
      status: "ok",
      msg: msg,
    };
    res.send(JSON.stringify(data)).status(200);
  }
});
router.post("/registro/nuevo-paciente", isAuthenticated, async (req, res) => {
  let {
    Nombres,
    Documento,
    Medicos,
    Direccion,
    FechaNacimiento,
    Telefono,
    TipoFactura,
    email,
    Nota,
    TipoDocumento,
  } = req.body;
  let timestamp = Date.now();
  let Fecha = new Date();
  let dia;
  let mes;
  let año = Fecha.getFullYear();
  if (Fecha.getDate() < 10) {
    dia = `0${Fecha.getDate()}`;
  } else {
    dia = Fecha.getDate();
  }
  if (Fecha.getMonth() + 1 < 10) {
    mes = `0${Fecha.getMonth() + 1}`;
  } else {
    mes = Fecha.getMonth() + 1;
  }
  let Fecha_Registro = `${dia}/${mes}/${año}`;

  let medicoRegistro = [];

  for (i = 0; i < Medicos.length; i++) {
    let medicoBase = await medicoDB.findById(Medicos[i]);
    let subdata = {
      _idMedico: Medicos[i],
      Medico: `${medicoBase.Nombres} ${medicoBase.Apellidos}`,
    };

    medicoRegistro.push(subdata);
  }

  if (await usersDB.findOne({ email: email })) {
    let data = {
      status: "error",
      msg: "El correo electrónico ingresado ya está registrado",
    };
    res.send(JSON.stringify(data)).status(200);
    return;
  } else if (await pacienteDB.findOne({ Documento })) {
    let data = {
      status: "error",
      msg: "El documento ingresado ya se encuentra registrada",
    };
    res.send(JSON.stringify(data)).status(200);
    return;
  } else {
    let validacionHistorial = await historialActividadDB.findOne({
      _idUsuario: req.user._id,
    });
    if (validacionHistorial) {
      let dataHistorial = {
        Fecha: Fecha_Registro,
        Seccion: "Data - Registro - Pacientes",
        Timestamp: timestamp,
        Accion: `Registro de paciente ${Nombres}`,
      };
      await historialActividadDB.findByIdAndUpdate(validacionHistorial._id, {
        $push: { Historial: dataHistorial },
      });
    } else {
      let dataHistorial = {
        Fecha: Fecha_Registro,
        Seccion: "Data - Registro - Pacientes",
        Timestamp: timestamp,
        Accion: `Registro de paciente ${Nombres}`,
      };
      let nuevoHistorialActividad = new historialActividadDB({
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Historial: [dataHistorial],
      });
      await nuevoHistorialActividad.save();
    }
    //Creacion de indicadores de medicos registrados
    let Mes = "";
    switch (mes) {
      case "01":
        Mes = "Enero";
        break;
      case "02":
        Mes = "Febrero";
        break;
      case "03":
        Mes = "Marzo";
        break;
      case "04":
        Mes = "Abril";
        break;
      case "05":
        Mes = "Mayo";
        break;
      case "06":
        Mes = "Junio";
        break;
      case "07":
        Mes = "Julio";
        break;
      case "08":
        Mes = "Agosto";
        break;
      case "09":
        Mes = "Septiembre";
        break;
      case "10":
        Mes = "Octubre";
        break;
      case "11":
        Mes = "Noviembre";
        break;
      case "12":
        Mes = "Diciembre";
    }
    for (i = 0; i < medicoRegistro.length; i++) {
      let validacion2 = await pacientesIndicadoresMedicoDB.findOne({
        $and: [
          { NumeroMes: mes },
          { Anio: año },
          { _idMedico: medicoRegistro[i]._id },
        ],
      });
      if (validacion2) {
        let Cantidad = (+validacion2.Cantidad + 1).toFixed(2);
        await pacientesIndicadoresMedicoDB.findByIdAndUpdate(validacion2._id, {
          Cantidad: Cantidad,
        });
      } else {
        let nuevopuntosComisionesIndicadores = new pacientesIndicadoresMedicoDB(
          {
            _idMedico: medicoRegistro[i]._idMedico,
            Medico: medicoRegistro[i].Medico,
            Mes: Mes,
            NumeroMes: mes,
            Cantidad: 1,
            Anio: año,
          }
        );
        await nuevopuntosComisionesIndicadores.save();
      }
    }

    //cierre de indicadores de medicos registrados

    //creacion de indicadores de pacientes por medico
    for (i = 0; i < medicoRegistro.length; i++) {
      let validacion2 = await pacientesIndicadoresMedicoDB.findOne({
        $and: [
          { NumeroMes: mes },
          { Anio: año },
          { _idMedico: medicoRegistro[i]._id },
        ],
      });
      if (validacion2) {
        let Cantidad = (+validacion2.Cantidad + 1).toFixed(2);
        await pacientesIndicadoresMedicoDB.findByIdAndUpdate(validacion2._id, {
          Cantidad: Cantidad,
        });
      } else {
        let nuevopuntosComisionesIndicadores = new pacientesIndicadoresMedicoDB(
          {
            _idMedico: medicoRegistro[i]._idMedico,
            Medico: medicoRegistro[i].Medico,
            Mes: Mes,
            NumeroMes: mes,
            Cantidad: 1,
            Anio: año,
          }
        );
        await nuevopuntosComisionesIndicadores.save();
      }
    }

    //cierre creacion de indicadores de pacientes por medico
    //generate a random number of 6 digits
    let random = Math.floor(100000 + Math.random() * 900000);

    let newPaciente = new pacienteDB({
      Nombres: Nombres.toUpperCase(),
      Documento: Documento,
      Direccion: Direccion,
      FechaNacimiento: FechaNacimiento,
      Telefono: Telefono,
      TipoFactura: TipoFactura,
      Email: email.toLowerCase(),
      Role: "Paciente",
      TipoDocumento: TipoDocumento,
      Estado: "Por activar",
      TipoDocumento: TipoDocumento,
      Fecha_Registro: Fecha_Registro,
      Nota: Nota,
      Clave: random,
      Fecha_Modificacion: Fecha_Registro,
      Fecha_Eliminacion: Fecha_Registro,
      Usuario_Registro: `${req.user.Nombres} ${req.user.Apellidos}`,
      Medicos: medicoRegistro,
    });

    for (i = 0; i < medicoRegistro.length; i++) {
      let medicoBase = await medicoDB.findById(medicoRegistro[i]._idMedico);
      let mensajesWhatsapp = new mensajesWhatsappDB({
        NombreUsuario: `${medicoBase.Nombres} ${medicoBase.Apellidos}`,
        _idUsuario: medicoBase._id,
        Mensaje: `Hola,${medicoBase.Nombres} ${medicoBase.Apellidos}. Se le informa que  se ha registrado y vinculado el paciente ${Nombres} a su directorio de pacientes.`,
        Enviado: false,
      });
      if (medicoBase.Whatsapp) {
        await mensajesWhatsapp.save();
      }
    }
    await newPaciente.save();

    let data = {
      status: "ok",
      msg: "Paciente registrado correctamente",
    };
    res.send(JSON.stringify(data)).status(200);
  }
});

router.post(
  "/registro/nuevo-paciente-examen",
  isAuthenticated,
  async (req, res) => {
    let {
      Nombres,
      Apellidos,
      Documento,
      Medicos,
      Direccion,
      FechaNacimiento,
      Telefono,
      TipoFactura,
      email,
      Nota,
    } = req.body;
    let timestamp = Date.now();
    let Fecha = new Date();
    let dia;
    let mes;
    let año = Fecha.getFullYear();
    if (Fecha.getDate() < 10) {
      dia = `0${Fecha.getDate()}`;
    } else {
      dia = Fecha.getDate();
    }
    if (Fecha.getMonth() + 1 < 10) {
      mes = `0${Fecha.getMonth() + 1}`;
    } else {
      mes = Fecha.getMonth() + 1;
    }
    let Fecha_Registro = `${dia}/${mes}/${año}`;

    let medicoRegistro = [];

    for (i = 0; i < Medicos.length; i++) {
      let medicoBase = await medicoDB.findById(Medicos[i]);
      let subdata = {
        _idMedico: Medicos[i],
        Medico: `${medicoBase.Nombres} ${medicoBase.Apellidos}`,
      };

      medicoRegistro.push(subdata);
    }
    let validacionPaciente = await pacienteDB.findOne({ Documento });
    /*if (await usersDB.findOne({ email: email })) {
        let data = {
            status: 'error',
            msg: 'El correo electrónico ingresado ya está registrado'
        }
        res.send(JSON.stringify(data)).status(200);
        return
    } else */ if (validacionPaciente) {
      let data = {
        status: "error",
        validacionPaciente,
        msg: "El documento ingresado ya se encuentra registrado. Se autocompletaron los datos del paciente",
      };
      res.send(JSON.stringify(data)).status(200);
      return;
    } else {
      let validacionHistorial = await historialActividadDB.findOne({
        _idUsuario: req.user._id,
      });
      if (validacionHistorial) {
        let dataHistorial = {
          Fecha: Fecha_Registro,
          Seccion: "Data - Registro - Pacientes",
          Timestamp: timestamp,
          Accion: `Registro de paciente ${Nombres} ${Apellidos}`,
        };
        await historialActividadDB.findByIdAndUpdate(validacionHistorial._id, {
          $push: { Historial: dataHistorial },
        });
      } else {
        let dataHistorial = {
          Fecha: Fecha_Registro,
          Seccion: "Data - Registro - Pacientes",
          Timestamp: timestamp,
          Accion: `Registro de paciente ${Nombres} ${Apellidos}`,
        };
        let nuevoHistorialActividad = new historialActividadDB({
          Nombre: `${req.user.Nombres} ${req.user.Apellidos}`,
          _idUsuario: req.user._id,
          Historial: [dataHistorial],
        });
        await nuevoHistorialActividad.save();
      }
      //Creacion de indicadores de medicos registrados
      let Mes = "";
      switch (mes) {
        case "01":
          Mes = "Enero";
          break;
        case "02":
          Mes = "Febrero";
          break;
        case "03":
          Mes = "Marzo";
          break;
        case "04":
          Mes = "Abril";
          break;
        case "05":
          Mes = "Mayo";
          break;
        case "06":
          Mes = "Junio";
          break;
        case "07":
          Mes = "Julio";
          break;
        case "08":
          Mes = "Agosto";
          break;
        case "09":
          Mes = "Septiembre";
          break;
        case "10":
          Mes = "Octubre";
          break;
        case "11":
          Mes = "Noviembre";
          break;
        case "12":
          Mes = "Diciembre";
      }
      for (i = 0; i < medicoRegistro.length; i++) {
        let validacion2 = await pacientesIndicadoresMedicoDB.findOne({
          $and: [
            { NumeroMes: mes },
            { Anio: año },
            { _idMedico: medicoRegistro[i]._id },
          ],
        });
        if (validacion2) {
          let Cantidad = (+validacion2.Cantidad + 1).toFixed(2);
          await pacientesIndicadoresMedicoDB.findByIdAndUpdate(
            validacion2._id,
            {
              Cantidad: Cantidad,
            }
          );
        } else {
          let nuevopuntosComisionesIndicadores =
            new pacientesIndicadoresMedicoDB({
              _idMedico: medicoRegistro[i]._idMedico,
              Medico: medicoRegistro[i].Medico,
              Mes: Mes,
              NumeroMes: mes,
              Cantidad: 1,
              Anio: año,
            });
          await nuevopuntosComisionesIndicadores.save();
        }
      }

      //cierre de indicadores de medicos registrados

      //creacion de indicadores de pacientes por medico
      for (i = 0; i < medicoRegistro.length; i++) {
        let validacion2 = await pacientesIndicadoresMedicoDB.findOne({
          $and: [
            { NumeroMes: mes },
            { Anio: año },
            { _idMedico: medicoRegistro[i]._id },
          ],
        });
        if (validacion2) {
          let Cantidad = (+validacion2.Cantidad + 1).toFixed(2);
          await pacientesIndicadoresMedicoDB.findByIdAndUpdate(
            validacion2._id,
            {
              Cantidad: Cantidad,
            }
          );
        } else {
          let nuevopuntosComisionesIndicadores =
            new pacientesIndicadoresMedicoDB({
              _idMedico: medicoRegistro[i]._idMedico,
              Medico: medicoRegistro[i].Medico,
              Mes: Mes,
              NumeroMes: mes,
              Cantidad: 1,
              Anio: año,
            });
          await nuevopuntosComisionesIndicadores.save();
        }
      }

      //cierre creacion de indicadores de pacientes por medico
      //generate a random number of 6 digits
      let random = Math.floor(100000 + Math.random() * 900000);

      let newPaciente = new pacienteDB({
        Nombres: Nombres.toUpperCase(),
        Documento: Documento,
        Direccion: Direccion,
        FechaNacimiento: FechaNacimiento,
        Telefono: Telefono,
        TipoFactura: TipoFactura,
        Email: email.toLowerCase(),
        Role: "Paciente",
        Estado: "Por activar",
        Fecha_Registro: Fecha_Registro,
        Nota: Nota,
        Clave: random,
        Fecha_Modificacion: Fecha_Registro,
        Fecha_Eliminacion: Fecha_Registro,
        Usuario_Registro: `${req.user.Nombres} ${req.user.Apellidos}`,
        Medicos: medicoRegistro,
      });

      for (i = 0; i < medicoRegistro.length; i++) {
        let medicoBase = await medicoDB.findById(medicoRegistro[i]._idMedico);
        let mensajesWhatsapp = new mensajesWhatsappDB({
          NombreUsuario: `${medicoBase.Nombres} ${medicoBase.Apellidos}`,
          _idUsuario: medicoBase._id,
          Mensaje: `Hola,${medicoBase.Nombres} ${medicoBase.Apellidos}. Se le informa que  se ha registrado y vinculado el paciente ${Nombres} ${Apellidos} a su directorio de pacientes.`,
          Enviado: false,
        });
        if (medicoBase.Whatsapp) {
          await mensajesWhatsapp.save();
        }
      }

      await newPaciente.save();

      let data = {
        status: "ok",
        msg: msg,
      };
      res.send(JSON.stringify(data)).status(200);
    }
  }
);

router.get("/activar-cuenta/:id", async (req, res) => {
  let id = req.params.id;
  let usuario = await medicoDB.findById(id);
  if (usuario) {
    if (usuario.Estado == "Por activar") {
      res.render("content/activacion/activar-cuenta-medico", {
        id,
        layout: "login",
      });
    } else {
      res.render("content/activacion/link-caducado", {
        layout: "login",
      });
    }
  } else {
    let usuario = await afiliadosFichaDB.findById(id);
    if (usuario) {
      if (usuario.Estado == "Por activar") {
        res.render("content/activacion/activar-cuenta-medico", {
          id,
          layout: "login",
        });
      } else {
        res.render("content/activacion/link-caducado", {
          layout: "login",
        });
      }
    }
  }
});

router.post("/activar-cuenta/:id", async (req, res) => {
  let { password } = req.body;
  let id = req.params.id;
  let usuario = await medicoDB.findById(id);
  let Cedula;
  let Role;
  if (!usuario) {
    usuario = await pacienteDB.findById(id);
    if (usuario) {
      Cedula = usuario.Documento;
      usuario.Apellidos = "";
      usuario.Tipo = "Paciente";
      Role = ["Paciente"];
      await pacienteDB.findByIdAndUpdate(id, {
        Estado: "Activo",
      });
    } else {
      usuario = await afiliadosFichaDB.findById(id);
      Cedula = usuario.Cedula;
      usuario.Tipo = "Afiliado";
      usuario.Apellidos = "";
      Role = ["Afiliado"];
      await afiliadosFichaDB.findByIdAndUpdate(id, {
        Estado: "Activo",
      });
    }
  } else {
    usuario.Tipo = "Medico";
    usuario.Nombre = usuario.Nombres;
    Role = ["Medico"];
    Cedula = usuario.Cedula;
    await medicoDB.findByIdAndUpdate(id, {
      Estado: "Activo",
    });
  }
  let Fecha = new Date();
  let dia;
  let mes;
  let año = Fecha.getFullYear();
  if (Fecha.getDate() < 10) {
    dia = `0${Fecha.getDate()}`;
  } else {
    dia = Fecha.getDate();
  }
  if (Fecha.getMonth() + 1 < 10) {
    mes = `0${Fecha.getMonth() + 1}`;
  } else {
    mes = Fecha.getMonth() + 1;
  }
  let Fecha_Registro = `${dia}/${mes}/${año}`;

  let nuevoUsuario = new usersDB({
    Nombres: usuario.Nombre,
    Apellidos: usuario.Apellidos,
    Cedula: Cedula,
    TipoUsuario: usuario.Tipo,
    email: usuario.Email.toLowerCase(),
    Role: Role,
    status: "activo",
    Fecha_Registro,
    Fecha_Ultimo_Acceso: Fecha_Registro,
    Fecha_Ultima_Modificacion: Fecha_Registro,
    Fecha_Ultimo_Cambio_Password: Fecha_Registro,
    Usuario_Registro: ``,
    Usuario_Ultimo_Cambio_Password: "",
    Usuario_Ultima_Modificacion: "admin",
  });
  let usuarios = await usersDB.find({ TipoUsuario: "Personal" });
  for (i = 0; i < usuarios.length; i++) {
    await usersDB.findByIdAndUpdate(usuarios[i]._id, {
      $push: { Contactos: nuevoUsuario._id },
    });
  }

  nuevoUsuario.password = await nuevoUsuario.encryptPassword(password);
  await nuevoUsuario.save();
  let data = {
    status: "success",
  };
  res.send(JSON.stringify(data));
});

router.get("/registro-pacientes", isAuthenticatedData, async (req, res) => {
  let medicos = await medicoDB.find().sort({ Nombre: 1 });
  let tipoDocumento = await tipoDocumentoDB.find().sort({ Nombre: 1 }).lean();
  medicos = medicos.map((data) => {
    return {
      Nombres: data.Nombres,
      _id: data._id,
      Apellidos: data.Apellidos,
    };
  });
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  res.render("content/registro/registro-pacientes", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    tipoDocumento,
    RutaImage: req.user.RutaImage,
    medicos,
  });
});

router.get("/directorio-medico", isAuthenticatedData, async (req, res) => {
  let data = await medicoDB.find().sort({ Nombre: 1 }).lean();
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  res.render("content/directorio/medicos", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    RutaImage: req.user.RutaImage,
    data,
  });
});
router.get("/directorio-pacientes", isAuthenticatedData, async (req, res) => {
  let data = await pacienteDB.find().sort({ Nombre: 1 });
  data = data.map((doc) => {
    return {
      Nombres: doc.Nombres,
      Apellidos: doc.Apellidos,
      Documento: doc.Documento,
      Email: doc.Email,
      _id: doc._id,
    };
  });
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  res.render("content/directorio/pacientes", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    RutaImage: req.user.RutaImage,
    data,
  });
});
router.get("/directorio-personal", isAuthenticatedData, async (req, res) => {
  let data = await personalDB.find().sort({ Nombre: 1 });

  data = data.map((doc) => {
    return {
      Nombres: doc.Nombres,
      Apellidos: doc.Apellidos,
      Cedula: doc.Cedula,
      Email: doc.Email,
      _id: doc._id,
    };
  });
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  res.render("content/directorio/personal", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    RutaImage: req.user.RutaImage,
    data,
  });
});
router.get("/directorio-usuarios", isAuthenticatedData, async (req, res) => {
  let data = await usersDB.find().sort({ Nombre: 1 });
  data = data.map((doc) => {
    return {
      Nombres: doc.Nombres,
      Apellidos: doc.Apellidos,
      Cedula: doc.Cedula,
      Email: doc.email,
      _id: doc._id,
    };
  });
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  res.render("content/directorio/usuarios", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    RutaImage: req.user.RutaImage,
    data,
  });
});

router.get(
  "/edicion/editar-medico/:id",
  isAuthenticatedData,
  async (req, res) => {
    let id = req.params.id;
    let medico = await medicoDB.findById(id);
    let historial = await historialPuntosDB
      .findOne({ _idMedico: medico._id })
      .sort({ Timestamp: -1 });
    let pacientes = await pacienteDB
      .find({ Medicos: { $elemMatch: { _idMedico: id } } })
      .lean();
    let examenes = await examenesSDB.find({ _idMedico: id }, { _id: 1 });
    let examenesSolicitados = examenes.length;
    let medallas = await medallasDB.find().lean();

    let usuarioMedico = await usersDB.findOne({ email: medico.Email });
    if (!usuarioMedico) {
      usuarioMedico = {
        RutaImage: "/assets/images/users/avatar-3.jpg",
      };
    }

    let rutaMedalla = "/assets/images/medals/bronze.png";

    if (medico.Medalla == "Plata") {
      rutaMedalla = "/assets/images/medals/silver.png";
    }
    if (medico.Medalla == "Oro") {
      rutaMedalla = "/assets/images/medals/gold.png";
    }
    if (medico.Medalla == "Platino") {
      rutaMedalla = "/assets/images/medals/platino.png";
    }
    if (historial) {
      historial = historial.Historial;
      historial.sort(function (a, b) {
        if (a.Timestamp > b.Timestamp) {
          return -1;
        }
        if (a.Timestamp < b.Timestamp) {
          return 1;
        }
        return 0;
      });

      historial = historial.map((data) => {
        return {
          Timestamp: data.Timestamp,
          TipoMovimiento: data.TipoMovimiento,
          PuntosAnteriores: data.PuntosAnteriores,
          PuntosMovidos: data.PuntosMovidos,
          PuntosActuales: data.PuntosActuales,
          Fecha: data.Fecha,
          Usuario: data.Usuario,
          Comentario: data.Comentario,
          Color: data.Color,
        };
      });
    } else {
      historial = [];
    }

    medico = {
      Nombres: medico.Nombres,
      Apellidos: medico.Apellidos,
      Cedula: medico.Cedula,
      Direccion: medico.Direccion,
      Email: medico.Email,
      Estado: medico.Estado,
      Telefono: medico.Telefono,
      Especialidad: medico.Especialidad,
      FechaNacimiento: medico.FechaNacimiento,
      Cuenta: medico.Cuenta,
      _id: medico._id,
      rutaMedalla: rutaMedalla,
      Medalla: medico.Medalla,
      PuntosObtenidos: (
        +medico.PuntosCanjeables + +medico.PuntosCanjeados
      ).toFixed(2),
      PuntosCanjeables: medico.PuntosCanjeables,
      PuntosCanjeados: medico.PuntosCanjeados,
      Fecha_Modificacion: medico.Fecha_Modificacion,
      RutaImage: usuarioMedico.RutaImage,
      Comision: medico.Comision,
      NumeroCIV: medico.NumeroCIV,
      GrupoSanguineo: medico.GrupoSanguineo,
    };
    let usuario = await usersDB.findOne({ Cedula: medico.Cedula });
    if (usuario) {
      medico.Verificado = "Verificado";
    } else {
      medico.Verificado = "Pendiente";
    }

    medallas = medallas.filter((data) => data.Nombre != medico.Medalla);

    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    let pacientesRegistrados = pacientes.length;
    medico.Activo = medico.Estado == "Activo" ? true : false;

    res.render("content/directorio/edicion/medicos", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      RutaImage: req.user.RutaImage,
      notificaciones,
      pacientes,
      historial,
      pacientesRegistrados,
      medallas,
      examenesSolicitados,
      medallas,
      medico,
    });
  }
);

router.get(
  "/edicion/editar-paciente/:id",
  isAuthenticatedData,
  async (req, res) => {
    let id = req.params.id;
    let paciente = await pacienteDB.findById(id);
    let examenes = await examenesSDB
      .find({ _idPaciente: paciente._id })
      .sort({ Timestamp: -1 })
      .lean();
    let usuario = await usersDB.findOne({ Cedula: paciente.Documento }).lean();
    let tipoDocumento = await tipoDocumentoDB.find().sort({ Nombre: 1 }).lean();
    if (!usuario) {
      usuario = {
        RutaImage: "/assets/images/users/avatar-3.jpg",
      };
    }
    let medicos = await medicoDB.find({}).sort({ Nombres: 1, Apellidos: 1 });
    medicos = medicos.filter((data) => data._id != paciente._idMedico);
    medicos = medicos.map((data) => {
      return {
        Nombres: data.Nombres,
        Apellidos: data.Apellidos,
        _id: data._id,
      };
    });
    let tipoFactura = "";
    if (paciente.TipoFactura == "Natural") {
      tipoFactura = "Jurídico";
    } else {
      tipoFactura = "Natural";
    }

    paciente = {
      Nombres: paciente.Nombres,
      _id: paciente._id,
      Apellidos: paciente.Apellidos,
      Documento: paciente.Documento,
      Direccion: paciente.Direccion,
      Medicos: paciente.Medicos.map((data) => {
        return {
          Medico: data.Medico,
          _idMedico: data._idMedico,
        };
      }),
      Email: paciente.Email,
      FechaNacimiento: paciente.FechaNacimiento,
      Telefono: paciente.Telefono,
      TipoFactura: paciente.TipoFactura,
      Fecha_Modificacion: paciente.Fecha_Modificacion,
      RutaImagen: usuario.RutaImage,
      TipoDocumento: paciente.TipoDocumento,
      Nota: paciente.Nota,
      _id: paciente._id,
    };

    tipoDocumento = tipoDocumento.filter(
      (data) => data.Nombre != paciente.TipoDocumento
    );

    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    examenes = examenes.map((data) => {
      let disabled = false;
      if (data.Resultado) {
        disabled = false;
      } else {
        disabled = true;
      }
      return {
        _id: data._id,
        Fecha: data.Fecha,
        Numero: data.Numero,
        PuntosTotales: data.PuntosTotales,
        PuntosNetos: data.PuntosNetos,
        Estado: data.Estado,
        disabled: disabled,
      };
    });

    res.render("content/directorio/edicion/pacientes", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
      paciente,
      tipoFactura,
      tipoDocumento,
      examenes,
      medicos,
    });
  }
);

router.get(
  "/edicion/editar-usuario/:id",
  isAuthenticatedData,
  async (req, res) => {
    let id = req.params.id;
    let usuario = await usersDB.findById(id);
    let Historial = [];
    let historial = await historialIngresoDB.findOne({
      _idUsuario: req.params.id,
    });
    let ultimoInicio = "";
    if (historial) {
      Historial = historial.Historial;
      ultimoInicio = Historial[Historial.length - 1].Fecha;
    }
    Historial = Historial.map((data) => {
      return {
        Fecha: data.Fecha,
      };
    });

    usuario = {
      Nombres: usuario.Nombres,
      Apellidos: usuario.Apellidos,
      Roles: usuario.Role.map((data) => {
        return data;
      }),
      password: usuario.password,
      Email: usuario.email,
      _id: usuario._id,
      RutaImage: usuario.RutaImage,
    };
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    res.render("content/directorio/edicion/usuarios", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      notificaciones,
      Tema: req.user.Tema,
      usuario,
      Historial,
      ultimoInicio,
    });
  }
);

router.get(
  "/edicion/editar-personal/:id",
  isAuthenticatedData,
  async (req, res) => {
    let id = req.params.id;
    let personal = await personalDB.findById(id);
    let usuario = await usersDB.findOne({ Cedula: personal.Cedula });
    let roles = usuario.Role;
    let historial = await historialActividadDB.findOne({
      _idUsuario: req.user._id,
    });
    let Historial = [];
    if (historial) {
      Historial = historial.Historial;
    }
    let sucursales = await sucursalDB.find().lean();
    let rolesList = [
      "Master",
      "Sub-master",
      "Soporte",
      "Servicios",
      "Data",
      "Red",
      "Herramientas",
    ];
    rolesList = rolesList.filter(function (item) {
      return roles.indexOf(item) === -1;
    });
    personal = {
      Nombres: personal.Nombres,
      Apellidos: personal.Apellidos,
      Cedula: personal.Cedula,
      Direccion: personal.Direccion,
      Email: personal.Email,
      RutaImage: usuario.RutaImage,
      Fecha_Modificacion: personal.Fecha_Modificacion,
      Role: personal.Role.map((data) => {
        return data;
      }),
      FechaNacimiento: personal.FechaNacimiento,
      Cargo: personal.Cargo,
      _id: personal._id,
      Estado: personal.Estado,
      Sucursal: personal.Sucursal,
    };
    sucursales = sucursales.filter((data) => data.Nombre != personal.Sucursal);

    Historial = Historial.map((data) => {
      return {
        Fecha: data.Fecha,
        Seccion: data.Seccion,
        Timestamp: data.Timestamp,
        Accion: data.Accion,
      };
    });

    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    res.render("content/directorio/edicion/personal", {
      personal,
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      notificaciones,
      Tema: req.user.Tema,
      roles,
      sucursales,
      Historial,
      rolesList,
    });
  }
);

router.post("/edicion/actualizar-medico", isAuthenticated, async (req, res) => {
  let {
    Nombres,
    Apellidos,
    Cedula,
    Direccion,
    email,
    _id,
    FechaNacimiento,
    Telefono,
    Especialidad,
    Cuenta,
    Medalla,
    numeroCIV,
    grupoSanguineo,
  } = req.body;
  let medico = await medicoDB.findById(_id);
  let validacion1 = await medicoDB.find({ Cedula: Cedula });
  validacion1 = validacion1.filter((data) => data._id != _id);
  let validacion2 = await medicoDB.find({ Email: email });
  validacion2 = validacion2.filter((data) => data._id != _id);

  let medallaBase = await medallasDB.findOne({ Nombre: Medalla });

  if (validacion1.length > 0) {
    let data = {
      status: "error",
      msg: "Ya existe un medico con esa cedula",
    };
    res.send(JSON.stringify(data));
    return;
  } else if (validacion2.length > 0) {
    let data = {
      status: "error",
      msg: "Ya existe un medico con ese email",
    };
    res.send(JSON.stringify(data));
    return;
  } else {
    let usuario = await usersDB.findOne({ email: medico.Email });
    if (usuario) {
      await usersDB.findByIdAndUpdate(usuario._id, {
        email,
        Cedula,
        Nombres,
        Apellidos,
      });
    }
    let Fecha = new Date();
    let dia;
    let mes;
    let año = Fecha.getFullYear();
    if (Fecha.getDate() < 10) {
      dia = `0${Fecha.getDate()}`;
    } else {
      dia = Fecha.getDate();
    }
    if (Fecha.getMonth() + 1 < 10) {
      mes = `0${Fecha.getMonth() + 1}`;
    } else {
      mes = Fecha.getMonth() + 1;
    }
    let Fecha_Modificacion = `${dia}/${mes}/${año}`;
    await medicoDB.findByIdAndUpdate(_id, {
      Nombres,
      Apellidos,
      Cedula,
      Medalla,
      Direccion,
      Email: email,
      FechaNacimiento,
      Telefono,
      Especialidad,
      Fecha_Modificacion,
      Cuenta,
      Comision: medallaBase.Comision,
      NumeroCIV: numeroCIV,
      GrupoSanguineo: grupoSanguineo,
    });
    let data = {
      status: "ok",
      msg: "Datos actualizados correctamente",
    };
    res.send(JSON.stringify(data));
  }
});

router.post(
  "/edicion/actualizar-paciente",
  isAuthenticated,
  async (req, res) => {
    let {
      Nombres,
      Apellidos,
      Documento,
      Direccion,
      _id,
      email,
      TipoFactura,
      Medico,
      Telefono,
      FechaNacimiento,
      Nota,
      TipoDocumento,
    } = req.body;
    let paciente = await pacienteDB.findById(_id);
    let validacion1 = await pacienteDB.find({ Documento: Documento });
    validacion1 = validacion1.filter((data) => data._id != _id);
    let validacion2 = await pacienteDB.find({ Email: email });
    validacion2 = validacion2.filter((data) => data._id != _id);

    let medicoRegistro = [];
    for (i = 0; i < Medico.length; i++) {
      let medicoBase = await medicoDB.findById(Medico[i]);
      let subdata = {
        _idMedico: Medico[i],
        Medico: `${medicoBase.Nombres} ${medicoBase.Apellidos}`,
      };

      medicoRegistro.push(subdata);
    }

    if (validacion1.length > 0) {
      let data = {
        status: "error",
        msg: "Ya existe un paciente con esa cedula",
      };
      res.send(JSON.stringify(data));
      return;
    } else if (validacion2.length > 0) {
      let data = {
        status: "error",
        msg: "Ya existe un paciente con ese email",
      };
      res.send(JSON.stringify(data));
      return;
    } else {
      let usuario = await usersDB.findOne({ email: paciente.Email });
      if (usuario) {
        await usersDB.findByIdAndUpdate(usuario._id, {
          email,
          Cedula: Documento,
          Nombres,
          Apellidos,
        });
      }
      let Fecha = new Date();
      let dia;
      let mes;
      let año = Fecha.getFullYear();
      if (Fecha.getDate() < 10) {
        dia = `0${Fecha.getDate()}`;
      } else {
        dia = Fecha.getDate();
      }
      if (Fecha.getMonth() + 1 < 10) {
        mes = `0${Fecha.getMonth() + 1}`;
      } else {
        mes = Fecha.getMonth() + 1;
      }
      let Fecha_Modificacion = `${dia}/${mes}/${año}`;
      await pacienteDB.findByIdAndUpdate(_id, {
        Nombres,
        Apellidos,
        Documento,
        Direccion,
        Medicos: medicoRegistro,
        Email: email,
        FechaNacimiento,
        Telefono,
        TipoDocumento,
        Nota,
        TipoFactura,
        Fecha_Modificacion,
      });
      let data = {
        status: "ok",
        msg: "Datos actualizados correctamente",
      };
      res.send(JSON.stringify(data));
    }
  }
);

router.post(
  "/edicion/actualizar-personal",
  isAuthenticated,
  async (req, res) => {
    let {
      Nombres,
      Apellidos,
      Cedula,
      Direccion,
      email,
      _id,
      Role,
      FechaNacimiento,
      Cargo,
      Sucursal,
    } = req.body;
    let personal = await personalDB.findById(_id);
    let validacion1 = await personalDB.find({ Cedula: Cedula });
    validacion1 = validacion1.filter((data) => data._id != _id);
    let validacion2 = await personalDB.find({ Email: email });
    validacion2 = validacion2.filter((data) => data._id != _id);
    if (validacion1.length > 0) {
      let data = {
        status: "error",
        msg: "Ya existe un personal con esa cedula",
      };
      res.send(JSON.stringify(data));
      return;
    } else if (validacion2.length > 0) {
      let data = {
        status: "error",
        msg: "Ya existe un personal con ese email",
      };
      res.send(JSON.stringify(data));
      return;
    } else {
      let usuario = await usersDB.findOne({ email: personal.Email });
      await usersDB.findByIdAndUpdate(usuario._id, {
        email,
        Cedula,
        Nombres,
        Role,
        Apellidos,
        Sucursal,
      });

      let Fecha = new Date();
      let dia;
      let mes;
      let año = Fecha.getFullYear();
      if (Fecha.getDate() < 10) {
        dia = `0${Fecha.getDate()}`;
      } else {
        dia = Fecha.getDate();
      }
      if (Fecha.getMonth() + 1 < 10) {
        mes = `0${Fecha.getMonth() + 1}`;
      } else {
        mes = Fecha.getMonth() + 1;
      }
      let Fecha_Modificacion = `${dia}/${mes}/${año}`;
      await personalDB.findByIdAndUpdate(_id, {
        Nombres,
        Role,
        FechaNacimiento,
        Cargo,
        Apellidos,
        Cedula,
        Direccion,
        Email: email,
        Fecha_Modificacion,
        Sucursal,
      });

      let data = {
        status: "ok",
        Role: Role,
        msg: "Datos actualizados correctamente",
      };
      res.send(JSON.stringify(data));
    }
  }
);

router.post(
  "/edicion/actualizar-usuarios",
  isAuthenticated,
  async (req, res) => {
    let { email, password, _id } = req.body;
    let usuario = await usersDB.findById(_id);
    let validacion1 = await usersDB.find({ email: email });
    validacion1 = validacion1.filter((data) => data._id != _id);
    if (validacion1.length > 0) {
      let data = {
        status: "error",
        msg: "Ya existe un usuario con ese correo electronico",
      };
      res.send(JSON.stringify(data));
      return;
    } else {
      if (password == usuario.password) {
        await usersDB.findByIdAndUpdate(_id, {
          email,
        });
        if (usuario.TipoUsuario == "Medico") {
          let medico = await medicoDB.findOne({ Email: usuario.email });
          await medicoDB.findByIdAndUpdate(medico._id, {
            Email: email,
          });
        } else if (usuario.TipoUsuario == "Paciente") {
          let paciente = await pacienteDB.findOne({ Email: usuario.email });
          await medicoDB.findByIdAndUpdate(paciente._id, {
            Email: email,
          });
        } else {
          let personal = await personalDB.findOne({ Email: usuario.email });
          await personalDB.findByIdAndUpdate(personal._id, {
            Email: email,
          });
        }
      } else {
        let nuevoUsuario = new usersDB({});
        password = await nuevoUsuario.encryptPassword(password);
        await usersDB.findByIdAndUpdate(_id, {
          email,
          password,
        });
        if (usuario.TipoUsuario == "Medico") {
          let medico = await medicoDB.findOne({ Email: usuario.email });
          await medicoDB.findByIdAndUpdate(medico._id, {
            Email: email,
          });
        } else if (usuario.TipoUsuario == "Paciente") {
          let paciente = await pacienteDB.findOne({ Email: usuario.email });
          await medicoDB.findByIdAndUpdate(paciente._id, {
            Email: email,
          });
        } else {
          let personal = await personalDB.findOne({ Email: usuario.email });
          await personalDB.findByIdAndUpdate(personal._id, {
            Email: email,
          });
        }
      }
      let data = {
        status: "ok",
        msg: "Datos actualizados correctamente",
      };
      res.send(JSON.stringify(data));
    }
  }
);

router.post(
  "/edicion/actualizar-usuario",
  isAuthenticated,
  async (req, res) => {
    let { Nombres, Apellidos, Cedula, Direccion, email, password, _id } =
      req.body;
    let validacion1 = await personalDB.find({ Cedula: Cedula });
    validacion1 = validacion1.filter((data) => data._id != _id);
    let validacion2 = await personalDB.find({ Email: email });
    validacion2 = validacion2.filter((data) => data._id != _id);
    if (validacion1.length > 0) {
      let data = {
        status: "error",
        msg: "Ya existe un personal con esa cedula",
      };
      res.send(JSON.stringify(data));
      return;
    } else if (validacion2.length > 0) {
      let data = {
        status: "error",
        msg: "Ya existe un personal con ese email",
      };
      res.send(JSON.stringify(data));
      return;
    } else {
      let personal = await personalDB.findById(_id);
      let usuario = await usersDB.findOne({ email: personal.Email });
      if (usuario.password == password) {
        await usersDB.findByIdAndUpdate(usuario._id, {
          email,
          Nombres,
          Apellidos,
          Cedula,
        });
      } else {
        let nuevoUsuario = new usersDB({});
        password = await nuevoUsuario.encryptPassword(password);
        await usersDB.findByIdAndUpdate(usuario._id, {
          email,
          password,
          Nombres,
          Apellidos,
          Cedula,
        });
      }
      await personalDB.findByIdAndUpdate(_id, {
        Nombres,
        Apellidos,
        Cedula,
        Direccion,
        Email: email,
      });

      let data = {
        status: "ok",
        msg: "Datos personales actualizados correctamente",
      };
      res.send(JSON.stringify(data));
    }
  }
);

router.post(
  "/edicion/actualizar-usuario-afiliado",
  isAuthenticated,
  async (req, res) => {
    let { Nombres, Cedula, email, password, _id } = req.body;
    let validacion1 = await afiliadosFichaDB.find({ Cedula: Cedula });
    validacion1 = validacion1.filter((data) => data._id != _id);
    let validacion2 = await personalDB.find({ Email: email });
    validacion2 = validacion2.filter((data) => data._id != _id);
    if (validacion1.length > 0) {
      let data = {
        status: "error",
        msg: "Ya existe un personal con esa cedula",
      };
      res.send(JSON.stringify(data));
      return;
    } else if (validacion2.length > 0) {
      let data = {
        status: "error",
        msg: "Ya existe un personal con ese email",
      };
      res.send(JSON.stringify(data));
      return;
    } else {
      let personal = await afiliadosFichaDB.findById(_id);
      let usuario = await usersDB.findOne({ email: personal.email });
      if (usuario.password == password) {
        await usersDB.findByIdAndUpdate(usuario._id, {
          email,
          Nombres,
          Cedula,
        });
      } else {
        let nuevoUsuario = new usersDB({});
        password = await nuevoUsuario.encryptPassword(password);
        await usersDB.findByIdAndUpdate(usuario._id, {
          email,
          password,
          Nombres,
          Apellidos,
          Cedula,
        });
      }
      await afiliadosFichaDB.findByIdAndUpdate(_id, {
        Nombre: Nombres,
        Cedula,
        Email: email,
      });

      let data = {
        status: "ok",
        msg: "Datos personales actualizados correctamente",
      };
      res.send(JSON.stringify(data));
    }
  }
);

router.post(
  "/actualizar-foto-perfil",
  isAuthenticated,
  upload.single("imagen"),
  async (req, res) => {
    try {
      let { id } = req.body;
      let personal = await personalDB.findById(id);
      let usuario = await usersDB.findOne({ email: personal.Email });
      if (!req.file) {
        let data = {
          status: "error",
          msg: "Ocurrio en error al cargar la imagen, solo se permiten imagenes con formato png, jpg o jpeg",
        };
        res.send(JSON.stringify(data));
      } else {
        let ruta = req.file.path;
        await cloudinary.v2.uploader.upload(
          ruta,
          {
            public_id: `${req.file.filename}`,
          },
          async (error, result) => {
            if (result) {
              await usersDB.findByIdAndUpdate(usuario._id, {
                RutaImage: result.url,
              });
              await personalDB.findByIdAndUpdate(id, {
                RutaImage: result.url,
              });
              let data = {
                status: "ok",
                image: result.url,
                msg: "Foto de perfil actualizada correctamente",
              };
              res.send(JSON.stringify(data));
            } else {
              let data = {
                status: "error",
                msg: "Ocurrio en error al cargar la imagen, solo se permiten imagenes con formato png, jpg o jpeg",
              };
              res.send(JSON.stringify(data));
            }
          }
        );
      }
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);
router.post(
  "/actualizar-foto-perfil-afiliado",
  isAuthenticated,
  upload.single("imagen"),
  async (req, res) => {
    try {
      let { id } = req.body;
      let personal = await afiliadosFichaDB.findById(id);
      let usuario = await usersDB.findOne({ email: personal.email });
      if (!req.file) {
        let data = {
          status: "error",
          msg: "Ocurrio en error al cargar la imagen, solo se permiten imagenes con formato png, jpg o jpeg",
        };
        res.send(JSON.stringify(data));
      } else {
        let ruta = req.file.path;
        await cloudinary.v2.uploader.upload(
          ruta,
          {
            public_id: `${req.file.filename}`,
          },
          async (error, result) => {
            if (result) {
              await usersDB.findByIdAndUpdate(usuario._id, {
                RutaImage: result.url,
              });
              await afiliadosFichaDB.findByIdAndUpdate(id, {
                RutaImage: result.url,
              });
              let data = {
                status: "ok",
                image: result.url,
                msg: "Foto de perfil actualizada correctamente",
              };
              res.send(JSON.stringify(data));
            } else {
              let data = {
                status: "error",
                msg: "Ocurrio en error al cargar la imagen, solo se permiten imagenes con formato png, jpg o jpeg",
              };
              res.send(JSON.stringify(data));
            }
          }
        );
      }
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);
router.get("/configuracion", isAuthenticated, async (req, res) => {
  let checkedVisibilidad = "";
  let checkedPromocionales = "";
  if (req.user.Visibilidad) {
    checkedVisibilidad = "checked";
  }
  if (req.user.Promociones) {
    checkedPromocionales = "checked";
  }
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  res.render("content/configuracion", {
    Apellido: `${req.user.Apellidos}`,
    checkedVisibilidad,
    checkedPromocionales,
    RutaImage: req.user.RutaImage,
    Tema: req.user.Tema,
    notificaciones,
    _idUsuario: req.user._id,
    RutaImage: req.user.RutaImage,
  });
});

router.post("/configuracion-visibilidad", isAuthenticated, async (req, res) => {
  let cedula = req.user.Cedula;
  let { visibilidad } = req.body;
  let personal = await personalDB.findOne({ Cedula: cedula });
  let usuario = await usersDB.findOne({ email: personal.Email });
  await usersDB.findByIdAndUpdate(usuario._id, {
    Visibilidad: visibilidad,
  });
  await personalDB.findByIdAndUpdate(personal._id, {
    Visibilidad: visibilidad,
  });
  res.send().status(200);
});

router.post("/configuracion-promociones", isAuthenticated, async (req, res) => {
  let cedula = req.user.Cedula;
  let { promociones } = req.body;
  let personal = await personalDB.findOne({ Cedula: cedula });
  let usuario = await usersDB.findOne({ email: personal.Email });
  await usersDB.findByIdAndUpdate(usuario._id, {
    Promociones: promociones,
  });
  await personalDB.findByIdAndUpdate(personal._id, {
    Promociones: promociones,
  });
  res.send().status(200);
});

router.get("/soporte", isAuthenticatedSoporte, async (req, res) => {
  let layout = "main.hbs";
  if (req.user.Role.find((data) => data == "Medico")) {
    layout = "medico.hbs";
  }
  if (req.user.Role.find((data) => data == "Paciente")) {
    layout = "paciente.hbs";
  }
  let subcategorias = await subcategoriasDB.find().sort({ Categoria: 1 });
  let tickets = await ticketDB.find({
    $and: [{ _idUsuario: req.user._id }, { Estado: { $ne: "Anulado" } }],
  });
  tickets = tickets.map((data) => {
    let Color = "warning";
    if (data.Estado == "En proceso") {
      Color = "info";
    }
    if (data.Estado == "Anulado") {
      Color = "danger";
    }
    if (data.Estado == "Cerrado") {
      Color = "success";
    }
    return {
      FechaCompleta: data.FechaCompleta,
      FechaCorta: data.FechaCorta,
      Timestamp: data.Timestamp,
      Usuario: data.Usuario,
      EmailUsuario: data.EmailUsuario,
      _idUsuario: data._idUsuario,
      Numero: data.Numero,
      Estado: data.Estado,
      Categoria: data.Categoria,
      Subcategoria: data.Subcategoria,
      Titulo: data.Titulo,
      Color: Color,
      TipoUsuario: data.TipoUsuario,
      Descripcion: data.Descripcion,
      _id: data._id,
    };
  });
  subcategorias = subcategorias.map((data) => {
    return {
      Categoria: data.Categoria,
    };
  });

  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  res.render("content/soporte", {
    layout,
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    subcategorias,
    tickets,
    RutaImage: req.user.RutaImage,
  });
});

router.get("/calendario", isAuthenticatedHerramientas, async (req, res) => {
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  res.render("content/herramientas/calendario", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    RutaImage: req.user.RutaImage,
  });
});

router.post("/nueva-fecha-calendario", isAuthenticated, async (req, res) => {
  let { start, title, color, id, registrarDuplicado } = req.body;
  let timestamp = Date.now();
  let tipo = "";
  let error = false;
  if (id != "") {
    tipo = "actualizacion";
    await calendarioDB.findOneAndUpdate(
      { id: id },
      {
        start,
        title,
        color,
      }
    );
  } else {
    tipo = "nuevo";
    let validacion = false;
    if (!registrarDuplicado) {
      validacion = await calendarioDB.findOne({ title });
    }
    if (validacion) {
      error = true;
    } else {
      let newFecha = new calendarioDB({
        start: start,
        title: title,
        id: timestamp,
        color: color,
        _idUser: req.user._id,
        email: req.user.email,
        Nombres: req.user.Nombres,
        Apellidos: req.user.Apellidos,
      });
      await newFecha.save();
    }
  }
  let fechas = await calendarioDB.find({ _idUser: req.user._id });
  fechas = fechas.map((data) => {
    return {
      id: data.id,
      start: data.start,
      title: data.title,
      color: data.color,
    };
  });
  if (error) {
    let data = {
      error,
    };
    res.send(JSON.stringify(data));
  } else {
    let data = {
      fechas,
      tipo,
      error,
    };
    res.send(JSON.stringify(data));
  }
});

router.post("/actualizar-fecha-drop", isAuthenticated, async (req, res) => {
  let { id, fecha } = req.body;
  await calendarioDB.findOneAndUpdate(
    { id: id },
    {
      start: fecha,
    }
  );
  let fechas = await calendarioDB.find({ _idUser: req.user._id });
  fechas = fechas.map((data) => {
    return {
      id: data.id,
      start: data.start,
      title: data.title,
      color: data.color,
    };
  });
  res.send(JSON.stringify(fechas));
});

router.post("/eliminar-fecha-calendario", isAuthenticated, async (req, res) => {
  let { id } = req.body;
  await calendarioDB.findOneAndDelete({ id: id });
  let fechas = await calendarioDB.find({ _idUser: req.user._id });
  fechas = fechas.map((data) => {
    return {
      id: data.id,
      start: data.start,
      title: data.title,
      color: data.color,
    };
  });
  let data = {
    fechas,
    tipo: "eliminacion",
  };
  res.send(JSON.stringify(data));
});

router.post(
  "/solicitar-fechas-calendario",
  isAuthenticated,
  async (req, res) => {
    let fechas = await calendarioDB.find({ _idUser: req.user._id });
    fechas = fechas.map((data) => {
      return {
        id: data.id,
        start: data.start,
        title: data.title,
        color: data.color,
      };
    });
    res.send(JSON.stringify(fechas));
  }
);

router.post("/configuracion-tema", isAuthenticated, async (req, res) => {
  let { modo } = req.body;
  await usersDB.findByIdAndUpdate(req.user._id, {
    Tema: modo,
  });
  res.send().status(200);
});

router.get("/registro-examenes", isAuthenticatedData, async (req, res) => {
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();
  let tipos = await tipoExamenDB.find({}).sort({ Nombre: 1 }).lean();
  let especialidades = await especialidadesDB
    .find({})
    .sort({ Nombre: 1 })
    .lean();
  let perfiles = await perfilesDB.find({}).sort({ Nombre: 1 }).lean();

  res.render("content/registro/registro-examenes", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    notificaciones,
    Tema: req.user.Tema,
    tipos,
    especialidades,
    perfiles,
  });
});

router.post("/registro/nuevo-examen", isAuthenticated, async (req, res) => {
  let {
    Nombre,
    Tipo,
    Subtipo1,
    Subtipo2,
    Subtipo3,
    campoTexto,
    AgregadoPosterior,
    Puntos,
    Comisiones,
    Especialidad,
    Perfiles,
    CantidadMaxima,
  } = req.body;
  let timestamp = Date.now();
  let Fecha = new Date();
  let dia;
  let mes;
  let año = Fecha.getFullYear();
  if (Fecha.getDate() < 10) {
    dia = `0${Fecha.getDate()}`;
  } else {
    dia = Fecha.getDate();
  }
  if (Fecha.getMonth() + 1 < 10) {
    mes = `0${Fecha.getMonth() + 1}`;
  } else {
    mes = Fecha.getMonth() + 1;
  }
  let Fecha_Registro = `${dia}/${mes}/${año}`;

  let validacion = await examenDB.findOne({ Nombre: Nombre });
  if (validacion) {
    let data = {
      status: "error",
      msg: "El examen ingresado ya se encuentra registrado.",
    };
    res.send(JSON.stringify(data)).status(200);
  } else {
    let validacionHistorial = await historialActividadDB.findOne({
      _idUsuario: req.user._id,
    });
    if (validacionHistorial) {
      let dataHistorial = {
        Fecha: Fecha_Registro,
        Seccion: "Data - Registro - Examenes",
        Timestamp: timestamp,
        Accion: `Registro de examen ${Nombre}`,
      };
      await historialActividadDB.findByIdAndUpdate(validacionHistorial._id, {
        $push: { Historial: dataHistorial },
      });
    } else {
      let dataHistorial = {
        Fecha: Fecha_Registro,
        Seccion: "Data - Registro - Examenes",
        Timestamp: timestamp,
        Accion: `Registro de examen ${Nombre}`,
      };
      let nuevoHistorialActividad = new historialActividadDB({
        Nombre: `${req.user.Nombres} ${req.user.Apellidos}`,
        _idUsuario: req.user._id,
        Historial: [dataHistorial],
      });
      await nuevoHistorialActividad.save();
    }
    let clase = "text-info";
    if (Comisiones == false) {
      clase = "text-secondary";
    }

    let nuevoExamen = new examenDB({
      Nombre,
      Puntos,
      Tipo,
      SubTipo1: Subtipo1,
      SubTipo2: Subtipo2,
      SubTipo3: Subtipo3,
      CantidadMaxima: CantidadMaxima,
      CampoTexto: campoTexto,
      AgregadoPosterior: AgregadoPosterior,
      Estado: "Activo",
      Fecha_Registro: Fecha_Registro,
      Fecha_Modificacion: Fecha_Registro,
      Usuario_Registro: `${req.user.Nombres} ${req.user.Apellidos}`,
      clase: clase,
      Comisiones: Comisiones,
      Especialidad: Especialidad,
      Perfiles: Perfiles,
    });
    await nuevoExamen.save();
    let data = {
      status: "ok",
      msg: "Examen registrado correctamente",
    };
    res.send(JSON.stringify(data)).status(200);
  }
});

router.get("/directorio-examenes", isAuthenticatedData, async (req, res) => {
  let data = await examenDB.find().sort({ Nombre: 1 }).lean();

  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  res.render("content/directorio/examenes", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    notificaciones,
    Tema: req.user.Tema,
    data,
  });
});

router.get(
  "/edicion/editar-examenes/:id",
  isAuthenticatedData,
  async (req, res) => {
    let examen = await examenDB.findById(req.params.id).lean();
    let textoCampoTexto = "No";
    let historial = await historialExamenesDB.findOne({
      _idExamen: req.params.id,
    });
    let Historial = [];

    examen.Checked = examen.Comisiones == true ? "checked" : "";
    examen.campoTexto = examen.CampoTexto == true ? "Si" : "No";

    let especialidades = await especialidadesDB
      .find()
      .sort({ Nombre: 1 })
      .lean();
    if (examen.Especialidad) {
      for (i = 0; i < examen.Especialidad.length; i++) {
        especialidades = especialidades.filter(
          (data) => data.Nombre != examen.Especialidad[i]
        );
      }
    }
    let perfiles = await perfilesDB.find().sort({ Nombre: 1 }).lean();
    if (examen.Perfiles) {
      for (i = 0; i < examen.Perfiles.length; i++) {
        perfiles = perfiles.filter((data) => data.Nombre != examen.Perfiles[i]);
      }
    }

    if (historial) {
      Historial = historial.Historial;
    }

    Historial = Historial.map((data) => {
      return {
        Timestamp: data.Timestamp,
        Numero: data.Numero,
        TipoExamen: data.TipoExamen,
        Medico: data.Medico,
        Paciente: data.Paciente,
        Puntos: data.Puntos,
        Fecha: data.Fecha,
        perfiles: perfiles,
      };
    });

    if (examen.CampoTexto == true) {
      textoCampoTexto = "Si";
    }

    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();
    let tipos = await tipoExamenDB.find({}).sort({ Nombre: 1 });
    tipos = tipos.map((data) => {
      return {
        Nombre: data.Nombre,
      };
    });
    tipos = tipos.filter((data) => data.Nombre != examen.Tipo);
    let CampoTexto = [
      {
        Valor: false,
        Texto: "No",
      },
      {
        Valor: true,
        Texto: "Si",
      },
    ];
    let Estados = ["Activo", "Inactivo"];
    Estados = Estados.filter((data) => data != examen.Estado);
    CampoTexto = CampoTexto.filter((data) => data.Valor != examen.CampoTexto);

    res.render("content/directorio/edicion/examenes", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      notificaciones,
      Tema: req.user.Tema,
      tipos,
      CampoTexto,
      Estados,
      Historial,
      examen,
      especialidades,
      perfiles,
    });
  }
);

router.post("/edicion/actualizar-examen", isAuthenticated, async (req, res) => {
  let {
    _id,
    Nombre,
    Tipo,
    Subtipo1,
    Subtipo2,
    Subtipo3,
    AgregadoPosterior,
    Estado,
    campoTexto,
    Puntos,
    Especialidad,
    Perfiles,
    Comisiones,
    CantidadMaxima,
  } = req.body;
  let validacion = await examenDB.findOne({ Nombre: Nombre });
  if (validacion) {
    if (validacion._id != _id) {
      let data = {
        status: "error",
        msg: "Ya existe un examen con ese nombre",
      };
      res.send(JSON.stringify(data));
    }
  }
  let Fecha = new Date();
  let dia;
  let mes;
  let año = Fecha.getFullYear();
  if (Fecha.getDate() < 10) {
    dia = `0${Fecha.getDate()}`;
  } else {
    dia = Fecha.getDate();
  }
  if (Fecha.getMonth() + 1 < 10) {
    mes = `0${Fecha.getMonth() + 1}`;
  } else {
    mes = Fecha.getMonth() + 1;
  }
  let Fecha_Modificacion = `${dia}/${mes}/${año}`;
  await examenDB.findByIdAndUpdate(_id, {
    Nombre,
    Tipo,
    SubTipo1: Subtipo1,
    SubTipo2: Subtipo2,
    SubTipo3: Subtipo3,
    AgregadoPosterior,
    Estado,
    CantidadMaxima,
    Puntos,
    CampoTexto: campoTexto == "No" ? false : true,
    Fecha_Modificacion,
    Especialidad,
    Perfiles,
    Comisiones,
  });
  let data = {
    status: "ok",
    msg: "Examen actualizado correctamente",
  };
  res.send(JSON.stringify(data)).status(200);
});

router.get("/contactos", isAuthenticatedRed, async (req, res) => {
  let usuarios = await usersDB.find().sort({ Nombres: 1, Apellidos: 1 });
  usuarios = usuarios.filter((data) => data.Cedula != req.user.Cedula);
  for (i = 0; i < usuarios.length; i++) {
    let validacion = req.user.Contactos.find(
      (data) => data.toString() == usuarios[i]._id.toString()
    );
    if (validacion) {
      usuarios[i].Contacto = false;
    } else {
      usuarios[i].Contacto = true;
    }
  }
  usuarios = usuarios.map(async (data) => {
    if (data.TipoUsuario === "Personal") {
      return {
        _id: data._id,
        TipoUsuario: data.TipoUsuario,
        Nombres: data.Nombres,
        Apellidos: data.Apellidos,
        LinkPerfil: false,
        email: data.email,
        Contacto: data.Contacto,
        Especialidad: "",
        RutaImage: data.RutaImage,
      };
    } else if (data.TipoUsuario === "Medico") {
      let medico = await medicoDB.findOne({ Email: data.email }).lean();
      return {
        _id: data._id,
        TipoUsuario: data.TipoUsuario,
        Nombres: data.Nombres,
        Apellidos: data.Apellidos,
        LinkPerfil: `/edicion/editar-medico/${data._id}`,
        email: data.email,
        Especialidad: medico.Especialidad,
        Contacto: data.Contacto,
        RutaImage: data.RutaImage,
      };
    } else {
      return {
        _id: data._id,
        TipoUsuario: data.TipoUsuario,
        Nombres: data.Nombres,
        Apellidos: data.Apellidos,
        LinkPerfil: `/edicion/editar-paciente/${data._id}`,
        email: data.email,
        Especialidad: "",
        Contacto: data.Contacto,
        RutaImage: data.RutaImage,
      };
    }
  });

  usuarios = await Promise.all(usuarios);

  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  res.render("content/social/contactos", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    usuarios,
  });
});

router.post("/red/contactos/agregar/:id", isAuthenticated, async (req, res) => {
  let { id } = req.params;
  let validacion = false;
  for (i = 0; i < req.user.Contactos.length; i++) {
    if (req.user.Contactos[i].toString() === id.toString()) {
      validacion = true;
    }
  }
  if (validacion) {
    let data = {
      status: "error",
      msg: "El usuario ya se encuentra en su lista de contactos",
    };
    res.send(JSON.stringify(data)).status(200);
  } else {
    console.log(req.user._id);
    console.log(id);
    await usersDB.findByIdAndUpdate(req.user._id, {
      $push: { Contactos: id },
    });
    await usersDB.findByIdAndUpdate(id, {
      $push: { Contactos: req.user._id },
    });

    let data = {
      status: "success",
      msg: "Contacto agregado correctamente",
    };
    res.send(JSON.stringify(data)).status(200);
  }
});

router.get("/Chat", isAuthenticatedRed, async (req, res, next) => {
  try {
    let contactos2 = req.user.Contactos;
    let contactosAgregados = [];
    let notificaciones = await notificacionDB
      .find({
        $and: [
          { _idUsuario: req.user._id },
          { Notificacion: true },
          { Tipo: "chat" },
        ],
      })
      .sort({ Timestamp: -1 });
    let contactos = [];

    for (r = 0; r < contactos2.length; r++) {
      let usuarioExiste = await usersDB.findById(contactos2[r]);
      if (usuarioExiste) {
        contactos.push(contactos2[r]);
      }
    }

    for (i = 0; i < notificaciones.length; i++) {
      await notificacionDB.findByIdAndUpdate(notificaciones[i]._id, {
        Notificacion: false,
      });
    }
    notificaciones = await notificacionDB
      .find({
        $and: [
          { _idUsuario: req.user._id },
          { Notificacion: true },
          { Tipo: "chat" },
        ],
      })
      .sort({ Timestamp: -1 })
      .limit(5);
    for (i = 0; i < contactos.length; i++) {
      let chat = await chatDB.findOne({
        $or: [
          {
            $and: [
              { _idUsuario1: req.user._id },
              { _idUsuario2: contactos[i] },
            ],
          },
          {
            $and: [
              { _idUsuario1: contactos[i] },
              { _idUsuario2: req.user._id },
            ],
          },
        ],
      });
      mensajes = {
        Usuario: false,
        _idUsuario: false,
        Timestamp: false,
        Tiempo: "",
        RutaImagen: false,
        Mensaje: "",
        Posicion: false,
        Notificacion: false,
      };
      if (chat) {
        mensajes = chat.Mensajes[chat.Mensajes.length - 1];
        contactos[i].Mensajes = mensajes;
      }
      contactosAgregados.push(await usersDB.findById(contactos[i]).lean());
      let mensajeAgregar = mensajes.Mensaje.toString()
        .substring(0, 20)
        .concat("...");
      contactosAgregados[i].Tiempo = mensajes.Tiempo;
      contactosAgregados[i].Mensaje = mensajeAgregar;
      contactosAgregados[i].Timestamp = mensajes.Timestamp;
      contactosAgregados[i].Notificacion = mensajes.Notificacion;
      if (mensajes._idUsuario == req.user._id) {
        contactosAgregados[i].Notificacion = false;
      }
    }
    contactosAgregados.sort(function (a, b) {
      if (a.Tiempo > b.Tiempo) {
        return -1;
      }
      if (a.Tiempo < b.Tiempo) {
        return 1;
      }
      return 0;
    });
    contactosAgregados = contactosAgregados.map((data) => {
      return {
        Nombres: data.Nombres,
        Apellidos: data.Apellidos,
        Cedula: data.Cedula,
        TipoUsuario: data.TipoUsuario,
        Role: data.Role,
        Contactos: data.Contactos,
        email: data.email,
        RutaImage: data.RutaImage,
        _idReq: req.user._id,
        _id: data._id,
        Mensaje: data.Mensaje,
        Tiempo: data.Tiempo,
        Timestamp: data.Timestamp,
        Notificacion: data.Notificacion,
      };
    });
    contactosAgregados.sort(function (a, b) {
      if (a.Timestamp > b.Timestamp) {
        return -1;
      }
      if (a.Timestamp < b.Timestamp) {
        return 1;
      }
      return 0;
    });

    res.render("content/social/chat", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      notificaciones,
      Tema: req.user.Tema,
      contactosAgregados,
    });
  } catch (err) {
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.post("/chat/abrir", isAuthenticated, async (req, res, next) => {
  try {
    let { _id, _idReq } = req.body;
    let chat = await chatDB.findOne({
      $or: [
        { _idUsuario1: _idReq, _idUsuario2: _id },
        { _idUsuario1: _id, _idUsuario2: _idReq },
      ],
    });
    let mensajes = [];
    if (chat) {
      mensajes = chat.Mensajes.map((data) => {
        if (data._idUsuario == req.user._id) {
          data.Posicion = "odd";
        } else {
          data.Posicion = "";
        }
        return {
          Usuario: data.Usuario,
          _idUsuario: data._idUsuario,
          Timestamp: data.Timestamp,
          Tiempo: data.Tiempo,
          RutaImagen: data.RutaImagen,
          Mensaje: data.Mensaje,
          Posicion: data.Posicion,
        };
      });
      mensajes.sort(function (a, b) {
        if (a.Timestamp > b.Timestamp) {
          return 1;
        }
        if (a.Timestamp < b.Timestamp) {
          return -1;
        }
        return 0;
      });
      let ActualizarMensajes = chat.Mensajes.map((data) => {
        data.Notificacion = false;
        return data;
      });
      await chatDB.findByIdAndUpdate(chat._id, {
        Mensajes: ActualizarMensajes,
      });
    }
    let usuario = await usersDB.findById(_id);
    let data = {
      status: "ok",
      usuario,
      _id: _id,
      _idReq: _idReq,
      mensajes,
      usuarioPersonal: `${req.user.Nombres} ${req.user.Apellidos}`,
      chat,
    };
    res.send(JSON.stringify(data)).status(200);
  } catch (err) {
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.post("/nuevo-tipo-examen", isAuthenticated, async (req, res, next) => {
  try {
    let { Tipo } = req.body;
    Tipo = Tipo.toUpperCase();
    if (await tipoExamenDB.findOne({ Nombre: Tipo })) {
      let data = {
        success: false,
      };
      res.send(JSON.stringify(data));
    } else {
      let nuevoTipo = new tipoExamenDB({
        Nombre: Tipo,
      });
      await nuevoTipo.save();
      let Tipos = await tipoExamenDB.find().sort({ Nombre: 1 });
      let data = {
        success: true,
        Tipos,
      };
      res.send(JSON.stringify(data));
    }
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    next();
  }
});

router.get(
  "/examenes-nuevos",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let examenes = await examenesSDB
        .find({ $and: [{ Estado: "Pendiente" }, { Tipo: "Nuevo" }] })
        .sort({ Timestamp: -1 });
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      examenes = examenes.map((data) => {
        let AplicarDescuento;
        if (data.AplicarDescuento == true) {
          AplicarDescuento = "Si";
        } else {
          AplicarDescuento = "No";
        }
        return {
          Numero: data.Numero,
          Fecha: data.Fecha,
          _id: data._id,
          AplicarDescuento: AplicarDescuento,
          ExamenesTotales: data.ExamenesTotales,
          PuntosTotales: data.PuntosTotales,
          Comision: data.Comision,
          PuntosMedico: data.PuntosMedico,
          Paciente: data.Paciente,
          DocumentoPaciente: data.DocumentoPaciente,
          PuntosDescuento: data.PuntosDescuento,
          Observacion: data.Observacion,
          PuntosNetos: data.PuntosNetos,
          Tipo: data.Tipo,
        };
      });

      res.render("content/servicios/examenes/examenes-nuevos.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        examenes,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get(
  "/examenes-resolicitados",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let examenes = await examenesSDB
        .find({ $and: [{ Tipo: "Resolicitud" }, { Estado: "Pendiente" }] })
        .sort({ Timestamp: -1 });
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      examenes = examenes.map((data) => {
        let AplicarDescuento;
        if (data.AplicarDescuento == true) {
          AplicarDescuento = "Si";
        } else {
          AplicarDescuento = "No";
        }
        return {
          Numero: data.Numero,
          Fecha: data.Fecha,
          _id: data._id,
          AplicarDescuento: AplicarDescuento,
          ExamenesTotales: data.ExamenesTotales,
          PuntosTotales: data.PuntosTotales,
          Comision: data.Comision,
          PuntosMedico: data.PuntosMedico,
          Paciente: data.Paciente,
          DocumentoPaciente: data.DocumentoPaciente,
          PuntosDescuento: data.PuntosDescuento,
          Observacion: data.Observacion,
          PuntosNetos: data.PuntosNetos,
          Tipo: data.Tipo,
          Sucursal: data.Sucursal,
        };
      });

      res.render("content/servicios/examenes/examenes-resolicitados.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        examenes,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.post("/examenes/procesar", isAuthenticated, async (req, res) => {
  try {
    let { Numero } = req.body;
    let examen = await examenesSDB.findOne({ Numero: Numero });
    if (examen.Estado == "Pendiente") {
      let data = {
        status: "success",
      };
      res.send(JSON.stringify(data));
    } else {
      //enviamos error
      let data = {
        status: "error",
      };
      res.send(JSON.stringify(data));
    }
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get(
  "/examenes/procesar/:id",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let examen = await examenesSDB.findOne({ Numero: req.params.id });
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      let paciente = await pacienteDB
        .findOne({ Documento: examen.DocumentoPaciente })
        .lean();

      let textoButton = paciente ? "Paciente registrado" : "Registrar paciente";

      let buttonActive = paciente ? "disabled" : "";

      examen = {
        Fecha: examen.Fecha,
        Timestamp: examen.Timestamp,
        Tipo: examen.Tipo,
        Resolicitado: examen.Resolicitado,
        Numero: examen.Numero,
        ExamenesTotales: examen.ExamenesTotales,
        PuntosTotales: examen.PuntosTotales,
        Comision: examen.Comision,
        PuntosMedico: examen.PuntosMedico,
        Medico: examen.Medico,
        CedulaMedico: examen.CedulaMedico,
        FormaPagoMedico: examen.FormaPagoMedico,
        _idMedico: examen._idMedico,
        Paciente: examen.Paciente,
        DocumentoPaciente: examen.DocumentoPaciente,
        DireccionPaciente: examen.DireccionPaciente,
        FechaNacimientoPaciente: examen.FechaNacimientoPaciente,
        TelefonoPaciente: examen.TelefonoPaciente,
        _idPaciente: examen._idPaciente,
        Observacion: examen.Observacion,
        AplicarDescuento: examen.AplicarDescuento,
        PuntosDescuento: examen.PuntosDescuento,
        PuntosNetos: examen.PuntosNetos,
        Estado: examen.Estado,
        _id: examen._id,
        ListaExamenes: examen.ListaExamenes.map((data) => {
          return {
            id: data.id,
            nombre: data.nombre,
            puntos: data.puntos,
            subtipo: data.subtipo,
            cantidad: data.cantidad,
            tipo: data.tipo,
            agregadoPosterior: data.agregadoPosterior,
          };
        }),
      };
      res.render("content/servicios/examenes/procesar-examen-nuevo.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        paciente,
        textoButton,
        buttonActive,
        examen,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get(
  "/examenes/procesar-resolicitud/:id",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let examen = await examenesSDB.findOne({ Numero: req.params.id });
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      examen = {
        Fecha: examen.Fecha,
        Timestamp: examen.Timestamp,
        Tipo: examen.Tipo,
        Resolicitado: examen.Resolicitado,
        Numero: examen.Numero,
        ExamenesTotales: examen.ExamenesTotales,
        PuntosTotales: examen.PuntosTotales,
        Comision: examen.Comision,
        PuntosMedico: examen.PuntosMedico,
        Medico: examen.Medico,
        CedulaMedico: examen.CedulaMedico,
        FormaPagoMedico: examen.FormaPagoMedico,
        _idMedico: examen._idMedico,
        Paciente: examen.Paciente,
        DocumentoPaciente: examen.DocumentoPaciente,
        DireccionPaciente: examen.DireccionPaciente,
        FechaNacimientoPaciente: examen.FechaNacimientoPaciente,
        TelefonoPaciente: examen.TelefonoPaciente,
        _idPaciente: examen._idPaciente,
        Observacion: examen.Observacion,
        AplicarDescuento: examen.AplicarDescuento,
        PuntosDescuento: examen.PuntosDescuento,
        PuntosNetos: examen.PuntosNetos,
        Estado: examen.Estado,
        _id: examen._id,
        ListaExamenes: examen.ListaExamenes.map((data) => {
          return {
            id: data.id,
            nombre: data.nombre,
            puntos: data.puntos,
            subtipo: data.subtipo,
            tipo: data.tipo,
            agregadoPosterior: data.agregadoPosterior,
          };
        }),
      };
      res.render("content/servicios/examenes/procesar-examen-resolicitud.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        examen,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.post(
  "/examenes/cargar-resultados/:id",
  isAuthenticated,
  uploadFile.single("Resultado"),
  async (req, res, next) => {
    let { Resultados } = req.body;
    let ruta = req.file.path;
    let _idExamen = req.params.id.split("-")[0];
    let documentoPaciente = req.params.id.split("-")[1];
    let sobrante = req.params.id.split("-")[2];
    let examen = await examenesSDB.findById(_idExamen);
    let medico = await medicoDB.findById(examen._idMedico);
    documentoPaciente = sobrante
      ? `${documentoPaciente}-${sobrante}`
      : documentoPaciente;
    let paciente = await pacienteDB.findOne({ Documento: documentoPaciente });
    let usuarioMedico = await usersDB.findOne({ email: medico.Email });
    let usuarioPaciente = await usersDB.findOne({ email: paciente.Email });
    let timestamp = Date.now();
    let Fecha = new Date();
    let dia;
    let mes;
    let año = Fecha.getFullYear();
    if (Fecha.getDate() < 10) {
      dia = `0${Fecha.getDate()}`;
    } else {
      dia = Fecha.getDate();
    }
    if (Fecha.getMonth() + 1 < 10) {
      mes = `0${Fecha.getMonth() + 1}`;
    } else {
      mes = Fecha.getMonth() + 1;
    }
    let FechaAtencion = `${dia}/${mes}/${año}`;

    let Resultado = {
      Ruta: ruta,
    };

    for (i = 0; i < examen.ListaExamenes.length; i++) {
      let validacion = await historialExamenesDB.findOne({
        _idExamen: examen.ListaExamenes[i].id,
      });
      if (validacion) {
        //insertamos
        let dataHistorial = {
          Timestamp: timestamp,
          Numero: examen.Numero,
          TipoExamen: examen.Tipo,
          Medico: examen.Medico,
          Paciente: examen.Paciente,
          Puntos: examen.ListaExamenes[i].puntos,
          Fecha: FechaAtencion,
        };
        await historialExamenesDB.findByIdAndUpdate(validacion._id, {
          $push: { Historial: dataHistorial },
        });
      } else {
        //creamos
        let dataHistorial = {
          Timestamp: timestamp,
          Numero: examen.Numero,
          TipoExamen: examen.Tipo,
          Medico: examen.Medico,
          Paciente: examen.Paciente,
          Puntos: examen.ListaExamenes[i].puntos,
          Fecha: FechaAtencion,
        };
        let nuevoHistorial = new historialExamenesDB({
          Tipo: examen.ListaExamenes[i].tipo,
          Nombre: examen.ListaExamenes[i].nombre,
          _idExamen: examen.ListaExamenes[i].id,
          Historial: [dataHistorial],
        });

        await nuevoHistorial.save();
      }
    }
    let validacionHistorial = await historialActividadDB.findOne({
      _idUsuario: req.user._id,
    });
    if (validacionHistorial) {
      let dataHistorial = {
        Fecha: FechaAtencion,
        Seccion: "Servicios - Examenes - atención de examenes",
        Timestamp: timestamp,
        Accion: `Examen #${examen.Numero} atendido`,
      };
      await historialActividadDB.findByIdAndUpdate(validacionHistorial._id, {
        $push: { Historial: dataHistorial },
      });
    } else {
      let dataHistorial = {
        Fecha: FechaAtencion,
        Seccion: "Servicios - Examenes - atención de examenes",
        Timestamp: timestamp,
        Accion: `Examen #${examen.Numero} atendido`,
      };
      let nuevoHistorialActividad = new historialActividadDB({
        Nombre: `${req.user.Nombres} ${req.user.Apellidos}`,
        _idUsuario: req.user._id,
        Historial: [dataHistorial],
      });
      await nuevoHistorialActividad.save();
    }
    if (examen.Tipo == "Nuevo") {
      if (examen.PuntosMedico > 0) {
        // crear historial,  sumar puntos y enviamos notificacion al doctor y paciente de que el examen se atendio
        let validacionHistorial = await historialPuntosDB.findOne({
          _idMedico: examen._idMedico,
        });
        let PuntosObtenidos = medico.PuntosObtenidos;
        let PuntosCanjeables = (
          +medico.PuntosCanjeables + +examen.PuntosMedico
        ).toFixed(2);
        let Medalla = medico.Medalla; //Evaluar los puntos obtenidos del reciente mes y subir la medalla en base a eso
        let anioEvaluar = moment().format("YYYY");
        //get the textual month with moment
        let mesEvaluar = moment().format("MMMM");
        //first letter uppercase
        mesEvaluar = mesEvaluar.charAt(0).toUpperCase() + mesEvaluar.slice(1);

        let indicadores = await puntosIndicadoresMedicoDB.findOne({
          $and: [
            { _idMedico: medico._id },
            { Anio: anioEvaluar },
            { Mes: mesEvaluar },
          ],
        });
        if (indicadores) {
          let puntosEvaluar = +indicadores.Cantidad + +examen.PuntosMedico;
          let medallaBronce = await medallasDB.find({ Nombre: "Bronce" });
          let medallaPlata = await medallasDB.find({ Nombre: "Plata" });
          let medallaOro = await medallasDB.find({ Nombre: "Oro" });

          if (
            +puntosEvaluar > medallaBronce.Desde &&
            +puntosEvaluar < medallaBronce.Hasta
          ) {
            Medalla = medallaBronce;
          }
          if (
            +puntosEvaluar > medallaPlata.Desde &&
            +puntosEvaluar < medallaPlata.Hasta
          ) {
            Medalla = medallaPlata;
          }
          if (
            +puntosEvaluar > medallaOro.Desde &&
            +puntosEvaluar < medallaOro.Hasta
          ) {
            Medalla = medallaOro;
          }
        }

        //creamos indicadores de puntos comisiones
        let Mes = "";
        switch (mes) {
          case "01":
            Mes = "Enero";
            break;
          case "02":
            Mes = "Febrero";
            break;
          case "03":
            Mes = "Marzo";
            break;
          case "04":
            Mes = "Abril";
            break;
          case "05":
            Mes = "Mayo";
            break;
          case "06":
            Mes = "Junio";
            break;
          case "07":
            Mes = "Julio";
            break;
          case "08":
            Mes = "Agosto";
            break;
          case "09":
            Mes = "Septiembre";
            break;
          case "10":
            Mes = "Octubre";
            break;
          case "11":
            Mes = "Noviembre";
            break;
          case "12":
            Mes = "Diciembre";
        }
        let validacion = await puntosComisionesIndicadoresDB.findOne({
          $and: [{ NumeroMes: mes }, { Anio: año }],
        });
        if (validacion) {
          let Cantidad = (+validacion.Cantidad + +examen.PuntosMedico).toFixed(
            2
          );
          await puntosComisionesIndicadoresDB.findByIdAndUpdate(
            validacion._id,
            {
              Cantidad: Cantidad,
            }
          );
        } else {
          let nuevopuntosComisionesIndicadores =
            new puntosComisionesIndicadoresDB({
              Mes: Mes,
              NumeroMes: mes,
              Cantidad: examen.PuntosMedico,
              Anio: año,
            });
          await nuevopuntosComisionesIndicadores.save();
        }

        //cierre de indicadores de puntos comisiones

        //creamos indicadores de puntos generales
        let validacion2 = await puntosGeneralesIndicadoresDB.findOne({
          $and: [{ NumeroMes: mes }, { Anio: año }],
        });
        if (validacion2) {
          let Cantidad = (+validacion2.Cantidad + +examen.PuntosNetos).toFixed(
            2
          );
          await puntosGeneralesIndicadoresDB.findByIdAndUpdate(
            validacion2._id,
            {
              Cantidad: Cantidad,
            }
          );
        } else {
          let nuevopuntosComisionesIndicadores =
            new puntosGeneralesIndicadoresDB({
              Mes: Mes,
              NumeroMes: mes,
              Cantidad: examen.PuntosNetos,
              Anio: año,
            });
          await nuevopuntosComisionesIndicadores.save();
        }

        //cierre de inidicadores de puntos generales

        //creamos indicadores de puntos comisiones por medico aqui     medico
        let validacionMedico = await puntosIndicadoresMedicoDB.findOne({
          $and: [{ NumeroMes: mes }, { Anio: año }, { _idMedico: medico._id }],
        });
        if (validacionMedico) {
          let Cantidad = (
            +validacionMedico.Cantidad + +examen.PuntosMedico
          ).toFixed(2);
          await puntosIndicadoresMedicoDB.findByIdAndUpdate(
            validacionMedico._id,
            {
              Cantidad: Cantidad,
            }
          );
        } else {
          let nuevopuntosComisionesIndicadores = new puntosIndicadoresMedicoDB({
            _idMedico: medico._id,
            Medico: `${medico.Nombres} ${medico.Apellidos}`,
            Mes: Mes,
            NumeroMes: mes,
            Cantidad: examen.PuntosMedico,
            Anio: año,
          });
          await nuevopuntosComisionesIndicadores.save();
        }

        //cierre de inidicadores de puntos comisiones por medico

        //creamos indicadores de puntos por semana
        let fecha = new Date();
        let dia = fecha.getDay();
        let semana = [
          "Domingo",
          "Lunes",
          "Martes",
          "Miercoles",
          "Jueves",
          "Viernes",
          "Sabado",
        ];

        let validacionSemana = await puntosSemanelesIndicadoresDB.findOne({
          FechaCompleta: FechaAtencion,
        });
        if (validacionSemana) {
          let Cantidad = (
            +validacionSemana.Cantidad + +examen.PuntosTotales
          ).toFixed(2);
          await puntosSemanelesIndicadoresDB.findByIdAndUpdate(
            validacionSemana._id,
            {
              Cantidad: Cantidad,
            }
          );
        } else {
          let nuevoPuntosSemaneles = new puntosSemanelesIndicadoresDB({
            Mes: Mes,
            NumeroMes: mes,
            Anio: año,
            Timestamp: timestamp,
            Dia: semana[dia],
            FechaCompleta: FechaAtencion,
            Cantidad: examen.PuntosTotales,
          });

          await nuevoPuntosSemaneles.save();
        }
        //creacion de puntos semanales por medico
        //aqui
        let validacionSemanaMedico =
          await puntosSemanalesIndicadoresMedicoDB.findOne({
            $and: [{ FechaCompleta: FechaAtencion }, { _idMedico: medico._id }],
          });
        if (validacionSemanaMedico) {
          let Cantidad = (
            +validacionSemanaMedico.Cantidad + +examen.PuntosMedico
          ).toFixed(2);
          await puntosSemanalesIndicadoresMedicoDB.findByIdAndUpdate(
            validacionSemanaMedico._id,
            {
              Cantidad: Cantidad,
            }
          );
        } else {
          let nuevoPuntosSemaneles = new puntosSemanalesIndicadoresMedicoDB({
            _idMedico: medico._id,
            Medico: `${medico.Nombres} ${medico.Apellidos}`,
            Mes: Mes,
            NumeroMes: mes,
            Anio: año,
            Timestamp: timestamp,
            Dia: semana[dia],
            FechaCompleta: FechaAtencion,
            Cantidad: examen.PuntosMedico,
          });

          await nuevoPuntosSemaneles.save();
        }

        //cerre de  indicadores de puntos por semana

        await medicoDB.findByIdAndUpdate(medico._id, {
          Medalla: Medalla.Nombre,
          Comision: Medalla.Comision,
          PuntosObtenidos: PuntosObtenidos,
          PuntosCanjeables: PuntosCanjeables,
        });
        if (+examen.PuntosMedico > 0) {
          if (validacionHistorial) {
            //insertamos historial y sumamos puntos al paciente
            let ultimoHistorial =
              validacionHistorial.Historial[
                validacionHistorial.Historial.length - 1
              ];
            let dataHistorial = {
              Timestamp: timestamp,
              TipoMovimiento: "Ingreso",
              PuntosAnteriores: ultimoHistorial.PuntosActuales,
              PuntosMovidos: examen.PuntosMedico,
              PuntosActuales: (
                +ultimoHistorial.PuntosActuales + +examen.PuntosMedico
              ).toFixed(2),
              Fecha: FechaAtencion,
              Usuario: `${req.user.Nombres} ${req.user.Apellidos}`,
              Comentario: `Ingreso de puntos por examen #${examen.Numero}`,
              Color: "success",
            };
            await historialPuntosDB.findByIdAndUpdate(validacionHistorial._id, {
              $push: { Historial: dataHistorial },
            });
          } else {
            //creamos historial
            let dataHistorial = {
              Timestamp: timestamp,
              TipoMovimiento: "Ingreso",
              PuntosAnteriores: 0,
              PuntosMovidos: examen.PuntosMedico,
              PuntosActuales: examen.PuntosMedico,
              Fecha: FechaAtencion,
              Paciente: examen.Paciente,
              Usuario: `${req.user.Nombres} ${req.user.Apellidos}`,
              Comentario: `Ingreso de puntos por examen #${examen.Numero}`,
              Color: "success",
            };
            let nuevoHistorial = new historialPuntosDB({
              _idMedico: medico._id,
              Medico: `${medico.Nombres} ${medico.Apellidos}`,
              DocumentoMedico: medico.Cedula,
              Historial: [dataHistorial],
            });
            await nuevoHistorial.save();
          }
        }
      }
      //creamos notificacion para el paciente y medico
      if (usuarioPaciente) {
        let nuevaNotificacionPaciente = new notificacionDB({
          _idUsuario: usuarioPaciente._id,
          Timestamp: timestamp,
          Titulo: `Resultados de solicitud #${examen.Numero}`,
          Mensaje: "Resultados",
          Imagen: "/images/icons/icon.png",
          idSocket: paciente.idSocket,
          Tipo: "Examen",
          link: "/paiente/examenes-atendidos",
        });
        await nuevaNotificacionPaciente.save();
      }
      if (usuarioMedico) {
        let nuevaNotificacionMedico = new notificacionDB({
          _idUsuario: usuarioMedico._id,
          Timestamp: timestamp,
          Titulo: `Resultados de solicitud #${examen.Numero}`,
          Mensaje: "Resultados",
          Imagen: "/images/icons/icon.png",
          idSocket: paciente.idSocket,
          Tipo: "Examen",
          link: "/medico/examenes-atendidos",
        });
        await nuevaNotificacionMedico.save();
      }

      await examenesSDB.findByIdAndUpdate(_idExamen, {
        $push: { Resultado: Resultado },
        Resultados: Resultados,
        FechaAtencion: FechaAtencion,
        Sucursal: req.user.Sucursal,
        Paciente: paciente.Nombres,
        DocumentoPaciente: paciente.Documento,
        DireccionPaciente: paciente.Direccion,
        FechaNacimientoPaciente: paciente.FechaNacimiento,
        TelefonoPaciente: paciente.Telefono,
        _idPaciente: paciente._id,
        Estado: "Procesado",
      });

      if (medico.Whatsapp) {
        let mensajesWhatsappMedico = new mensajesWhatsappDB({
          NombreUsuario: `${medico.Nombres} ${medico.Apellidos}`,
          _idUsuario: medico._id,
          Mensaje: `Hola,${medico.Nombres} ${medico.Apellidos}. Se le informa que han sido procesados los resultados del examen #${examen.Numero} correspondientes al paciente ${examen.Paciente}. Para mayor información ingrese a la plataforma de *Club salud*.`,
          Enviado: false,
        });
        await mensajesWhatsappMedico.save();
      }
      if (paciente.Whatsapp) {
        let mensajesWhatsappPaciente = new mensajesWhatsappDB({
          NombreUsuario: `${paciente.Nombres} ${paciente.Apellidos}`,
          _idUsuario: paciente._id,
          Mensaje: `Hola,${paciente.Nombres} ${paciente.Apellidos}. Se le informa que han sido procesados los resultados del examen #${paciente.Numero}. Para mayor información ingrese a la plataforma de *Club salud*.`,
          Enviado: false,
        });
        await mensajesWhatsappPaciente.save();
      }

      let data = {
        status: "success",
        ruta: "/examenes-nuevos",
      };
      res.send(JSON.stringify(data));
    } else {
      //Enviamos notificacion al doctor y paciente de que el examen se atendio
      if (usuarioPaciente) {
        let nuevaNotificacionPaciente = new notificacionDB({
          _idUsuario: usuarioPaciente._id,
          Timestamp: timestamp,
          Titulo: `Resultados de solicitud #${examen.Numero}`,
          Mensaje: "Resultados",
          Imagen: "/images/icons/icon.png",
          idSocket: paciente.idSocket,
          Tipo: "Examen",
          link: "/paiente/examenes-atendidos",
        });
        await nuevaNotificacionPaciente.save();
      }

      let nuevaNotificacionMedico = new notificacionDB({
        _idUsuario: usuarioMedico._id,
        Timestamp: timestamp,
        Titulo: `Resultados de solicitud #${examen.Numero}`,
        Mensaje: "Resultados",
        Imagen: "/images/icons/icon.png",
        idSocket: paciente.idSocket,
        Tipo: "Examen",
        link: "/medico/examenes-atendidos",
      });
      await nuevaNotificacionMedico.save();

      await examenesSDB.findByIdAndUpdate(_idExamen, {
        $push: { Resultado: Resultado },
        Resultados: Resultados,
        FechaAtencion: FechaAtencion,
        Sucursal: req.user.Sucursal,
        Paciente: paciente.Nombres,
        DocumentoPaciente: paciente.Documento,
        DireccionPaciente: paciente.Direccion,
        FechaNacimientoPaciente: paciente.FechaNacimiento,
        TelefonoPaciente: paciente.Telefono,
        _idPaciente: paciente._id,
        Estado: "Procesado",
      });

      if (medico.Whatsapp) {
        let mensajesWhatsappMedico = new mensajesWhatsappDB({
          NombreUsuario: `${medico.Nombres} ${medico.Apellidos}`,
          _idUsuario: medico._id,
          Mensaje: `Hola,${medico.Nombres} ${medico.Apellidos}. Se le informa que han sido procesados los resultados del examen #${examen.Numero} correspondientes al paciente ${examen.Paciente}. Para mayor información ingrese a la plataforma de *Club salud*.`,
          Enviado: false,
        });
        await mensajesWhatsappMedico.save();
      }
      if (paciente.Whatsapp) {
        let mensajesWhatsappPaciente = new mensajesWhatsappDB({
          NombreUsuario: `${paciente.Nombres} ${paciente.Apellidos}`,
          _idUsuario: paciente._id,
          Mensaje: `Hola,${paciente.Nombres} ${paciente.Apellidos}. Se le informa que han sido procesados los resultados del examen #${paciente.Numero}. Para mayor información ingrese a la plataforma de *Club salud*.`,
          Enviado: false,
        });
        await mensajesWhatsappPaciente.save();
      }

      let data = {
        status: "success",
        ruta: "/examenes-resolicitados",
      };
      res.send(JSON.stringify(data));
    }
  }
);

router.get(
  "/examenes-atendidos",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let examenes = await examenesSDB
        .find({ Estado: "Procesado" })
        .sort({ Numero: -1 });
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      examenes = examenes.map((data) => {
        let AplicarDescuento;
        let Resultados;
        if (data.AplicarDescuento == true) {
          AplicarDescuento = "Si";
        } else {
          AplicarDescuento = "No";
        }
        if (data.Resultados == "false") {
          Resultados = true;
        } else {
          Resultados = false;
        }
        return {
          _id: data._id,
          Fecha: data.Fecha,
          FechaAtencion: data.FechaAtencion,
          Tipo: data.Tipo,
          Numero: data.Numero,
          ExamenesTotales: data.ExamenesTotales,
          PuntosTotales: data.PuntosTotales,
          Comision: data.Comision,
          PuntosMedico: data.PuntosMedico,
          Medico: data.Medico,
          CedulaMedico: data.CedulaMedico,
          FormaPagoMedico: data.FormaPagoMedico,
          _idMedico: data._idMedico,
          Paciente: data.Paciente,
          DocumentoPaciente: data.DocumentoPaciente,
          DireccionPaciente: data.DireccionPaciente,
          FechaNacimientoPaciente: data.FechaNacimientoPaciente,
          TelefonoPaciente: data.TelefonoPaciente,
          _idPaciente: data._idPaciente,
          Observacion: data.Observacion,
          AplicarDescuento: AplicarDescuento,
          PuntosDescuento: data.PuntosDescuento,
          PuntosNetos: data.PuntosNetos,
          Estado: data.Estado,
          Resultado: data.Resultado,
          CorreoEnviado: data.CorreoEnviado,
          ListaExamenes: data.ListaExamenes,
          Resultados: Resultados,
          Sucursal: data.Sucursal,
        };
      });

      res.render("content/servicios/examenes/examenes-atendidos.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        examenes,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get("/ver-resultados/:id", async (req, res, next) => {
  try {
    let _id = req.params.id.split(":")[0];
    let examenNumero = req.params.id.split(":")[1];
    let examen = await examenesSDB.findById(_id);
    let resultado = examen.Resultado[examenNumero].Ruta;
    var stream = fs.createReadStream(resultado);
    var filename = `${examen.Paciente} - #${examen.Numero}.pdf`;
    filename = encodeURIComponent(filename);
    res.setHeader("Content-disposition", 'inline; filename="' + filename + '"');
    res.setHeader("Content-type", "application/pdf");
    stream.pipe(res);
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.post(
  "/examenes/rechazar-examen/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      let { ObservacionRechazo } = req.body;
      let Fecha = new Date();
      let timestamp = Date.now();
      let dia;
      let mes;
      let año = Fecha.getFullYear();
      if (Fecha.getDate() < 10) {
        dia = `0${Fecha.getDate()}`;
      } else {
        dia = Fecha.getDate();
      }
      if (Fecha.getMonth() + 1 < 10) {
        mes = `0${Fecha.getMonth() + 1}`;
      } else {
        mes = Fecha.getMonth() + 1;
      }
      let FechaRechazo = `${dia}/${mes}/${año}`;
      let examen = await examenesSDB.findById(req.params.id);
      //Enviar notificacion de rechazo al doctor y paciente
      let validacionHistorial = await historialActividadDB.findOne({
        _idUsuario: req.user._id,
      });
      if (validacionHistorial) {
        let dataHistorial = {
          Fecha: FechaRechazo,
          Seccion: "Servicios - Examenes - rechazo de examenes",
          Timestamp: timestamp,
          Accion: `Examen #${examen.Numero} rechazado`,
        };
        await historialActividadDB.findByIdAndUpdate(validacionHistorial._id, {
          $push: { Historial: dataHistorial },
        });
      } else {
        let dataHistorial = {
          Fecha: FechaRechazo,
          Seccion: "Servicios - Examenes - rechazo de examenes",
          Timestamp: timestamp,
          Accion: `Examen #${examen.Numero} rechazado`,
        };
        let nuevoHistorialActividad = new historialActividadDB({
          Nombre: `${req.user.Nombres} ${req.user.Apellidos}`,
          _idUsuario: req.user._id,
          Historial: [dataHistorial],
        });
        await nuevoHistorialActividad.save();
      }

      if (examen.Tipo == "Nuevo") {
        await examenesSDB.findByIdAndUpdate(req.params.id, {
          ObservacionRechazo,
          FechaRechazo,
          Sucursal: req.user.Sucursal,
          Estado: "Rechazado",
        });
        let data = {
          status: "success",
          ruta: "/examenes-nuevos",
        };
        res.send(JSON.stringify(data));
      } else {
        await examenesSDB.findByIdAndUpdate(req.params.id, {
          ObservacionRechazo,
          FechaRechazo,
          Sucursal: req.user.Sucursal,
          Estado: "Rechazado",
        });
        let data = {
          status: "success",
          ruta: "/examenes-resolicitados",
        };
        res.send(JSON.stringify(data));
      }
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get(
  "/examenes-rechazados",
  isAuthenticatedServicios,
  async (req, res) => {
    try {
      let examenes = await examenesSDB
        .find({ Estado: "Rechazado" })
        .sort({ Timestamp: -1 });
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      examenes = examenes.map((data) => {
        return {
          Fecha: data.Fecha,
          FechaAtencion: data.FechaAtencion,
          FechaRechazo: data.FechaRechazo,
          Timestamp: data.Timestamp,
          Tipo: data.Tipo,
          Resolicitado: data.Resolicitado,
          Numero: data.Numero,
          ExamenesTotales: data.ExamenesTotales,
          PuntosTotales: data.PuntosTotales,
          Comision: data.Comision,
          PuntosMedico: data.PuntosMedico,
          Medico: data.Medico,
          CedulaMedico: data.CedulaMedico,
          FormaPagoMedico: data.FormaPagoMedico,
          _idMedico: data._idMedico,
          Paciente: data.Paciente,
          DocumentoPaciente: data.DocumentoPaciente,
          DireccionPaciente: data.DireccionPaciente,
          FechaNacimientoPaciente: data.FechaNacimientoPaciente,
          TelefonoPaciente: data.TelefonoPaciente,
          _idPaciente: data._idPaciente,
          Observacion: data.Observacion,
          AplicarDescuento: data.AplicarDescuento,
          PuntosDescuento: data.PuntosDescuento,
          PuntosNetos: data.PuntosNetos,
          Estado: data.Estado,
          Resultado: data.Resultado,
          CorreoEnviado: data.CorreoEnviado,
          ComisionCancelada: data.ComisionCancelada,
          ObservacionRechazo: data.ObservacionRechazo,
          Sucursal: data.Sucursal,
        };
      });

      res.render("content/servicios/examenes/examenes-rechazados.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        examenes,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get("/historial-medicos", isAuthenticatedServicios, async (req, res) => {
  try {
    let medicos = await medicoDB.find({}).sort({ Timestamp: -1 });
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    medicos = medicos.map((data) => {
      return {
        Nombres: data.Nombres,
        Apellidos: data.Apellidos,
        Cedula: data.Cedula,
        _id: data._id,
      };
    });
    res.render("content/servicios/historiales/historial-medicos.hbs", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      medicos,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get("/historial-medico/:id", isAuthenticated, async (req, res, next) => {
  try {
    let medico = await medicoDB.findById(req.params.id);
    let examenes = await examenesSDB
      .find({ _idMedico: req.params.id })
      .sort({ Timestamp: -1 });
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    medico = {
      Nombres: medico.Nombres,
      Apellidos: medico.Apellidos,
      Cedula: medico.Cedula,
      Direccion: medico.Direccion,
    };
    examenes = examenes.map((data) => {
      let disabled = false;
      if (data.Resultado.length > 0) {
        disabled = false;
      } else {
        disabled = true;
      }
      return {
        Numero: data.Numero,
        _id: data._id,
        Fecha: data.Fecha,
        Estado: data.Estado,
        Paciente: data.Paciente,
        PuntosTotales: data.PuntosTotales,
        PuntosMedico: data.PuntosMedico,
        PuntosDescuento: data.PuntosDescuento,
        PuntosNetos: data.PuntosNetos,
        disabled: disabled,
        Comision: data.Comision,
      };
    });

    if (req.user.TipoUsuario == "Afiliado") {
      res.render(
        "content/servicios/historiales/historial-medico-afiliado.hbs",
        {
          layout: "afiliado.hbs",
          Apellido: `${req.user.Apellidos}`,
          RutaImage: req.user.RutaImage,
          Nombre: `${req.user.Nombres}`,
          _idUsuario: req.user._id,
          Tema: req.user.Tema,
          notificaciones,
          medico,
          examenes,
        }
      );
    } else {
      res.render("content/servicios/historiales/historial-medico.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        medico,
        examenes,
      });
    }
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get(
  "/historial-pacientes",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let pacientes = await pacienteDB
        .find({})
        .sort({ Nombres: 1, Apellidos: 1 });
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      pacientes = pacientes.map((data) => {
        return {
          Nombres: data.Nombres,
          Apellidos: data.Apellidos,
          Documento: data.Documento,
          Telefono: data.Telefono,
          _id: data._id,
        };
      });
      res.render("content/servicios/historiales/historial-pacientes.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        pacientes,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get("/historial-paciente/:id", isAuthenticated, async (req, res) => {
  try {
    let paciente = await pacienteDB.findOne({ _id: req.params.id });
    let examenes = await examenesSDB
      .find({ _idPaciente: req.params.id })
      .sort({ Numero: -1 });
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    examenes = examenes.map((data) => {
      let disabled = false;
      if (data.Resultado.length > 0) {
        disabled = false;
      } else {
        disabled = true;
      }
      return {
        _id: data._id,
        Fecha: data.Fecha,
        FechaAtencion: data.FechaAtencion,
        FechaRechazo: data.FechaRechazo,
        Timestamp: data.Timestamp,
        Tipo: data.Tipo,
        Resolicitado: data.Resolicitado,
        Numero: data.Numero,
        ExamenesTotales: data.ExamenesTotales,
        PuntosTotales: data.PuntosTotales,
        Comision: data.Comision,
        PuntosMedico: data.PuntosMedico,
        Medico: data.Medico,
        CedulaMedico: data.CedulaMedico,
        FormaPagoMedico: data.FormaPagoMedico,
        _idMedico: data._idMedico,
        Paciente: data.Paciente,
        DocumentoPaciente: data.DocumentoPaciente,
        DireccionPaciente: data.DireccionPaciente,
        FechaNacimientoPaciente: data.FechaNacimientoPaciente,
        TelefonoPaciente: data.TelefonoPaciente,
        _idPaciente: data._idPaciente,
        Observacion: data.Observacion,
        AplicarDescuento: data.AplicarDescuento,
        PuntosDescuento: data.PuntosDescuento,
        PuntosNetos: data.PuntosNetos,
        Estado: data.Estado,
        Resultado: data.Resultado,
        CorreoEnviado: data.CorreoEnviado,
        ComisionCancelada: data.ComisionCancelada,
        ObservacionRechazo: data.ObservacionRechazo,
        ListaExamenes: data.ListaExamenes,
        disabled: disabled,
      };
    });
    paciente = {
      Nombres: paciente.Nombres,
      Apellidos: paciente.Apellidos,
      Documento: paciente.Documento,
      Telefono: paciente.Telefono,
      _id: paciente._id,
    };

    if (req.user.TipoUsuario == "Afiliado") {
      res.render("content/servicios/historiales/historial-paciente.hbs", {
        layout: "afiliado.hbs",
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        examenes,
        paciente,
      });
    } else {
      res.render("content/servicios/historiales/historial-paciente.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        examenes,
        paciente,
      });
    }
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get(
  "/historial-examenes",
  isAuthenticatedServicios,
  async (req, res) => {
    try {
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();
      let examenes = await examenDB.find().sort({ Tipo: 1, Nombre: 1 });
      examenes = examenes.map((data) => {
        return {
          Tipo: data.Tipo,
          Nombre: data.Nombre,
          _id: data._id,
        };
      });

      res.render("content/servicios/historiales/historial-examenes.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        examenes,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get(
  "/historial-examen/:id",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let examen = await examenDB.findById(req.params.id);
      examen = {
        Tipo: examen.Tipo,
        Nombre: examen.Nombre,
      };

      let examenes = await examenesSDB.find().sort({ Timestamp: -1 });
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      examenes = examenes.map((data) => {
        let validacion = false;
        data.ListaExamenes.map((doc) => {
          if (doc.nombre == examen.Nombre) {
            validacion = true;
          }
        });
        if (validacion) {
          let disabled = false;
          if (data.Resultado.length > 0) {
            disabled = false;
          } else {
            disabled = true;
          }
          return {
            Fecha: data.Fecha,
            Numero: data.Numero,
            Estado: data.Estado,
            Paciente: data.Paciente,
            Medico: data.Medico,
            PuntosTotales: data.PuntosTotales,
            Comision: data.Comision,
            PuntosMedico: data.PuntosMedico,
            PuntosNetos: data.PuntosNetos,
            disabled: disabled,
            _id: data._id,
          };
        }
      });
      examenes = examenes.filter((data) => data != undefined);
      res.render("content/servicios/historiales/historial-examen.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        examen,
        examenes,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.post(
  "/soliciat-examenes-tipos",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let examenes = await examenesSDB.find();
      let examenesAtendidos = examenes.filter(
        (data) => data.Estado == "Procesado"
      ).length;
      let examenesRechazados = examenes.filter(
        (data) => data.Estado == "Rechazado"
      ).length;
      let examenesPendientes = examenes.filter(
        (data) => data.Estado == "Pendiente"
      ).length;
      let data = {
        Procesados: examenesAtendidos,
        Pendientes: examenesPendientes,
        Rechazados: examenesRechazados,
      };

      res.send(JSON.stringify(data));
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get("/formato-correo", (req, res) => {
  res.render("content/formato-correo.hbs", {
    layout: false,
  });
});

router.get("/actualizar-precios", async (req, res) => {
  let examenes = await examenDB.find().sort();

  for (i = 0; i < examenes.length; i++) {
    if (examenes[i].Puntos > 0) {
      await examenDB.findByIdAndUpdate(examenes[i]._id, {
        clase: "text-info",
      });
    } else {
      await examenDB.findByIdAndUpdate(examenes[i]._id, {
        clase: "text-secondary",
      });
    }
  }
  res.send("ok");
});

router.get(
  "/examenes/procesar-otros-resultados/:id",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let examen = await examenesSDB.findOne({ Numero: req.params.id });
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      examen = {
        Fecha: examen.Fecha,
        Timestamp: examen.Timestamp,
        Tipo: examen.Tipo,
        Resolicitado: examen.Resolicitado,
        Numero: examen.Numero,
        ExamenesTotales: examen.ExamenesTotales,
        PuntosTotales: examen.PuntosTotales,
        Comision: examen.Comision,
        PuntosMedico: examen.PuntosMedico,
        Medico: examen.Medico,
        CedulaMedico: examen.CedulaMedico,
        FormaPagoMedico: examen.FormaPagoMedico,
        _idMedico: examen._idMedico,
        Paciente: examen.Paciente,
        DocumentoPaciente: examen.DocumentoPaciente,
        DireccionPaciente: examen.DireccionPaciente,
        FechaNacimientoPaciente: examen.FechaNacimientoPaciente,
        TelefonoPaciente: examen.TelefonoPaciente,
        _idPaciente: examen._idPaciente,
        Observacion: examen.Observacion,
        AplicarDescuento: examen.AplicarDescuento,
        PuntosDescuento: examen.PuntosDescuento,
        PuntosNetos: examen.PuntosNetos,
        Estado: examen.Estado,
        _id: examen._id,
        ListaExamenes: examen.ListaExamenes.map((data) => {
          return {
            id: data.id,
            nombre: data.nombre,
            puntos: data.puntos,
            subtipo: data.subtipo,
            tipo: data.tipo,
            agregadoPosterior: data.agregadoPosterior,
          };
        }),
      };
      res.render("content/servicios/examenes/procesar-otros-resultados.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        examen,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.post(
  "/examenes/cargar-otros-resultados/:id",
  isAuthenticated,
  uploadFile.single("Resultado"),
  async (req, res, next) => {
    try {
      let { Resultados } = req.body;
      let ruta = req.file.path;
      Resultado = {
        Ruta: ruta,
      };
      await examenesSDB.findByIdAndUpdate(req.params.id, {
        $push: { Resultado: Resultado },
        Resultados: Resultados,
        Sucursal: req.user.Sucursal,
        Estado: "Procesado",
      });
      let data = {
        status: "success",
        ruta: "/examenes-atendidos",
      };
      res.send(JSON.stringify(data));
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.post("/solicitar-resultados-examen", async (req, res) => {
  let examen = await examenesSDB.findOne({ Numero: req.body.Numero });
  let data = {
    _id: examen._id,
    Resultado: examen.Resultado,
  };
  res.send(JSON.stringify(data));
});

router.get("/formato-correos-electronicos", (req, res) => {
  res.render("content/formato-correo", {
    layout: false,
  });
});

router.get(
  "/Indicadores",
  isAuthenticatedHerramientas,
  async (req, res, next) => {
    try {
      let examenesIndicadores = await examenesIndicadoresDB
        .find()
        .sort({ Anio: -1, NumeroMes: -1 })
        .limit(12);
      let puntosComisionesIndicadores = await puntosComisionesIndicadoresDB
        .find()
        .sort({ Anio: -1, NumeroMes: -1 })
        .limit(12);
      let puntosGeneralesIndicadores = await puntosGeneralesIndicadoresDB
        .find()
        .sort({ Anio: -1, NumeroMes: -1 })
        .limit(12);
      let medicosIndicadores = await medicosIndicadoresDB
        .find()
        .sort({ Anio: -1, NumeroMes: -1 })
        .limit(12);
      let pacientesIndicadores = await pacientesIndicadoresDB
        .find()
        .sort({ Anio: -1, NumeroMes: -1 })
        .limit(12);
      let visitasIndicadores = await visitasIndicadoresDB
        .find()
        .sort({ Anio: -1, NumeroMes: -1 })
        .limit(12);
      let puntosSemanelesIndicadores = await puntosSemanelesIndicadoresDB
        .find()
        .sort({ Timestamp: -1 })
        .limit(14);
      let medicos = await medicoDB.find().sort({ Nombres: 1, Apellidos: 1 });
      let examenesTotales = 0;
      let puntosComisionesTotales = 0;
      let puntosGeneralesTotales = 0;
      let medicosTotales = 0;
      let pacientesTotales = 0;
      let visitasTotales = 0;
      let semanaActual = 0;
      let semanaPasada = 0;

      medicos = medicos.slice(0, 5);

      medicos.sort(function (a, b) {
        if (a.PuntosObtenidos > b.PuntosObtenidos) {
          return -1;
        }
        if (a.PuntosObtenidos < b.PuntosObtenidos) {
          return 1;
        }
        return 0;
      });
      let topMedicos = medicos.map((data) => {
        let rutaMedalla = "/assets/images/medals/bronze.png";

        if (data.Medalla == "Plata") {
          rutaMedalla = "/assets/images/medals/silver.png";
        }
        if (data.Medalla == "Oro") {
          rutaMedalla = "/assets/images/medals/gold.png";
        }
        return {
          Nombres: data.Nombres,
          Apellidos: data.Apellidos,
          PuntosObtenidos: data.PuntosObtenidos,
          Medalla: rutaMedalla,
        };
      });

      let longitud = puntosSemanelesIndicadores.length;
      let generadoHoy = puntosSemanelesIndicadores[0].Cantidad;
      let fechaHoy = moment().format("DD/MM/YYYY"); //aqui
      if (puntosSemanelesIndicadores[0].FechaCompleta != fechaHoy) {
        generadoHoy = 0;
      }

      puntosSemanelesIndicadores.forEach((item, index) => {
        if (longitud < 14) {
          if (index < 7) {
            semanaActual += +item.Cantidad;
          }
        } else {
          if (index < 7) {
            semanaActual += +item.Cantidad;
          } else {
            semanaPasada += +item.Cantidad;
          }
        }
      });

      semanaActual = semanaActual.toFixed(2);
      semanaPasada = semanaPasada.toFixed(2);

      //calculo porcentaje visitas
      visitasIndicadores.forEach((item) => {
        visitasTotales += +item.Cantidad;
      });
      let iterador =
        visitasIndicadores.length > 0 ? visitasIndicadores[0].Cantidad : 0;
      let porcentajeVisitas = iterador * 100;
      if (visitasIndicadores.length == 1) {
        porcentajeVisitas = 100;
      } else if (visitasIndicadores.length > 1) {
        porcentajeVisitas =
          +porcentajeVisitas / +visitasIndicadores[1].Cantidad;
        porcentajeVisitas = (+porcentajeVisitas - 100).toFixed(2);
      }
      let dataPorcentajeVisitas;
      if (porcentajeVisitas <= 0) {
        dataPorcentajeVisitas = {
          Porcentaje: porcentajeVisitas,
          Arriba: false,
        };
      } else {
        dataPorcentajeVisitas = {
          Porcentaje: porcentajeVisitas,
          Arriba: true,
        };
      }

      //Cierre calculo porcentaje visitas

      //calculo porcentaje pacientes
      pacientesIndicadores.forEach((item) => {
        pacientesTotales += +item.Cantidad;
      });
      let iteradorPacientes =
        pacientesIndicadores.legth > 0 ? pacientesIndicadores[0].Cantidad : 0;
      let porcentajePacientes = +iteradorPacientes * 100;
      if (pacientesIndicadores.length == 1) {
        porcentajePacientes = 100;
      } else if (pacientesIndicadores.length > 1) {
        porcentajePacientes =
          +porcentajePacientes / +pacientesIndicadores[1].Cantidad;
        porcentajePacientes = (+porcentajePacientes - 100).toFixed(2);
      }
      let dataPorcentajePacientes;
      if (porcentajePacientes <= 0) {
        dataPorcentajePacientes = {
          Porcentaje: porcentajePacientes,
          Arriba: false,
        };
      } else {
        dataPorcentajePacientes = {
          Porcentaje: porcentajePacientes,
          Arriba: true,
        };
      }

      //calculo porcentaje medicos

      //calculo porcentajes medicos

      medicosIndicadores.forEach((item) => {
        medicosTotales += +item.Cantidad;
      });
      let iteradorMedicos =
        medicosIndicadores.length > 0 ? medicosIndicadores[0].Cantidad : 0;
      let porcentajeMedicos = +iteradorMedicos * 100;
      if (medicosIndicadores.length == 1) {
        porcentajeMedicos = 100;
      } else if (medicosIndicadores.length > 1) {
        porcentajeMedicos =
          +porcentajeMedicos / +medicosIndicadores[1].Cantidad;
        porcentajeMedicos = (+porcentajeMedicos - 100).toFixed(2);
      }
      let dataPorcentajeMedicos;
      if (porcentajeMedicos <= 0) {
        dataPorcentajeMedicos = {
          Porcentaje: porcentajeMedicos,
          Arriba: false,
        };
      } else {
        dataPorcentajeMedicos = {
          Porcentaje: porcentajeMedicos,
          Arriba: true,
        };
      }

      //cierre calculo porcentajes medicos

      //Calculo porcentajes puntos comisiones

      puntosComisionesIndicadores.forEach((item) => {
        puntosComisionesTotales += +item.Cantidad;
      });
      let porcentajePuntosComisiones =
        +puntosComisionesIndicadores[0].Cantidad * 100;
      if (puntosComisionesIndicadores.length == 1) {
        porcentajePuntosComisiones = 100;
      } else {
        porcentajePuntosComisiones =
          +porcentajePuntosComisiones /
          +puntosComisionesIndicadores[1].Cantidad;
        porcentajePuntosComisiones = (
          +porcentajePuntosComisiones - 100
        ).toFixed(2);
      }
      let dataPorcentajePuntosComisiones;
      if (porcentajePuntosComisiones <= 0) {
        dataPorcentajePuntosComisiones = {
          Porcentaje: porcentajePuntosComisiones,
          Arriba: false,
        };
      } else {
        dataPorcentajePuntosComisiones = {
          Porcentaje: porcentajePuntosComisiones,
          Arriba: true,
        };
      }
      puntosComisionesTotales = puntosComisionesTotales.toFixed(2);
      //Cierre calculo porcentajes puntos comisiones

      //calculo porccentajes puntos generales
      puntosGeneralesIndicadores.forEach((item) => {
        puntosGeneralesTotales += +item.Cantidad;
      });
      let porcentajePuntosGenerales =
        +puntosGeneralesIndicadores[0].Cantidad * 100;
      if (puntosGeneralesIndicadores.length == 1) {
        porcentajePuntosGenerales = 100;
      } else {
        porcentajePuntosGenerales =
          +porcentajePuntosGenerales / +puntosGeneralesIndicadores[1].Cantidad;
        porcentajePuntosGenerales = (+porcentajePuntosGenerales - 100).toFixed(
          2
        );
      }
      let dataPorcentajePuntosGenerales;
      if (porcentajePuntosGenerales <= 0) {
        dataPorcentajePuntosGenerales = {
          Porcentaje: porcentajePuntosGenerales,
          Arriba: false,
        };
      } else {
        dataPorcentajePuntosGenerales = {
          Porcentaje: porcentajePuntosGenerales,
          Arriba: true,
        };
      }

      puntosGeneralesTotales = puntosGeneralesTotales.toFixed(2);
      //cierre porccentajes puntos generales

      //Calculo procentaje examenes
      examenesIndicadores.forEach((item) => {
        examenesTotales += +item.Cantidad;
      });
      let iteradorExamenes =
        examenesIndicadores.length > 0 ? examenesIndicadores[0].Cantidad : 0;
      let porcentajeExamenes = +iteradorExamenes * 100;
      if (examenesIndicadores.length == 1) {
        porcentajeExamenes = 100;
      } else if (examenesIndicadores.length > 1) {
        porcentajeExamenes =
          +porcentajeExamenes / +examenesIndicadores[1].Cantidad;
        porcentajeExamenes = (+porcentajeExamenes - 100).toFixed(2);
      }
      let dataPorcentajeExamenes;
      if (porcentajeExamenes <= 0) {
        dataPorcentajeExamenes = {
          Porcentaje: porcentajeExamenes,
          Arriba: false,
        };
      } else {
        dataPorcentajeExamenes = {
          Porcentaje: porcentajeExamenes,
          Arriba: true,
        };
      }
      //cierre calculo porcentaje examenes

      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();
      res.render("content/indicadores", {
        layout: "main-indicadores.hbs",
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        dataPorcentajeExamenes,
        examenesTotales,
        puntosComisionesTotales,
        puntosGeneralesTotales,
        dataPorcentajePuntosGenerales,
        dataPorcentajePuntosComisiones,
        dataPorcentajeMedicos,
        medicosTotales,
        generadoHoy,
        dataPorcentajePacientes,
        pacientesTotales,
        dataPorcentajeVisitas,
        topMedicos,
        semanaActual,
        semanaPasada,
        visitasTotales,
        RutaImage: req.user.RutaImage,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get("/notificaciones", isAuthenticated, async (req, res, next) => {
  try {
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    res.render("content/notificaciones", {
      layout: req.user.TipoUsuario == "Personal" ? "main.hbs" : "afiliado.hbs",
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.post("/solicitar-puntos-semanales", async (req, res, next) => {
  try {
    let puntosSemanales = await puntosSemanelesIndicadoresDB
      .find()
      .sort({ Timestamp: -1 })
      .limit(14);
    let semanaActual = [];
    let semanaAnterior = [];
    let dias = [];
    let longitud = puntosSemanales.length;
    let puntosComisionesIndicadores = await puntosComisionesIndicadoresDB
      .find()
      .sort({ Anio: -1, NumeroMes: -1 });
    let puntosGeneralesIndicadores = await puntosGeneralesIndicadoresDB
      .find()
      .sort({ Anio: -1, NumeroMes: -1 });

    let meses = [];
    let puntosBrutos = [];
    let puntosNetos = [];

    puntosGeneralesIndicadores.forEach((item) => {
      meses.push(item.Mes);
      puntosNetos.push(item.Cantidad);
    });
    puntosComisionesIndicadores.forEach((item, index) => {
      let cantidad = (+item.Cantidad + +puntosNetos[index]).toFixed(2);
      puntosBrutos.push(cantidad);
    });

    puntosSemanales.sort(function (a, b) {
      if (a.Timestamp < b.Timestamp) {
        return -1;
      }
      if (a.Timestamp > b.Timestamp) {
        return 1;
      }
      return 0;
    });

    puntosSemanales.forEach((item, index) => {
      if (longitud < 14) {
        if (index < 7) {
          semanaActual.push(item.Cantidad);
        }
      } else {
        if (index < 7) {
          semanaAnterior.push(item.Cantidad);
        } else {
          dias.push(item.Dia);
          semanaActual.push(item.Cantidad);
        }
      }
    });

    let dataEnvio = {
      semanaActual,
      semanaAnterior,
      dias,
      meses,
      puntosBrutos,
      puntosNetos,
    };
    res.send(JSON.stringify(dataEnvio));
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.post("/enviar-correos-electronicos/:id", async (req, res, next) => {
  try {
    let examen = await examenesSDB.findById(req.params.id);
    let medico = await medicoDB.findById(examen._idMedico);
    let paciente = await pacienteDB.findById(examen._idPaciente);
    let resultados = examen.Resultado.filter((data) => data.Enviado == false);
    let resultadosEnviados = examen.Resultado.filter(
      (data) => data.Enviado == true
    );
    resultados.forEach((item) => {
      item.Enviado = true;
      resultadosEnviados.push(item);
    });
    resultados = resultados.map((data) => {
      return {
        filename: data.Ruta.substring(22, data.Ruta.length),
        path: data.Ruta,
        contentType: "application/pdf",
      };
    });

    let footer = "Gracias por formar parte de la familia Club Salud",
      btnTexto = "Iniciar sesión",
      btnUrl = "https://app.clubsaludve.com/",
      content = `
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            Los resultados de la solicitud <strong>#${examen.Numero}</strong> del paciente <strong>${examen.Paciente}</strong> ya se encuentran listos. Los resultados fueron adjuntados en este correo. 
        </p> </br>
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            Usted obtuvo <strong>${examen.PuntosMedico}</strong> puntos. Si desea visualizar
            los puntos en su cuenta, por favor cliquee el botón de "Iniciar sesión" y será
            redireccionado a la plataforma. 
        </p> </br>
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            No compartas este correo ni la información del mismo con nadie.
        </p> </br>`,
      titulo = `Resultados de solicitud`;
    const htmlContent = sendEmail(footer, btnTexto, btnUrl, content, titulo);
    const info = transporter
      .sendMail({
        from: "<no-reply@clubsaludve.com>",
        to: medico.Email,
        subject: `Resultados de solicitud #${examen.Numero} - Paciente: ${examen.Paciente}`,
        html: htmlContent,
        attachments: resultados,
      })
      .then((data) => {})
      .catch((err) => {
        console.log(err);
      });

    await examenesSDB.findByIdAndUpdate(req.params.id, {
      Resultado: resultadosEnviados,
      Sucursal: req.user.Sucursal,
    });

    res.send(JSON);
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.post(
  "/enviar-correos-electronicos-otros/:id",
  async (req, res, next) => {
    try {
      let examen = await examenesSDB.findById(req.params.id);
      let medico = await medicoDB.findById(examen._idMedico);
      let paciente = await pacienteDB.findById(examen._idPaciente);
      let resultados = examen.Resultado.filter((data) => data.Enviado == false);
      let resultadosEnviados = examen.Resultado.filter(
        (data) => data.Enviado == true
      );
      resultados.forEach((item) => {
        item.Enviado = true;
        resultadosEnviados.push(item);
      });
      resultados = resultados.map((data) => {
        return {
          filename: data.Ruta.substring(22, data.Ruta.length),
          path: data.Ruta,
          contentType: "application/pdf",
        };
      });

      let footer = "Gracias por formar parte de la familia Club Salud",
        btnTexto = "Iniciar sesión",
        btnUrl = "https://app.clubsaludve.com/",
        content = `
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            Los resultados faltantes de la solicitud #${examen.Numero} ya se encuentran listos. Los resultados fueron adjuntados en este correo. 
        </p> </br>
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            En este correo solo se estan adjuntando los resultados faltantes a la solicitud
            #${examen.Numero}, por lo tanto no se sumaran puntos a su cuenta. Si
            desea visualizar el detalle, por favor cliquee el botón de "Iniciar sesión" y será
            redireccionado a la plataforma. 
        </p> </br>
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            No compartas este correo ni la información del mismo con nadie.
        </p> </br>`,
        titulo = `Resultados faltantes`;
      const htmlContent = sendEmail(footer, btnTexto, btnUrl, content, titulo);
      const info = transporter
        .sendMail({
          from: "<no-reply@clubsaludve.com>",
          to: medico.Email,
          subject: `Resultados faltantes examen #${examen.Numero} - Paciente: ${examen.Paciente}`,
          html: htmlContent,
          attachments: resultados,
        })
        .then((data) => {})
        .catch((err) => {
          console.log(err);
        });

      await examenesSDB.findByIdAndUpdate(req.params.id, {
        Resultado: resultadosEnviados,
        Sucursal: req.user.Sucursal,
      });

      res.send(JSON);
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get(
  "/nuevo-examen-admin",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let examenes = await examenDB
        .find({ Estado: "Activo" })
        .sort({ Nombre: 1 });
      let pacientes = await pacienteDB.find().sort({ Nombres: 1 }).lean();
      pacientes = pacientes.filter((paciente) => paciente.Medicos.length > 0);
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .lean()
        .limit(5);
      let tipos = await tipoExamenDB.find({}).sort({ Orden: 1 });
      let especialidades = await especialidadesDB
        .find({})
        .sort({ Nombre: 1 })
        .lean();
      let perfiles = await perfilesDB.find({}).sort({ Orden: 1 }).lean();
      let dataExamenes = [];
      let dataExamenesEspecialidades = [];
      let dataExamenesPerfiles = [];
      for (i = 0; i < tipos.length; i++) {
        let examenesTipo = examenes.filter(
          (data) => data.Tipo == tipos[i].Nombre
        );
        if (examenesTipo.length > 0) {
          let data = {
            Tipo: tipos[i].Nombre,
            Examenes: examenesTipo,
          };
          dataExamenes.push(data);
        }
      }

      dataExamenes = dataExamenes.map((data) => {
        return {
          orden: data.Tipo.replace(/ /g, "-"),
          Tipo: data.Tipo,
          Examenes: data.Examenes.map((doc) => {
            let dosPuntos = false;
            let agregado = false;
            let dataTipos = false;
            if (doc.SubTipo1 || doc.SubTipo1 != "") {
              dataTipos = true;
              dosPuntos = ":";
            }
            if (doc.CampoTexto || doc.CampoTexto != "") {
              agregado = true;
            }
            return {
              Tipo: data.Tipo,
              _id: doc._id,
              Puntos: doc.Puntos,
              Nombre: doc.Nombre,
              dataTipos: dataTipos,
              dosPuntos: dosPuntos,
              CantidadMaxima: doc.CantidadMaxima || 1,
              SubTipo1: doc.SubTipo1,
              OrdenPetitorio: doc.OrdenPetitorio,
              SubTipo2: doc.SubTipo2,
              SubTipo3: doc.SubTipo3,
              agregado: agregado,
              AgregadoPosterior: doc.AgregadoPosterior,
              clase: doc.clase,
              Comisiones: doc.Comisiones,
            };
          }),
        };
      });

      dataExamenes = dataExamenes.map((data) => {
        data.Examenes.sort(function (a, b) {
          if (a.OrdenPetitorio < b.OrdenPetitorio) {
            return -1;
          }
          if (a.OrdenPetitorio > b.OrdenPetitorio) {
            return 1;
          }
          return 0;
        });

        return data;
      });

      //-----Especialidades-----
      for (i = 0; i < especialidades.length; i++) {
        let examenesTipo = examenes.filter((data) =>
          data.Especialidad.includes(especialidades[i].Nombre)
        );
        if (examenesTipo.length > 0) {
          let data = {
            Especialidad: especialidades[i].Nombre,
            Examenes: examenesTipo,
          };
          dataExamenesEspecialidades.push(data);
        }
      }

      dataExamenesEspecialidades.sort(function (a, b) {
        if (b.Examenes.length < a.Examenes.length) {
          return -1;
        }
        if (b.Examenes.length > a.Examenes.length) {
          return 1;
        }
        return 0;
      });

      dataExamenesEspecialidades = dataExamenesEspecialidades.map((data) => {
        return {
          Especialidad: data.Especialidad,
          Examenes: data.Examenes.map((doc) => {
            let dosPuntos = false;
            let agregado = false;
            let dataTipos = false;
            if (doc.SubTipo1 || doc.SubTipo1 != "") {
              dataTipos = true;
              dosPuntos = ":";
            }
            if (doc.CampoTexto || doc.CampoTexto != "") {
              agregado = true;
            }
            return {
              Tipo: data.Especialidad,
              _id: doc._id,
              Puntos: doc.Puntos,
              Nombre: doc.Nombre,
              dataTipos: dataTipos,
              dosPuntos: dosPuntos,
              SubTipo1: doc.SubTipo1,
              SubTipo2: doc.SubTipo2,
              SubTipo3: doc.SubTipo3,
              agregado: agregado,
              AgregadoPosterior: doc.AgregadoPosterior,
              clase: doc.clase,
              Comisiones: doc.Comisiones,
            };
          }),
        };
      });
      //-----Especialidades-----
      for (i = 0; i < perfiles.length; i++) {
        let examenesTipo = examenes.filter((data) =>
          data.Perfiles.includes(perfiles[i].Nombre)
        );
        if (examenesTipo.length > 0) {
          let data = {
            Perfil: perfiles[i].Nombre,
            Puntos: perfiles[i].Precio,
            OrdenPerfi: perfiles[i].Orden,
            Comisiones: true,
            Tipo: "Perfil",
            clase: "text-with",
            _id: perfiles[i]._id,
            Examenes: examenesTipo,
          };
          dataExamenesPerfiles.push(data);
        }
      }

      dataExamenesPerfiles.sort(function (a, b) {
        if (b.OrdenPerfi > a.OrdenPerfi) {
          return -1;
        }
        if (b.OrdenPerfi < a.OrdenPerfi) {
          return 1;
        }
        return 0;
      });

      dataExamenesPerfiles = dataExamenesPerfiles.map((data) => {
        return {
          Perfil: data.Perfil,
          Puntos: data.Puntos,
          Comisiones: data.Comisiones,
          Tipo: data.Tipo,
          clase: data.clase,
          _id: data._id,
          Examenes: data.Examenes.map((doc) => {
            let dosPuntos = false;
            let agregado = false;
            let dataTipos = false;
            return {
              Tipo: data.Perfil,
              _id: doc._id,
              Puntos: doc.Puntos,
              Nombre: doc.Nombre,
              dataTipos: dataTipos,
              dosPuntos: dosPuntos,
              SubTipo1: doc.SubTipo1,
              SubTipo2: doc.SubTipo2,
              SubTipo3: doc.SubTipo3,
              agregado: agregado,
              AgregadoPosterior: doc.AgregadoPosterior,
              clase: doc.clase,
              Comisiones: doc.Comisiones,
              OrdenPerfil: doc.OrdenPerfil.filter(
                (subdata) => subdata.Perfil == data.Perfil
              )[0].Orden,
            };
          }),
        };
      });

      dataExamenesPerfiles = dataExamenesPerfiles.map((data) => {
        data.Examenes.sort(function (a, b) {
          if (a.OrdenPerfil < b.OrdenPerfil) {
            return -1;
          }
          if (a.OrdenPerfil > b.OrdenPerfil) {
            return 1;
          }
          return 0;
        });

        return data;
      });

      res.render("content/servicios/examenes/nuevo-examen.hbs", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        notificaciones,
        Tema: req.user.Tema,
        pacientes,
        dataExamenes,
        dataExamenesEspecialidades,
        dataExamenesPerfiles,
        especialidades,
        perfiles,
      });
    } catch (err) {
      console.log(err);
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      next();
    }
  }
);

router.post("/solicitar-pacientes-examen", async (req, res, next) => {
  try {
    let pacientes = await pacienteDB.find().sort({ Nombres: 1, Apellidos: 1 });
    pacientes = pacientes.map((data) => {
      return {
        Nombres: data.Nombres,
        Apellidos: data.Apellidos,
        _id: data._id,
      };
    });

    res.send(JSON.stringify(pacientes));
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get("/registro-rapido-paciente", async (req, res, next) => {
  try {
    let tipoDocumento = await tipoDocumentoDB.find().sort({ Nombre: 1 }).lean();
    let medicos = await medicoDB.find().sort({ Nombre: 1 });
    medicos = medicos.map((data) => {
      return {
        Nombres: data.Nombres,
        _id: data._id,
        Apellidos: data.Apellidos,
      };
    });
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    res.render("content/registro/registro-pacientes-rapido", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      tipoDocumento,
      RutaImage: req.user.RutaImage,
      medicos,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get(
  "/soporte-admin",
  isAuthenticatedRed,
  isAuthenticatedSoporte,
  async (req, res, next) => {
    try {
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();
      let tickets = await ticketDB.find().sort({ Timestamp: -1 });
      tickets = tickets.map((data) => {
        let Color = "warning";
        if (data.Estado == "En proceso") {
          Color = "info";
        }
        if (data.Estado == "Anulado") {
          Color = "danger";
        }
        if (data.Estado == "Cerrado") {
          Color = "success";
        }
        return {
          Usuario: data.Usuario,
          FechaCorta: data.FechaCorta,
          Numero: data.Numero,
          TipoUsuario: data.TipoUsuario,
          Categoria: data.Categoria,
          FechaCompleta: data.FechaCompleta,
          Subcategoria: data.Subcategoria,
          Estado: data.Estado,
          Color: Color,
          _id: data._id,
        };
      });

      res.render("content/social/soporte", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        tickets,
        RutaImage: req.user.RutaImage,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get(
  "/configuracion-soporte",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let Datasubcategorias = await subcategoriasDB
        .find()
        .sort({ Categoria: 1 });
      Datasubcategorias = Datasubcategorias.map((data) => {
        return {
          Categoria: data.Categoria,
          _id: data._id,
          Subcategorias: data.Subcategorias.map((data2) => {
            return {
              Subcategoria: data2,
              _id: data._id,
            };
          }),
        };
      });
      let categorias = await categoriasDB.find().sort({ Categoria: 1 });
      categorias = categorias.map((data) => ({
        Categoria: data.Categoria,
      }));
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      res.render("content/social/configuracion-soporte", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        categorias,
        Datasubcategorias,
        RutaImage: req.user.RutaImage,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.post(
  "/registrar-nueva-categoria",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let { Categoria } = req.body;

      console.log(Categoria);

      let nuevaCategoria = new categoriasDB({
        Categoria,
      });
      await nuevaCategoria.save();
      let categorias = await categoriasDB.find().sort({ Categoria: 1 });
      res.send(JSON.stringify(categorias));
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.post(
  "/guardar-subcategoria",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let { Subcategorias, Categoria } = req.body;
      let validacion = await subcategoriasDB.findOne({ Categoria: Categoria });
      if (validacion) {
        Subcategorias = [...validacion.Subcategorias, ...Subcategorias];
        await subcategoriasDB.findByIdAndUpdate(validacion._id, {
          Subcategorias: Subcategorias,
        });
      } else {
        let nuevaSubcategoria = new subcategoriasDB({
          Categoria: Categoria,
          Subcategorias: Subcategorias,
        });

        await nuevaSubcategoria.save();
      }
      res.send(JSON.stringify("ok"));
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.post("/actualizar-subcategoria/:id", async (req, res, next) => {
  try {
    let { Subcategorias } = req.body;
    await subcategoriasDB.findByIdAndUpdate(req.params.id, {
      Subcategorias,
    });
    res.send(JSON.stringify("ok"));
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.put(
  "/eliminar-subcategoria/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let { Subcategorias } = req.body;
      if (Subcategorias.length == 0) {
        await subcategoriasDB.findByIdAndDelete(req.params.id);
      } else {
        await subcategoriasDB.findByIdAndUpdate(req.params.id, {
          Subcategorias: Subcategorias,
        });
      }
      res.send(JSON.stringify("ok"));
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.post(
  "/solicitar-subcategoria",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let { Categoria } = req.body;
      let subcategorias = await subcategoriasDB.findOne({ Categoria });
      subcategorias = subcategorias.Subcategorias;
      res.send(JSON.stringify(subcategorias));
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.post(
  "/registrar-nuevo-ticket",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let { Categoria, Subcategoria, Titulo, Descripcion } = req.body;
      let tickets = await ticketDB.find().sort({ Numero: -1 });
      let FechaCompleta = new Date();
      let Timestamp = Date.now();
      let Fecha = new Date();
      let dia;
      let mes;
      let año = Fecha.getFullYear();
      if (Fecha.getDate() < 10) {
        dia = `0${Fecha.getDate()}`;
      } else {
        dia = Fecha.getDate();
      }
      if (Fecha.getMonth() + 1 < 10) {
        mes = `0${Fecha.getMonth() + 1}`;
      } else {
        mes = Fecha.getMonth() + 1;
      }
      let FechaCorta = `${dia}/${mes}/${año}`;
      let Numero = `${dia}${mes}01`;
      let validacion = true;
      for (i = 0; validacion; i++) {
        let validacionInterna = tickets.find((data) => data.Numero == Numero);
        if (validacionInterna) {
          Numero = +Numero + +1;
        } else {
          validacion = false;
        }
      }
      let TipoUsuario = "Administrador";
      if (req.user.Role.find((data) => data == "Medico")) {
        TipoUsuario = "Medico";
      }
      if (req.user.Role.find((data) => data == "Paciente")) {
        TipoUsuario = "Paciente";
      }
      let Usuario = `${req.user.Nombres} ${req.user.Nombres}`;
      let _idUsuario = req.user._id;
      let EmailUsuario = req.user.email;

      let nuevoTicket = new ticketDB({
        FechaCompleta,
        FechaCorta,
        Timestamp,
        Usuario,
        EmailUsuario,
        _idUsuario,
        Estado: "Pendiente",
        Numero,
        TipoUsuario,
        Categoria,
        Subcategoria,
        Titulo,
        Descripcion,
      });

      await nuevoTicket.save();
      //envio de correo a soporte

      const info = transporter
        .sendMail({
          from: "Club Salud VE <soporte@clubsaludve.com>",
          to: `${EmailUsuario} , ${process.env.SUPPORT_EMAIL}`,
          subject: `Ticket #${Numero} ${Categoria}/${Subcategoria}  -  ${Titulo}`,
          text: Descripcion,
        })
        .then((data) => {})
        .catch((err) => {
          console.log(err);
        });
      let usuarios = await usersDB.find({ TipoUsuario: "Personal" }).sort({});
      for (i = 0; i < usuarios.length; i++) {
        let nuevaNotificacion = new notificacionDB({
          _idUsuario: usuarios[i]._id,
          Timestamp: Timestamp,
          Titulo: `Nuevo ticket soporte #${Numero}`,
          Mensaje: "Nuevo ticket",
          Imagen: req.user.RutaImage,
          idSocket: usuarios[i].idSocket,
          Tipo: "Soporte",
          link: "/soporte-admin",
        });
        await nuevaNotificacion.save();
      }

      res.send(JSON.stringify("ok"));
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get("/detalle-ticket/:id", isAuthenticated, async (req, res, next) => {
  try {
    let ticket = await ticketDB.findById(req.params.id);
    let FechaCompleta = ticket.FechaCompleta.substring(
      3,
      ticket.FechaCompleta.length
    );
    let Color = "warning";
    if (ticket.Estado == "En proceso") {
      Color = "info";
    }
    if (ticket.Estado == "Anulado") {
      Color = "danger";
    }
    if (ticket.Estado == "Cerrado") {
      Color = "success";
    }
    ticket = {
      FechaCompleta: FechaCompleta,
      FechaCorta: ticket.FechaCorta,
      Timestamp: ticket.Timestamp,
      Usuario: ticket.Usuario,
      EmailUsuario: ticket.EmailUsuario,
      _idUsuario: ticket._idUsuario,
      Numero: ticket.Numero,
      Estado: ticket.Estado,
      Categoria: ticket.Categoria,
      Subcategoria: ticket.Subcategoria,
      Titulo: ticket.Titulo,
      TipoUsuario: ticket.TipoUsuario,
      Descripcion: ticket.Descripcion,
      Color: Color,
      _id: ticket._id,
    };
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    res.render("content/social/detalle-ticket", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
      ticket,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.put(
  "/cambiar-estado-ticket/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let { Estado } = req.body;

      await ticketDB.findByIdAndUpdate(req.params.id, {
        Estado: Estado,
      });
      res.send(JSON.stringify("ok"));
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get("/canjear-puntos", isAuthenticated, async (req, res, next) => {
  try {
    let medicos = await medicoDB
      .find({ PuntosCanjeables: { $gt: 0 } })
      .sort({ PuntosCanjeables: -1 });
    medicos = medicos.map((data) => {
      return {
        Nombres: data.Nombres,
        Apellidos: data.Apellidos,
        Cedula: data.Cedula,
        PuntosCanjeables: data.PuntosCanjeables,
        _id: data._id,
      };
    });
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    res.render("content/canje/canjear-puntos", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      medicos,
      RutaImage: req.user.RutaImage,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.post("/canje/canjear-puntos", async (req, res, next) => {
  try {
    let { id, fecha, idTransaccion, puntos } = req.body;

    let ultimaConstancia = await constanciasCanjeDB
      .findOne()
      .sort({ Numero: -1 })
      .limit(1);
    let Numero = ultimaConstancia ? +ultimaConstancia.Numero + 1 : 20230000001;
    let medico = await medicoDB.findById(id);
    let puntosPendientes = (+medico.PuntosCanjeables - +puntos).toFixed(2);
    let PuntosCanjeados = (+medico.PuntosCanjeados + +puntos).toFixed(2);

    let FechaRecibo = moment().format("DD/MM/YYYY");
    fecha = moment(fecha).format("DD/MM/YYYY");
    let Timestamp = Date.now();

    let nuevaConstancia = new constanciasCanjeDB({
      _idMedico: id,
      Medico: `${medico.Nombres} ${medico.Apellidos}`,
      Cedula: medico.Cedula,
      PuntosAntes: medico.PuntosCanjeables,
      PuntosMovidos: puntos,
      PuntosPendientes: puntosPendientes,
      FechaRecibo: FechaRecibo,
      FechaPago: fecha,
      Numero: Numero,
      idTransaccion: idTransaccion,
      _idUsuario: req.user._id,
      NombresUsuario: `${req.user.Nombres} ${req.user.Apellidos}`,
      Timestamp: Timestamp,
    });

    let mensajesWhatsapp = new mensajesWhatsappDB({
      NombreUsuario: `${medico.Nombres} ${medico.Apellidos}`,
      _idUsuario: medico._id,
      Mensaje: `${medico.Nombres} ${medico.Apellidos}, se ha realizado un canje de puntos por un valor de ${puntos} puntos. Su saldo pendiente es de ${puntosPendientes} puntos. Para mayor información ingrese a la plataforma de *Club salud*.`,
      Enviado: false,
    });

    if (medico.Whatsapp) {
      await mensajesWhatsapp.save();
    }
    await nuevaConstancia.save();

    await medicoDB.findByIdAndUpdate(id, {
      PuntosCanjeables: puntosPendientes,
      PuntosCanjeados: PuntosCanjeados,
    });

    let dataHistorial = {
      Timestamp: Timestamp,
      TipoMovimiento: "Egreso",
      PuntosAnteriores: medico.PuntosCanjeables,
      PuntosMovidos: puntos,
      PuntosActuales: puntosPendientes,
      Fecha: fecha,
      Usuario: `${req.user.Nombres} ${req.user.Apellidos}`,
      Comentario: `Egreso por canjeo de puntos #${Numero}`,
      Color: "danger",
    };
    await historialPuntosDB.findOneAndUpdate(
      { _idMedico: medico._id },
      {
        $push: { Historial: dataHistorial },
      }
    );

    (footer = "Gracias por formar parte de la familia Club Salud"),
      (btnTexto = "Iniciar sesión"),
      (btnUrl = "https://app.clubsaludve.com/"),
      (content = `
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            Se ha emitido una constancia de canjeo de puntos por un valor de ${puntos} puntos.
        </p> </br>
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            Si desea visualizar la constancia en su cuenta, por favor cliquee el botón de "Iniciar sesión" y será
            redireccionado a la plataforma. 
        </p> </br>
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            No compartas este correo ni la información del mismo con nadie.
        </p> </br>`),
      (titulo = `Canejo de puntos #${Numero}`);
    const htmlContent = sendEmail(footer, btnTexto, btnUrl, content, titulo);
    const info2 = transporter
      .sendMail({
        from: "<no-reply@clubsaludve.com>",
        to: medico.Email,
        subject: `Canejo de puntos #${Numero}`,
        html: htmlContent,
      })
      .then((data) => {})
      .catch((err) => {
        console.log(err);
      });

    res.send(
      JSON.stringify({
        ok: true,
        puntos: puntosPendientes,
      })
    );
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get(
  "/constancias-canjes",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();
      let constancias = await constanciasCanjeDB
        .find()
        .sort({ Timestamp: -1 })
        .lean();
      res.render("content/canje/constancias-canjes", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
        constancias,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get("/ver-constancia/:id", async (req, res, next) => {
  try {
    let constancia = await constanciasCanjeDB
      .findOne({ _id: req.params.id })
      .lean();

    res.render("content/documentos/constancias-puntos", {
      layout: false,
      constancia,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get(
  "/area-examenes",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();
      res.render("content/areas/examenes", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get("/area-historiales", async (req, res, next) => {
  try {
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();
    res.render("content/areas/historiales", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});
router.get("/area-canje", async (req, res, next) => {
  try {
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();
    res.render("content/areas/canje", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get("/area-directorios", async (req, res, next) => {
  try {
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();
    res.render("content/areas/directorio", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get("/registro", async (req, res, next) => {
  try {
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();
    res.render("content/areas/registro", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.post("/nuevo-tipo-especialidad", async (req, res, next) => {
  try {
    let { Especialidad } = req.body;
    let existeEspecialidad = await especialidadesDB.findOne({
      Nombre: Especialidad,
    });
    if (!existeEspecialidad) {
      await especialidadesDB.create({ Nombre: Especialidad });
    }
    let Tipos = await especialidadesDB.find().sort({ Nombre: 1 });
    let data = {
      success: true,
      Tipos,
    };
    res.send(JSON.stringify(data));
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get("/asignar-especialidades", async (req, res, next) => {
  let examenes = await examenDB.find().sort({ Nombre: 1 });
  let especialidades = await especialidadesDB.find().sort({ Nombre: 1 });

  for (i = 0; i < examenes.length; i++) {
    //get a random number between 1 and 5
    let random = Math.floor(Math.random() * 5) + 1;
    let Especialidad = [especialidades[random].Nombre];
    await examenDB.findByIdAndUpdate(examenes[i]._id, { Especialidad });
  }

  res.send("ok");
});

router.get(
  "/registro-perfiles",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      res.render("content/registro/perfiles", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.post("/registro/nuevo-perfil", async (req, res, next) => {
  try {
    let { Nombre, Precio } = req.body;
    let validacion = await perfilesDB.findOne({ Nombre });
    if (validacion) {
      let data = {
        ok: false,
        message:
          "El perfil ingresado ya se encuentra registrado. Por favor, valida y vuelve a intentarlo",
      };

      res.send(JSON.stringify(data));
    } else {
      let nuevoPerfil = new perfilesDB({
        Nombre,
        Precio,
      });

      await nuevoPerfil.save();

      let data = {
        ok: true,
      };

      res.send(JSON.stringify(data));
    }
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    let data = {
      ok: false,
      message:
        "Ocurrio un error con el registro del perfil. Por favor intente de nuevo o contacte con soporte.",
    };
    res.send(JSON.stringify(data));
  }
});

router.get(
  "/solicitudes-canjes",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();
      let solicitudes = await solicitudCanjeDB
        .find()
        .sort({ Numero: -1 })
        .lean();
      solicitudes = solicitudes.map((solicitud) => {
        let color = "";
        if (solicitud.Estado == "Pendiente") {
          color = "warning";
        } else if (solicitud.Estado == "En proceso") {
          color = "info";
        } else if (solicitud.Estado == "Procesado") {
          color = "success";
        } else {
          color = "danger";
        }
        solicitud.color = color;
        return solicitud;
      });

      res.render("content/canje/solicitudes-canjes", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
        solicitudes,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      let data = {
        ok: false,
        message:
          "Ocurrio un error con el registro del perfil. Por favor intente de nuevo o contacte con soporte.",
      };
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get("/registro-canjes", isAuthenticatedData, async (req, res, next) => {
  try {
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();
    res.render("content/registro/canjes", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    let data = {
      ok: false,
      message:
        "Ocurrio un error con el registro del perfil. Por favor intente de nuevo o contacte con soporte.",
    };
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.post("/registro/tipo-canjes", async (req, res, next) => {
  try {
    let { Nombre, Puntos, Descripcion } = req.body;

    let validacion = await tiposCanjesDB.findOne({ Nombre });
    if (validacion) {
      let data = {
        ok: false,
        msg: "El tipo de canje ingresado ya se encuentra registrado. Por favor, valida y vuelve a intentarlo",
      };

      res.send(JSON.stringify(data));
    } else {
      let nuevoTipoCanje = new tiposCanjesDB({
        Nombre: Nombre.toUpperCase(),
        Puntos,
        Descripcion,
      });

      await nuevoTipoCanje.save();

      let data = {
        ok: true,
      };

      res.send(JSON.stringify(data));
    }
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    let data = {
      ok: false,
      msg: "Ocurrio un error con el registro del perfil. Por favor intente de nuevo o contacte con soporte.",
    };

    res.send(JSON.stringify(data));
  }
});

router.get("/tipos-canjes", isAuthenticatedData, async (req, res, next) => {
  try {
    let tiposCanjes = await tiposCanjesDB.find().lean();

    tiposCanjes = tiposCanjes.map((data) => {
      let checked = "";
      if (data.Activo) {
        checked = "checked";
      }
      data.checked = checked;
      return data;
    });

    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();
    res.render("content/directorio/canjes", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
      tiposCanjes,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    let data = {
      ok: false,
      message:
        "Ocurrio un error con el registro del perfil. Por favor intente de nuevo o contacte con soporte.",
    };
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.put("/canje/cambio-estado", async (req, res, next) => {
  try {
    let { id, activo } = req.body;

    await tiposCanjesDB.findByIdAndUpdate(id, { Activo: activo });

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    let data = {
      ok: false,
      message:
        "Ocurrio un error con el registro del perfil. Por favor intente de nuevo o contacte con soporte.",
    };
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get(
  "/edicion/editar-canje/:id",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let canje = await tiposCanjesDB.findById(req.params.id).lean();

      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      res.render("content/directorio/edicion/canjes", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
        canje,
      });
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.put(
  "/edicion/tipo-canjes",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let { Nombre, Puntos, Descripcion, _id } = req.body;

      await tiposCanjesDB.findOneAndUpdate(_id, {
        Nombre,
        Puntos,
        Descripcion,
      });

      let data = {
        ok: true,
      };

      res.send(JSON.stringify(data));
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      let data = {
        ok: false,
        msg: "Ocurrio un error con el registro del perfil. Por favor intente de nuevo o contacte con soporte.",
      };
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.put(
  "/api/canje/atender-solicitud/:id",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      await solicitudCanjeDB.findOneAndUpdate(
        { Numero: req.params.id },
        { Estado: req.body.estado }
      );

      if (req.body.estado == "Procesado") {
        let solicitud = await solicitudCanjeDB
          .findOne({ Numero: req.params.id })
          .lean();
        let medico = await medicoDB
          .findOne({ _id: solicitud._idMedico })
          .lean();
        let validacionHistorial = await historialPuntosDB.findOne({
          _idMedico: solicitud._idMedico,
        });
        let FechaAtencion = moment().format("DD/MM/YYYY");
        let PuntosCanjeados = (
          +medico.PuntosCanjeados + +solicitud.PuntosCanjeados
        ).toFixed(2);
        let PuntosCanjeables = (
          +medico.PuntosCanjeables - +solicitud.PuntosCanjeados
        ).toFixed(2);
        let dataHistorial = {
          Timestamp: Date.now(),
          TipoMovimiento: "Egreso",
          PuntosAnteriores: medico.PuntosCanjeables,
          PuntosMovidos: solicitud.PuntosCanjeados,
          PuntosActuales: PuntosCanjeables,
          Fecha: FechaAtencion,
          Usuario: `${req.user.Nombres} ${req.user.Apellidos}`,
          Comentario: `Egreso de puntos por solicitud de canje #${req.params.id}`,
          Color: "danger",
        };
        await historialPuntosDB.findByIdAndUpdate(validacionHistorial._id, {
          $push: { Historial: dataHistorial },
        });

        await medicoDB.findByIdAndUpdate(medico._id, {
          PuntosCanjeados,
          PuntosCanjeables,
        });

        let ultimaConstancia = await constanciasCanjeDB
          .findOne()
          .sort({ Numero: -1 })
          .limit(1);
        let Numero = ultimaConstancia
          ? +ultimaConstancia.Numero + 1
          : 20230000001;

        let FechaRecibo = moment().format("DD/MM/YYYY");
        let fecha = moment().format("DD/MM/YYYY");
        let Timestamp = Date.now();

        let nuevaConstancia = new constanciasCanjeDB({
          _idMedico: solicitud._idMedico,
          Medico: `${medico.Nombres} ${medico.Apellidos}`,
          Cedula: medico.Cedula,
          PuntosAntes: medico.PuntosCanjeables,
          PuntosMovidos: solicitud.PuntosCanjeados,
          PuntosPendientes: PuntosCanjeables,
          FechaRecibo: FechaRecibo,
          FechaPago: fecha,
          Numero: Numero,
          _idUsuario: req.user._id,
          NombresUsuario: `${req.user.Nombres} ${req.user.Apellidos}`,
          Timestamp: Timestamp,
          TipoCanje: solicitud.TipoCanje,
          _idTipoCanje: solicitud._idTipoCanje,
        });

        await nuevaConstancia.save();

        //Notificacion al medico de que su solicitud fue procesada
        let usuarioMedico = await usersDB
          .findOne({ Cedula: medico.Cedula })
          .lean();
        let nuevaNotificacionMedico = new notificacionDB({
          _idUsuario: usuarioMedico._id,
          Timestamp: Date.now(),
          Titulo: `Solicitud: Canje #${solicitud.Numero} | Procesado`,
          Mensaje: "Canje",
          Imagen: "/images/icons/icon.png",
          idSocket: usuarioMedico.idSocket,
          Tipo: "Canje",
          link: "/medico/solicitud-canjes",
        });
        await nuevaNotificacionMedico.save();
      }

      let data = {
        ok: true,
      };
      res.send(JSON.stringify(data));
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      let data = {
        ok: false,
        msg: "Ocurrio un error con el registro del perfil. Por favor intente de nuevo o contacte con soporte.",
      };
      res.send(JSON.stringify(data));
    }
  }
);

router.get("/exportar-indicadores/:id", async (req, res, next) => {
  try {
    const wb = new xl.Workbook();

    //complete date with hours with moment
    let fecha = moment().format("DD/MM/YYYY HH:mm:ss");

    if (req.params.id == "medicos") {
      let medicos = await medicoDB
        .find()
        .sort({ PuntosObtenidos: -1, Nombres: 1, Apellidos: 1 })
        .lean();

      const ws = wb.addWorksheet(`Rporte-Médicos`);

      const style = wb.createStyle({
        font: {
          color: "#FFFFFF",
          size: 11,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#313a46",
          fgColor: "#313a46",
        },
      });

      ws.cell(1, 1).string("Médico").style(style);
      ws.cell(1, 2).string("Documento").style(style);
      ws.cell(1, 3).string("Email").style(style);
      ws.cell(1, 4).string("Dirección").style(style);
      ws.cell(1, 5).string("Cuenta").style(style);
      ws.cell(1, 6).string("Puntos obtenidos").style(style);
      ws.cell(1, 7).string("Puntos canjeables").style(style);
      ws.cell(1, 8).string("Puntos canjeados").style(style);
      ws.cell(1, 9).string("Medalla").style(style);

      let fila = 2;
      for (let i = 0; i < medicos.length; i++) {
        ws.cell(fila, 1).string(
          `${medicos[i].Nombres} ${medicos[i].Apellidos}`
        );
        ws.cell(fila, 2).string(medicos[i].Cedula);
        ws.cell(fila, 3).string(medicos[i].Email);
        ws.cell(fila, 4).string(medicos[i].Direccion);
        ws.cell(fila, 5).string(medicos[i].Cuenta);
        ws.cell(fila, 6).number(medicos[i].PuntosObtenidos);
        ws.cell(fila, 7).number(medicos[i].PuntosCanjeables);
        ws.cell(fila, 8).number(medicos[i].PuntosCanjeados);
        ws.cell(fila, 9).string(medicos[i].Medalla);
        fila++;
      }

      wb.write(`Reporte medicos ${fecha}.xlsx`, res);
    } else if (req.params.id == "mensual") {
      let puntosComisionesIndicadores = await puntosComisionesIndicadoresDB
        .find()
        .sort({ Anio: -1, NumeroMes: -1 });
      let puntosGeneralesIndicadores = await puntosGeneralesIndicadoresDB
        .find()
        .sort({ Anio: -1, NumeroMes: -1 });

      let meses = [];
      let puntosBrutos = [];
      let puntosNetos = [];

      puntosGeneralesIndicadores.forEach((item) => {
        meses.push({ Mes: item.Mes, Anio: item.Anio });
        puntosNetos.push(item.Cantidad);
      });
      puntosComisionesIndicadores.forEach((item, index) => {
        let cantidad = (+item.Cantidad + +puntosNetos[index]).toFixed(2);
        puntosBrutos.push(cantidad);
      });

      let mesesIterar = [];

      for (i = 0; i < meses.length; i++) {
        let data = {
          Mes: meses[i].Mes,
          Anio: meses[i].Anio,
          PuntosBrutos: puntosBrutos[i],
          PuntosNetos: puntosNetos[i],
        };

        mesesIterar.push(data);
      }

      const ws = wb.addWorksheet("Reporte indicadores mensual");

      const style = wb.createStyle({
        font: {
          color: "#FFFFFF",
          size: 11,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#313a46",
          fgColor: "#313a46",
        },
      });

      ws.cell(1, 1).string("Año").style(style);
      ws.cell(1, 2).string("Mes").style(style);
      ws.cell(1, 3).string("Puntos brutos").style(style);
      ws.cell(1, 4).string("Puntos netos").style(style);

      let fila = 2;
      for (let i = 0; i < mesesIterar.length; i++) {
        ws.cell(fila, 1).number(+mesesIterar[i].Anio);
        ws.cell(fila, 2).string(mesesIterar[i].Mes);
        ws.cell(fila, 3).number(+mesesIterar[i].PuntosBrutos);
        ws.cell(fila, 4).number(+mesesIterar[i].PuntosNetos);
        fila++;
      }

      wb.write(`Reporte indicadores mensual - ${fecha}.xlsx`, res);
    } else {
      let puntosSemanales = await puntosSemanelesIndicadoresDB
        .find()
        .sort({ Timestamp: -1 })
        .limit(14);
      let semanaActual = [];
      let semanaAnterior = [];
      let dias = [];
      let longitud = puntosSemanales.length;

      puntosSemanales.sort(function (a, b) {
        if (a.Timestamp < b.Timestamp) {
          return -1;
        }
        if (a.Timestamp > b.Timestamp) {
          return 1;
        }
        return 0;
      });

      puntosSemanales.forEach((item, index) => {
        if (longitud < 14) {
          if (index < 7) {
            semanaActual.push(item.Cantidad);
          }
        } else {
          if (index < 7) {
            semanaAnterior.push(item.Cantidad);
          } else {
            dias.push({ Dia: item.Dia, Fecha: item.FechaCompleta });
            semanaActual.push(item.Cantidad);
          }
        }
      });

      let semanasIterar = [];

      for (i = 0; i < 7; i++) {
        let data = {
          Dia: dias[i].Dia,
          Fecha: dias[i].Fecha,
          SemanaAnterior: semanaAnterior[i],
          SemanaActual: semanaActual[i],
        };
        semanasIterar.push(data);
      }

      const ws = wb.addWorksheet("Reporte semanal");

      const style = wb.createStyle({
        font: {
          color: "#FFFFFF",
          size: 11,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#313a46",
          fgColor: "#313a46",
        },
      });

      ws.cell(1, 1).string("Fecha").style(style);
      ws.cell(1, 2).string("Día").style(style);
      ws.cell(1, 3).string("Puntos día semana anterior").style(style);
      ws.cell(1, 4).string("Puntos día semana actual").style(style);

      let fila = 2;
      for (let i = 0; i < semanasIterar.length; i++) {
        let semana = semanasIterar[i];
        ws.cell(fila, 1).string(semana.Fecha);
        ws.cell(fila, 2).string(semana.Dia);
        ws.cell(fila, 3).number(+semana.SemanaAnterior);
        ws.cell(fila, 4).number(+semana.SemanaActual);
        fila++;
      }

      wb.write(`Reporte semanal ${fecha}.xlsx`, res);
    }
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    let data = {
      ok: false,
      msg: "Ocurrio un error con el registro del perfil. Por favor intente de nuevo o contacte con soporte.",
    };
    res.send(JSON.stringify(data));
  }
});

router.get("/generar-reporte-puntos-mensuales", async (req, res) => {
  try {
    let examenes = await examenesSDB.find({ Estado: "Procesado" });

    let dataMeses = [];
    const getMonth = (numeroMes) => {
      numeroMes = +numeroMes - 1;
      //return the month with moment js in spansih
      let mes = moment().month(numeroMes).format("MMMM");
      mes = mes.charAt(0).toUpperCase() + mes.slice(1);
      return mes;
    };
    let PuntosTotales = 0;
    let PuntosNetos = 0;

    for (i = 0; i < examenes.length; i++) {
      let examen = examenes[i];
      let codigo = examen.Fecha.split("/");
      let codigoEvaluar = `${codigo[1]}${codigo[2]}`;
      let validacion = dataMeses.find((data) => data.Codigo == codigoEvaluar);
      if (validacion) {
        validacion.PuntosNetos = (
          +validacion.PuntosNetos + +examen.PuntosNetos
        ).toFixed(2);
        validacion.PuntosTotales = (
          +validacion.PuntosTotales + +examen.PuntosTotales
        ).toFixed(2);
        dataMeses = dataMeses.filter((data) => data.Codigo != codigoEvaluar);
        dataMeses.push(validacion);
        PuntosTotales = (+PuntosTotales + +examen.PuntosTotales).toFixed(2);
        PuntosNetos = (+PuntosNetos + +examen.PuntosNetos).toFixed(2);
      } else {
        PuntosTotales = (+PuntosTotales + +examen.PuntosTotales).toFixed(2);
        PuntosNetos = (+PuntosNetos + +examen.PuntosNetos).toFixed(2);
        let data = {
          Codigo: codigoEvaluar,
          Mes: getMonth(codigo[1]),
          Anio: codigo[2],
          PuntosNetos: examen.PuntosNetos,
          PuntosTotales: examen.PuntosTotales,
        };
        dataMeses.push(data);
      }
    }

    res.render("content/documentos/reporte-puntos-mensuales", {
      layout: false,
      dataMeses,
      PuntosTotales,
      PuntosNetos,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    let data = {
      ok: false,
      msg: "Ocurrio un error con el registro del perfil. Por favor intente de nuevo o contacte con soporte.",
    };
    res.send(JSON.stringify(data));
  }
});

router.get("/validacion-diaria-puntos-medicos", async (req, res, next) => {
  try {
    let medicos = await medicoDB.find().select("Nombres").sort({ Nombres: 1 });
    let Fecha = new Date();
    let dia;
    let mes;
    let año = Fecha.getFullYear();
    if (Fecha.getDate() < 10) {
      dia = `0${Fecha.getDate()}`;
    } else {
      dia = Fecha.getDate();
    }
    if (Fecha.getMonth() + 1 < 10) {
      mes = `0${Fecha.getMonth() + 1}`;
    } else {
      mes = Fecha.getMonth() + 1;
    }
    let FechaAtencion = `${dia}/${mes}/${año}`;
    let timestamp = Date.now();
    let fecha = new Date();
    let diaTextual = fecha.getDay();
    let semana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado",
    ];
    let Mes = "";
    switch (mes) {
      case "01":
        Mes = "Enero";
        break;
      case "02":
        Mes = "Febrero";
        break;
      case "03":
        Mes = "Marzo";
        break;
      case "04":
        Mes = "Abril";
        break;
      case "05":
        Mes = "Mayo";
        break;
      case "06":
        Mes = "Junio";
        break;
      case "07":
        Mes = "Julio";
        break;
      case "08":
        Mes = "Agosto";
        break;
      case "09":
        Mes = "Septiembre";
        break;
      case "10":
        Mes = "Octubre";
        break;
      case "11":
        Mes = "Noviembre";
        break;
      case "12":
        Mes = "Diciembre";
    }

    for (i = 0; i < medicos.length; i++) {
      //Validacion semanal
      let medico = medicos[i];
      let validacionSemanaMedico =
        await puntosSemanalesIndicadoresMedicoDB.findOne({
          $and: [{ FechaCompleta: FechaAtencion }, { _idMedico: medico._id }],
        });
      if (!validacionSemanaMedico) {
        let nuevoPuntosSemaneles = new puntosSemanalesIndicadoresMedicoDB({
          _idMedico: medico._id,
          Medico: `${medico.Nombres} ${medico.Apellidos}`,
          Mes: Mes,
          NumeroMes: mes,
          Anio: año,
          Timestamp: timestamp,
          Dia: semana[diaTextual],
          FechaCompleta: FechaAtencion,
          Cantidad: 0,
        });
        await nuevoPuntosSemaneles.save();
      }
      //Cierre validacion semanal
      //validacion mensual
      let validacionMedico = await puntosIndicadoresMedicoDB.findOne({
        $and: [{ NumeroMes: mes }, { Anio: año }, { _idMedico: medico._id }],
      });
      if (!validacionMedico) {
        let nuevopuntosComisionesIndicadores = new puntosIndicadoresMedicoDB({
          _idMedico: medico._id,
          Medico: `${medico.Nombres} ${medico.Apellidos}`,
          Mes: Mes,
          NumeroMes: mes,
          Cantidad: 0,
          Anio: año,
        });
        await nuevopuntosComisionesIndicadores.save();
      }
    }

    res.send(JSON.stringify({ ok: true })).status(200);
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.get(
  "/validacion-diaria-puntos-administracion",
  async (req, res, next) => {
    try {
      let Fecha = new Date();
      let dia;
      let mes;
      let año = Fecha.getFullYear();
      if (Fecha.getDate() < 10) {
        dia = `0${Fecha.getDate()}`;
      } else {
        dia = Fecha.getDate();
      }
      if (Fecha.getMonth() + 1 < 10) {
        mes = `0${Fecha.getMonth() + 1}`;
      } else {
        mes = Fecha.getMonth() + 1;
      }
      let FechaAtencion = `${dia}/${mes}/${año}`;
      let timestamp = Date.now();
      let fecha = new Date();
      let diaTextual = fecha.getDay();
      let semana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miercoles",
        "Jueves",
        "Viernes",
        "Sabado",
      ];
      let Mes = "";
      switch (mes) {
        case "01":
          Mes = "Enero";
          break;
        case "02":
          Mes = "Febrero";
          break;
        case "03":
          Mes = "Marzo";
          break;
        case "04":
          Mes = "Abril";
          break;
        case "05":
          Mes = "Mayo";
          break;
        case "06":
          Mes = "Junio";
          break;
        case "07":
          Mes = "Julio";
          break;
        case "08":
          Mes = "Agosto";
          break;
        case "09":
          Mes = "Septiembre";
          break;
        case "10":
          Mes = "Octubre";
          break;
        case "11":
          Mes = "Noviembre";
          break;
        case "12":
          Mes = "Diciembre";
      }
      //puntos comision
      let validacion = await puntosComisionesIndicadoresDB.findOne({
        $and: [{ NumeroMes: mes }, { Anio: año }],
      });
      if (!validacion) {
        let nuevopuntosComisionesIndicadores =
          new puntosComisionesIndicadoresDB({
            Mes: Mes,
            NumeroMes: mes,
            Cantidad: 0,
            Anio: año,
          });
        await nuevopuntosComisionesIndicadores.save();
      }
      //puntos generales
      let validacion2 = await puntosGeneralesIndicadoresDB.findOne({
        $and: [{ NumeroMes: mes }, { Anio: año }],
      });
      if (!validacion2) {
        let nuevopuntosComisionesIndicadores = new puntosGeneralesIndicadoresDB(
          {
            Mes: Mes,
            NumeroMes: mes,
            Cantidad: 0,
            Anio: año,
          }
        );
        await nuevopuntosComisionesIndicadores.save();
      }
      //puntos semanales
      let validacionSemana = await puntosSemanelesIndicadoresDB.findOne({
        FechaCompleta: FechaAtencion,
      });
      if (!validacionSemana) {
        let nuevoPuntosSemaneles = new puntosSemanelesIndicadoresDB({
          Mes: Mes,
          NumeroMes: mes,
          Anio: año,
          Timestamp: timestamp,
          Dia: semana[diaTextual],
          FechaCompleta: FechaAtencion,
          Cantidad: 0,
        });
        await nuevoPuntosSemaneles.save();
      }
      res.send(JSON.stringify({ ok: true })).status(200);
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      res.render("content/404", {
        layout: "blank",
      });
    }
  }
);

router.get("/consulta-pacientes", async (req, res, next) => {
  try {
    res.render("consulta/consulta", {
      layout: false,
    });
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    res.render("content/404", {
      layout: "blank",
    });
  }
});

router.post("/consulta-paciente", async (req, res, next) => {
  try {
    let { usuario, password } = req.body;

    let paciente = await pacienteDB.findOne({ Documento: usuario }).lean();
    if (paciente) {
      if (paciente.Clave == password) {
        //buscar examenes y resultados
        let examenes = await examenesSDB
          .find({ _idPaciente: paciente._id })
          .lean();

        let fechaNacimiento = paciente.FechaNacimiento;
        let anio = moment().format("YYYY");
        let mes = moment().format("MM");

        let anioNacimiento = fechaNacimiento.split("-")[0];
        let mesNacimiento = fechaNacimiento.split("-")[1];
        paciente.FechaNacimiento = moment(paciente.FechaNacimiento).format(
          "DD/MM/YYYY"
        );

        let edad = anio - anioNacimiento;
        if (mesNacimiento > mes) {
          edad = edad - 1;
        }

        paciente.Imagen = 4;
        if (paciente.Sexo) {
          paciente.Imagen = paciente.Sexo == "Masculino" ? 3 : 4;
        }

        paciente.Edad = edad;

        let data = {
          ok: true,
          examenes,
          paciente,
        };

        res.send(JSON.stringify(data)).status(200);
      } else {
        //error la contraseña es incorrecta
        let data = {
          ok: false,
          msg: "La clave ingresada es incorrecta. Por favor verifique los datos ingresados.",
        };

        res.send(JSON.stringify(data)).status(200);
      }
    } else {
      //error usuario no existe
      let data = {
        ok: false,
        msg: "El usuario ingresado no existe. Por favor verifique los datos ingresados.",
      };

      res.send(JSON.stringify(data)).status(200);
    }
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    let data = {
      ok: false,
      msg: "No hemos podido conseguir los datos. Por favor intente nuevamente mas tarde.",
    };
    res.send(JSON.stringify(data)).status(200);
  }
});

router.post("/recuperar-datos-consulta-pacientes", async (req, res, next) => {
  try {
    let { documento } = req.body;

    let paciente = await pacienteDB.findOne({ Documento: documento }).lean();
    if (paciente) {
      //Return the email of the paciente censured
      let email = paciente.Email;
      let emailCensured = email.split("@")[0];
      let emailCensured2 = emailCensured.split("");
      let emailCensured3 = emailCensured2.map((e, i) => {
        if (i > 2) {
          return "*";
        } else {
          return e;
        }
      });

      emailCensured = emailCensured3.join("") + "@" + email.split("@")[1];

      let data = {
        ok: true,
        correo: emailCensured,
      };

      res.send(JSON.stringify(data)).status(200);
    } else {
      let data = {
        ok: false,
      };
      res.send(JSON.stringify(data)).status(200);
    }
  } catch (err) {
    let fecha = new Date();
    let stack = err.stack;
    console.log(err.stack);
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    let data = {
      ok: false,
      msg: "No hemos podido conseguir los datos. Por favor intente nuevamente mas tarde.",
    };
    res.send(JSON.stringify(data)).status(200);
  }
});

router.post("/recuperar-contrasena", async (req, res, next) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase();
    let usuario = await usersDB.findOne({ email });
    if (usuario) {
      // Ejemplo de uso
      const userId = usuario._id;
      const token = generateToken(userId);

      let footer = "Gracias por formar parte de la familia Club Salud",
        btnTexto = "Recuperar contraseña",
        btnUrl = `https://app.clubsaludve.com/recuperar-contrasena/${userId}`,
        content = `
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
        Haz click en el botón de abajo para recuperar las credenciales de inicio de sesión de tu cuenta de Club Salud.
        </p> </br>`,
        titulo = `Club Salud | Recuperacion de contraseña - ${usuario.Nombres} ${usuario.Apellidos}`;
      const htmlContent = sendEmail(footer, btnTexto, btnUrl, content, titulo);
      transporter
        .sendMail({
          from: "<no-reply@clubsaludve.com>",
          to: email,
          subject: `Club Salud | Recuperacion de contraseña - ${usuario.Nombres} ${usuario.Apellidos}`,
          html: htmlContent,
        })
        .then((data) => {})
        .catch((err) => {
          console.log(err);
        });

      await usersDB.findOneAndUpdate({ email }, { token });
      let data = {
        ok: true,
      };

      res.send(JSON.stringify(data)).status(200);
    } else {
      let data = {
        ok: false,
      };

      res.send(JSON.stringify(data)).status(200);
    }
  } catch (err) {
    console.log(err);

    let data = {
      ok: false,
    };

    res.send(JSON.stringify(data)).status(200);
  }
});

router.get("/recuperar-contrasena/:id", async (req, res, next) => {
  try {
    let usuario = await usersDB.findOne({ _id: req.params.id });
    const decoded = verifyToken(usuario.token);
    if (decoded && decoded.sub === req.params.id) {
      res.render("content/activacion/recuperar-contrasena", {
        id: req.params.id,
        layout: "login",
      });
    } else {
      res.render("content/activacion/link-caducado", {
        layout: "login",
      });
    }
  } catch (err) {
    res.render("/content/404");
  }
});

router.post("/recuperar-contrasena/:id", async (req, res, next) => {
  try {
    let { password } = req.body;
    let usuario = new usersDB({});
    password = await usuario.encryptPassword(password);

    await usersDB.findOneAndUpdate(
      { _id: req.params.id },
      { password, token: "" }
    );

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data)).status(200);
  } catch (err) {
    let data = {
      ok: false,
      message:
        "No hemos podido cambiar la contraseña. Por favor intente nuevamente mas tarde.",
    };

    res.send(JSON.stringify(data)).status(200);
  }
});

router.put(
  "/examenes/finalizar-examen/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let { Resultados } = req.body;

      let examen = await examenesSDB.findOne({ Numero: req.params.id });
      let resultadosExamen = examen.Resultado;

      let pendientes = 0;
      //Procesado
      for (i = 0; i < resultadosExamen.length; i++) {
        if (!resultadosExamen[i].Enviado) {
          pendientes++;
        }
      }

      if (pendientes == 0) {
        let data = {
          ok: false,
          message:
            "No hay resultados recientes disponibles. Por favor, recarga los resultados e inténtalo de nuevo",
        };

        res.send(JSON.stringify(data)).status(200);
      } else {
        await examenesSDB.findOneAndUpdate(
          { Numero: req.params.id },
          {
            Resultados,
            Resultados,
            Sucursal: req.user.Sucursal,
          }
        );
        let data = {
          ok: true,
          _id: examen._id,
        };

        res.send(JSON.stringify(data)).status(200);
      }
    } catch (err) {
      console.log(err);
      let data = {
        ok: false,
        message:
          "No se pudo procesar el examen. Por favor intente nuevamente mas tarde.",
      };

      res.send(JSON.stringify(data)).status(200);
    }
  }
);

router.post(
  "/solicitar-info-medico-comisiones-admin",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let { Cedula } = req.body;
      let medico = await medicoDB.findOne({ Cedula: Cedula }).lean();

      let data = {
        porcentaje: medico.Comision,
        comisiones: medico.PuntosCanjeables,
      };

      res.send(JSON.stringify(data)).status(200);
    } catch (err) {
      console.log(err);
    }
  }
);

router.post("/medico/nuevo-admin", isAuthenticated, async (req, res, next) => {
  try {
    let {
      Paciente,
      listaExamenes,
      Observacion,
      PuntosFinal,
      PuntosDescuento,
      puntosObtenidosMedico,
      puntosTotalesFinales,
      noGeneraComision,
      noGenerarPuntos,
      Medico,
    } = req.body;

    let examenesS = await examenesSDB.find().sort({ Timestamp: -1 });
    let Numero = 2022000001;
    if (examenesS.length > 0) {
      Numero = +examenesS[0].Numero + 1;
    }
    if (noGeneraComision) {
      puntosObtenidosMedico = 0;
    }
    if (noGenerarPuntos) {
      puntosObtenidosMedico = 0;
      puntosTotalesFinales = 0;
      PuntosFinal = 0;
      PuntosDescuento = 0;
    }

    let paciente = await pacienteDB.findById(Paciente);
    let medico = await medicoDB.findById(Medico);
    puntosActualesMedico = medico.PuntosCanjeables;
    let Comision = medico.Comision;
    let Timestamp = Date.now();
    let Fecha = new Date();
    let dia;
    let mes;
    let año = Fecha.getFullYear();
    if (Fecha.getDate() < 10) {
      dia = `0${Fecha.getDate()}`;
    } else {
      dia = Fecha.getDate();
    }
    if (Fecha.getMonth() + 1 < 10) {
      mes = `0${Fecha.getMonth() + 1}`;
    } else {
      mes = Fecha.getMonth() + 1;
    }
    Fecha = `${dia}/${mes}/${año}`;

    let usuarios = await usersDB.find({ TipoUsuario: "Personal" }).sort({});
    for (i = 0; i < usuarios.length; i++) {
      let nuevaNotificacion = new notificacionDB({
        _idUsuario: usuarios[i]._id,
        Timestamp: Timestamp,
        Titulo: `Nueva solicitud de examen de ${medico.Nombres} ${medico.Apellidos}`,
        Mensaje: "Nueva solicitud",
        Imagen: req.user.RutaImage,
        idSocket: usuarios[i].idSocket,
        Tipo: "Examen",
        link: "/examenes-nuevos",
      });
      await nuevaNotificacion.save();
    }
    let PuntosMedico = puntosObtenidosMedico;
    let PuntosNetos = PuntosFinal;
    let AplicarDescuento = false;
    if (+PuntosDescuento > 0) {
      AplicarDescuento = true;
      PuntosMedico = (+puntosObtenidosMedico - +PuntosDescuento).toFixed(2);
    }

    if (+PuntosDescuento >= +puntosObtenidosMedico) {
      PuntosNetos = (+puntosTotalesFinales - +PuntosDescuento).toFixed(2);
    } else {
      PuntosNetos = (
        +puntosTotalesFinales -
        +PuntosMedico -
        +PuntosDescuento
      ).toFixed(2);
    }

    let Mes = "";
    switch (mes) {
      case "01":
        Mes = "Enero";
        break;
      case "02":
        Mes = "Febrero";
        break;
      case "03":
        Mes = "Marzo";
        break;
      case "04":
        Mes = "Abril";
        break;
      case "05":
        Mes = "Mayo";
        break;
      case "06":
        Mes = "Junio";
        break;
      case "07":
        Mes = "Julio";
        break;
      case "08":
        Mes = "Agosto";
        break;
      case "09":
        Mes = "Septiembre";
        break;
      case "10":
        Mes = "Octubre";
        break;
      case "11":
        Mes = "Noviembre";
        break;
      case "12":
        Mes = "Diciembre";
    }
    let validacion = await examenesIndicadoresDB.findOne({
      $and: [{ NumeroMes: mes }, { Anio: año }],
    });
    if (validacion) {
      let Cantidad = +validacion.Cantidad + +listaExamenes.length;
      await examenesIndicadoresDB.findByIdAndUpdate(validacion._id, {
        Cantidad,
      });
    } else {
      let nuevoExamenesIndicadores = new examenesIndicadoresDB({
        Mes: Mes,
        NumeroMes: mes,
        Cantidad: listaExamenes.length,
        Anio: año,
      });

      await nuevoExamenesIndicadores.save();
    }
    //Cierre creación de examenes

    //crear indicadores de examenes por medico aqui
    let validacion2 = await examenesIndicadoresMedicoDB.findOne({
      $and: [{ NumeroMes: mes }, { Anio: año }, { _idMedico: medico._id }],
    });
    if (validacion2) {
      let Cantidad = +validacion2.Cantidad + +listaExamenes.length;
      await examenesIndicadoresMedicoDB.findByIdAndUpdate(validacion2._id, {
        Cantidad,
      });
    } else {
      let nuevoExamenesIndicadores = new examenesIndicadoresMedicoDB({
        Mes: Mes,
        Medico: `${medico.Nombres} ${medico.Apellidos}`,
        _idMedico: medico._id,
        NumeroMes: mes,
        Cantidad: listaExamenes.length,
        Anio: año,
      });

      await nuevoExamenesIndicadores.save();
    }
    //Cierre creación de examenes

    let nuevoExamenS = new examenesSDB({
      Fecha: Fecha,
      Timestamp: Timestamp,
      Numero: Numero,
      ExamenesTotales: listaExamenes.length,
      Comision: Comision,
      Medico: `${medico.Nombres} ${medico.Apellidos}`,
      _idMedico: medico._id,
      Paciente: `${paciente.Nombres}`,
      _idPaciente: Paciente,
      Observacion: Observacion,
      AplicarDescuento: AplicarDescuento,
      PuntosTotales: PuntosFinal,
      PuntosMedico: PuntosMedico,
      PuntosDescuento: PuntosDescuento,
      PuntosNetos: PuntosNetos,
      ListaExamenes: listaExamenes,
      CedulaMedico: medico.Cedula,
      FormaPagoMedico: medico.Cuenta,
      noGeneraComision,
      noGenerarPuntos,
      DocumentoPaciente: paciente.Documento,
      DireccionPaciente: paciente.Direccion,
      FechaNacimientoPaciente: paciente.FechaNacimiento,
      TelefonoPaciente: paciente.Telefono,
    });
    await nuevoExamenS.save();
    res.send(JSON.stringify("ok"));
  } catch (err) {
    console.log(err);
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    next();
  }
});

router.get("/activar-examanes", async (req, res, next) => {
  let examenes = await examenDB.find({}).sort({});

  for (i = 0; i < examenes.lenght; i++) {
    await examenDB.findByIdAndUpdate(examenes[i]._id, {
      Estado: "Activo",
    });
  }

  res.send(JSON.stringify("ok"));
});

router.post("/edicion/activar-cuenta-medico/:id", async (req, res, next) => {
  try {
    let medicoBase = await medicoDB.findById(req.params.id);
    await medicoDB.findByIdAndUpdate(req.params.id, {
      Estado: "Activo",
    });

    await usersDB.findOneAndUpdate(
      { Cedula: medicoBase.Cedula },
      {
        status: "Activo",
      }
    );

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    let data = {
      ok: false,
    };

    res.send(JSON.stringify(data));
  }
});

router.post("/edicion/desactivar-cuenta-medico/:id", async (req, res, next) => {
  try {
    let medicoBase = await medicoDB.findById(req.params.id);
    await medicoDB.findByIdAndUpdate(req.params.id, {
      Estado: "Inactivo",
    });

    await usersDB.findOneAndUpdate(
      { Cedula: medicoBase.Cedula },
      {
        status: "Inactivo",
      }
    );

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    let data = {
      ok: false,
    };

    res.send(JSON.stringify(data));
  }
});

router.post("/edicion/eliminar-cuenta-medico/:id", async (req, res, next) => {
  try {
    let medicoBase = await medicoDB.findById(req.params.id);

    await medicoDB.findByIdAndDelete(req.params.id);
    await usersDB.findOneAndDelete({ Cedula: medicoBase.Cedula });

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    let data = {
      ok: false,
    };

    res.send(JSON.stringify(data));
  }
});

router.get(
  "/directorio-componentes",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      let tipos = await tipoExamenDB.find().sort({ Nombre: 1 }).lean();
      let especialidad = await especialidadesDB
        .find()
        .sort({ Nombre: 1 })
        .lean();
      let sucursales = await sucursalDB.find().sort({ Nombre: 1 }).lean();
      let tipoDocumentos = await tipoDocumentoDB
        .find()
        .sort({ Nombre: 1 })
        .lean();
      res.render("content/directorio/componentes", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        tipoDocumentos,
        RutaImage: req.user.RutaImage,
        tipos,
        especialidad,
        sucursales,
      });
    } catch (err) {
      console.log(err);
      res.render("content/404.hbs");
    }
  }
);

router.post("/editar-tipo-examen", async (req, res, next) => {
  try {
    let { id, nombre } = req.body;

    let tipoBase = await tipoExamenDB.findById(id);

    let examenes = await examenDB.find({ Tipo: tipoBase.Nombre });

    for (i = 0; i < examenes.length; i++) {
      await examenDB.findByIdAndUpdate(examenes[i]._id, {
        Tipo: nombre,
      });
    }

    await tipoExamenDB.findByIdAndUpdate(id, {
      Nombre: nombre,
    });

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    let data = {
      ok: false,
    };
    res.send(JSON.stringify(data));
  }
});
router.post("/editar-especialidad", async (req, res, next) => {
  try {
    let { id, nombre } = req.body;
    console.log(id, nombre);
    let examenes = await examenDB.find({ $in: { Especialidad: [nombre] } });
    for (i = 0; i < examenes.length; i++) {
      let Especialidad = examenes[0].Especialidad;
      Especialidad = Especialidad.filter((item) => item !== nombre);
      Especialidad.push(nombre);
      await examenDB.findByIdAndUpdate(examenes[i]._id, {
        Especialidad,
      });
    }

    await especialidadesDB.findByIdAndUpdate(id, {
      Nombre: nombre,
    });

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    let data = {
      ok: false,
    };
    res.send(JSON.stringify(data));
  }
});

router.post("/eliminar-especialidad", async (req, res, next) => {
  try {
    let { id } = req.body;

    await especialidadesDB.findByIdAndDelete(id);

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    let data = {
      ok: false,
    };

    res.send(JSON.stringify(data));
  }
});

router.post("/eliminar-tipo-examen", async (req, res, next) => {
  try {
    let { id } = req.body;

    await tipoExamenDB.findByIdAndDelete(id);

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    let data = {
      ok: false,
    };

    res.send(JSON.stringify(data));
  }
});

router.post("/nueva-sucursal", isAuthenticated, async (req, res, next) => {
  try {
    let { sucursal } = req.body;

    let nuevaSucursal = new sucursalDB({
      Nombre: sucursal,
    });

    await nuevaSucursal.save();

    let data = {
      ok: true,
      sucursal,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    let data = {
      ok: false,
    };

    res.send(JSON.stringify(data));
  }
});

router.post("/eliminar-sucursal", isAuthenticated, async (req, res, next) => {
  try {
    let { id } = req.body;
    let sucursalBase = await sucursalDB.findById(id);

    let usuarios = await usersDB.find({ Sucursal: sucursalBase.Nombre });
    if (usuarios.length > 0) {
      let data = {
        ok: false,
        msg: "No se puede eliminar la sucursal ya que cuenta con usuarios asociados",
      };

      res.send(JSON.stringify(data));
    } else {
      await sucursalDB.findByIdAndDelete(id);

      let data = {
        ok: true,
      };

      res.send(JSON.stringify(data));
    }
  } catch (err) {
    console.log(err);
    let data = {
      ok: false,
      msg: "Ocurrio un error al eliminar la sucursal. Por favor, intente de nuevo o comunicate con soporte",
    };

    res.send(JSON.stringify(data));
  }
});

router.post("/editar-sucursal", isAuthenticated, async (req, res, next) => {
  try {
    let { id, nombre } = req.body;

    let sucursalBase = await sucursalDB.findById(id);

    let usuarios = await usersDB.find({ Sucursal: sucursalBase.Nombre });

    for (i = 0; i < usuarios.length; i++) {
      let personal = await personalDB.findOne({ Cedula: usuarios[i].Cedula });

      await personalDB.findByIdAndUpdate(personal._id, {
        Sucursal: nombre,
      });

      await usersDB.findByIdAndUpdate(usuarios[i]._id, {
        Sucursal: nombre,
      });
    }

    await sucursalDB.findByIdAndUpdate(id, {
      Nombre: nombre,
    });

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    let data = {
      ok: false,
    };
    res.send(JSON.stringify(data));
  }
});

router.get("/contactanos", isAuthenticated, async (req, res, next) => {
  try {
    let layout = "main.hbs";
    if (req.user.TipoUsuario == "Medico") {
      layout = "medico.hbs";
    }
    if (req.user.TipoUsuario == "Afiliado") {
      layout = "afiliado.hbs";
    }
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();
    res.render("content/contactanos.hbs", {
      layout: layout,
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/directorio-medallas",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let medallas = await medallasDB.find({}).lean();
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      res.render("content/directorio/medallas", {
        medallas,
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/edicion/editar-medalla/:id",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let medalla = await medallasDB.findById(req.params.id).lean();

      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      res.render("content/directorio/edicion/medallas", {
        medalla,
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/edicion/editar-medalla/:id",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let { Comision, Desde, Hasta } = req.body;

      let medallaBase = await medallasDB.findById(req.params.id);

      let medicos = await medicoDB.find({ Medalla: medallaBase.Nombre });

      for (i = 0; i < medicos.length; i++) {
        await medicoDB.findByIdAndUpdate(medicos[i]._id, {
          Comision: Comision,
        });
      }

      await medallasDB.findByIdAndUpdate(req.params.id, {
        Comision,
        Desde,
        Hasta,
      });

      let data = {
        ok: true,
      };

      res.send(JSON.stringify(data));
    } catch (err) {
      next(err);
    }
  }
);

router.get("/print-examen/:id", isAuthenticated, async (req, res, next) => {
  try {
    let examen = await examenesSDB.findOne({ Numero: req.params.id }).lean();

    console.log(examen);

    res.render("content/documentos/examenes", {
      layout: false,
      examen,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/generar-petitorio", isAuthenticated, async (req, res, next) => {
  try {
    let examenes = await examenDB
      .find({ Estado: "Activo" })
      .sort({ Nombre: 1 });
    let tipos = await tipoExamenDB.find({}).sort({ Nombre: 1 });
    let perfiles = await perfilesDB.find({}).sort({ Nombre: 1 }).lean();
    let dataExamenes = [];
    let dataExamenesPerfiles = [];
    for (i = 0; i < tipos.length; i++) {
      let examenesTipo = examenes.filter(
        (data) => data.Tipo == tipos[i].Nombre
      );
      if (examenesTipo.length > 0) {
        let data = {
          Tipo: tipos[i].Nombre,
          Examenes: examenesTipo,
        };
        dataExamenes.push(data);
      }
    }

    dataExamenes.sort(function (a, b) {
      if (b.Examenes.length < a.Examenes.length) {
        return -1;
      }
      if (b.Examenes.length > a.Examenes.length) {
        return 1;
      }
      return 0;
    });

    dataExamenes = dataExamenes.map((data) => {
      return {
        Tipo: data.Tipo,
        Examenes: data.Examenes.map((doc) => {
          let dosPuntos = false;
          let agregado = false;
          let dataTipos = false;
          if (doc.SubTipo1 || doc.SubTipo1 != "") {
            dataTipos = true;
            dosPuntos = ":";
          }
          if (doc.CampoTexto || doc.CampoTexto != "") {
            agregado = true;
          }
          return {
            Tipo: data.Tipo,
            _id: doc._id,
            Puntos: doc.Puntos,
            Nombre: doc.Nombre,
            dataTipos: dataTipos,
            dosPuntos: dosPuntos,
            SubTipo1: doc.SubTipo1,
            SubTipo2: doc.SubTipo2,
            SubTipo3: doc.SubTipo3,
            agregado: agregado,
            AgregadoPosterior: doc.AgregadoPosterior,
            clase: doc.clase,
            Comisiones: doc.Comisiones,
          };
        }),
      };
    });

    //-----Perfiles ----------------
    for (i = 0; i < perfiles.length; i++) {
      let examenesTipo = examenes.filter((data) =>
        data.Perfiles.includes(perfiles[i].Nombre)
      );
      if (examenesTipo.length > 0) {
        let data = {
          Perfil: perfiles[i].Nombre,
          Puntos: perfiles[i].Precio,
          Comisiones: true,
          Tipo: "Perfil",
          clase: "text-with",
          _id: perfiles[i]._id,
          Examenes: examenesTipo,
        };
        dataExamenesPerfiles.push(data);
      }
    }

    dataExamenesPerfiles.sort(function (a, b) {
      if (b.Examenes.length < a.Examenes.length) {
        return -1;
      }
      if (b.Examenes.length > a.Examenes.length) {
        return 1;
      }
      return 0;
    });

    dataExamenesPerfiles = dataExamenesPerfiles.map((data) => {
      return {
        Perfil: data.Perfil,
        Puntos: data.Puntos,
        Comisiones: data.Comisiones,
        Tipo: data.Tipo,
        clase: data.clase,
        _id: data._id,
        Examenes: data.Examenes.map((doc) => {
          let dosPuntos = false;
          let agregado = false;
          let dataTipos = false;
          return {
            Tipo: data.Perfil,
            _id: doc._id,
            Puntos: doc.Puntos,
            Nombre: doc.Nombre,
            dataTipos: dataTipos,
            dosPuntos: dosPuntos,
            SubTipo1: doc.SubTipo1,
            SubTipo2: doc.SubTipo2,
            SubTipo3: doc.SubTipo3,
            agregado: agregado,
            AgregadoPosterior: doc.AgregadoPosterior,
            clase: doc.clase,
            Comisiones: doc.Comisiones,
          };
        }),
      };
    });

    res.render("content/documentos/petitorio", {
      layout: false,
      dataExamenes,
      dataExamenesPerfiles,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/registro-afiliados", async (req, res, next) => {
  let notificaciones = await notificacionDB
    .find({ _idUsuario: req.user._id })
    .sort({ Timestamp: -1 })
    .limit(5)
    .lean();

  let servicios = await serviciosDB.find({}).sort({ Nombre: 1 }).lean();
  let afiliados = await afiliadosDB.find({}).sort({ Nombre: 1 }).lean();

  res.render("content/registro/afiliados", {
    Apellido: `${req.user.Apellidos}`,
    RutaImage: req.user.RutaImage,
    Nombre: `${req.user.Nombres}`,
    _idUsuario: req.user._id,
    Tema: req.user.Tema,
    notificaciones,
    RutaImage: req.user.RutaImage,
    servicios,
    afiliados,
  });
});

router.post("/nuevo-afiliado", async (req, res, next) => {
  try {
    let { Nombre } = req.body;

    let validacion = await afiliadosDB.findOne({ Nombre });
    if (validacion) {
      let data = {
        success: false,
      };

      res.send(JSON.stringify(data));
    } else {
      let nuevoAfiliado = new afiliadosDB({
        Nombre,
      });

      await nuevoAfiliado.save();

      let Tipos = await afiliadosDB.find().sort({ Nombre: 1 }).lean();

      let data = {
        success: true,
        Tipos,
      };
      res.send(JSON.stringify(data));
    }
  } catch (err) {
    console.log(err);
  }
});
router.post("/nuevo-servicio", async (req, res, next) => {
  try {
    let { Nombre } = req.body;

    let validacion = await serviciosDB.findOne({ Nombre });
    if (validacion) {
      let data = {
        success: false,
      };

      res.send(JSON.stringify(data));
    } else {
      let nuevoServicio = new serviciosDB({
        Nombre,
      });

      await nuevoServicio.save();

      let Tipos = await serviciosDB.find().sort({ Nombre: 1 }).lean();

      let data = {
        success: true,
        Tipos,
      };

      res.send(JSON.stringify(data));
    }
  } catch (err) {
    console.log(err);
  }
});

router.post(
  "/registro/afiliado",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let { afiliado, servicio, nombre, cedula, email } = req.body;

      let validacionCedula = await afiliadosFichaDB.findOne({ Cedula: cedula });
      let validacionEmail = await afiliadosFichaDB.findOne({ email: email });
      let userEmail = await usersDB.findOne({ email: email });
      if (validacionCedula) {
        let data = {
          ok: false,
          msg: "La cedula ya se encuentra registrada en otro afiliado",
        };

        res.send(JSON.stringify(data));
        return;
      }
      if (validacionEmail) {
        let data = {
          ok: false,
          msg: "El email ya se encuentra registrado en otro afiliado",
        };
        res.send(JSON.stringify(data));
        return;
      }
      if (userEmail) {
        let data = {
          ok: false,
          msg: "El email ya se encuentra registrado en otro usuario",
        };

        res.send(JSON.stringify(data));
        return;
      }

      let nuevoAfiliado = new afiliadosFichaDB({
        Afiliado: afiliado,
        Servicio: servicio,
        Nombre: nombre,
        Cedula: cedula,
        Email: email,
      });

      await nuevoAfiliado.save();

      let footer = "Gracias por formar parte de la familia Club Salud",
        btnTexto = "Activar cuenta",
        btnUrl = `https://app.clubsaludve.com/activar-cuenta/${nuevoAfiliado._id}`,
        content = `
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
        Ya eres parte de Club Salud, la mejor plataforma de salud del país. Te damos una grata bienvenida y esperamos que tu experencia dentro de la plataforma sea la mejor.
        </p> </br>
        <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
        Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
        font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
            Solo falta que actives tu cuenta para poder ingresar a la plataforma.
        </p> </br>`,
        titulo = `Hola ${nombre}. ¡Bienvenido a Club Salud!`;
      const htmlContent = sendEmail(footer, btnTexto, btnUrl, content, titulo);
      let msg = "El afiliado se registró correctamente";
      transporter
        .sendMail({
          from: "<no-reply@clubsaludve.com>",
          to: email,
          subject: `Bienvenido ${nombre}.`,
          html: htmlContent,
        })
        .then((data) => {})
        .catch((err) => {
          msg = `El afiliado se registró correctamente, pero no se pudo enviar el correo ya que el dominio no existe. 
            Por favor, valide el correo electrónico y proceda a editarlo en el siguiente enlace: 
            <a class="text-info" href="/edicion/editar-afiliado/${nuevoAfiliado._id}">Editar Afiliado</a>.`;
        });

      let data = {
        ok: true,
      };

      res.send(JSON.stringify(data));
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

router.get("/generar-perfiles-visualizar", async (req, res) => {
  let perfiles = await perfilesDB.find({}).sort({ Nombre: 1 }).lean();

  let examenes = await examenDB.find({}).sort({ Nombre: 1 }).lean();

  let dataPerfiles = [];

  for (i = 0; i < perfiles.length; i++) {
    let examenesBases = examenes.filter((data) =>
      data.Perfiles.includes(perfiles[i].Nombre)
    );

    examenesBases = examenesBases.map((data) => {
      return {
        Nombre: data.Nombre,
      };
    });

    console.log({
      Perfil: perfiles[i].Nombre,
      examenesBases,
    });
  }

  res.send(JSON.stringify("ok"));
});

router.get(
  "/orden-tipo-examen",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();
      let tipos = await tipoExamenDB.find({}).sort({ Orden: 1 }).lean();

      res.render("content/orden/orden-tipo-examen", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
        tipos,
        notificaciones,
      });
    } catch (err) {
      console.log(err);
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      next();
    }
  }
);

router.post(
  "/actualizar-orden-tipo-examen",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let { tipoExamenes } = req.body;

      for (i = 0; i < tipoExamenes.length; i++) {
        await tipoExamenDB.findByIdAndUpdate(tipoExamenes[i].id, {
          Orden: tipoExamenes[i].orden,
        });
      }

      let data = {
        ok: true,
      };

      res.send(JSON.stringify(data));
    } catch (err) {
      console.log(err);
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();

      let data = {
        ok: false,
      };

      res.send(JSON.stringify(data));
    }
  }
);

router.post(
  "/actualizar-orden-perfil",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let { tipoExamenes } = req.body;

      for (i = 0; i < tipoExamenes.length; i++) {
        await perfilesDB.findByIdAndUpdate(tipoExamenes[i].id, {
          Orden: tipoExamenes[i].orden,
        });
      }

      let data = {
        ok: true,
      };

      res.send(JSON.stringify(data));
    } catch (err) {
      console.log(err);
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();

      let data = {
        ok: false,
      };

      res.send(JSON.stringify(data));
    }
  }
);

router.get("/orden-examenes", isAuthenticatedData, async (req, res, next) => {
  try {
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    let tipos = await tipoExamenDB.find({}).sort({ Orden: 1 }).lean();

    let examenesOrden = [];

    for (i = 0; i < tipos.length; i++) {
      let examenes = await examenDB
        .find({ Tipo: tipos[i].Nombre })
        .sort({ OrdenPetitorio: 1 })
        .lean()
        .select("Nombre OrdenPetitorio");

      let validacion = examenesOrden.filter(
        (data) => data.Tipo == tipos[i].Nombre
      );

      if (validacion.length > 0) {
        let index = examenesOrden.findIndex(
          (data) => data.Tipo == tipos[i].Nombre
        );
        examenesOrden[index].Examenes = examenes;
      } else {
        let data = {
          Tipo: tipos[i].Nombre,
          Examenes: examenes,
          _id: tipos[i]._id,
        };
        examenesOrden.push(data);
      }
    }

    res.render("content/orden/orden-examenes", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
      notificaciones,
      examenesOrden,
    });
  } catch (err) {
    console.log(err);
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();
    next();
  }
});

router.post(
  "/actualizar-orden-examenes-petitorio",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let { examenes, _id } = req.body;

      for (i = 0; i < examenes.length; i++) {
        await examenDB.findByIdAndUpdate(examenes[i].id, {
          OrdenPetitorio: examenes[i].orden,
        });
      }

      let data = {
        ok: true,
      };

      res.send(JSON.stringify(data));
    } catch (err) {
      console.log(err);
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();

      let data = {
        ok: false,
      };

      res.send(JSON.stringify(data));
    }
  }
);

router.get(
  "/orden-perfiles-examenes",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let perfiles = await perfilesDB.find({}).sort({ Orden: 1 }).lean();

      let examenes = await examenDB
        .find({})
        .sort({ OrdenPetitorio: 1 })
        .lean()
        .select("Nombre OrdenPerfil Perfiles");

      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      let dataPerfiles = [];

      for (i = 0; i < perfiles.length; i++) {
        let examenesPerfil = examenes.filter((data) =>
          data.Perfiles.includes(perfiles[i].Nombre)
        );

        let subdata = {
          Perfil: perfiles[i].Nombre,
          _idPerfil: perfiles[i]._id,
          Examenes: examenesPerfil,
        };

        dataPerfiles.push(subdata);
      }

      for (i = 0; i < dataPerfiles.length; i++) {
        let perfil = dataPerfiles[i].Perfil;
        for (r = 0; r < dataPerfiles[i].Examenes.length; r++) {
          let examenBase = await examenDB.findById(
            dataPerfiles[i].Examenes[r]._id
          );
          let getOrden = examenBase.OrdenPerfil.find(
            (data) => data.Perfil == perfil
          );
          let orden;
          if (getOrden) {
            orden = getOrden.Orden;
          } else {
            orden = 0;
          }
          dataPerfiles[i].Examenes[r].Orden = orden;
        }
      }

      res.render("content/orden/orden-perfiles", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
        notificaciones,
        dataPerfiles,
      });
    } catch (err) {
      console.log(err);
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();

      next(err);
    }
  }
);

router.get("/actualizar-orden-exaemenes-perfil", async (req, res, next) => {
  try {
    let examenes = await examenDB.find({}).sort({ OrdenPetitorio: 1 }).lean();

    for (i = 0; i < examenes.length; i++) {
      await examenDB.findByIdAndUpdate(examenes[i]._id, {
        OrdenPerfil: [],
      });
    }

    res.send("ok");
  } catch (err) {
    next(err);
  }
});

router.post("/actualizar-orden-examenes-perfil", async (req, res, next) => {
  try {
    let { examenes, _id } = req.body;
    let perfil = await perfilesDB.findById(_id);

    for (i = 0; i < examenes.length; i++) {
      let examenBase = await examenDB.findById(examenes[i].id);

      let OrdenPerfil = examenBase.OrdenPerfil;
      let validacion = OrdenPerfil.find((data) => data.Perfil == perfil.Nombre);
      if (validacion) {
        let index = OrdenPerfil.findIndex(
          (data) => data.Perfil == perfil.Nombre
        );
        OrdenPerfil[index].Orden = examenes[i].orden;

        await examenDB.findByIdAndUpdate(examenes[i].id, {
          OrdenPerfil,
        });
      } else {
        let data = {
          Perfil: perfil.Nombre,
          Orden: examenes[i].orden,
        };

        OrdenPerfil.push(data);

        await examenDB.findByIdAndUpdate(examenes[i].id, {
          OrdenPerfil,
        });
      }
    }

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    console.log(err);
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();

    next(err);
  }
});

router.get("/orden-perfiles", isAuthenticatedData, async (req, res, next) => {
  try {
    let perfiles = await perfilesDB.find({}).sort({ Orden: 1 }).lean();

    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    res.render("content/orden/orden-perfil", {
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
      notificaciones,
      RutaImage: req.user.RutaImage,
      notificaciones,
      perfiles,
    });
  } catch (err) {
    console.log(err);
    let fecha = new Date();
    let stack = err.stack;
    let nuevoError = new errorDB({
      Descripcion: err.message,
      Fecha: fecha,
      Usuario: req.user._id,
      Linea: stack,
    });
    await nuevoError.save();

    next(err);
  }
});

router.get("/actualizar-precioo-ordenes", async (req, res, next) => {
  let ordenes = await examenesSDB.find();

  for (i = 0; i < ordenes.length; i++) {
    let medicoBase = await medicoDB.findById(ordenes[i]._idMedico).lean();

    let PuntosTotales = 0;
    let PuntosMedico = 0;
    let PuntosDescuento = ordenes[i].PuntosDescuento;
    let PuntosNetos = 0;

    for (r = 0; r < ordenes[i].ListaExamenes.length; r++) {
      let examenBase = await examenDB.findById(ordenes[i].ListaExamenes[r].id);

      if (!examenBase) {
        examenBase = await perfilesDB
          .findById(ordenes[i].ListaExamenes[r].id)
          .lean();
        examenBase.Puntos = examenBase.Precio;
      }

      ordenes[i].ListaExamenes[r].puntos = examenBase.Puntos;

      PuntosTotales = (+PuntosTotales + +examenBase.Puntos).toFixed(2);
    }

    let Comision = medicoBase.Comision;

    let factorComision = 0;

    if (+Comision >= 10) {
      factorComision = `0.${Comision}`;
    } else {
      factorComision = `0.0${Comision}`;
    }

    PuntosMedico = (+factorComision * +PuntosTotales).toFixed(2);
    PuntosNetos = (+PuntosTotales - +PuntosDescuento - +PuntosMedico).toFixed(
      2
    );

    console.log(PuntosMedico);

    await examenesSDB.findByIdAndUpdate(ordenes[i]._id, {
      PuntosTotales,
      PuntosMedico,
      PuntosDescuento,
      PuntosNetos,
      Comision,
      ListaExamenes: ordenes.ListaExamenes,
    });
  }

  res.send("ok");
});

router.get(
  "/directorio-perfiles",
  isAuthenticatedData,
  async (req, res, next) => {
    try {
      let perfiles = await perfilesDB.find().sort({ Orden: 1 }).lean();
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      res.render("content/directorio/perfiles", {
        perfiles,
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
      });
    } catch (err) {
      console.log(err);
      let fecha = new Date();
      let stack = err.stack;
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();

      next(err);
    }
  }
);

router.post("/editar-perfil", isAuthenticatedData, async (req, res, next) => {
  let { id, nombre, precio } = req.body;

  await perfilesDB.findByIdAndUpdate(id, {
    Nombre: nombre,
    Precio: precio,
  });

  let data = {
    ok: true,
  };

  res.send(JSON.stringify(data));
});

router.post("/eliminar-perfil", isAuthenticatedData, async (req, res, next) => {
  let { id } = req.body;

  await perfilesDB.findByIdAndDelete(id);

  let data = {
    ok: true,
  };

  res.send(JSON.stringify(data));
});

router.get("/descargar-examenes", async (req, res, next) => {
  try {
    const xl = require("excel4node");

    const wb = new xl.Workbook();

    const ws = wb.addWorksheet("Examenes");

    let examenes = await examenDB.find().sort({ Nombre: 1 }).lean();

    const headers3 = wb.createStyle({
      font: {
        color: "#ffffff",
        size: 11,
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#15A204",
        fgColor: "#15A204",
      },
    });

    const lineas = wb.createStyle({
      font: {
        color: "#000000",
        size: 11,
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#ffffff",
        fgColor: "#ffffff",
      },
    });

    ws.cell(1, 1).string("Nombre").style(headers3);
    ws.cell(1, 2).string("Tipo").style(headers3);
    ws.cell(1, 3).string("Puntos").style(headers3);
    ws.cell(1, 4).string("Estado").style(headers3);

    for (i = 0; i < examenes.length; i++) {
      let examen = examenes[i];

      ws.cell(i + 2, 1)
        .string(examen.Nombre)
        .style(lineas);
      ws.cell(i + 2, 2)
        .string(examen.Tipo)
        .style(lineas);
      ws.cell(i + 2, 3)
        .number(+examen.Puntos)
        .style(lineas);
      ws.cell(i + 2, 4)
        .string(examen.Estado)
        .style(lineas);
    }

    wb.write(`Examenes.xlsx`, res);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/descargar-solicitudes", async (req, res, next) => {
  try {
    const xl = require("excel4node");

    const wb = new xl.Workbook();

    const ws = wb.addWorksheet("Solicitudes");

    let solicitudes = await examenesSDB.find().sort({ Numero: 1 }).lean();

    const headers3 = wb.createStyle({
      font: {
        color: "#ffffff",
        size: 11,
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#15A204",
        fgColor: "#15A204",
      },
    });

    const lineas = wb.createStyle({
      font: {
        color: "#000000",
        size: 11,
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#ffffff",
        fgColor: "#ffffff",
      },
    });

    ws.cell(1, 1).string("Fecha").style(headers3);
    ws.cell(1, 2).string("Fecha Atencion").style(headers3);
    ws.cell(1, 3).string("Fecha Rechazo").style(headers3);
    ws.cell(1, 4).string("Observacion Rechazo").style(headers3);
    ws.cell(1, 5).string("Timestamp").style(headers3);
    ws.cell(1, 6).string("Tipo").style(headers3);
    ws.cell(1, 7).string("Resolicitado").style(headers3);
    ws.cell(1, 8).string("Numero").style(headers3);
    ws.cell(1, 9).string("Examenes Totales").style(headers3);
    ws.cell(1, 10).string("Comision").style(headers3);
    ws.cell(1, 11).string("Puntos Totales").style(headers3);
    ws.cell(1, 12).string("Puntos Medico").style(headers3);
    ws.cell(1, 13).string("Puntos Descuento").style(headers3);
    ws.cell(1, 14).string("Puntos Netos").style(headers3);
    ws.cell(1, 15).string("Medico").style(headers3);
    ws.cell(1, 16).string("Cedula Medico").style(headers3);
    ws.cell(1, 17).string("Forma Pago Medico").style(headers3);
    ws.cell(1, 18).string("_id Medico").style(headers3);
    ws.cell(1, 19).string("Paciente").style(headers3);
    ws.cell(1, 20).string("Documento Paciente").style(headers3);
    ws.cell(1, 21).string("Direccion Paciente").style(headers3);
    ws.cell(1, 22).string("Fecha Nacimiento Paciente").style(headers3);
    ws.cell(1, 23).string("Telefono Paciente").style(headers3);
    ws.cell(1, 24).string("_id Paciente").style(headers3);
    ws.cell(1, 25).string("Observacion").style(headers3);
    ws.cell(1, 26).string("Aplicar Descuento").style(headers3);
    ws.cell(1, 27).string("Sucursal").style(headers3);
    ws.cell(1, 28).string("Estado").style(headers3);
    ws.cell(1, 29).string("Comision Cancelada").style(headers3);
    ws.cell(1, 30).string("Examenes solicitados").style(headers3);

    for (i = 0; i < solicitudes.length; i++) {
      let examenesSolicitados = "";
      let solicitud = solicitudes[i];

      for (r = 0; r < solicitud.ListaExamenes.length; r++) {
        let examen = solicitud.ListaExamenes[r];

        examenesSolicitados += `${examen.nombre} / `;
      }

      ws.cell(i + 2, 1)
        .string(solicitud.Fecha)
        .style(lineas);
      ws.cell(i + 2, 2)
        .string(solicitud.FechaAtencion)
        .style(lineas);
      ws.cell(i + 2, 3)
        .string(solicitud.FechaRechazo)
        .style(lineas);
      ws.cell(i + 2, 4)
        .string(solicitud.ObservacionRechazo)
        .style(lineas);
      ws.cell(i + 2, 5)
        .number(solicitud.Timestamp)
        .style(lineas);
      ws.cell(i + 2, 6)
        .string(solicitud.Tipo)
        .style(lineas);
      ws.cell(i + 2, 7)
        .string(solicitud.Resolicitado)
        .style(lineas);
      ws.cell(i + 2, 8)
        .number(+solicitud.Numero)
        .style(lineas);
      ws.cell(i + 2, 9)
        .string(solicitud.ExamenesTotales)
        .style(lineas);
      ws.cell(i + 2, 10)
        .number(+solicitud.Comision)
        .style(lineas);
      ws.cell(i + 2, 11)
        .number(+solicitud.PuntosTotales)
        .style(lineas);
      ws.cell(i + 2, 12)
        .number(+solicitud.PuntosMedico)
        .style(lineas);
      ws.cell(i + 2, 13)
        .number(+solicitud.PuntosDescuento)
        .style(lineas);
      ws.cell(i + 2, 14)
        .number(+solicitud.PuntosNetos)
        .style(lineas);
      ws.cell(i + 2, 15)
        .string(solicitud.Medico)
        .style(lineas);
      ws.cell(i + 2, 16)
        .string(solicitud.CedulaMedico)
        .style(lineas);
      ws.cell(i + 2, 17)
        .string(solicitud.FormaPagoMedico)
        .style(lineas);
      ws.cell(i + 2, 18)
        .string(solicitud._idMedico)
        .style(lineas);
      ws.cell(i + 2, 19)
        .string(solicitud.Paciente)
        .style(lineas);
      ws.cell(i + 2, 20)
        .string(solicitud.DocumentoPaciente)
        .style(lineas);
      ws.cell(i + 2, 21)
        .string(solicitud.DireccionPaciente)
        .style(lineas);
      ws.cell(i + 2, 22)
        .string(solicitud.FechaNacimientoPaciente)
        .style(lineas);
      ws.cell(i + 2, 23)
        .string(solicitud.TelefonoPaciente)
        .style(lineas);
      ws.cell(i + 2, 24)
        .string(solicitud._idPaciente)
        .style(lineas);
      ws.cell(i + 2, 25)
        .string(solicitud.Observacion)
        .style(lineas);
      ws.cell(i + 2, 26)
        .string(solicitud.AplicarDescuento)
        .style(lineas);
      ws.cell(i + 2, 27)
        .string(solicitud.Sucursal)
        .style(lineas);
      ws.cell(i + 2, 28)
        .string(solicitud.Estado)
        .style(lineas);
      ws.cell(i + 2, 29)
        .string(solicitud.ComisionCancelada)
        .style(lineas);
      ws.cell(i + 2, 30)
        .string(examenesSolicitados)
        .style(lineas);
    }

    wb.write(`Solicitudes.xlsx`, res);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/descargar-canjes", async (req, res, next) => {
  try {
    const xl = require("excel4node");

    const wb = new xl.Workbook();

    const ws = wb.addWorksheet("Canjes");

    const canjes = await constanciasCanjeDB
      .find()
      .sort({ timestamp: -1 })
      .lean();

    const headers3 = wb.createStyle({
      font: {
        color: "#ffffff",
        size: 11,
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#15A204",
        fgColor: "#15A204",
      },
    });

    const lineas = wb.createStyle({
      font: {
        color: "#000000",
        size: 11,
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#ffffff",
        fgColor: "#ffffff",
      },
    });

    ws.cell(1, 1).string("Numero").style(headers3);
    ws.cell(1, 2).string("Medico").style(headers3);
    ws.cell(1, 3).string("_idM edico").style(headers3);
    ws.cell(1, 4).string("Cedula").style(headers3);
    ws.cell(1, 5).string("Puntos Antes").style(headers3);
    ws.cell(1, 6).string("Puntos ajustados").style(headers3);
    ws.cell(1, 7).string("Puntos Pendientes").style(headers3);
    ws.cell(1, 8).string("Fecha Recibo").style(headers3);
    ws.cell(1, 9).string("Fecha Pago").style(headers3);
    ws.cell(1, 10).string("_id Usuario").style(headers3);
    ws.cell(1, 11).string("Nombres Usuario").style(headers3);
    ws.cell(1, 12).string("Timestamp").style(headers3);

    for (i = 0; i < canjes.length; i++) {
      ws.cell(i + 2, 1)
        .number(+canjes[i].Numero)
        .style(lineas);
      ws.cell(i + 2, 2)
        .string(canjes[i].Medico)
        .style(lineas);
      ws.cell(i + 2, 3)
        .string(canjes[i]._idMedico)
        .style(lineas);
      ws.cell(i + 2, 4)
        .string(canjes[i].Cedula)
        .style(lineas);
      ws.cell(i + 2, 5)
        .number(+canjes[i].PuntosAntes)
        .style(lineas);
      ws.cell(i + 2, 6)
        .number(+canjes[i].PuntosMovidos)
        .style(lineas);
      ws.cell(i + 2, 7)
        .number(+canjes[i].PuntosPendientes)
        .style(lineas);
      ws.cell(i + 2, 8)
        .string(canjes[i].FechaRecibo)
        .style(lineas);
      ws.cell(i + 2, 9)
        .string(canjes[i].FechaPago)
        .style(lineas);
      ws.cell(i + 2, 10)
        .string(canjes[i]._idUsuario)
        .style(lineas);
      ws.cell(i + 2, 11)
        .string(canjes[i].NombresUsuario)
        .style(lineas);
      ws.cell(i + 2, 12)
        .string(canjes[i].Timestamp)
        .style(lineas);
    }

    wb.write(`Canjes.xlsx`, res);
  } catch (err) {
    next(err);
  }
});

router.get("/descargar-medicos", async (req, res, next) => {
  try {
    const xl = require("excel4node");

    const wb = new xl.Workbook();

    const ws = wb.addWorksheet("medicos");

    const title = wb.createStyle({
      font: {
        color: "#ffffff",
        size: 15,
      },
      alignment: {
        wrapText: true,
        horizontal: "center",
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#198754",
        fgColor: "#198754",
      },
    });
    const headers3 = wb.createStyle({
      font: {
        color: "#ffffff",
        size: 11,
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#15A204",
        fgColor: "#15A204",
      },
    });

    const lineas = wb.createStyle({
      font: {
        color: "#000000",
        size: 11,
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#ffffff",
        fgColor: "#ffffff",
      },
    });

    const medicos = await medicoDB.find().sort({ NroAfiliado: 1 }).lean();

    ws.cell(1, 1).string("Nro Afiliado").style(headers3);
    ws.cell(1, 2).string("Nombres").style(headers3);
    ws.cell(1, 3).string("Apellidos").style(headers3);
    ws.cell(1, 4).string("Cedula").style(headers3);
    ws.cell(1, 5).string("Direccion").style(headers3);
    ws.cell(1, 6).string("Email").style(headers3);
    ws.cell(1, 7).string("Role").style(headers3);
    ws.cell(1, 8).string("Estado").style(headers3);
    ws.cell(1, 9).string("Telefono").style(headers3);
    ws.cell(1, 10).string("Especialidad").style(headers3);
    ws.cell(1, 11).string("Fecha Nacimiento").style(headers3);
    ws.cell(1, 12).string("Cuenta").style(headers3);
    ws.cell(1, 13).string("Puntos Obtenidos").style(headers3);
    ws.cell(1, 14).string("Puntos Canjeables").style(headers3);
    ws.cell(1, 15).string("Puntos Canjeados").style(headers3);
    ws.cell(1, 16).string("Medalla").style(headers3);
    ws.cell(1, 17).string("Comision").style(headers3);
    ws.cell(1, 18).string("Fecha Registro").style(headers3);
    ws.cell(1, 19).string("Fecha Modificacion").style(headers3);
    ws.cell(1, 20).string("Fecha Eliminacion").style(headers3);
    ws.cell(1, 21).string("Usuario Registro").style(headers3);
    ws.cell(1, 22).string("Numero CIV").style(headers3);
    ws.cell(1, 23).string("Grupo Sanguineo").style(headers3);
    ws.cell(1, 24).string("Visibilidad").style(headers3);
    ws.cell(1, 25).string("Promociones").style(headers3);
    ws.cell(1, 26).string("Whatsapp").style(headers3);

    for (i = 0; i < medicos.length; i++) {
      ws.cell(i + 2, 1)
        .string(medicos[i].NroAfiliado)
        .style(lineas);
      ws.cell(i + 2, 2)
        .string(medicos[i].Nombres)
        .style(lineas);
      ws.cell(i + 2, 3)
        .string(medicos[i].Apellidos)
        .style(lineas);
      ws.cell(i + 2, 4)
        .string(medicos[i].Cedula)
        .style(lineas);
      ws.cell(i + 2, 5)
        .string(medicos[i].Direccion)
        .style(lineas);
      ws.cell(i + 2, 6)
        .string(medicos[i].Email)
        .style(lineas);
      ws.cell(i + 2, 7)
        .string(medicos[i].Role)
        .style(lineas);
      ws.cell(i + 2, 8)
        .string(medicos[i].Estado)
        .style(lineas);
      ws.cell(i + 2, 9)
        .string(medicos[i].Telefono)
        .style(lineas);
      ws.cell(i + 2, 10)
        .string(medicos[i].Especialidad)
        .style(lineas);
      ws.cell(i + 2, 11)
        .string(medicos[i].FechaNacimiento)
        .style(lineas);
      ws.cell(i + 2, 12)
        .string(medicos[i].Cuenta)
        .style(lineas);
      ws.cell(i + 2, 13)
        .number(+medicos[i].PuntosObtenidos)
        .style(lineas);
      ws.cell(i + 2, 14)
        .number(+medicos[i].PuntosCanjeables)
        .style(lineas);
      ws.cell(i + 2, 15)
        .number(+medicos[i].PuntosCanjeados)
        .style(lineas);
      ws.cell(i + 2, 16)
        .string(medicos[i].Medalla)
        .style(lineas);
      ws.cell(i + 2, 17)
        .number(+medicos[i].Comision)
        .style(lineas);
      ws.cell(i + 2, 18)
        .string(medicos[i].Fecha_Registro)
        .style(lineas);
      ws.cell(i + 2, 19)
        .string(medicos[i].Fecha_Modificacion)
        .style(lineas);
      ws.cell(i + 2, 20)
        .string(medicos[i].Fecha_Eliminacion)
        .style(lineas);
      ws.cell(i + 2, 21)
        .string(medicos[i].Usuario_Registro)
        .style(lineas);
      ws.cell(i + 2, 22)
        .string(medicos[i].NumeroCIV)
        .style(lineas);
      ws.cell(i + 2, 23)
        .string(medicos[i].GrupoSanguineo)
        .style(lineas);
      ws.cell(i + 2, 24)
        .string(medicos[i].Visibilidad)
        .style(lineas);
      ws.cell(i + 2, 25)
        .string(medicos[i].Promociones)
        .style(lineas);
      ws.cell(i + 2, 26)
        .string(medicos[i].Whatsapp)
        .style(lineas);
    }

    wb.write(`medicos.xlsx`, res);
  } catch (err) {
    next(err);
  }
});

router.get(
  "/nueva-solicitud-canje",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let medicos = await medicoDB
        .find({})
        .sort({ Nombres: 1, Apellidos: 1 })
        .lean()
        .select("Nombres Apellidos PuntosCanjeables");

      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      let tiposCanjes = await tiposCanjesDB.find({ Activo: true }).lean();

      res.render("content/canje/nueva-solicitud", {
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        tiposCanjes,
        medicos,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.post(
  "/nueva-solicitud-canje-admin",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let { tipoCanje, puntosCanjear, _idmedico } = req.body;
      let medico = await medicoDB.findById(_idmedico);
      let ultimaSolicitud = await solicitudCanjeDB
        .findOne()
        .sort({ Numero: -1 })
        .lean();
      let Numero = ultimaSolicitud ? +ultimaSolicitud.Numero + 1 : 1;
      let tipoCanjeBase = await tiposCanjesDB.findOne({ Nombre: tipoCanje });
      let fecha = moment().format("DD/MM/YYYY");
      let Timestamp = Date.now();

      let nuevaSolicitud = new solicitudCanjeDB({
        Numero: Numero,
        Medico: `${medico.Nombres} ${medico.Apellidos}`,
        _idMedico: medico._id,
        Cedula: medico.Cedula,
        PuntosCanjeados: puntosCanjear,
        TipoCanje: tipoCanje,
        _idTipoCanje: tipoCanjeBase._id,
        FechaCanje: fecha,
      });
      await nuevaSolicitud.save();

      let data = {
        ok: true,
      };

      let usuarios = await usersDB.find({ TipoUsuario: "Personal" }).sort({});
      for (i = 0; i < usuarios.length; i++) {
        let nuevaNotificacion = new notificacionDB({
          _idUsuario: usuarios[i]._id,
          Timestamp: Timestamp,
          Titulo: `Nueva solicitud de canje de ${medico.Nombres} ${medico.Apellidos}`,
          Mensaje: "Nueva solicitud",
          Imagen: req.user.RutaImage,
          idSocket: usuarios[i].idSocket,
          Tipo: "Canje",
          link: "/solicitudes-canjes",
        });
        nuevaNotificacion.save();
      }

      res.send(JSON.stringify(data)).status(200);
    } catch (err) {
      let fecha = new Date();
      let stack = err.stack;
      console.log(err.stack);
      let nuevoError = new errorDB({
        Descripcion: err.message,
        Fecha: fecha,
        Usuario: req.user._id,
        Linea: stack,
      });
      await nuevoError.save();
      let data = {
        ok: false,
      };
      res.send(JSON.stringify(data)).status(200);
    }
  }
);

router.get(
  "/correos-pendientes",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let soliciutdes = await examenesSDB
        .find({ Resultado: { $elemMatch: { Enviado: false } } })
        .sort({ Numero: -1 })
        .lean();
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      soliciutdes = soliciutdes.filter((data) => data.Resultado.length > 0);

      res.render("content/servicios/examenes/correos-pendientes", {
        notificaciones,
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        soliciutdes,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.post("/nuevo-tipo-documento", async (req, res, next) => {
  try {
    let { nuevoTipoDocumento } = req.body;

    let nuevoTipoDocumentoBase = new tipoDocumentoDB({
      Nombre: nuevoTipoDocumento,
    });

    await nuevoTipoDocumentoBase.save();

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    console.log(err);
  }
});

router.post("/editar-tipo-documento", async (req, res, next) => {
  try {
    let { id, nombre } = req.body;

    await tipoDocumentoDB.findByIdAndUpdate(id, {
      Nombre: nombre,
    });

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    console.lgh(err);
  }
});

router.post("/eliminar-tipo-documento", async (req, res, next) => {
  try {
    let { id } = req.body;

    await tipoDocumentoDB.findByIdAndDelete(id);

    let data = {
      ok: true,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    console.log(err);
  }
});

router.get(
  "/editar-solicitud",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let solicitudes = await examenesSDB
        .find({ Estado: { $ne: "Rechazado" } })
        .sort({ Numero: -1 })
        .lean();
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      res.render("content/servicios/examenes/editar-solicitudes", {
        notificaciones,
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        solicitudes,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/editar-solicitud/:id",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let solicitud = await examenesSDB.findById(req.params.id).lean();
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();
      let medicos = await medicoDB.find().sort({ Nombres: 1 }).lean();
      let pacientes = await pacienteDB.find().sort({ Nombres: 1 }).lean();
      let examenes = await examenDB.find().sort({ Tipo: 1, Nombre: 1 }).lean();

      solicitud.Comision = (
        (+solicitud.PuntosMedico * 100) /
        +solicitud.PuntosTotales
      ).toFixed(2);

      let checkedNoGeneraPuntos = "";
      let checkedNoGeneraComision = "";
      if (solicitud.noGenerarPuntos) {
        checkedNoGeneraPuntos = "checked";
      }
      if (solicitud.noGeneraComision) {
        checkedNoGeneraComision = "checked";
      }

      solicitud.checkedNoGeneraPuntos = checkedNoGeneraPuntos;
      solicitud.checkedNoGeneraComision = checkedNoGeneraComision;

      solicitud.ListaExamenes = solicitud.ListaExamenes.map((data) => {
        data.puntosUnitarios = (+data.puntos / +data.cantidad).toFixed(2);
        return data;
      });

      res.render("content/servicios/examenes/editar-solicitud", {
        notificaciones,
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        solicitud,
        medicos,
        pacientes,
        examenes,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get("/solicitar-informacion-examen/:id", async (req, res, next) => {
  try {
    let examen = await examenDB.findById(req.params.id).lean();

    let data = {
      ok: true,
      examen,
    };

    res.send(JSON.stringify(data));
  } catch (err) {
    console.log(err);
  }
});

router.post(
  "/editar-solicitud",
  isAuthenticatedServicios,
  async (req, res, next) => {
    try {
      let {
        Numero,
        Paciente,
        listaExamenes,
        DescuentoPuntos,
        PuntosDescuento,
        PuntosFinal,
        puntosObtenidosMedico,
        puntosTotalesFinales,
        noGeneraComision,
        noGenerarPuntos,
        Medico,
      } = req.body;

      let medicoBase = await medicoDB.findById(Medico);
      let pacienteBase = await pacienteDB.findById(Paciente);

      await examenesSDB.findOneAndUpdate(
        { Numero: Numero },
        {
          _idMedico: Medico,
          CedulaMedico: medicoBase.Cedula,
          Medico: `${medicoBase.Nombres} ${medicoBase.Apellidos}`,
          _idPaciente: Paciente,
          Paciente: pacienteBase.Nombres,
          DocumentoPaciente: pacienteBase.Documento,
          DireccionPaciente: pacienteBase.Direccion,
          FechaNacimientoPaciente: pacienteBase.FechaNacimiento,
          TelefonoPaciente: pacienteBase.Telefono,
          listaExamenes: listaExamenes,
          ExamenesTotales: listaExamenes.lenght,
          Comision: medicoBase.Comision,
          PuntosTotales: PuntosFinal,
          PuntosMedico: puntosObtenidosMedico,
          PuntosDescuento: DescuentoPuntos,
          PuntosNetos: puntosTotalesFinales,
          noGeneraComision: noGeneraComision,
          noGenerarPuntos: noGenerarPuntos,
          AplicarDescuento: +PuntosDescuento > 0 ? true : false,
          Editado: true,
          UsuarioEdicion: `${req.user.Nombres} ${req.user.Apellidos}`,
          FechaEdicion: moment().format("DD/MM/YYYY hh:ss"),
        }
      );

      let data = {
        ok: true,
      };

      res.send(JSON.stringify(data));
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/registro-masivo",
  isAuthenticatedMaster,
  async (req, res, next) => {
    try {
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      res.render("content/funciones-avanzadas/registro", {
        notificaciones,
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get("/edicion-maiva", isAuthenticatedMaster, async (req, res, next) => {
  try {
    let notificaciones = await notificacionDB
      .find({ _idUsuario: req.user._id })
      .sort({ Timestamp: -1 })
      .limit(5)
      .lean();

    res.render("content/funciones-avanzadas/edicion", {
      notificaciones,
      Apellido: `${req.user.Apellidos}`,
      RutaImage: req.user.RutaImage,
      Nombre: `${req.user.Nombres}`,
      _idUsuario: req.user._id,
      Tema: req.user.Tema,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get(
  "/registro-masivo/:id",
  isAuthenticatedMaster,
  async (req, res, next) => {
    try {
      let tipoDescarga = req.params.id;

      if (tipoDescarga == 1) tipoDescarga = "Análisis";
      if (tipoDescarga == 2) tipoDescarga = "Médicos";
      if (tipoDescarga == 3) tipoDescarga = "Pacientes";
      if (tipoDescarga == 4) tipoDescarga = "Usuarios";

      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      res.render("content/funciones-avanzadas/registro/registro-tipos", {
        notificaciones,
        tipoDescarga,
        tipoNumero: req.params.id,
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/edicion-masiva/:id",
  isAuthenticatedMaster,
  async (req, res, next) => {
    try {
      let tipoDescarga = req.params.id;

      if (tipoDescarga == 1) tipoDescarga = "Análisis";
      if (tipoDescarga == 2) tipoDescarga = "Médicos";
      if (tipoDescarga == 3) tipoDescarga = "Pacientes";
      if (tipoDescarga == 4) tipoDescarga = "Usuarios";

      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();

      res.render("content/funciones-avanzadas/edicion/edicion-tipos", {
        notificaciones,
        tipoDescarga,
        tipoNumero: req.params.id,
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/api/importar-formato-registro-masivo/:id",
  isAuthenticatedMaster,
  async (req, res, next) => {
    try {
      let tipo = req.params.id;
      let tipoDescarga;

      if (tipo == 1) tipoDescarga = "Análisis";
      if (tipo == 2) tipoDescarga = "Médicos";
      if (tipo == 3) tipoDescarga = "Pacientes";
      if (tipo == 4) tipoDescarga = "Usuarios";

      const xl = require("excel4node");
      const wb = new xl.Workbook();
      const ws = wb.addWorksheet(`Formato registro masivo ${tipoDescarga}`);
      const style = wb.createStyle({
        font: {
          color: "#FFFFFF",
          size: 11,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#313a46",
          fgColor: "#313a46",
        },
      });

      if (tipo == 1) {
        ws.cell(1, 1).string("Nombre").style(style);
        ws.cell(1, 2).string("Tipo").style(style);
        ws.cell(1, 3).string("Puntos").style(style);
        ws.cell(1, 4).string("SubTipo1").style(style);
        ws.cell(1, 5).string("SubTipo2").style(style);
        ws.cell(1, 6).string("SubTipo3").style(style);
        ws.cell(1, 7).string("CampoTexto").style(style);
        ws.cell(1, 8).string("CantidadMaxima").style(style);
        ws.cell(1, 9).string("AgregadoPosterior").style(style);
        ws.cell(1, 10).string("Comisiones").style(style);
        ws.cell(1, 11).string("OrdenPetitorio").style(style);
      }
      if (tipo == 2) {
        ws.cell(1, 1).string("Nombres").style(style);
        ws.cell(1, 2).string("Apellidos").style(style);
        ws.cell(1, 3).string("Cedula").style(style);
        ws.cell(1, 4).string("Direccion").style(style);
        ws.cell(1, 5).string("Email").style(style);
        ws.cell(1, 6).string("Estado").style(style);
        ws.cell(1, 7).string("Telefono").style(style);
        ws.cell(1, 8).string("Especialidad").style(style);
        ws.cell(1, 9).string("FechaNacimiento").style(style);
        ws.cell(1, 10).string("Cuenta").style(style);
        ws.cell(1, 11).string("Medalla").style(style);
        ws.cell(1, 12).string("Comision").style(style);
        ws.cell(1, 13).string("NumeroCIV").style(style);
        ws.cell(1, 14).string("GrupoSanguineo").style(style);
      }
      if (tipo == 3) {
        ws.cell(1, 1).string("Nombres").style(style);
        ws.cell(1, 2).string("Telefono").style(style);
        ws.cell(1, 3).string("Direccion").style(style);
        ws.cell(1, 4).string("Email").style(style);
        ws.cell(1, 5).string("FechaNacimiento").style(style);
        ws.cell(1, 6).string("TipoFactura").style(style);
        ws.cell(1, 7).string("TipoDocumento").style(style);
        ws.cell(1, 8).string("Documento").style(style);
        ws.cell(1, 9).string("Nota").style(style);
        ws.cell(1, 10).string("Medico").style(style);

        const medicos = await medicoDB
        .find()
        .select("Nombres Apellidos")
        .sort({ Nombres: 1 });

        const ws2 = wb.addWorksheet("Datos", {
        /* sheetProtection: {
          // same as "Protect Sheet" in Review tab of Excel
          autoFilter: true, // True means that that user will be unable to modify this setting
          deleteColumns: true,
          deleteRows: true,
          formatCells: true,
          formatColumns: true,
          formatRows: true,
          insertColumns: true,
          insertHyperlinks: true,
          insertRows: true,
          objects: true,
          password: "as1dad1a1dw656w",
          pivotTables: true,
          scenarios: true,
          selectLockedCells: true,
          selectUnlockedCells: true,
          sheet: true,
          sort: true,
        },*/
      });

      for (i = 0; i < medicos.length; i++) {
        ws2
          .cell(1 + i, 1)
          .string(`${medicos[i].Nombres} ${medicos[i].Apellidos}`);
      }
      
      ws.addDataValidation({
        type: "list",
        allowBlank: false,
        prompt: "Elige un médico de la lista",
        error: "Debe seleccionar un médico de la lista",
        showDropDown: true,
        sqref: `J2:J500`,
        formulas: [`=Datos!$A$1:$A$${medicos.length}`],
      });

      }
      if (tipo == 4) {
        ws.cell(1, 1).string("Nombres").style(style);
        ws.cell(1, 2).string("Apellidos").style(style);
        ws.cell(1, 3).string("Cedula").style(style);
        ws.cell(1, 4).string("Role").style(style);
        ws.cell(1, 5).string("Contactos").style(style);
        ws.cell(1, 6).string("email").style(style);
        ws.cell(1, 7).string("password").style(style);
        ws.cell(1, 8).string("Sucursal").style(style);
      }

      wb.write(`Formato registro masivo ${tipoDescarga}.xlsx`, res);
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/api/importar-formato-edicion-masiva/:id",
  isAuthenticatedMaster,
  async (req, res, next) => {
    try {
      let tipo = req.params.id;
      let tipoDescarga;

      if (tipo == 1) tipoDescarga = "Análisis";
      if (tipo == 2) tipoDescarga = "Médicos";
      if (tipo == 3) tipoDescarga = "Pacientes";
      if (tipo == 4) tipoDescarga = "Usuarios";

      const xl = require("excel4node");
      const wb = new xl.Workbook();
      const ws = wb.addWorksheet(`Formato edición masiva ${tipoDescarga}`);
      const style = wb.createStyle({
        font: {
          color: "#FFFFFF",
          size: 11,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#313a46",
          fgColor: "#313a46",
        },
      });

      if (tipo == 1) {
        let examenes = await examenDB
          .find()
          .select(
            "Nombre Tipo Puntos SubTipo1 SubTipo2 SubTipo3 CampoTexto CantidadMaxima AgregadoPosterior Comisiones OrdenPetitorio"
          )
          .sort({ OrdenPetitorio: 1 })
          .lean();

        ws.cell(1, 1).string("_id").style(style);
        ws.cell(1, 2).string("Nombre").style(style);
        ws.cell(1, 3).string("Tipo").style(style);
        ws.cell(1, 4).string("Puntos").style(style);
        ws.cell(1, 5).string("SubTipo1").style(style);
        ws.cell(1, 6).string("SubTipo2").style(style);
        ws.cell(1, 7).string("SubTipo3").style(style);
        ws.cell(1, 8).string("CampoTexto").style(style);
        ws.cell(1, 9).string("CantidadMaxima").style(style);
        ws.cell(1, 10).string("AgregadoPosterior").style(style);
        ws.cell(1, 11).string("Comisiones").style(style);
        ws.cell(1, 12).string("OrdenPetitorio").style(style);

        for (i = 0; i < examenes.length; i++) {
          let ordenPetitorio =
            examenes[i].OrdenPetitorio == undefined
              ? 0
              : examenes[i].OrdenPetitorio;

          ws.cell(i + 2, 1).string(examenes[i]._id.toString()); //a
          ws.cell(i + 2, 2).string(examenes[i].Nombre); //a
          ws.cell(i + 2, 3).string(examenes[i].Tipo); //b
          ws.cell(i + 2, 4).number(examenes[i].Puntos); //c
          ws.cell(i + 2, 5).string(examenes[i].SubTipo1); //d
          ws.cell(i + 2, 6).string(examenes[i].SubTipo2); //e
          ws.cell(i + 2, 7).string(examenes[i].SubTipo3); //f
          ws.cell(i + 2, 8).bool(examenes[i].CampoTexto); //g
          ws.cell(i + 2, 9).number(examenes[i].CantidadMaxima); //h
          ws.cell(i + 2, 10).string(examenes[i].AgregadoPosterior); //i
          ws.cell(i + 2, 11).bool(examenes[i].Comisiones); //j
          ws.cell(i + 2, 12).number(ordenPetitorio); //k
        }
      }
      if (tipo == 2) {
        let medicos = await medicoDB
          .find()
          .sort({ Nombres: 1, Apellidos: 1 })
          .select(
            "Nombres Apellidos Cedula Direccion Email Estado Telefono Especialidad FechaNacimiento Cuenta Medalla Comision NumeroCIV GrupoSanguineo"
          );

        ws.cell(1, 1).string("_id").style(style);
        ws.cell(1, 2).string("Nombres").style(style);
        ws.cell(1, 3).string("Apellidos").style(style);
        ws.cell(1, 4).string("Cedula").style(style);
        ws.cell(1, 5).string("Direccion").style(style);
        ws.cell(1, 6).string("Email").style(style);
        ws.cell(1, 7).string("Estado").style(style);
        ws.cell(1, 8).string("Telefono").style(style);
        ws.cell(1, 9).string("Especialidad").style(style);
        ws.cell(1, 10).string("FechaNacimiento").style(style);
        ws.cell(1, 11).string("Cuenta").style(style);
        ws.cell(1, 12).string("Medalla").style(style);
        ws.cell(1, 13).string("Comision").style(style);
        ws.cell(1, 14).string("NumeroCIV").style(style);
        ws.cell(1, 15).string("GrupoSanguineo").style(style);

        for (i = 0; i < medicos.length; i++) {
          ws.cell(i + 2, 1).string(medicos[i]._id.toString());
          ws.cell(i + 2, 2).string(medicos[i].Apellidos);
          ws.cell(i + 2, 3).string(medicos[i].Cedula.toString());
          ws.cell(i + 2, 4).string(medicos[i].Direccion);
          ws.cell(i + 2, 5).string(medicos[i].Email);
          ws.cell(i + 2, 6).string(medicos[i].Estado);
          ws.cell(i + 2, 7).string(medicos[i].Telefono.toString());
          ws.cell(i + 2, 8).string(medicos[i].Especialidad);
          ws.cell(i + 2, 9).string(medicos[i].FechaNacimiento);
          ws.cell(i + 2, 10).string(medicos[i].Cuenta);
          ws.cell(i + 2, 11).string(medicos[i].Medalla);
          ws.cell(i + 2, 12).string(medicos[i].Comision.toString());
          ws.cell(i + 2, 13).string(medicos[i].NumeroCIV.toString());
          ws.cell(i + 2, 14).string(medicos[i].GrupoSanguineo);
          ws.cell(i + 2, 15).string(medicos[i].GrupoSanguineo);
        }
      }
      if (tipo == 3) {
        ws.cell(1, 1).string("_id").style(style);
        ws.cell(1, 2).string("Nombres").style(style);
        ws.cell(1, 3).string("Telefono").style(style);
        ws.cell(1, 4).string("Direccion").style(style);
        ws.cell(1, 5).string("Email").style(style);
        ws.cell(1, 6).string("FechaNacimiento").style(style);
        ws.cell(1, 7).string("TipoFactura").style(style);
        ws.cell(1, 8).string("TipoDocumento").style(style);
        ws.cell(1, 9).string("Documento").style(style);
        ws.cell(1, 10).string("Nota").style(style);

        let pacientes = await pacienteDB
          .find()
          .sort()
          .select(
            "Nombres Telefono Direccion Email FechaNacimiento TipoFactura TipoDocumento Documento Nota"
          );

        for (i = 0; i < pacientes.length; i++) {
          ws.cell(i + 2, 1).string(pacientes[i]._id.toString());
          ws.cell(i + 2, 2).string(pacientes[i].Nombres);
          ws.cell(i + 2, 3).string(pacientes[i].Telefono.toString());
          ws.cell(i + 2, 4).string(pacientes[i].Direccion);
          ws.cell(i + 2, 5).string(pacientes[i].Email);
          ws.cell(i + 2, 6).string(pacientes[i].FechaNacimiento);
          ws.cell(i + 2, 7).string(pacientes[i].TipoFactura);
          ws.cell(i + 2, 8).string(pacientes[i].TipoDocumento);
          ws.cell(i + 2, 9).string(pacientes[i].Documento.toString());
          ws.cell(i + 2, 10).string(pacientes[i].Nota);
        }
      }
      if (tipo == 4) {
        ws.cell(1, 1).string("_id").style(style);
        ws.cell(1, 2).string("Nombres").style(style);
        ws.cell(1, 3).string("Apellidos").style(style);
        ws.cell(1, 4).string("Cedula").style(style);
        ws.cell(1, 5).string("Role").style(style);
        ws.cell(1, 6).string("email").style(style);
        ws.cell(1, 7).string("password").style(style);
        ws.cell(1, 8).string("Sucursal").style(style);

        let personal = await personalDB
          .find()
          .sort()
          .select(
            "Nombres Apellidos Cedula Role Contactos Email password Sucursal"
          );

        for (i = 0; i < personal.length; i++) {
          let usuario = await usersDB.findOne({ email: personal[i].Email });

          let email = "Usuario no registrado";
          let password = "Usuario no registrado";

          if (usuario) {
            email = usuario.email;
            password = usuario.password;
          }

          ws.cell(i + 2, 1).string(personal[i]._id.toString());
          ws.cell(i + 2, 2).string(personal[i].Nombres);
          ws.cell(i + 2, 3).string(personal[i].Apellidos);
          ws.cell(i + 2, 4).string(personal[i].Cedula.toString());
          ws.cell(i + 2, 5).string(personal[i].Role);
          ws.cell(i + 2, 6).string(email);
          ws.cell(i + 2, 7).string(password);
          ws.cell(i + 2, 8).string(personal[i].Sucursal);
        }
      }

      wb.write(`Formato edición masiva ${tipoDescarga}.xlsx`, res);
    } catch (err) {
      console.log(err);
    }
  }
);

router.post(
  "/api/cargar-archivo-registro-masivo/:id",
  isAuthenticated,
  upload2.single("Control"),
  async (req, res, next) => {
    try {
      let dataExcel;

      function leerExcel(ruta) {
        const workbook = XLSX.readFile(ruta);
        const workbookSheets = workbook.SheetNames;
        Sucursal = workbookSheets[0];
        const sheet = workbookSheets[0];
        dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
      }
      leerExcel(path.join(__dirname, "controles", "control.xlsx"));

      let tipo = req.params.id;

      let fechaRegistro = moment().format("DD/MM/YYYY");

      if (tipo == 1) {
        // "Análisis"
        for (i = 0; i < dataExcel.legth; i++) {
          let nuevoExamen = new examenDB({
            Nombre: dataExcel[i].Nombre,
            Tipo: dataExcel[i].Tipo,
            Puntos: dataExcel[i].Puntos,
            SubTipo1: dataExcel[i].SubTipo1,
            SubTipo2: dataExcel[i].SubTipo2,
            SubTipo3: dataExcel[i].SubTipo3,
            CampoTexto: dataExcel[i].CampoTexto,
            CantidadMaxima: dataExcel[i].CantidadMaxima,
            AgregadoPosterior: dataExcel[i].AgregadoPosterior,
            Comisiones: dataExcel[i].Comisiones,
            OrdenPetitorio: dataExcel[i].OrdenPetitorio,
          });
          await nuevoExamen.save();
        }
      }
      if (tipo == 2) {
        // "Médicos"
        let ultimoMedico = await medicoDB
          .findOne()
          .sort({ NroAfiliado: -1 })
          .select("NroAfiliado");
        let NroAfiliado = ultimoMedico.NroAfiliado;

        for (i = 0; i < dataExcel.length; i++) {
          let newMedico = new medicoDB({
            Nombres: dataExcel[i].Nombres.toUpperCase(),
            NroAfiliado: +NroAfiliado + 1,
            Apellidos: dataExcel[i].Apellidos.toUpperCase(),
            Medalla: dataExcel[i].Medialla,
            Cedula: dataExcel[i].Cedula,
            Direccion: dataExcel[i].Direccion,
            Email: dataExcel[i].Email.toLowerCase(),
            Estado: "Por activar",
            Fecha_Registro: fechaRegistro,
            Fecha_Modificacion: fechaRegistro,
            Fecha_Eliminacion: "",
            Telefono: dataExcel[i].Telefono,
            Especialidad: dataExcel[i].Especialidad,
            NumeroCIV: dataExcel[i].numeroCIV,
            GrupoSanguineo: dataExcel[i].GrupoSanguineo,
            FechaNacimiento: dataExcel[i].FechaNacimiento,
            Comision: dataExcel[i].Comision,
            Cuenta: dataExcel[i].Cuenta,
            Usuario_Registro: `${req.user.Nombres} ${req.user.Apellidos}`,
          });
          await newMedico.save();

          let footer = "Gracias por formar parte de la familia Club Salud",
            btnTexto = "Activar cuenta",
            btnUrl = `https://app.clubsaludve.com/activar-cuenta/${newMedico._id}`,
            content = `
                <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
                Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
                font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
                Ya eres parte de Club Salud, la mejor plataforma de salud del país. Te damos una grata bienvenida y esperamos que tu experencia dentro de la plataforma sea la mejor.
                </p> </br>
                <p style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
                Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;
                font-weight:400;margin:0;line-height:1.7;padding:0;color:#000;margin-bottom:24px">
                    Solo falta que actives tu cuenta para poder ingresar.
                </p> </br>`,
            titulo = `Hola ${newMedico.Nombres} ${newMedico.Apellidos}. ¡Bienvenido a Club Salud!`;
          const htmlContent = sendEmail(
            footer,
            btnTexto,
            btnUrl,
            content,
            titulo
          );
          let msg = "El médico se registró correctamente";
          transporter
            .sendMail({
              from: "<no-reply@clubsaludve.com>",
              to: newMedico.Email,
              subject: `Bienvenido ${newMedico.Nombres} ${newMedico.Apellidos}.`,
              html: htmlContent,
            })
            .then((data) => {});
        }
      }
      if (tipo == 3) {
        // "Pacientes"
        const medicosSolicitudes = await medicoDB.find().select('Nombres Apellidos').lean()
        for (i = 0; i < dataExcel.length; i++) {
          let random = Math.floor(100000 + Math.random() * 900000);
          let medicoBusqueda = medicosSolicitudes.find(
            (data) =>
              `${data.Nombres} ${data.Apellidos}` === dataExcel[i].Medico
          );
          let newPaciente = new pacienteDB({
            Nombres: dataExcel[i].Nombres.toUpperCase(),
            Documento: dataExcel[i].Documento,
            Direccion: dataExcel[i].Direccion,
            FechaNacimiento: dataExcel[i].FechaNacimiento,
            Telefono: dataExcel[i].Telefono,
            TipoFactura: dataExcel[i].TipoFactura,
            TipoDocumento: dataExcel[i].TipoDocumento,
            Email: dataExcel[i].Email.toLowerCase(),
            Role: "Paciente",
            Estado: "Por activar",
            Fecha_Registro: fechaRegistro,
            Nota: dataExcel[i].Nota,
            Clave: random,
            Medicos: [{
              _idMedico: medicoBusqueda._id,
              Medico: dataExcel[i].Medico,
            }],
            Fecha_Modificacion: fechaRegistro,
            Fecha_Eliminacion: "",
            Usuario_Registro: `${req.user.Nombres} ${req.user.Apellidos}`,
          });

          await newPaciente.save();
        }
      }
      if (tipo == 4) {
        // "Usuarios"
        for (i = 0; i < dataExcel.length; i++) {
          let nuevoPersonal = new personalDB({
            Nombres: dataExcel[i].Nombres,
            Apellidos: dataExcel[i].Apellidos,
            Cedula: dataExcel[i].Cedula,
            Role: [dataExcel[i].Role],
            Email: dataExcel[i].email.toLowerCase(),
            password: dataExcel[i].password,
            Sucursal: dataExcel[i].Sucursal,
            Direccion: "",
            FechaNacimiento: "",
            Cargo: "",
            Fecha_Registro: fechaRegistro,
          });
          let id = nuevoPersonal._id;

          email = email.toLowerCase();
          let nuevoUsuario = new usersDB({
            Nombres: nuevoPersonal.Nombres,
            Apellidos: nuevoPersonal.Apellidos,
            Cedula: nuevoPersonal.Cedula,
            Role: [nuevoPersonal.Role],
            TipoUsuario: "Personal",
            email: nuevoPersonal.Email,
            status: "activo",
            Fecha_Registro: fechaRegistro,
            Fecha_Ultimo_Acceso: fechaRegistro,
            Fecha_Ultima_Modificacion: fechaRegistro,
            Fecha_Ultimo_Cambio_Password: fechaRegistro,
            Usuario_Registro: `${req.user.Nombres} ${req.user.Apellidos}`,
            Usuario_Ultimo_Cambio_Password: `${req.user.Nombres} ${req.user.Apellidos}`,
            Usuario_Ultima_Modificacion: `${req.user.Nombres} ${req.user.Apellidos}`,
            Sucursal: nuevoPersonal.Sucursal,
          });
          nuevoUsuario.password = await nuevoUsuario.encryptPassword(password);
          await nuevoUsuario.save();
          await nuevoPersonal.save();
        }
      }

      req.flash("success", "Datos registrados correctamente");
      res.redirect(`/registro-masivo/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  }
);

router.post(
  "/api/cargar-archivo-edicion-masica/:id",
  isAuthenticated,
  upload2.single("Control"),
  async (req, res, next) => {
    try {
      let dataExcel;

      function leerExcel(ruta) {
        const workbook = XLSX.readFile(ruta);
        const workbookSheets = workbook.SheetNames;
        Sucursal = workbookSheets[0];
        const sheet = workbookSheets[0];
        dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
      }
      leerExcel(path.join(__dirname, "controles", "control.xlsx"));

      let tipo = req.params.id;

      let fechaRegistro = moment().format("DD/MM/YYYY");

      if (tipo == 1) {
        for (i = 0; i < dataExcel.legth; i++) {
          await examenDB.findByIdAndUpdate(dataExcel[i]._id, {
            Nombre: dataExcel[i].Nombre,
            Tipo: dataExcel[i].Tipo,
            Puntos: dataExcel[i].Puntos,
            SubTipo1: dataExcel[i].SubTipo1,
            SubTipo2: dataExcel[i].SubTipo2,
            SubTipo3: dataExcel[i].SubTipo3,
            CampoTexto: dataExcel[i].CampoTexto,
            CantidadMaxima: dataExcel[i].CantidadMaxima,
            AgregadoPosterior: dataExcel[i].AgregadoPosterior,
            Comisiones: dataExcel[i].Comisiones,
            OrdenPetitorio: dataExcel[i].OrdenPetitorio,
          });
        }
      }
      if (tipo == 2) {
        let ultimoMedico = await medicoDB
          .findOne()
          .sort({ NroAfiliado: -1 })
          .select("NroAfiliado");
        let NroAfiliado = ultimoMedico.NroAfiliado;

        for (i = 0; i < dataExcel.length; i++) {
          await medicoDB.findByIdAndUpdate(dataExcel[i]._id, {
            Nombres: dataExcel[i].Nombres.toUpperCase(),
            NroAfiliado: +NroAfiliado + 1,
            Apellidos: dataExcel[i].Apellidos.toUpperCase(),
            Medalla: dataExcel[i].Medialla,
            Cedula: dataExcel[i].Cedula,
            Direccion: dataExcel[i].Direccion,
            Email: dataExcel[i].Email.toLowerCase(),
            Fecha_Modificacion: fechaRegistro,
            Fecha_Eliminacion: "",
            Telefono: dataExcel[i].Telefono,
            Especialidad: dataExcel[i].Especialidad,
            NumeroCIV: dataExcel[i].numeroCIV,
            GrupoSanguineo: dataExcel[i].GrupoSanguineo,
            FechaNacimiento: dataExcel[i].FechaNacimiento,
            Comision: dataExcel[i].Comision,
            Cuenta: dataExcel[i].Cuenta,
          });
        }
      }
      if (tipo == 3) {
        for (i = 0; i < dataExcel.length; i++) {
          await pacienteDB.findByIdAndUpdate(dataExcel[i]._id, {
            Nombres: dataExcel[i].Nombres.toUpperCase(),
            Documento: dataExcel[i].Documento,
            Direccion: dataExcel[i].Direccion,
            FechaNacimiento: dataExcel[i].FechaNacimiento,
            Telefono: dataExcel[i].Telefono,
            TipoFactura: dataExcel[i].TipoFactura,
            TipoDocumento: dataExcel[i].TipoDocumento,
            Email: dataExcel[i].Email.toLowerCase(),
            Fecha_Registro: fechaRegistro,
            Nota: dataExcel[i].Nota,
            Fecha_Modificacion: fechaRegistro,
          });
        }
      }
      if (tipo == 4) {
        for (i = 0; i < dataExcel.length; i++) {
          let personalBase = await personalDB.findById(dataExcel[i]._id);
          let passwordBase = personalBase.password;
          let passwordNueva = dataExcel[i].password;

          await personalDB.findByIdAndUpdate(dataExcel[i]._id, {
            Nombres: dataExcel[i].Nombres,
            Apellidos: dataExcel[i].Apellidos,
            Cedula: dataExcel[i].Cedula,
            Role: [dataExcel[i].Role],
            Email: dataExcel[i].email.toLowerCase(),
            password: passwordNueva,
            Sucursal: dataExcel[i].Sucursal,
          });

          email = email.toLowerCase();

          if (passwordBase != passwordNueva) {
            let nuevaPassword = await nuevoUsuario.encryptPassword(password);
            await usersDB.findOneAndUpdate(
              { email: personalBase.Email },
              {
                Nombres: dataExcel[i].Nombres,
                Apellidos: dataExcel[i].Apellidos,
                Cedula: dataExcel[i].Cedula,
                Role: [nuevoPersonal.Role],
                email: dataExcel[i].email.toLowerCase(),
                Sucursal: nuevoPersonal.Sucursal,
                password: nuevaPassword,
              }
            );
          } else {
            await usersDB.findOneAndUpdate(
              { email: personalBase.Email },
              {
                Nombres: dataExcel[i].Nombres,
                Apellidos: dataExcel[i].Apellidos,
                Cedula: dataExcel[i].Cedula,
                Role: [nuevoPersonal.Role],
                email: dataExcel[i].email.toLowerCase(),
                Sucursal: dataExcel[i].Sucursal,
              }
            );
          }
        }
      }

      req.flash("success", "Datos editados correctamente");
      res.redirect(`/edicion-masiva/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/registro-masivo-solicitudes",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let notificaciones = await notificacionDB
        .find({ _idUsuario: req.user._id })
        .sort({ Timestamp: -1 })
        .limit(5)
        .lean();
      res.render("content/funciones-avanzadas/registro-masivo-solicitudes", {
        notificaciones,
        tipoNumero: req.params.id,
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/api/importar-formato-registro-masivo-solicitudes",
  isAuthenticatedMaster,
  async (req, res, next) => {
    try {
      const medicos = await medicoDB
        .find()
        .select("Nombres Apellidos")
        .sort({ Nombres: 1 });
      const analisis = await examenDB
        .find()
        .select("Nombre")
        .sort({ Nombre: 1 });
      const pacientes = await pacienteDB
        .find()
        .select("Nombres")
        .sort({ Nombre: 1 });

      const xl = require("excel4node");

      const wb = new xl.Workbook();

      const ws = wb.addWorksheet("Solicitudes");

      const ws2 = wb.addWorksheet("Datos", {
        /* sheetProtection: {
          // same as "Protect Sheet" in Review tab of Excel
          autoFilter: true, // True means that that user will be unable to modify this setting
          deleteColumns: true,
          deleteRows: true,
          formatCells: true,
          formatColumns: true,
          formatRows: true,
          insertColumns: true,
          insertHyperlinks: true,
          insertRows: true,
          objects: true,
          password: "as1dad1a1dw656w",
          pivotTables: true,
          scenarios: true,
          selectLockedCells: true,
          selectUnlockedCells: true,
          sheet: true,
          sort: true,
        },*/
      });

      for (i = 0; i < medicos.length; i++) {
        ws2
          .cell(1 + i, 1)
          .string(`${medicos[i].Nombres} ${medicos[i].Apellidos}`);
      }
      for (i = 0; i < analisis.length; i++) {
        ws2.cell(1 + i, 2).string(`${analisis[i].Nombre}`);
      }
      for (i = 0; i < pacientes.length; i++) {
        ws2.cell(1 + i, 3).string(`${pacientes[i].Nombres}`);
      }
      ws2.cell(1, 4).string("true");
      ws2.cell(2, 4).string("false");

      const headers = wb.createStyle({
        font: {
          color: "#ffffff",
          size: 11,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#15A204",
          fgColor: "#15A204",
        },
      });
      const headers1 = wb.createStyle({
        font: {
          color: "#ffffff",
          size: 11,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#343a40",
          fgColor: "#343a40",
        },
      });

      ws.cell(1, 1).string("Numero").style(headers); //a
      ws.cell(1, 2).string("Fecha").style(headers); //b
      ws.cell(1, 3).string("Medico").style(headers); //c
      ws.cell(1, 4).string("Paciente").style(headers); //d
      ws.cell(1, 5).string("Observacion").style(headers); //e
      ws.cell(1, 6).string("PuntosDescontar").style(headers); //f
      ws.cell(1, 7).string("NoGeneraComision").style(headers); //g
      ws.cell(1, 8).string("NoGeneraPuntos").style(headers); //h
      ws.cell(1, 9).string("NombreExamen").style(headers1); //i
      ws.cell(1, 10).string("Cantidad").style(headers1); //j
      ws.cell(1, 11).string("PrecioPersonalizado").style(headers1); //

      const longitudMedicos = medicos.length == 0 ? 1 : medicos.length;
      const longitudAnalisis = analisis.length == 0 ? 1 : analisis.length;
      const longitudPacientes = pacientes.length == 0 ? 1 : pacientes.length;

      ws.addDataValidation({
        type: "list",
        allowBlank: false,
        prompt: "Elige un médico de la lista",
        error: "Debe seleccionar un médico de la lista",
        showDropDown: true,
        sqref: `C2:C500`,
        formulas: [`=Datos!$A$1:$A$${longitudMedicos}`],
      });

      ws.addDataValidation({
        type: "list",
        allowBlank: false,
        prompt: "Elige un paciente de la lista",
        error: "Debe seleccionar un paciente de la lista",
        showDropDown: true,
        sqref: `D2:D500`,
        formulas: [`=Datos!$C$1:$C$${longitudPacientes}`],
      });

      ws.addDataValidation({
        type: "list",
        allowBlank: false,
        prompt: "Elige un análisis de la lista",
        error: "Debe seleccionar un análisis de la lista",
        showDropDown: true,
        sqref: `I2:I500`,
        formulas: [`=Datos!$B$1:$B$${longitudAnalisis}`],
      });
      ws.addDataValidation({
        type: "list",
        allowBlank: false,
        prompt: "Elige un opción de la lista",
        error: "Debe seleccionar un opción de la lista",
        showDropDown: true,
        sqref: `G2:G500`,
        formulas: [`=Datos!$D$1:$D$2`],
      });
      ws.addDataValidation({
        type: "list",
        allowBlank: false,
        prompt: "Elige un opción de la lista",
        error: "Debe seleccionar un opción de la lista",
        showDropDown: true,
        sqref: `H2:H500`,
        formulas: [`=Datos!$D$1:$D$2`],
      });

      wb.write(`Registro masivo de solicitudes.xlsx`, res);
    } catch (err) {
      console.log(err);
    }
  }
);

router.post(
  "/api/cargar-archivo-registro-masivo-solicitudes",
  isAuthenticated,
  upload2.single("Control"),
  async (req, res, next) => {
    try {
      let dataExcel;
      function leerExcel(ruta) {
        const workbook = XLSX.readFile(ruta);
        const workbookSheets = workbook.SheetNames;
        Sucursal = workbookSheets[0];
        const sheet = workbookSheets[0];
        dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
      }
      leerExcel(path.join(__dirname, "controles", "control.xlsx"));

      let medicos = await medicoDB.find();
      let medicosSolicitudes = [];
      let errores = [];
      let pacientes = [];
      let examenes = [];
      for (i = 0; i < dataExcel.length; i++) {
        let medico = medicos.find(
          (data) => `${data.Nombres} ${data.Apellidos}` === dataExcel[i].Medico
        );
        let paciente = await pacienteDB.findOne({
          Nombres: dataExcel[i].Paciente,
        });
        let examen = await examenDB.findOne({
          Nombre: dataExcel[i].NombreExamen,
        });
        if (dataExcel[i].Numero === undefined) {
          errores.push(
            `El campo "Numero" de la linea ${
              i + 1
            } no debe estar vacio y debe tener un valor númerico`
          );
        }
        if (medico) {
          medicosSolicitudes.push(medico);
        } else {
          errores.push(
            `El médico de la linea ${i + 1} no se encuentro en la base de datos`
          );
        }
        if (paciente) {
          pacientes.push(paciente);
        } else {
          errores.push(
            `El paciente de la linea ${
              i + 1
            } no se encuentro en la base de datos`
          );
        }
        if (examen) {
          examenes.push(examen);
        } else {
          errores.push(
            `El analisis de la linea ${
              i + 1
            } no se encuentro en la base de datos`
          );
        }
        if (
          dataExcel[i].NoGeneraComision !== "false" &&
          dataExcel[i].NoGeneraComision !== "true"
        ) {
          errores.push(
            `El campo "NoGeneraComision" de la linea ${
              i + 1
            } debe tener un valor de la lista`
          );
        }
        if (
          dataExcel[i].NoGeneraPuntos !== "false" &&
          dataExcel[i].NoGeneraPuntos !== "true"
        ) {
          errores.push(
            `El campo "NoGeneraPuntos" de la linea ${
              i + 1
            } debe tener un valor de la lista`
          );
        }
        if (dataExcel[i].Cantidad !== undefined) {
          let cantidad = +dataExcel[i].Cantidad;
          if (cantidad <= 0) {
            errores.push(
              `El campo "Cantidad" de la linea ${
                i + 1
              } debe tener un valor númerico mayor a cero`
            );
          }
        } else {
          errores.push(
            `El campo "Cantidad" de la linea ${
              i + 1
            } debe tener un valor númerico mayor a cero`
          );
        }
        if (dataExcel[i].PuntosDescontar !== undefined) {
          let PuntosDescontar = +dataExcel[i].PuntosDescontar;
          if (PuntosDescontar <= 0) {
            errores.push(
              `El campo "PuntosDescontar" de la linea ${
                i + 1
              } debe tener un valor númerico mayor a cero`
            );
          }
        }
      }

      if (errores.length > 0) {
        req.flash("error", errores[0]);
        res.redirect(`/registro-masivo-solicitudes`);
      } else {
        let solicitudes = [];
        let Fecha = new Date();
        let dia;
        let mes;
        let año = Fecha.getFullYear();
        if (Fecha.getDate() < 10) {
          dia = `0${Fecha.getDate()}`;
        } else {
          dia = Fecha.getDate();
        }
        if (Fecha.getMonth() + 1 < 10) {
          mes = `0${Fecha.getMonth() + 1}`;
        } else {
          mes = Fecha.getMonth() + 1;
        }
        Fecha = `${dia}/${mes}/${año}`;
        let examenesS = await examenesSDB.findOne().sort({ Timestamp: -1 });
        let Numero = 2022000001;
        if (examenesS) {
          Numero = +examenesS.Numero + 1;
        }

        for (i = 0; i < dataExcel.length; i++) {
          let validacion = solicitudes.find(
            (data) => data.NumeroDos == dataExcel[i].Numero
          );
          let examenBusqueda = examenes.find(
            (data) => data.Nombre === dataExcel[i].NombreExamen
          );
          let medicoBusqueda = medicosSolicitudes.find(
            (data) =>
              `${data.Nombres} ${data.Apellidos}` === dataExcel[i].Medico
          );
          let pacienteBusqueda = pacientes.find(
            (data) => data.Nombres === dataExcel[i].Paciente
          );
          if (validacion) {
            solicitudes = solicitudes.map((data) => {
              if (data.NumeroDos == dataExcel[i].Numero) {
                let puntosExamen =
                  dataExcel[i].PrecioPersonalizado != undefined
                    ? dataExcel[i].PrecioPersonalizado
                    : examenBusqueda.Puntos;
                data.ListaExamenes.push({
                  id: examenBusqueda._id,
                  nombre: examenBusqueda.Nombre,
                  puntos: +(puntosExamen * +dataExcel[i].Cantidad).toFixed(2),
                  cantidad: dataExcel[i].Cantidad,
                  subtipo: "",
                  tipo: examenBusqueda.Tipo,
                  agregadoPosterior: "",
                });
                data.ExamenesTotales = data.ListaExamenes.length;
              }
              return data;
            });
          } else {
            let puntosExamen =
              dataExcel[i].PrecioPersonalizado != undefined
                ? dataExcel[i].PrecioPersonalizado
                : examenBusqueda.Puntos;

            let listaExamenes = [
              {
                id: examenBusqueda._id,
                nombre: examenBusqueda.Nombre,
                puntos: +(puntosExamen * +dataExcel[i].Cantidad).toFixed(2),
                cantidad: dataExcel[i].Cantidad,
                subtipo: "",
                tipo: examenBusqueda.Tipo,
                agregadoPosterior: "",
              },
            ];

            let observacion =
              dataExcel[i].PuntosDescontar != undefined
                ? dataExcel[i].PuntosDescontar
                : "";
            let AplicarDescuento =
              dataExcel[i].PuntosDescontar != undefined ? true : false;

            let PuntosDescuentos =
              dataExcel[i].PuntosDescontar != undefined
                ? dataExcel[i].PuntosDescontar
                : 0;

            Fecha =
              dataExcel[i].Fecha != undefined ? dataExcel[i].Fecha : Fecha;

            let subdata = {
              Fecha: Fecha,
              Timestamp: Date.now(),
              Numero: Numero,
              NumeroDos: dataExcel[i].Numero,
              ExamenesTotales: 1,
              Comision: medicoBusqueda.Comision,
              Medico: dataExcel[i].Medico,
              _idMedico: medicoBusqueda._id,
              Paciente: pacienteBusqueda.Nombres,
              _idPaciente: pacienteBusqueda._id,
              Observacion: observacion,
              AplicarDescuento: AplicarDescuento,
              PuntosTotales: 0,
              PuntosMedico: 0,
              PuntosDescuento: PuntosDescuentos,
              PuntosNetos: 0,
              ListaExamenes: listaExamenes,
              CedulaMedico: medicoBusqueda.Cedula,
              FormaPagoMedico: medicoBusqueda.Cuenta,
              noGeneraComision: dataExcel[i].NoGeneraComision,
              noGenerarPuntos: dataExcel[i].NoGeneraPuntos,
              DocumentoPaciente: pacienteBusqueda.Documento,
              DireccionPaciente: pacienteBusqueda.Direccion,
              FechaNacimientoPaciente: pacienteBusqueda.FechaNacimiento,
              TelefonoPaciente: pacienteBusqueda.Telefono,
            };
            solicitudes.push(subdata);
          }
          Numero++;
        }

        for (r = 0; r < solicitudes.length; r++) {
          let PuntosTotales = 0;
          let PuntosMedico = 0;
          for (d = 0; d < solicitudes[r].ListaExamenes.length; d++) {
            PuntosTotales = +(
              +PuntosTotales + +solicitudes[r].ListaExamenes[d].puntos
            ).toFixed(2);
          }

          if (+solicitudes[r].Comision < 10) {
            let comisionFactor = solicitudes[r].Comision.toString().replace(
              ",",
              ""
            );
            let factorComision = `0.0${comisionFactor}`;
            PuntosMedico = +(PuntosTotales * +factorComision).toFixed(2);
          }
          if (
            +solicitudes[r].Comision >= 10 &&
            +solicitudes[r].Comision < 100
          ) {
            let comisionFactor = solicitudes[r].Comision.toString().replace(
              ",",
              ""
            );
            let factorComision = `0.${comisionFactor}`;
            PuntosMedico = +(PuntosTotales * +factorComision).toFixed(2);
          }
          if (solicitudes[r].Comision == 100) {
            let factorComision = `1`;
            PuntosMedico = +(PuntosTotales * +factorComision).toFixed(2);
          }

          let PuntosNetos = +(
            +PuntosTotales -
            +PuntosMedico -
            +solicitudes[r].PuntosDescuento
          ).toFixed(2);

          if (
            solicitudes[r].noGeneraComision == "true" ||
            solicitudes[r].noGeneraComision == true
          ) {
            PuntosMedico = 0;
          }
          if (
            solicitudes[r].noGenerarPuntos == "true" ||
            solicitudes[r].noGenerarPuntos == true
          ) {
            PuntosMedico = 0;
            PuntosTotales = 0;
            PuntosNetos = 0;
          }

          solicitudes[r].PuntosMedico = PuntosMedico;
          solicitudes[r].PuntosTotales = PuntosTotales;
          solicitudes[r].PuntosNetos = PuntosNetos;
        }

        let Mes = "";
        switch (mes) {
          case "01":
            Mes = "Enero";
            break;
          case "02":
            Mes = "Febrero";
            break;
          case "03":
            Mes = "Marzo";
            break;
          case "04":
            Mes = "Abril";
            break;
          case "05":
            Mes = "Mayo";
            break;
          case "06":
            Mes = "Junio";
            break;
          case "07":
            Mes = "Julio";
            break;
          case "08":
            Mes = "Agosto";
            break;
          case "09":
            Mes = "Septiembre";
            break;
          case "10":
            Mes = "Octubre";
            break;
          case "11":
            Mes = "Noviembre";
            break;
          case "12":
            Mes = "Diciembre";
        }

        for (i = 0; i < solicitudes.length; i++) {
          let validacionIndicadores = await examenesIndicadoresDB.findOne({
            $and: [
              { NumeroMes: solicitudes[i].Fecha.split("-")[1] },
              { Anio: solicitudes[i].Fecha.split("-")[2] },
            ],
          });
          if (validacionIndicadores) {
            let Cantidad =
              +validacionIndicadores.Cantidad +
              +solicitudes[i].ListaExamenes.length;
            await examenesIndicadoresDB.findByIdAndUpdate(
              validacionIndicadores._id,
              {
                Cantidad,
              }
            );
          } else {
            let nuevoExamenesIndicadores = new examenesIndicadoresDB({
              Mes: Mes,
              NumeroMes: mes,
              Cantidad: solicitudes[i].ListaExamenes.length,
              Anio: año,
            });

            await nuevoExamenesIndicadores.save();
          }

          let validacion2 = await examenesIndicadoresMedicoDB.findOne({
            $and: [
              { NumeroMes: solicitudes[i].Fecha.split("-")[1] },
              { Anio: solicitudes[i].Fecha.split("-")[2] },
              { _idMedico: solicitudes[i]._idMedico },
            ],
          });
          if (validacion2) {
            let Cantidad =
              +validacion2.Cantidad + +solicitudes[i].ListaExamenes.length;
            await examenesIndicadoresMedicoDB.findByIdAndUpdate(
              validacion2._id,
              {
                Cantidad,
              }
            );
          } else {
            let nuevoExamenesIndicadores = new examenesIndicadoresMedicoDB({
              Mes: Mes,
              Medico: solicitudes[i].Medico,
              _idMedico: solicitudes[i]._idMedico,
              NumeroMes: mes,
              Cantidad: solicitudes[i].ListaExamenes.length,
              Anio: año,
            });

            await nuevoExamenesIndicadores.save();
          }

          let nuevoExamenS = new examenesSDB({
            Fecha: solicitudes[i].Fecha,
            Timestamp: solicitudes[i].Timestamp,
            Numero: solicitudes[i].Numero,
            ExamenesTotales: solicitudes[i].ExamenesTotales,
            Comision: solicitudes[i].Comision,
            Medico: solicitudes[i].Medico,
            _idMedico: solicitudes[i]._idMedico,
            Paciente: solicitudes[i].Paciente,
            _idPaciente: solicitudes[i]._idPaciente,
            Observacion: solicitudes[i].Observacion,
            AplicarDescuento: solicitudes[i].AplicarDescuento,
            PuntosTotales: solicitudes[i].PuntosTotales,
            PuntosMedico: solicitudes[i].PuntosMedico,
            PuntosDescuento: solicitudes[i].PuntosDescuento,
            PuntosNetos: solicitudes[i].PuntosNetos,
            ListaExamenes: solicitudes[i].ListaExamenes,
            CedulaMedico: solicitudes[i].CedulaMedico,
            FormaPagoMedico: solicitudes[i].FormaPagoMedico,
            noGeneraComision: solicitudes[i].noGeneraComision,
            noGenerarPuntos: solicitudes[i].noGenerarPuntos,
            DocumentoPaciente: solicitudes[i].DocumentoPaciente,
            DireccionPaciente: solicitudes[i].DireccionPaciente,
            FechaNacimientoPaciente: solicitudes[i].FechaNacimientoPaciente,
            TelefonoPaciente: solicitudes[i].TelefonoPaciente,
          });

          await nuevoExamenS.save();
        }
        req.flash("success", "Solicitudes creadas correctamente");
        res.redirect(`/registro-masivo-solicitudes`);
      }
    } catch (err) {
      console.log(err);
      req.flash("error", err);
      res.redirect(`/registro-masivo-solicitudes`);
    }
  }
);

module.exports = router;
