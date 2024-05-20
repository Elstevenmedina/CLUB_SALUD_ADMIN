const router = require('express').Router();
const { isAuthenticatedMedico } = require("../helpers/auth");
const { isAuthenticated } = require("../helpers/auth");
const errorDB = require("../models/soporte/errores");
const notificacionDB = require("../models/herramientas/notificaciones");
const pacienteDB = require("../models/data/paciente");
const medicoDB = require("../models/data/medico");
const examenDB = require("../models/data/examenes");
const examenesSDB = require("../models/servicios/examenes");
const usersDB = require("../models/data/users");
const tipoExamenDB = require("../models/data/tipoExamen");
const historialPuntosDB = require("../models/servicios/historialPuntos");
const chatDB = require("../models/data/chat");
const historialIngresoDB = require("../models/servicios/historialIngresos");
const examenesIndicadoresDB = require("../models/indicadores/examenesIndicadores")
const examenesIndicadoresMedicoDB = require("../models/indicadores/medico/examenesIndicadoresMedico")
const pacientesIndicadoresDB = require("../models/indicadores/medico/pacientesIndicadoresMedico")
const puntosIndicadoresMedicoDB = require("../models/indicadores/medico/puntosIndicadoresMedico")
const puntosSemanalesIndicadoresMedicoDB = require("../models/indicadores/medico/puntosSemanalesIndicadoresMedico")
const mensajesWhatsappDB = require("../models/herramientas/mensajes-whatsapp")
const constanciasCanjeDB = require("../models/servicios/constancias-canje")
const especialidadesDB = require("../models/data/especialidades");
const perfilesDB = require("../models/data/perfiles")
const solicitudCanjeDB = require("../models/servicios/solicitud-canje")
const multer = require('multer');
const cloudinary = require("cloudinary")
const path = require('path')
const tiposCanjesDB = require("../models/data/tipo-canjes")
const moment = require("moment-timezone");
const otrosServiciosDB = require("../models/servicios/otros-servicios")
const serviciosDB = require("../models/data/servicios");
const afiliadosFichaDB = require("../models/data/afiliado_ficha");
moment.tz.setDefault("America/Caracas");

const upload = multer({
    storage: multer.diskStorage({
        destination: 'src/public/images/profile_pictures',
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            let data = {
                status: 'error',
                msg: "Ocurrio en error al cargar la imagen, solo se permiten imagenes con formato png, jpg o jpeg"
            }
        }
    }
});

cloudinary.config({
    cloud_name: 'testrps',
    api_key: '329682633831313',
    api_secret: process.env.SECRET_CLOUDINARY
});


router.get('/inicio-medicos', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })

        let medallaBronce = await medallasDB.findOne({ Nombre: 'Bronce' })
        let medallaPlata = await medallasDB.findOne({ Nombre: 'Plata' })
        let medallaOro = await medallasDB.findOne({ Nombre: 'Oro' })
        let medallaPlatino = await medallasDB.findOne({ Nombre: 'Platino' })

        let rutaMedalla1 = '/assets/images/medals/bronze.png'
        let rutaMedalla2 = '/assets/images/medals/silver.png'
        let nombreMedalla1 = 'Bronce'
        let nombreMedalla2 = 'Plata'
        let puntosMedalla1 = medallaBronce.Desde
        let puntosMedalla2 = medallaBronce.Hasta



        if (medico.Medalla == 'Plata') {
            rutaMedalla1 = '/assets/images/medals/silver.png'
            rutaMedalla2 = '/assets/images/medals/gold.png'
            puntosMedalla1 = medallaPlata.Desde
            puntosMedalla2 = medallaPlata.Hasta
            nombreMedalla1 = 'Plata'
            nombreMedalla2 = 'Oro'
        }
        if (medico.Medalla == 'Oro') {
            rutaMedalla1 = '/assets/images/medals/gold.png'
            rutaMedalla2 = '/images/icons/icon.png'
            puntosMedalla1 = medallaOro.Desde
            nombreMedalla2 = '∞'
            nombreMedalla1 = 'Oro'
            nombreMedalla2 = 'Club Salud'
        }

        let dataPuntos = {
            rutaMedalla1,
            rutaMedalla2,
            nombreMedalla1,
            nombreMedalla2,
            puntosMedalla1,
            puntosMedalla2,
        }

        let examenes = await examenesSDB.find({ $and: [{ _idMedico: medico._id }, { Estado: "Procesado" }] }).sort({ Numero: -1 }).limit(5)
        examenes = examenes.map((data) => {
            return {
                Paciente: data.Paciente,
                FechaAtencion: data.FechaAtencion,
                PuntosTotales: data.PuntosTotales,
                Comision: data.Comision,
                PuntosMedico: data.PuntosMedico,
            }
        })

        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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
            }
        })
        res.render('medicos/inicio.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            examenes,
            dataPuntos,
            RutaImage: req.user.RutaImage
        })

    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})

router.get('/medico/registro-examenes', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let Medico = `${req.user.Nombres} ${req.user.Apellidos}`
        let medicoBase = await medicoDB.findOne({ Cedula: req.user.Cedula });
        _idMedico = medicoBase._id;
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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
            }
        })
        res.render('medicos/registro/pacientes.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
            _idMedico,
            Medico
        })
    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})


router.get('/medico/directorio-pacientes', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula });
        let pacientes = await pacienteDB.find({ Medicos: { $elemMatch: { _idMedico: medico._id } } }).lean()
        pacientes = pacientes.map((data) => {
            return {
                _id: data._id,
                Nombres: data.Nombres,
                Apellidos: data.Apellidos,
                Email: data.Email,
                Documento: data.Documento
            }
        })
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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
            }
        })
        res.render('medicos/directorio/pacientes.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
            pacientes

        })
    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})


router.get('/medico/edicion/editar-paciente/:id', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let id = req.params.id;
        let paciente = await pacienteDB.findById(id);

        let tipoFactura = ""
        if (paciente.TipoFactura == "Natural") {
            tipoFactura = "Jurídico"
        } else {
            tipoFactura = "Natural"
        }

        paciente = {
            Nombres: paciente.Nombres,
            _id: paciente._id,
            Apellidos: paciente.Apellidos,
            Documento: paciente.Documento,
            Direccion: paciente.Direccion,
            Medico: paciente.Medico,
            _idMedico: paciente._idMedico,
            Email: paciente.Email,
            FechaNacimiento: paciente.FechaNacimiento,
            Telefono: paciente.Telefono,
            Nota: paciente.Nota,
            TipoFactura: paciente.TipoFactura,
            _id: paciente._id,
        }
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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

            }
        })

        res.render('medicos/directorio/edicion/pacientes.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
            paciente,
            tipoFactura,
        })
    } catch {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})

router.get('/medico/directorio-examenes', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let examenes = await examenDB.find({ Estado: "Activo" }).sort({ Nombre: 1 });
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
        examenes = examenes.map((data) => {
            return {
                Nombre: data.Nombre,
                Tipo: data.Tipo,
                Puntos: data.Puntos,
            }
        })
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
            }
        })
        res.render('medicos/directorio/examenes.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
            examenes
        })
    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})

