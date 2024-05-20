const router = require('express').Router();
const { isAuthenticatedPaciente } = require("../helpers/auth");
const { isAuthenticated } = require("../helpers/auth");
const errorDB = require("../models/soporte/errores");
const notificacionDB = require("../models/herramientas/notificaciones");
const pacienteDB = require("../models/data/paciente");
const medicoDB = require("../models/data/medico");
const examenDB = require("../models/data/examenes");
const examenesSDB = require("../models/servicios/examenes");
const usersDB = require("../models/data/users");
const tipoExamenDB = require("../models/data/tipoExamen");
const chatDB = require("../models/data/chat");
const historialIngresoDB = require("../models/servicios/historialIngresos");
const mensajesWhatsappDB = require("../models/herramientas/mensajes-whatsapp")
const multer = require('multer');
const cloudinary = require("cloudinary")
const path = require('path')


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

router.get('/inicio-pacientes', isAuthenticatedPaciente, async(req, res, next) => {
    try {
        let paciente = await pacienteDB.findOne({ Documento: req.user.Cedula });
        let examenes = await examenesSDB.find({ $and: [{ _idPaciente: paciente._id }, { Estado: "Procesado" }] }).sort({ Timestamp: -1 }).limit(5);
        examenes = examenes.map((data) => {
            return {
                Numero: data.Numero,
                FechaAtencion: data.FechaAtencion,
                _id: data._id,
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
        res.render('pacientes/inicio.hbs', {
            layout: 'paciente.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            examenes,
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

router.get('/paciente/nuevo-examen', isAuthenticatedPaciente, async(req, res, next) => {
    try {

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


router.get('/paciente/calendario', isAuthenticatedPaciente, async(req, res, next) => {
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

        res.render('pacientes/herramientas/calendario', {
            layout: 'paciente.hbs',
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

router.get('/paciente/Chat', isAuthenticatedPaciente, async(req, res, next) => {
    try {
        let paciente = await pacienteDB.findOne({ Email: req.user.email })
        let medico = await medicoDB.findById(paciente._idMedico)
        let usuarioMedico = await usersDB.findOne({ email: medico.Email })
        let validacionContacto = req.user.Contactos.find((data) => data == usuarioMedico._id)
        if (!validacionContacto) {
            await usersDB.findByIdAndUpdate(req.user._id, {
                $push: { Contactos: usuarioMedico._id }
            })
            await usersDB.findByIdAndUpdate(usuarioMedico._id, {
                $push: { Contactos: req.user._id }
            })
        }
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


        res.render('pacientes/social/chat', {
            layout: 'paciente.hbs',
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

router.get('/paciente/examenes-proceso', isAuthenticatedPaciente, async(req, res, next) => {
    try {
        let paciente = await pacienteDB.findOne({ Documento: req.user.Cedula })
        let examenes = await examenesSDB.find({ $and: [{ Estado: 'Pendiente' }, { _idPaciente: paciente._id }] }).sort({ Timestamp: -1 })
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
        res.render('pacientes/servicios/examenes/examenes-proceso.hbs', {
            layout: 'paciente.hbs',
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

router.get('/paciente/examenes-rechazados', isAuthenticatedPaciente, async(req, res, next) => {
    try {
        let paciente = await pacienteDB.findOne({ Documento: req.user.Cedula })
        let examenes = await examenesSDB.find({ $and: [{ Estado: 'Rechazado' }, { _idPaciente: paciente._id }] }).sort({ Timestamp: -1 })
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
        res.render('pacientes/servicios/examenes/examenes-rechazados.hbs', {
            layout: 'paciente.hbs',
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


router.get('/paciente/historial', isAuthenticatedPaciente, async(req, res, next) => {
    try {
        let paciente = await pacienteDB.findOne({ Email: req.user.email })
        let examenes = await examenesSDB.find({ _idPaciente: paciente._id }).sort({ Numero: -1 })
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


        res.render('pacientes/servicios/historial/historial', {
            layout: 'paciente.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
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


router.get('/paiente/examenes-atendidos', isAuthenticatedPaciente, async(req, res) => {
    try {
        let paciente = await pacienteDB.findOne({ Email: req.user.email })
        let examenes = await examenesSDB.find({ $and: [{ _idPaciente: paciente._id }, { Estado: "Procesado" }] }).sort({ Numero: -1 })
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
        res.render('pacientes/servicios/examenes/examenes-atendidos.hbs', {
            layout: 'paciente.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
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

router.get('/paciente/mi-cuenta', isAuthenticatedPaciente, async(req, res, next) => {
    try {
        let usuario = await usersDB.findOne({ email: req.user.email })
        let paciente = await pacienteDB.findOne({ Documento: usuario.Cedula })
        let historial = await historialIngresoDB.findOne({ _idUsuario: req.user._id })
        let ultimoInicioSesion = historial.Historial[historial.Historial.length - 1].Fecha
        usuario = {
            Nombres: usuario.Nombres,
            Apellidos: usuario.Apellidos,
            email: usuario.email,
            password: usuario.password,
            status: usuario.status,
            RutaImage: usuario.RutaImage,
            Fecha_Registro: usuario.Fecha_Registro,
            Fecha_Modificacion: usuario.Fecha_Modificacion,
            Fecha_Ultimo_Acceso: ultimoInicioSesion,
            _id: paciente._id,
            Cedula: paciente.Documento,
            Direccion: paciente.Direccion,
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

        res.render('pacientes/mi-cuenta.hbs', {
            layout: 'paciente.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
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
        next()
    }
})

router.post('/paciente/actualizar-foto-perfil', isAuthenticatedPaciente, upload.single('imagen'), async(req, res) => {
    let { id } = req.body;
    let paciente = await pacienteDB.findById(id);
    let usuario = await usersDB.findOne({ email: paciente.Email })
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

router.post('/paciente/edicion/actualizar-usuario', isAuthenticatedPaciente, async(req, res) => {
    let { Nombres, Apellidos, Cedula, Direccion, email, password, _id } = req.body;
    let validacion1 = await pacienteDB.find({ Documento: Cedula });
    validacion1 = validacion1.filter((data) => data._id != _id)
    let validacion2 = await pacienteDB.find({ Email: email });
    validacion2 = validacion2.filter((data) => data._id != _id)
    if (validacion1.length > 0) {
        let data = {
            status: 'error',
            msg: 'Ya existe un usuario con ese documento'
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
        let paciente = await pacienteDB.findById(_id);
        let usuario = await usersDB.findOne({ email: paciente.Email })
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
        await pacienteDB.findByIdAndUpdate(_id, {
            Nombres,
            Apellidos,
            Documento: Cedula,
            Direccion,
            Email: email,
        })

        let data = {
            status: 'ok',
            msg: 'Datos personales actualizados correctamente',
        }
        res.send(JSON.stringify(data))
    }
})


router.get('/paciente/soporte', isAuthenticated, async(req, res) => {
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

        res.render('pacientes/soporte.hbs', {
            layout: 'paciente.hbs',
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


router.get('/paciente/configuracion', isAuthenticated, async (req, res, next)=>{
    try {   
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean();
        let checkedPromocionales = ''
        let checkedWhatsapp = ''
        if (req.user.Promociones) {
            checkedPromocionales = 'checked'

        }
        if (req.user.Whatsapp) {
            checkedWhatsapp = 'checked'

        }


        res.render('pacientes/configuracion', {
            layout: 'paciente.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
            checkedPromocionales,
            checkedWhatsapp
        })

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
        next()
    }
})

router.post('/paciente/configuracion-promociones', isAuthenticated, async (req, res, next)=>{
    try {
        let cedula = req.user.Cedula
        let { promociones } = req.body;
        let paciente = await pacienteDB.findOne({ Cedula: cedula })
        let usuario = await usersDB.findOne({ email: paciente.Email })

        await usersDB.findByIdAndUpdate(usuario._id, {
            Promociones: promociones
        })
        await pacienteDB.findByIdAndUpdate(paciente._id, {
            Promociones: promociones
        })
        res.send().status(200)
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
        next()
    }
})

router.post('/paciente/configuracion-whatsapp', isAuthenticated, async (req, res, next)=>{
    try {
        let cedula = req.user.Cedula
        let { whatsapp } = req.body;
        let paciente = await pacienteDB.findOne({ Documento: cedula })
        let usuario = await usersDB.findOne({ email: paciente.Email })
        await usersDB.findByIdAndUpdate(usuario._id, {
            Whatsapp: whatsapp
        })
        await pacienteDB.findByIdAndUpdate(paciente._id, {
            Whatsapp: whatsapp
        })

        let mensajesWhatsapp
        if(whatsapp == true){
            mensajesWhatsapp = new mensajesWhatsappDB({
                NombreUsuario: `${paciente.Nombres } ${ paciente.Apellidos }`,
                _idUsuario: paciente._id,
                Mensaje: `Hola, ${paciente.Nombres} ${paciente.Apellidos}. Su suscripción a los mensajes de whatsapp ha sido activida correctamente. A partir de ahora recibirá diferentes mensajes notificandole de los retiros de los puntos de su cuenta, de sus pacientes registrados y de los resultados de los examenes. Recuerda que puedes desuscribirte de estos mensajes en el momento que desees desde la configuración de tu cuenta en la plataforma *Club salud*`
            })
        }else{
            mensajesWhatsapp = new mensajesWhatsappDB({
                NombreUsuario: `${paciente.Nombres} ${paciente.Apellidos}`,
                _idUsuario: paciente._id,
                Mensaje: `Hola, ${paciente.Nombres} ${paciente.Apellidos}. Su desuscripción ha sido realizada correctamente. A partir de ahora no recibirá más mensajes de whatsapp. Recuerda que puedes suscribirte nuevamente a estos mensajes en el momento que desees desde la configuración de tu cuenta en la plataforma *Club salud*`
            })
        }
        await mensajesWhatsapp.save()

        res.send().status(200)
    }catch(err){
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


module.exports = router;