router.get('/medico/calendario', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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
            }
        })

        res.render('medicos/herramientas/calendario', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
        })
    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})

router.get('/medico/contactos', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let usuarios = await usersDB.find({ TipoUsuario: 'Medico' }).sort({ Nombres: 1, Apellidos: 1 })
        usuarios = usuarios.filter((data) => data.Cedula != req.user.Cedula)
        for (i = 0; i < usuarios.length; i++) {
            let validacion = req.user.Contactos.find((data) => data.toString() == usuarios[i]._id.toString())
            if (validacion) {
                usuarios[i].Contacto = false
            } else {
                usuarios[i].Contacto = true
            }
        }
        usuarios = usuarios.map(async (data) => {
            let medico = await medicoDB.findOne({ Email: data.email }).lean()
            return {
                _id: data._id,
                TipoUsuario: data.TipoUsuario,
                Nombres: data.Nombres,
                Apellidos: data.Apellidos,
                LinkPerfil: false,
                email: data.email,
                Contacto: data.Contacto,
                Especialidad: medico.Especialidad,
                RutaImage: data.RutaImage,
            }
        })

        usuarios = await Promise.all(usuarios)

        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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
            }
        })

        res.render('medicos/social/contactos', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            usuarios
        })

    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})

router.get('/medico/Chat', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let contactos = req.user.Contactos
        let contactosAgregados = []
        let notificaciones = await notificacionDB.find({ $and: [{ _idUsuario: req.user._id }, { Notificacion: true }, { Tipo: 'chat' }] }).sort({ Timestamp: -1 })
        for (i = 0; i < notificaciones.length; i++) {
            await notificacionDB.findByIdAndUpdate(notificaciones[i]._id, {
                Notificacion: false
            })
        }
        notificaciones = await notificacionDB.find({ $and: [{ _idUsuario: req.user._id }, { Notificacion: true }, { Tipo: 'chat' }] }).sort({ Timestamp: -1 }).limit(5);


        for (i = 0; i < contactos.length; i++) {
            let chat = await chatDB.findOne({ $or: [{ $and: [{ _idUsuario1: req.user.id }, { _idUsuario2: contactos[i] }] }, { $and: [{ _idUsuario1: contactos[i] }, { _idUsuario2: req.user.id }] }] })
            mensajes = {
                Usuario: false,
                _idUsuario: false,
                Timestamp: false,
                Tiempo: "",
                RutaImagen: false,
                Mensaje: "",
                Posicion: false,
                Notificacion: false
            }
            if (chat) {
                mensajes = chat.Mensajes[chat.Mensajes.length - 1]
                contactos[i].Mensajes = mensajes
            }
            contactosAgregados.push(await usersDB.findById(contactos[i]))

            contactosAgregados[i].Mensaje = mensajes.Mensaje.toString().substring(0, 20).concat('...')
            contactosAgregados[i].Tiempo = mensajes.Tiempo
            contactosAgregados[i].Timestamp = mensajes.Timestamp
            contactosAgregados[i].Notificacion = mensajes.Notificacion
            if (mensajes._idUsuario == req.user.id) {
                contactosAgregados[i].Notificacion = false
            }
        }
        contactosAgregados.sort(function(a, b) {
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
                Notificacion: data.Notificacion
            }
        })
        contactosAgregados.sort(function(a, b) {
            if (a.Timestamp > b.Timestamp) {
                return -1;
            }
            if (a.Timestamp < b.Timestamp) {
                return 1;
            }
            return 0;
        });
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
            }
        })


        res.render('medicos/social/chat', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            notificaciones,
            contactosAgregados,
            Tema: req.user.Tema,

        })
    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})


router.get('/medico/nuevo-examen', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let examenes = await examenDB.find({ Estado: 'Activo' }).sort({ Nombre: 1 })
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let pacientes = await pacienteDB.find({ Medicos: { $elemMatch: { _idMedico: medico._id } } }).lean()
        if(pacientes.Medicos.length == 0) pacientes = pacientes.filter((paciente) => paciente.Medicos.length > 0)
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).lean().limit(5);
        let tipos = await tipoExamenDB.find({}).sort({ Orden: 1 })
        let especialidades = await especialidadesDB.find({}).sort({ Nombre: 1 }).lean()
        let perfiles = await perfilesDB.find({}).sort({Orden: 1}).lean()
        let dataExamenes = []
        let dataExamenesEspecialidades = []
        let dataExamenesPerfiles = []
        for (i = 0; i < tipos.length; i++) {
            let examenesTipo = examenes.filter((data) => data.Tipo == tipos[i].Nombre)
            if (examenesTipo.length > 0) {
                let data = {
                    Tipo: tipos[i].Nombre,
                    Examenes: examenesTipo
                }
                dataExamenes.push(data)
            }
        }

    
        dataExamenes = dataExamenes.map((data) => {
            return {
                orden: data.Tipo.replace(/ /g, '-'),
                Tipo: data.Tipo,
                Examenes: data.Examenes.map((doc) => {
                    let dosPuntos = false
                    let agregado = false
                    let dataTipos = false
                    if (doc.SubTipo1 || doc.SubTipo1 != "") {
                        dataTipos = true
                        dosPuntos = ":"
                    }
                    if (doc.CampoTexto || doc.CampoTexto != "") {
                        agregado = true
                    }
                    return {
                        Tipo: data.Tipo,
                        _id: doc._id,
                        Puntos: doc.Puntos,
                        Nombre: doc.Nombre,
                        dataTipos: dataTipos,
                        dosPuntos: dosPuntos,
                        SubTipo1: doc.SubTipo1,
                        CantidadMaxima: doc.CantidadMaxima,
                        OrdenPetitorio : doc.OrdenPetitorio,
                        SubTipo2: doc.SubTipo2,
                        SubTipo3: doc.SubTipo3,
                        agregado: agregado,
                        AgregadoPosterior: doc.AgregadoPosterior,
                        clase: doc.clase,
                        Comisiones: doc.Comisiones
                    }
                })
            }
        })

        dataExamenes = dataExamenes.map((data) =>{
            data.Examenes.sort(function(a, b) {
                if (a.OrdenPetitorio < b.OrdenPetitorio) {
                    return -1;
                }
                if (a.OrdenPetitorio > b.OrdenPetitorio) {
                    return 1;
                }
                return 0;
            })

            return data
        })


        //-----Especialidades-----
        for (i = 0; i < especialidades.length; i++) {
            let examenesTipo = examenes.filter((data) => data.Especialidad.includes(especialidades[i].Nombre))
            if (examenesTipo.length > 0) {
                let data = {
                    Especialidad: especialidades[i].Nombre,
                    Examenes: examenesTipo
                }
                dataExamenesEspecialidades.push(data)
            }
        }


        dataExamenesEspecialidades.sort(function(a, b) {
            if (b.Examenes.length < a.Examenes.length) {
                return -1;
            }
            if (b.Examenes.length > a.Examenes.length) {
                return 1;
            }
            return 0;
        })
        
        
        dataExamenesEspecialidades = dataExamenesEspecialidades.map((data) => {
            return {
                Especialidad: data.Especialidad,
                Examenes: data.Examenes.map((doc) => {
                    let dosPuntos = false
                    let agregado = false
                    let dataTipos = false
                    if (doc.SubTipo1 || doc.SubTipo1 != "") {
                        dataTipos = true
                        dosPuntos = ":"
                    }
                    if (doc.CampoTexto || doc.CampoTexto != "") {
                        agregado = true
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
                        Comisiones: doc.Comisiones
                    }
                })
            }
        })
        //-----Especialidades-----
        for (i = 0; i < perfiles.length; i++) {
            let examenesTipo = examenes.filter((data) => data.Perfiles.includes(perfiles[i].Nombre))
            if (examenesTipo.length > 0) {
                let data = {
                    Perfil: perfiles[i].Nombre,
                    Puntos : perfiles[i].Precio,
                    OrdenPerfi: perfiles[i].Orden,
                    Comisiones: true,
                    Tipo: "Perfil",
                    clase: "text-with",
                    _id : perfiles[i]._id,
                    Examenes: examenesTipo,
                }
                dataExamenesPerfiles.push(data)
            }
        }
        
        
        dataExamenesPerfiles.sort(function(a, b) {
            if (b.OrdenPerfi > a.OrdenPerfi) {
                return -1;
            }
            if (b.OrdenPerfi < a.OrdenPerfi) {
                return 1;
            }
            return 0;
        })
        
        
        dataExamenesPerfiles = dataExamenesPerfiles.map((data) => {
            return {
                Perfil: data.Perfil,
                Puntos: data.Puntos,
                Comisiones: data.Comisiones,
                Tipo: data.Tipo,
                clase: data.clase,
                _id: data._id,
                Examenes: data.Examenes.map((doc) => {
                    let dosPuntos = false
                    let agregado = false
                    let dataTipos = false
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
                        OrdenPerfil: doc.OrdenPerfil.filter((subdata) => subdata.Perfil == data.Perfil)[0].Orden
                    }
                })
            }
        })

        dataExamenesPerfiles = dataExamenesPerfiles.map((data) =>{
            data.Examenes.sort(function(a, b) {
                if (a.OrdenPerfil < b.OrdenPerfil) {
                    return -1;
                }
                if (a.OrdenPerfil > b.OrdenPerfil) {
                    return 1;
                }
                return 0;
            })

            return data
        })

        res.render('medicos/servicios/examenes/nuevo-examen.hbs', {
            layout: 'medico.hbs',
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
            perfiles

        })


    } catch (err) {
        console.log(err)
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})

router.post('/solicitar-datos-paciente', isAuthenticated, async(req, res) => {
    let { Paciente } = req.body
    let datosPaciente = await pacienteDB.findById(Paciente).lean()
    let datosMedico = []
    for(i=0; i< datosPaciente.Medicos.length; i++){
        let medicoBase = await medicoDB.findOne({ _id: datosPaciente.Medicos[i]._idMedico })
        datosMedico.push(medicoBase)
    }
    console.log(datosMedico)
    datosPaciente.MedicosAsginados = datosMedico

    res.send(JSON.stringify(datosPaciente))
})

router.post('/medico/nuevo-examen', isAuthenticated, async(req, res, next) => {
    try {
        let { 
            Paciente, 
            Cedula,
            listaExamenes, 
            Observacion, 
            DescuentoPuntos, 
            PuntosFinal ,
            PuntosDescuento ,
            puntosObtenidosMedico,
            puntosActualesMedico,
            puntosTotalesFinales 
        } = req.body
        let examenesS = await examenesSDB.find().sort({ Timestamp: -1 })
        let Numero = 2022000001
        if (examenesS.length > 0) {
            Numero = +examenesS[0].Numero + 1
        }
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let Comision = medico.Comision
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
        

        let usuarios = await usersDB.find({ TipoUsuario: 'Personal' }).sort({})
        for (i = 0; i < usuarios.length; i++) {
            let nuevaNotificacion = new notificacionDB({
                _idUsuario: usuarios[i]._id,
                Timestamp: Timestamp,
                Titulo: `Nueva solicitud de examen de ${medico.Nombres} ${medico.Apellidos}`,
                Mensaje: 'Nueva solicitud',
                Imagen: req.user.RutaImage,
                idSocket: usuarios[i].idSocket,
                Tipo: 'Examen',
                link: '/examenes-nuevos',
            })
            await nuevaNotificacion.save()
        }
        let PuntosMedico = puntosObtenidosMedico
        let PuntosNetos = PuntosFinal
        let AplicarDescuento = false
        if(+PuntosDescuento > 0){
            AplicarDescuento = true
            PuntosMedico = (+puntosObtenidosMedico - +PuntosDescuento).toFixed(2)
        }

        if(+PuntosDescuento >= +puntosObtenidosMedico){
            PuntosNetos = (+puntosTotalesFinales - +PuntosDescuento).toFixed(2) 
       
        }else{
            PuntosNetos = (+puntosTotalesFinales - +PuntosMedico - +PuntosDescuento).toFixed(2) 

        }

        //crear indicadores de examenes 
        let Mes = ""
        switch(mes){
            case '01':
                Mes = "Enero"
                break;
            case '02':
                Mes = "Febrero"
                break;
            case '03':
                Mes = "Marzo"
                break;
            case '04':
                Mes = "Abril"
                break;
            case '05':
                Mes = "Mayo"
                break;
            case '06':
                Mes = "Junio"
                break;
            case '07':
                Mes = "Julio"
                break;
            case '08':
                Mes = "Agosto"
                break;
            case '09':
                Mes = "Septiembre"
                break;
            case '10':
                Mes = "Octubre"
                break;
            case '11':
                Mes = "Noviembre"
                break;
            case '12':
                Mes = "Diciembre"
        }
            let validacion = await examenesIndicadoresDB.findOne({$and: [{NumeroMes: mes}, {Anio:año}]})
            if(validacion){
                let Cantidad = +validacion.Cantidad + +listaExamenes.length
                await examenesIndicadoresDB.findByIdAndUpdate(validacion._id,{
                    Cantidad
                })
            }else{
                let nuevoExamenesIndicadores = new examenesIndicadoresDB({
                    Mes: Mes,
                    NumeroMes: mes,
                    Cantidad: listaExamenes.length,
                    Anio: año,
                })

                await nuevoExamenesIndicadores.save()
            }
        //Cierre creación de examenes 

        //crear indicadores de examenes por medico aqui
            let validacion2 = await examenesIndicadoresMedicoDB.findOne({$and: [{NumeroMes: mes}, {Anio:año}, {_idMedico: medico._id}]})
            if(validacion2){
                let Cantidad = +validacion2.Cantidad + +listaExamenes.length
                await examenesIndicadoresMedicoDB.findByIdAndUpdate(validacion2._id,{
                    Cantidad
                })
            }else{
                let nuevoExamenesIndicadores = new examenesIndicadoresMedicoDB({
                    Mes: Mes,
                    Medico:`${medico.Nombres} ${medico.Apellidos}`,
                    _idMedico: medico._id,
                    NumeroMes: mes,
                    Cantidad: listaExamenes.length,
                    Anio: año,
                })

                await nuevoExamenesIndicadores.save()
            }
        //Cierre creación de examenes 

        let nuevoExamenS = new examenesSDB({
            Fecha: Fecha,
            Timestamp: Timestamp,
            DocumentoPaciente: Cedula,
            Numero: Numero,
            ExamenesTotales: listaExamenes.length,
            Comision: Comision,
            Medico: `${medico.Nombres} ${medico.Apellidos}`,
            _idMedico: medico._id,
            Paciente: Paciente,
            Observacion: Observacion,
            AplicarDescuento: AplicarDescuento,
            PuntosTotales: PuntosFinal,
            PuntosMedico: PuntosMedico,
            PuntosDescuento: PuntosDescuento,
            PuntosNetos: PuntosNetos,
            ListaExamenes: listaExamenes,
            CedulaMedico: medico.Cedula,
            FormaPagoMedico: medico.Cuenta,
        })
        await nuevoExamenS.save()
        res.send(JSON.stringify('ok'))
    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})

router.get('/medico/examenes-proceso', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let examenes = await examenesSDB.find({ $and: [{ Estado: 'Pendiente' }, { _idMedico: medico._id }] }).sort({ Timestamp: -1 })
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);

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
            }
        })
        examenes = examenes.map((data) => {
            let AplicarDescuento
            if (data.AplicarDescuento == true) {
                AplicarDescuento = 'Si'
            } else {
                AplicarDescuento = 'No'
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
                Observacion: data.Observacion

            }
        })
        res.render('medicos/servicios/examenes/proceso-examenes.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            notificaciones,
            Tema: req.user.Tema,
            examenes,
        })
    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})

router.get('/medico/examenes-rechazados', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let examenes = await examenesSDB.find({ $and: [{ Estado: 'Rechazado' }, { _idMedico: medico._id }] }).sort({ Timestamp: -1 })
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);

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
            }
        })
        examenes = examenes.map((data) => {
            let AplicarDescuento
            if (data.AplicarDescuento == true) {
                AplicarDescuento = 'Si'
            } else {
                AplicarDescuento = 'No'
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
                Observacion: data.Observacion

            }
        })
        res.render('medicos/servicios/examenes/rechazado-examenes.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            notificaciones,
            Tema: req.user.Tema,
            examenes,
        })
    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})

router.post('/solicitar-datos-examen', async(req, res) => {
    let { Numero } = req.body
    console.log(Numero)
    let examen = await examenesSDB.findOne({ Numero: Numero })
    res.send(JSON.stringify(examen))
})

router.get('/medico/resolicitar-examen', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let examenes = await examenesSDB.find({ $and: [{ Tipo: 'Nuevo' }, { _idMedico: medico._id }, {Estado: {$ne: "Rechazado"}}] }).sort({ Timestamp: -1 })
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);

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
            }
        })
        examenes = examenes.map((data) => {
            let AplicarDescuento
            if (data.AplicarDescuento == true) {
                AplicarDescuento = 'Si'
            } else {
                AplicarDescuento = 'No'
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
                Observacion: data.Observacion

            }
        })
        res.render('medicos/servicios/examenes/resolicitar-examenes.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            notificaciones,
            Tema: req.user.Tema,
            examenes,
        })
    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})

router.post('/resolicitar-examen', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let { Numero } = req.body
        let examen = await examenesSDB.findOne({ Numero: Numero })
        if (examen.Resolicitado) {
            //examen resolitado previamente
            let data = {
                status: 'error',
                msg: 'El examen ya fue resolicitado'
            }
            res.send(JSON.stringify(data))

        } else {
            if (examen.Tipo == 'Resolicitud') {
                let data = {
                    status: 'error',
                    msg: 'Solo los examenes nuevos pueden ser resolicitado'
                }
                res.send(JSON.stringify(data))
            } else {
                //examen no resolicitado creamos uno nuevo
                let examenes = await examenesSDB.find().sort({ Timestamp: -1 })
                let Numero = +examenes[0].Numero + 1
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

                await examenesSDB.findByIdAndUpdate(examen._id, {
                    Resolicitado: true,
                })
                let usuarios = await usersDB.find({ Tipo: 'Paciente' })
                for (i = 0; i < usuarios.length; i++) {
                    let nuevaNotificacion = new notificacionDB({
                        _idUsuario: usuarios[i]._id,
                        Timestamp: Timestamp,
                        Titulo: `Nueva resolicitud #${examen.Medico}`,
                        Mensaje: 'Nueva resolicitud',
                        Imagen: req.user.RutaImage,
                        idSocket: usuarios[i].idSocket,
                        Tipo: 'Resolicitud',
                        link: '/examenes-resolicitados',
                    })
                    await nuevaNotificacion.save()
                }

                let nuevoExamenS = new examenesSDB({
                    Fecha: Fecha,
                    Timestamp: Timestamp,
                    Numero: Numero,
                    ExamenesTotales: examen.ExamenesTotales,
                    Tipo: 'Resolicitud',
                    PuntosTotales: 0,
                    Comision: 0,
                    PuntosMedico: 0,
                    Medico: examen.Medico,
                    _idMedico: examen._idMedico,
                    Paciente: examen.Paciente,
                    _idPaciente: examen._idPaciente,
                    Observacion: examen.Observacion,
                    AplicarDescuento: false,
                    PuntosDescuento: 0,
                    PuntosNetos: 0,
                    ListaExamenes: examen.ListaExamenes,
                    CedulaMedico: examen.CedulaMedico,
                    FormaPagoMedico: examen.FormaPagoMedico,
                    DocumentoPaciente: examen.DocumentoPaciente,
                    DireccionPaciente: examen.DireccionPaciente,
                    FechaNacimientoPaciente: examen.FechaNacimientoPaciente,
                    TelefonoPaciente: examen.TelefonoPaciente,
                })
                await nuevoExamenS.save()
                let data = {
                    status: 'success',
                    msg: `Se resolicito la solcitud correctamente con el número #${Numero}`
                }
                res.send(JSON.stringify(data))
            }

        }
    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})


router.get('/medico/examenes-atendidos', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let examenes = await examenesSDB.find({ $and: [{ _idMedico: medico._id }, { Estado: "Procesado" }] }).sort({ Timestamp: -1 })
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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
            }
        })

        examenes = examenes.map((data) => {
            let AplicarDescuento
            if (data.AplicarDescuento == true) {
                AplicarDescuento = 'Si'
            } else {
                AplicarDescuento = 'No'
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
                AplicarDescuento: AplicarDescuento,
                PuntosDescuento: data.PuntosDescuento,
                PuntosNetos: data.PuntosNetos,
                Estado: data.Estado,
                Resultado: data.Resultado,
                CorreoEnviado: data.CorreoEnviado,
                ComisionCancelada: data.ComisionCancelada,
                ObservacionRechazo: data.ObservacionRechazo,
            }
        })
        res.render('medicos/servicios/examenes/atendidos-examenes.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            notificaciones,
            Tema: req.user.Tema,
            examenes,
        })

    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})

router.get('/medico/historial-pacientes', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let pacientes = await pacienteDB.find({ _idMedico: medico._id })
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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
            }
        })
        pacientes = pacientes.map((data) => {
            return {
                _id: data._id,
                Nombres: data.Nombres,
                Apellidos: data.Apellidos,
                Documento: data.Documento,
                Telefono: data.Telefono,
            }
        })

        res.render('medicos/servicios/historiales/historial-pacientes.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            notificaciones,
            Tema: req.user.Tema,
            pacientes,
        })

    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
        next()
    }
})


router.get('/medico/historial-paciente/:id', isAuthenticatedMedico, async(req, res) => {
    try {
        let paciente = await pacienteDB.findOne({ _id: req.params.id })
        let examenes = await examenesSDB.find({ _idPaciente: req.params.id }).sort({ Numero: -1 })
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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
            }
        })
        examenes = examenes.map((data) => {
            let disabled = false
            if (data.Resultado) {
                disabled = false
            } else {
                disabled = true
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
            }
        })
        paciente = {
            Nombres: paciente.Nombres,
            Apellidos: paciente.Apellidos,
            Documento: paciente.Documento,
            Telefono: paciente.Telefono,
            _id: paciente._id,
        }

        res.render('medicos/servicios/historiales/historial-paciente.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            examenes,
            paciente
        })

    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    })
    }
})


router.get('/medico/historial-puntos', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let historial = await historialPuntosDB.findOne({ _idMedico: medico._id }).sort({ Timestamp: -1 });
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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
            }
        })
        historial = historial ? historial.Historial : []
        historial.sort(function(a, b) {
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
                Paciente: data.Paciente,
                Fecha: data.Fecha,
                Usuario: data.Usuario,
                Comentario: data.Comentario,
                Color: data.Color,
            }
        })

        res.render('medicos/servicios/historiales/historial-puntos.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            historial,
        })

    } catch (err) {
        console.log(err)
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    })
    }
})

router.get('/medico/mi-cuenta', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let usuario = await usersDB.findOne({ email: req.user.email }).lean()
        let medico = await medicoDB.findOne({ Cedula: usuario.Cedula }).lean()
        let historial = await historialIngresoDB.findOne({ _idUsuario: req.user._id }).lean()
        let ultimoInicioSesion = historial.Historial[historial.Historial.length - 1].Fecha
   
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
     

        res.render('medicos/mi-cuenta', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
            medico,
            usuario
        })
    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    })
    }
})

router.post('/medico/actualizar-foto-perfil', isAuthenticatedMedico, upload.single('imagen'), async(req, res) => {
    let { id } = req.body;
    let usuario = await usersDB.findOne({ _id: id })
    if (!req.file) {
        let data = {
            status: 'error',
            msg: 'Ocurrio en error al cargar la imagen, solo se permiten imagenes con formato png, jpg o jpeg'
        }
        res.send(JSON.stringify(data))
    } else {
        let ruta = req.file.path
        await cloudinary.v2.uploader.upload(ruta, {
            public_id: `${req.file.filename}`,
        }, async(error, result) => {
            if (result) {
                await usersDB.findByIdAndUpdate(usuario._id, {
                    RutaImage: result.url
                })
                let data = {
                    status: 'ok',
                    image: result.url,
                    msg: 'Foto de perfil actualizada correctamente'
                }
                res.send(JSON.stringify(data))
            } else {
                let data = {
                    status: 'error',
                    msg: 'Ocurrio en error al cargar la imagen, solo se permiten imagenes con formato png, jpg o jpeg'
                }
                res.send(JSON.stringify(data))
            }
        })
    }
})

router.post('/medico/edicion/actualizar-usuario', isAuthenticatedMedico, async(req, res) => {
    let { Nombres, Apellidos, Cedula, Direccion, email, password, _id, Telefono } = req.body;
    let validacion1 = await medicoDB.find({ Cedula: Cedula });
    validacion1 = validacion1.filter((data) => data._id != _id)
    let validacion2 = await medicoDB.find({ Email: email });
    validacion2 = validacion2.filter((data) => data._id != _id)
    if (validacion1.length > 0) {
        let data = {
            status: 'error',
            msg: 'Ya existe un usuario con esa cedula'
        }
        res.send(JSON.stringify(data))
        return
    } else if (validacion2.length > 0) {
        let data = {
            status: 'error',
            msg: 'Ya existe un usuario con ese email'
        }
        res.send(JSON.stringify(data))
        return
    } else {
        let medico = await medicoDB.findById(_id);
        let usuario = await usersDB.findOne({ email: medico.Email })
        if (usuario.password == password) {
            await usersDB.findByIdAndUpdate(usuario._id, {
                email,
                Nombres,
                Apellidos,
                Cedula
            })
        } else {
            let nuevoUsuario = new usersDB({})
            password = await nuevoUsuario.encryptPassword(password);
            await usersDB.findByIdAndUpdate(usuario._id, {
                email,
                password,
                Nombres,
                Apellidos,
                Cedula
            })
        }
        await medicoDB.findByIdAndUpdate(_id, {
            Nombres,
            Apellidos,
            Cedula,
            Direccion,
            Email: email,
            Telefono
        })

        let data = {
            status: 'ok',
            msg: 'Datos personales actualizados correctamente',
        }
        res.send(JSON.stringify(data))
    }
})

router.get('/medico/configuracion-medico', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let checkedVisibilidad = ''
        let checkedPromocionales = ''
        let checkedWhatsapp = ''
        if (req.user.Visibilidad) {
            checkedVisibilidad = 'checked'
        }
        if (req.user.Promociones) {
            checkedPromocionales = 'checked'

        }
        if (req.user.Whatsapp) {
            checkedWhatsapp = 'checked'

        }
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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
            }
        })

        res.render('medicos/configuracion-medico.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            checkedVisibilidad,
            checkedPromocionales,
            checkedWhatsapp,
            RutaImage: req.user.RutaImage,
            Tema: req.user.Tema,
            notificaciones,
            _idUsuario: req.user._id,
            RutaImage: req.user.RutaImage,
        })

    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    })
    }
})

router.post('/medico/configuracion-visibilidad', isAuthenticated, async(req, res) => {
    let cedula = req.user.Cedula
    let { visibilidad } = req.body;
    let medico = await medicoDB.findOne({ Cedula: cedula })
    let usuario = await usersDB.findOne({ email: medico.Email })
    await usersDB.findByIdAndUpdate(usuario._id, {
        Visibilidad: visibilidad
    })
    await medicoDB.findByIdAndUpdate(medico._id, {
        Visibilidad: visibilidad
    })
    res.send().status(200)
})

router.post('/medico/configuracion-promociones', isAuthenticated, async(req, res) => {
    let cedula = req.user.Cedula
    let { promociones } = req.body;
    let medico = await medicoDB.findOne({ Cedula: cedula })
    let usuario = await usersDB.findOne({ email: medico.Email })
    await usersDB.findByIdAndUpdate(usuario._id, {
        Promociones: promociones
    })
    await medicoDB.findByIdAndUpdate(medico._id, {
        Promociones: promociones
    })
    res.send().status(200)
})


router.get('/medico/soporte', isAuthenticatedMedico, async(req, res, next) => {
    try {
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
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
            }
        })
        res.render('medicos/soporte.hbs', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Tema: req.user.Tema,
            notificaciones,
            _idUsuario: req.user._id,
            RutaImage: req.user.RutaImage,
        })

    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    })
    }
})

router.post('/solicitar-datos-puntos-medico', isAuthenticatedMedico, async(req, res) => {
    try {
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        
        let anioEvaluar = moment().format('YYYY')
        //get the textual month with moment 
        let mesEvaluar = moment().format('MMMM')
        //first letter uppercase
        mesEvaluar = mesEvaluar.charAt(0).toUpperCase() + mesEvaluar.slice(1)
        let puntosObtenidos = 0
        let indicadores = await puntosIndicadoresMedicoDB.findOne({$and: [{_idMedico: medico._id}, {Anio: anioEvaluar}, {Mes: mesEvaluar}]})
        if(indicadores){
            puntosObtenidos = +indicadores.Cantidad
        }

        let factor = 0.66
        if (+puntosObtenidos > 150 && +puntosObtenidos < 500) {
            factor = 0.2
        }
        if (+puntosObtenidos > 500) {
            factor = 0.05
        }

        let data = {
            PuntosObtenidos: puntosObtenidos,
            PuntosCanjeables: medico.PuntosCanjeables,
            PuntosCanjeados: medico.PuntosCanjeados,
            factor: factor,
        }
        res.send(JSON.stringify(data))

    } catch (err) {
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    })
    }
})


router.post('/solicitar-info-medico-comisiones', isAuthenticated, async (req, res, next) =>{
    try {
        let medico = await medicoDB.findOne({Cedula: req.user.Cedula})
        let data = {
            porcentaje: medico.Comision,
            comisiones: medico.PuntosCanjeables,
        }
        res.send(JSON.stringify(data))
    }catch(err){
        let fecha = new Date()
        let stack = err.stack
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    }) 
    }
})

router.get('/actualizar-examenes-comisiones', isAuthenticated, async (req, res) =>{
    let examenes = await examenDB.find()

    for(i=0; i< examenes.length; i++){
        await examenDB.findByIdAndUpdate(examenes[i]._id,{
            Comisiones : true
        })
    }

    res.send('OK')
})


router.get('/medico/Indicadores', isAuthenticatedMedico, async (req, res, next) =>{
    try {
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let puntosSemanalesIndicadoresMedico = await puntosSemanalesIndicadoresMedicoDB.find({_idMedico: medico._id}).sort({Timestamp: -1}) .limit(14)
        let pacientesIndicadores = await pacientesIndicadoresDB.find({_idMedico: medico._id}).sort({Anio: -1, NumeroMes: -1}).limit(12)
        let puntosComisionesIndicadores = await puntosIndicadoresMedicoDB.find({_idMedico: medico._id}).sort({Anio: -1, NumeroMes: -1}).limit(12)
        let examenesIndicadores = await examenesIndicadoresMedicoDB.find({_idMedico: medico._id}).sort({Anio: -1, NumeroMes: -1}).limit(12)
        let longitud = puntosSemanalesIndicadoresMedico.length
        let generadoHoy = puntosSemanalesIndicadoresMedico[0] ? puntosSemanalesIndicadoresMedico[0].Cantidad : 0
        let examenesTotales = 0
        let pacientesTotales = 0
        let puntosComisionesTotales = 0
        let semanaActual = 0
        let semanaPasada = 0
        let fechaHoy = moment().format('DD/MM/YYYY')

        puntosSemanalesIndicadoresMedico.forEach((item, index) =>{
            if(longitud < 14){
                if(index < 7){
                    semanaActual += +item.Cantidad
                }
            }else{
                if(index < 7){
                    semanaActual += +item.Cantidad
                }else{
                    semanaPasada += +item.Cantidad
                }
            }
        })

        if(puntosSemanalesIndicadoresMedico[0]){
            if(fechaHoy != puntosSemanalesIndicadoresMedico[0].FechaCompleta){
                generadoHoy = 0
            }
        }

        semanaActual = semanaActual.toFixed(2)
        semanaPasada = semanaPasada.toFixed(2)

        pacientesIndicadores.forEach((item) =>{
            pacientesTotales += +item.Cantidad
        })
        let porcentajePacientes = +pacientesIndicadores[0].Cantidad * 100 
        if(pacientesIndicadores.length == 1){
            porcentajePacientes = 100
        }else{
            porcentajePacientes = +porcentajePacientes / +pacientesIndicadores[1].Cantidad
            porcentajePacientes = (+porcentajePacientes - 100).toFixed(2)
        }
        let dataPorcentajePacientes
        if(porcentajePacientes <= 0 ){
            dataPorcentajePacientes = {
                Porcentaje: porcentajePacientes,
                Arriba: false
            }
        }else{
            dataPorcentajePacientes = {
                Porcentaje: porcentajePacientes,
                Arriba: true
            }
        }

        puntosComisionesIndicadores.forEach((item) =>{
            puntosComisionesTotales +=  +item.Cantidad
        })
        let porcentajePuntosComisiones = puntosComisionesIndicadores[0] ? +puntosComisionesIndicadores[0].Cantidad * 100 : 1 
        if(puntosComisionesIndicadores.length == 1){
            porcentajePuntosComisiones = 100
        }else{
            let puntosEvaluar = puntosComisionesIndicadores[1] ? puntosComisionesIndicadores[1].Cantidad : 1
            porcentajePuntosComisiones = +porcentajePuntosComisiones / +puntosEvaluar
            porcentajePuntosComisiones = (+porcentajePuntosComisiones - 100).toFixed(2)
        }
        let dataPorcentajePuntosComisiones
        if(porcentajePuntosComisiones <= 0 ){
            dataPorcentajePuntosComisiones = {
                Porcentaje: porcentajePuntosComisiones,
                Arriba: false
            }
        }else{
            dataPorcentajePuntosComisiones = {
                Porcentaje: porcentajePuntosComisiones,
                Arriba: true
            }
        }

        if(puntosComisionesTotales == 0){
            dataPorcentajePuntosComisiones.Porcentaje = 0
        }

        puntosComisionesTotales = puntosComisionesTotales.toFixed(2)

        examenesIndicadores.forEach((item) =>{
            examenesTotales +=  +item.Cantidad
        })
        
        let porcentajeExamenes = +examenesIndicadores[0].Cantidad * 100 
        if(examenesIndicadores.length == 1){
            porcentajeExamenes = 100
        }else{
            porcentajeExamenes = +porcentajeExamenes / +examenesIndicadores[1].Cantidad
            porcentajeExamenes = (+porcentajeExamenes - 100).toFixed(2)
        }
        let dataPorcentajeExamenes
        if(porcentajeExamenes <= 0 ){
            dataPorcentajeExamenes = {
                Porcentaje: porcentajeExamenes,
                Arriba: false
            }
        }else{
            dataPorcentajeExamenes = {
                Porcentaje: porcentajeExamenes,
                Arriba: true
            }
        }

        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()

        res.render('medicos/indicadores',{
            layout:'medico-indicadores',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Tema: req.user.Tema,
            notificaciones,
            _idUsuario: req.user._id,
            RutaImage: req.user.RutaImage,
            generadoHoy,
            examenesTotales,
            pacientesTotales,
            puntosComisionesTotales,
            semanaActual,
            semanaPasada,
            dataPorcentajeExamenes,
            dataPorcentajePuntosComisiones,
            dataPorcentajePacientes
            
        })
    }catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    }) 
    }
})

router.post('/solicitar-puntos-semanales-medico', isAuthenticatedMedico ,async (req, res, next) =>{
    try {
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let puntosSemanales = await puntosSemanalesIndicadoresMedicoDB.find({_idMedico: medico._id}).sort({Timestamp: -1}).limit(14)
        let semanaActual = []
        let semanaAnterior = [] 
        let dias = []
        let longitud = puntosSemanales.length
        let puntosGeneralesIndicadores = await puntosIndicadoresMedicoDB.find({_idMedico: medico._id}).sort({Anio: -1, NumeroMes: -1})

        let meses = []
        let puntosNetos = []

        puntosGeneralesIndicadores.forEach((item) =>{
            meses.push(item.Mes)
            puntosNetos.push(item.Cantidad)
        })
        puntosSemanales.sort(function(a, b) {

            if (a.Timestamp < b.Timestamp) {
                return -1;
            }
            if (a.Timestamp >  b.Timestamp) {
                return 1;
            }
            return 0;
        });
       let fechaCompleta = []
        puntosSemanales.forEach((item, index) =>{
            if(longitud < 14){
                if(index < 7){
                    semanaActual.push(item.Cantidad)
                }
            }else{
                if(index < 7){
                    semanaAnterior.push(item.Cantidad)
                }else{
                    dias.push(item.Dia)
                    semanaActual.push(item.Cantidad)
                }
            }
        })

        let dataEnvio = {
            semanaActual,
            semanaAnterior,
            dias,
            meses,
            puntosNetos,
        }
        res.send(JSON.stringify(dataEnvio))

    }catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    })
    }
})


router.post('/medico/configuracion-wahtsapp', isAuthenticatedMedico, async (req, res, next) =>{
    try {
        let cedula = req.user.Cedula
        let { whatsapp } = req.body;
        let medico = await medicoDB.findOne({ Cedula: cedula })
        let usuario = await usersDB.findOne({ email: medico.Email })
        await usersDB.findByIdAndUpdate(usuario._id, {
            Whatsapp: whatsapp
        })
        await medicoDB.findByIdAndUpdate(medico._id, {
            Whatsapp: whatsapp
        })
        let mensajesWhatsapp
        if(whatsapp == true){
            mensajesWhatsapp = new mensajesWhatsappDB({
                NombreUsuario: `${medico.Nombres } ${ medico.Apellidos }`,
                _idUsuario: medico._id,
                Mensaje: `Hola, ${medico.Nombres} ${medico.Apellidos}. Su suscripción a los mensajes de whatsapp ha sido activida correctamente. A partir de ahora recibirá diferentes mensajes notificandole de los retiros de los puntos de su cuenta, de sus pacientes registrados y de los resultados de los examenes. Recuerda que puedes desuscribirte de estos mensajes en el momento que desees desde la configuración de tu cuenta en la plataforma *Club salud*`
            })
        }else{
            mensajesWhatsapp = new mensajesWhatsappDB({
                NombreUsuario: `${medico.Nombres } ${ medico.Apellidos }`,
                _idUsuario: medico._id,
                Mensaje: `Hola, ${medico.Nombres}. Su desuscripción ha sido realizada correctamente. A partir de ahora no recibirá más mensajes de whatsapp. Recuerda que puedes suscribirte nuevamente a estos mensajes en el momento que desees desde la configuración de tu cuenta en la plataforma *Club salud*`
            })
        }
        await mensajesWhatsapp.save()

        res.send().status(200)
    }catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    })
    }
})

router.get('/medico/constancias-canjes', isAuthenticatedMedico, async (req, res, next) =>{
    try {
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })

        let constancias = await constanciasCanjeDB.find({_idMedico: medico._id}).sort({ Timestamp: -1 }).lean()

        res.render('medicos/servicios/canjes/constancias-canjes', {
            layout:'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
            constancias
        })


    }catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,
        
        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    }) 
    }
})

router.get('/medico/solicitud-canjes', isAuthenticatedMedico, async (req, res, next) =>{
    try {
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let puntosDisponibles = medico.PuntosCanjeables
        let solicitudes = await solicitudCanjeDB.find({_idMedico: medico._id}).sort({ Timestamp: -1 }).lean()

        solicitudes = solicitudes.map(solicitud =>{
            let color = ""
            if(solicitud.Estado == "Pendiente"){
                color = "warning"
            }else if(solicitud.Estado == "En proceso"){
                color = "info"
            } else if(solicitud.Estado == "Procesado") {
                color = "success"
            }else{
                color = "danger"
            }
            solicitud.color = color
            return solicitud
        })

        
        let tiposCanjes = await tiposCanjesDB.find({Activo: true}).lean()
        res.render('medicos/servicios/canjes/solicitar-canje', {
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
            solicitudes,
            puntosDisponibles, 
            tiposCanjes
        })

    }catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
        res.render('content/404', {
            layout: 'blank'
        })
    }
})


router.post('/nueva-solicitud-canje', isAuthenticated, async (req, res, next) =>{
    try {
        let { tipoCanje, puntosCanjear, } = req.body
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let ultimaSolicitud = await solicitudCanjeDB.findOne().sort({ Numero: -1 }).lean()
        let Numero =  ultimaSolicitud ? +ultimaSolicitud.Numero + 1 : 1
        let tipoCanjeBase = await tiposCanjesDB.findOne({Nombre: tipoCanje})
        let fecha = moment().format('DD/MM/YYYY')
        let Timestamp = Date.now()

        let nuevaSolicitud = new solicitudCanjeDB({
            Numero: Numero, 
            Medico: `${medico.Nombres} ${medico.Apellidos}`, 
            _idMedico: medico._id, 
            Cedula: medico.Cedula, 
            PuntosCanjeados: puntosCanjear, 
            TipoCanje: tipoCanje, 
            _idTipoCanje: tipoCanjeBase._id, 
            FechaCanje: fecha, 
        })
        await nuevaSolicitud.save()

        let data = {
            ok: true
        }

        let usuarios = await usersDB.find({ TipoUsuario: 'Personal' }).sort({})
        for (i = 0; i < usuarios.length; i++) {
            let nuevaNotificacion = new notificacionDB({
                _idUsuario: usuarios[i]._id,
                Timestamp: Timestamp,
                Titulo: `Nueva solicitud de canje de ${medico.Nombres} ${medico.Apellidos}`,
                   Mensaje: 'Nueva solicitud',
                Imagen: req.user.RutaImage,
                idSocket: usuarios[i].idSocket,
                Tipo: 'Canje',
                link: '/solicitudes-canjes',
            })
            nuevaNotificacion.save()
        }

        res.send(JSON.stringify(data)).status(200)

    }catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
        let data = {
            ok: false
        }  
        res.send(JSON.stringify(data)).status(200)
    }
})

router.get('/medico/notificaciones', isAuthenticated, async (req, res, next) =>{
    try{ 
        
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
     
        res.render('content/notificaciones',{
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage
        })
    }catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
         res.render('content/404', {
        layout: 'blank'
    })
    }
})


router.get('/medico/otros-servicios', isAuthenticated, async (req, res, next) =>{
    try{ 
        
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
        
        let servicios = await serviciosDB.find({}).lean()
        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let pacientes = await pacienteDB.find({ Medicos: { $elemMatch: { _idMedico: medico._id } } }).lean()


        res.render('medicos/servicios/otros/nuevo-servicio',{
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            servicios,
            pacientes,
            RutaImage: req.user.RutaImage
        })
    }catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
        res.render('content/404', {
            layout: 'blank'
        })
    }
})

router.post('/medicos/servicios/otros/nuevo-servicio', isAuthenticated, async (req, res, next) =>{
    try {
        let { Servicio, Paciente, Descripcion } = req.body

        let medicoBase = await medicoDB.findOne({ Cedula: req.user.Cedula })
        let pacienteBase = await pacienteDB.findOne ({ Cedula: Paciente })

        let Fecha = moment().format('DD/MM/YYYY')
        let Timestamp = Date.now()

        let servicioBase = await serviciosDB.findById(Servicio)
        let afiliado = await afiliadosFichaDB.findOne({ Servicio: servicioBase.Nombre })
        let ultimoServicio = await otrosServiciosDB.findOne().sort({ Numero: -1 }).lean()

        let Numero = ultimoServicio ? +ultimoServicio.Numero + 1 : 2023000001


        let nuevoServicio = new otrosServiciosDB({
            Medico: `${medicoBase.Nombres} ${medicoBase.Apellidos}`, 
            CedulaMedico: medicoBase.Cedula, 
            _idMedico: medicoBase._id, 
            Paciente: `${pacienteBase.Nombres} ${pacienteBase.Apellidos}`, 
            _idPaciente: pacienteBase._id, 
            Afiliado: afiliado.Afiliado,
            _idAfiliado: afiliado._id,
            DocumentoPaciente: pacienteBase.Documento, 
            DireccionPaciente: pacienteBase.Direccion, 
            FechaNacimientoPaciente: pacienteBase.FechaNacimiento, 
            TelefonoPaciente: pacienteBase.Telefono, 
            Servicio: servicioBase.Nombre, 
            Descripcion: Descripcion, 
            Fecha: Fecha, 
            Timestamp: Timestamp, 
            Numero: Numero, 
        })
        

        await nuevoServicio.save()


        let usuarios = await usersDB.find({ $or:[{TipoUsuario: 'Personal'}, {TipoUsuario: 'Afiliado'}] }).sort({})
        for (i = 0; i < usuarios.length; i++) {
            let link = usuarios[i].TipoUsuario == 'Personal' ? '/nuevo-servicios-otros' : '/afiliado/nuevo-servicios-otros'
            
            let nuevaNotificacion = new notificacionDB({
                _idUsuario: usuarios[i]._id,
                Timestamp: Timestamp,
                Titulo: `Nueva solicitud de ${medicoBase.Nombres} ${medicoBase.Apellidos}`,
                Mensaje: 'Nueva solicitud',
                Imagen: req.user.RutaImage,
                idSocket: usuarios[i].idSocket,
                Tipo: 'Otros servicios',
                link,
            })
            await nuevaNotificacion.save()
        }

        let data = {
            ok: true
        }

        res.send(JSON.stringify(data)).status(200)

    }catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
        res.render('content/404', {
            layout: 'blank'
        })
    }
})



router.get('/medico/otros-servicios-en-proceso', isAuthenticatedMedico, async (req, res, next) =>{

    try {   

        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })

        let otrosServicios = await otrosServiciosDB.find({ $and: [{_idMedico: medico._id}, {Estado: {$ne: "Atendido"}}]}).sort({ Timestamp: -1 }).lean()

        otrosServicios = otrosServicios.filter((data) => data.Estado != "Rechazado")

        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
     
        res.render('medicos/servicios/otros/en-proceso',{
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
            otrosServicios
        })

    } catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
        res.render('content/404', {
            layout: 'blank'
        })
    }
})


router.get('/medico/otros-servicios-atendidos', isAuthenticatedMedico, async (req, res, next) =>{

    try {   

        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })

        let otrosServicios = await otrosServiciosDB.find({ $and: [{_idMedico: medico._id}, {Estado: "Atendido"}]}).sort({ Timestamp: -1 }).lean()

        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
     
        res.render('medicos/servicios/otros/atendidos',{
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
            otrosServicios
        })

    } catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
        res.render('content/404', {
            layout: 'blank'
        })
    }
})


router.get('/medico/otros-servicios-rechazados', isAuthenticatedMedico, async (req, res, next) =>{

    try {   

        let medico = await medicoDB.findOne({ Cedula: req.user.Cedula })

        let otrosServicios = await otrosServiciosDB.find({ $and: [{_idMedico: medico._id}, {Estado: "Rechazado"}]}).sort({ Timestamp: -1 }).lean()

        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
     
        res.render('medicos/servicios/otros/atendidos',{
            layout: 'medico.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
            otrosServicios
        })

    } catch(err){
        let fecha = new Date()
        let stack = err.stack
        console.log(err.stack)
        let nuevoError = new errorDB({
            Descripcion: err.message,
            Fecha: fecha,
            Usuario: req.user._id,
            Linea: stack,

        })
        await nuevoError.save()
        res.render('content/404', {
            layout: 'blank'
        })
    }
})



module.exports = router;