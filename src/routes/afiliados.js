const router = require('express').Router();
const { isAuthenticatedAfiliado } = require('../helpers/auth');
const notificacionDB = require('../models/herramientas/notificaciones');
const fs = require("fs");
const passport = require("passport");
const nodemailer = require('nodemailer')
const personalDB = require("../models/data/personal");
const medicoDB = require("../models/data/medico");
const usersDB = require("../models/data/users");
const pacienteDB = require("../models/data/paciente");
const examenDB = require("../models/data/examenes");
const chatDB = require("../models/data/chat");
const { isAuthenticated } = require("../helpers/auth");
const { sendEmail } = require("../email/email");
const examenesSDB = require("../models/servicios/examenes");
const calendarioDB = require("../models/herramientas/calendario");
const historialPuntosDB = require("../models/servicios/historialPuntos");
const historialExamenesDB = require("../models/servicios/historialExamenes");
const historialActividadDB = require("../models/servicios/historialActividad");
const historialIngresoDB = require("../models/servicios/historialIngresos");
const examenesIndicadoresDB = require("../models/indicadores/examenesIndicadores")
const puntosComisionesIndicadoresDB = require("../models/indicadores/puntosComisionesIndicadores")
const puntosGeneralesIndicadoresDB = require("../models/indicadores/puntosGeneralesIndicadores")
const puntosSemanelesIndicadoresDB = require("../models/indicadores/puntosSemanalesIndicadores")
const medicosIndicadoresDB = require("../models/indicadores/medicosIndicadores")
const pacientesIndicadoresDB = require("../models/indicadores/pacientesIndicadores")
const visitasIndicadoresDB = require("../models/indicadores/visitasIndicadores")
const examenesIndicadoresMedicoDB = require("../models/indicadores/medico/examenesIndicadoresMedico")
const pacientesIndicadoresMedicoDB = require("../models/indicadores/medico/pacientesIndicadoresMedico")
const puntosIndicadoresMedicoDB = require("../models/indicadores/medico/puntosIndicadoresMedico")
const puntosSemanalesIndicadoresMedicoDB = require("../models/indicadores/medico/puntosSemanalesIndicadoresMedico")
const categoriasDB = require("../models/soporte/categorias")
const subcategoriasDB = require("../models/soporte/subcategorias")
const ticketDB = require("../models/soporte/ticket")
const constanciasCanjeDB = require("../models/servicios/constancias-canje")
const mensajesWhatsappDB = require("../models/herramientas/mensajes-whatsapp")
const tiposCanjesDB = require("../models/data/tipo-canjes")
const perfilesDB = require("../models/data/perfiles")
const solicitudCanjeDB = require("../models/servicios/solicitud-canje")
const sucursalDB = require("../models/data/sucursal")
const medallasDB = require("../models/data/medallas")
const xl = require("excel4node");
const serviciosDB = require("../models/data/servicios");
const afiliadosDB = require("../models/data/afiliado");
const afiliadosFichaDB = require("../models/data/afiliado_ficha");
const {generateToken, verifyToken} = require("../utils/token")
const otrosServiciosDB = require("../models/servicios/otros-servicios")

const cloudinary = require("cloudinary")
const tipoExamenDB = require("../models/data/tipoExamen");
const especialidadesDB = require("../models/data/especialidades");

const errorDB = require("../models/soporte/errores");
const path = require('path')
const moment = require("moment-timezone");
moment.tz.setDefault("America/Caracas");
moment.locale("es");

const multer = require('multer');
const subcategorias = require("../models/soporte/subcategorias");

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

const uploadFile = multer({
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "application/pdf") {
            cb(null, true);
        } else {
            cb(null, false);
            let data = {
                status: 'error',
                msg: "Ocurrio en error al cargar el documento. Solo se permiten documentos formato .pdf"
            }
        }
    },
    storage: multer.diskStorage({
        destination: 'src/public/resultados',
        filename: (req, file, cb) => {
            if (fs.existsSync(path.join('src/public/resultados', file.originalname.substring(0, file.originalname.length - 4) + path.extname(file.originalname)))) {
                cb(null, file.originalname.substring(0, file.originalname.length - 4) + "-" + Date.now() + path.extname(file.originalname));
            } else {
                cb(null, file.originalname.substring(0, file.originalname.length - 4) + path.extname(file.originalname));
            }
        }
    }),
});

cloudinary.config({
    cloud_name: 'testrps',
    api_key: '329682633831313',
    api_secret: process.env.SECRET_CLOUDINARY
});

const transporter = nodemailer.createTransport({
    host: 'business102.web-hosting.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SUPPORT_EMAIL,
        pass: process.env.PASSWORD_SUPPORT_EMAIL
    },
    tls: {
        rejectUnauthorized: false
    }
})


router.get('/afiliado/Calendario', isAuthenticatedAfiliado,  async(req, res) => {
    let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
    
    res.render('content/herramientas/calendario', {
        layout: 'afiliado.hbs',
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
    })
})

router.get('/afiliado/registro-pacientes', isAuthenticatedAfiliado, async(req, res) => {
    let medicos = await medicoDB.find().sort({ Nombre: 1 });
    medicos = medicos.map((data) => {
        return {
            Nombres: data.Nombres,
            _id: data._id,
            Apellidos: data.Apellidos
        }
    })
    let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
    
    res.render('content/registro/registro-pacientes', {
        layout: 'afiliado.hbs',
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
        medicos
    })
})


router.get('/afiliado/historial-pacientes', isAuthenticatedAfiliado, async(req, res, next) => {
    try {
        let pacientes = await pacienteDB.find({}).sort({ Nombres: 1, Apellidos: 1 })
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
     
        pacientes = pacientes.map((data) => {
            return {
                Nombres: data.Nombres,
                Apellidos: data.Apellidos,
                Documento: data.Documento,
                Telefono: data.Telefono,
                _id: data._id,
            }
        })
        res.render('content/servicios/historiales/historial-pacientes.hbs', {
            layout: 'afiliado.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
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
         res.render('content/404', {
        layout: 'blank'
    })
    }
})

router.get('/afiliado/historial-medicos', isAuthenticatedAfiliado, async(req, res) => {
    try {
        let medicos = await medicoDB.find({}).sort({ Timestamp: -1 })
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
       
        medicos = medicos.map((data) => {
            return {
                Nombres: data.Nombres,
                Apellidos: data.Apellidos,
                Cedula: data.Cedula,
                _id: data._id,
            }
        })
        res.render('content/servicios/historiales/historial-medicos.hbs', {
            layout: 'afiliado.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            medicos
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


router.get('/afiliado/historial-solicitudes', isAuthenticatedAfiliado, async(req, res) => {
    try {
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
       
        res.render('afiliado/historiales/servicios.hbs', {
            layout: 'afiliado.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
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



router.get('/afiliado/nuevo-servicios-otros', isAuthenticatedAfiliado, async (req, res, next) =>{
    try {

        let afiliado = await afiliadosFichaDB.findOne({email: req.user.email})


        let servicios = await otrosServiciosDB.find({$and: [{_idAfiliado: afiliado._id}, {Estado: {$ne: "Rechazado"}}]}).sort().lean()

        servicios = servicios.filter((data) => data.Estado != "Atendido")

        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
       
        res.render('afiliado/servicios/nuevos', {
            layout: 'afiliado.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            servicios
        })

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
        res.render('content/404', {
            layout: 'blank'
        })
    }
})
router.get('/afliado/solicitudes-atendidas', isAuthenticatedAfiliado, async (req, res, next) =>{
    try {

        let afiliado = await afiliadosFichaDB.findOne({email: req.user.email})

        let servicios = await otrosServiciosDB.find({$and: [{_idAfiliado: afiliado._id}, {Estado: "Atendido"}]}).sort().lean()

        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
       

        res.render('afiliado/servicios/atendidos', {
            layout: 'afiliado.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            servicios
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
        res.render('content/404', {
            layout: 'blank'
        })
    }
})
router.get('/afliado/solicitudes-rechazadas', isAuthenticatedAfiliado, async (req, res, next) =>{
    try {

        let afiliado = await afiliadosFichaDB.findOne({email: req.user.email})

        let servicios = await otrosServiciosDB.find({$and: [{_idAfiliado: afiliado._id}, {Estado: "Rechazado"}]}).sort().lean()

        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
       
        res.render('afiliado/servicios/rechazados', {
            layout: 'afiliado.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            servicios
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
        res.render('content/404', {
            layout: 'blank'
        })
    }
})


router.post('/afiliado/servicios/cambiarEstado', isAuthenticatedAfiliado, async (req, res, next) =>{

    try {

        let {id , estado , motivoRechazo , montoFinal} = req.body

        let servicio = await otrosServiciosDB.findById(id)
        let medico = await medicoDB.findById(servicio._idMedico)
        let paciente = await pacienteDB.findById(servicio._idPaciente)
        let usuarioMedico = await usersDB.findOne({ email: medico.Email })
        let usuarioPaciente = await usersDB.findOne({ email: paciente.Email })
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

        console.log(estado)

        if(estado == "Atendido"){
        
            let Comision = medico.Comision
            let PuntosMedico = 0
            if(+medico.Comision > 10){
                let factorCOmision = `0.${medico.Comision}`
                PuntosMedico = (+montoFinal * +factorCOmision).toFixed(2)
            }else{
                let factorCOmision = `0.0${medico.Comision}`
                PuntosMedico = (+montoFinal * +factorCOmision).toFixed(2)
            }
        
            let examen = {
                PuntosTotales: montoFinal,
                Comision: Comision,
                PuntosMedico: PuntosMedico,
                PuntosDescuento: 0,
                PuntosNetos: (+montoFinal - +PuntosMedico).toFixed(2),
            }
        
            if (examen.PuntosMedico > 0) {
                // crear historial,  sumar puntos y enviamos notificacion al doctor y paciente de que el examen se atendio
                let validacionHistorial = await historialPuntosDB.findOne({ _idMedico: examen._idMedico })
                let PuntosObtenidos = medico.PuntosObtenidos
                let PuntosCanjeables = (+medico.PuntosCanjeables + +examen.PuntosMedico).toFixed(2)
                let Medalla = medico.Medalla //Evaluar los puntos obtenidos del reciente mes y subir la medalla en base a eso
                let anioEvaluar = moment().format('YYYY')
                //get the textual month with moment 
                let mesEvaluar = moment().format('MMMM')
                //first letter uppercase
                mesEvaluar = mesEvaluar.charAt(0).toUpperCase() + mesEvaluar.slice(1)
        
                let indicadores = await puntosIndicadoresMedicoDB.findOne({$and: [{_idMedico: medico._id}, {Anio: anioEvaluar}, {Mes: mesEvaluar}]})
                if(indicadores){
                    let puntosEvaluar = +indicadores.Cantidad + +examen.PuntosMedico
                    let medallaBronce = await medallasDB.find({Nombre: "Bronce"})
                    let medallaPlata = await medallasDB.find({Nombre: "Plata"})
                    let medallaOro = await medallasDB.find({Nombre: "Oro"})
                    
                    if (+puntosEvaluar > medallaBronce.Desde && +puntosEvaluar < medallaBronce.Hasta) {
                        Medalla = medallaBronce
                    } 
                    if (+puntosEvaluar > medallaPlata.Desde && +puntosEvaluar < medallaPlata.Hasta) {
                        Medalla = medallaPlata
                    } 
                    if (+puntosEvaluar > medallaOro.Desde && +puntosEvaluar < medallaOro.Hasta) { 
                        Medalla = medallaOro
                    }
                }
        
                //creamos indicadores de puntos comisiones
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
                let validacion = await puntosComisionesIndicadoresDB.findOne({$and: [{NumeroMes: mes}, {Anio: año}]})
                if(validacion){
                    let Cantidad = (+validacion.Cantidad + +examen.PuntosMedico).toFixed(2)
                    await  puntosComisionesIndicadoresDB.findByIdAndUpdate(validacion._id,{
                        Cantidad:Cantidad
                    })
                }else{
                    let nuevopuntosComisionesIndicadores = new puntosComisionesIndicadoresDB({
                        Mes: Mes,
                        NumeroMes: mes,
                        Cantidad: examen.PuntosMedico,
                        Anio: año,
                    }) 
                    await nuevopuntosComisionesIndicadores.save()
                }
        
                //cierre de indicadores de puntos comisiones
                
                //creamos indicadores de puntos generales 
                let validacion2 = await puntosGeneralesIndicadoresDB.findOne({$and: [{NumeroMes: mes}, {Anio: año}]})
                if(validacion2){
                    let Cantidad = (+validacion2.Cantidad + +examen.PuntosNetos).toFixed(2)
                    await  puntosGeneralesIndicadoresDB.findByIdAndUpdate(validacion2._id,{
                        Cantidad:Cantidad
                    })
                }else{  
                    let nuevopuntosComisionesIndicadores = new puntosGeneralesIndicadoresDB({
                        Mes: Mes,
                        NumeroMes: mes,
                        Cantidad: examen.PuntosNetos,
                        Anio: año,
                    }) 
                    await nuevopuntosComisionesIndicadores.save()
                }
        
                //cierre de inidicadores de puntos generales
        
                //creamos indicadores de puntos comisiones por medico aqui     medico
                let validacionMedico = await puntosIndicadoresMedicoDB.findOne({$and: [{NumeroMes: mes}, {Anio: año}, {_idMedico: medico._id}]})
                if(validacionMedico){
                    let Cantidad = (+validacionMedico.Cantidad + +examen.PuntosMedico).toFixed(2)
                    await  puntosIndicadoresMedicoDB.findByIdAndUpdate(validacionMedico._id,{
                        Cantidad:Cantidad
                    })
                }else{  
                    let nuevopuntosComisionesIndicadores = new puntosIndicadoresMedicoDB({
                        _idMedico: medico._id,
                        Medico: `${medico.Nombres} ${medico.Apellidos}`,
                        Mes: Mes,
                        NumeroMes: mes,
                        Cantidad: examen.PuntosMedico,
                        Anio: año,
                    }) 
                    await nuevopuntosComisionesIndicadores.save()
                }
        
                //cierre de inidicadores de puntos comisiones por medico
        
                //creamos indicadores de puntos por semana
                    let fecha = new Date();
                    let dia = fecha.getDay()
                    let semana = ["Domingo","Lunes","Martes","Miercoles","Jueves","Viernes","Sabado"];
        
                    let validacionSemana = await puntosSemanelesIndicadoresDB.findOne({FechaCompleta: FechaAtencion})
                    if(validacionSemana){
                        let Cantidad = (+validacionSemana.Cantidad + +examen.PuntosTotales).toFixed(2)
                        await puntosSemanelesIndicadoresDB.findByIdAndUpdate(validacionSemana._id,{
                            Cantidad:Cantidad
                        })
                    }else{
                        let nuevoPuntosSemaneles = new puntosSemanelesIndicadoresDB({
                            Mes: Mes,
                            NumeroMes: mes,
                            Anio: año,
                            Timestamp:timestamp, 
                            Dia: semana[dia],
                            FechaCompleta: FechaAtencion,
                            Cantidad: examen.PuntosTotales,
                        }) 
                        
                        await nuevoPuntosSemaneles.save()
                    }
                    //creacion de puntos semanales por medico 
                    //aqui 
                    let validacionSemanaMedico = await puntosSemanalesIndicadoresMedicoDB.findOne({$and: [{FechaCompleta: FechaAtencion}, {_idMedico: medico._id}]})
                    if(validacionSemanaMedico){
                        let Cantidad = (+validacionSemanaMedico.Cantidad + +examen.PuntosMedico).toFixed(2)
                        await puntosSemanalesIndicadoresMedicoDB.findByIdAndUpdate(validacionSemanaMedico._id,{
                            Cantidad:Cantidad
                        })
                    }else{
                        let nuevoPuntosSemaneles = new puntosSemanalesIndicadoresMedicoDB({
                            _idMedico: medico._id,
                            Medico: `${medico.Nombres} ${medico.Apellidos}`,
                            Mes: Mes,
                            NumeroMes: mes,
                            Anio: año,
                            Timestamp:timestamp, 
                            Dia: semana[dia],
                            FechaCompleta: FechaAtencion,
                            Cantidad: examen.PuntosMedico,
                        }) 
                        
                        await nuevoPuntosSemaneles.save()
                    }
        
                //cerre de  indicadores de puntos por semana
        
        
                await medicoDB.findByIdAndUpdate(medico._id, {
                    Medalla: Medalla.Nombre,
                    Comision: Medalla.Comision,
                    PuntosObtenidos: PuntosObtenidos,
                    PuntosCanjeables: PuntosCanjeables,
                })
                if(+examen.PuntosMedico > 0){
                    if (validacionHistorial) {
                        //insertamos historial y sumamos puntos al paciente
                        let ultimoHistorial = validacionHistorial.Historial[validacionHistorial.Historial.length - 1]
                        let dataHistorial = {
                            Timestamp: timestamp,
                            TipoMovimiento: 'Ingreso',
                            PuntosAnteriores: ultimoHistorial.PuntosActuales,
                            PuntosMovidos: examen.PuntosMedico,
                            PuntosActuales: (+ultimoHistorial.PuntosActuales + +examen.PuntosMedico).toFixed(2),
                            Fecha: FechaAtencion,
                            Usuario: `${req.user.Nombres} ${req.user.Apellidos}`,
                            Comentario: `Ingreso de puntos por examen #${examen.Numero}`,
                            Color: 'success',
                        }
                        await historialPuntosDB.findByIdAndUpdate(validacionHistorial._id, {
                            $push: { Historial: dataHistorial }
                        })
                    } else {
                        //creamos historial
                        let dataHistorial = {
                            Timestamp: timestamp,
                            TipoMovimiento: 'Ingreso',
                            PuntosAnteriores: 0,
                            PuntosMovidos: examen.PuntosMedico,
                            PuntosActuales: examen.PuntosMedico,
                            Fecha: FechaAtencion,
                            Usuario: `${req.user.Nombres} ${req.user.Apellidos}`,
                            Comentario: `Ingreso de puntos por examen #${examen.Numero}`,
                            Color: 'success',
                        }
                        let nuevoHistorial = new historialPuntosDB({
                            _idMedico: medico._id,
                            Medico: `${medico.Nombres} ${medico.Apellidos}`,
                            DocumentoMedico: medico.Cedula,
                            Historial: [dataHistorial]
                        })
                        await nuevoHistorial.save()
                    }
                }
            }
            //creamos notificacion para el paciente y medico
            if (usuarioPaciente) {
                let nuevaNotificacionPaciente = new notificacionDB({
                    _idUsuario: usuarioPaciente._id,
                    Timestamp: timestamp,
                    Titulo: `Resultados de solicitud #${examen.Numero}`,
                    Mensaje: 'Resultados',
                    Imagen: '/images/icons/icon.png',
                    idSocket: paciente.idSocket,
                    Tipo: 'Examen',
                    link: '/paiente/examenes-atendidos',
                })
                await nuevaNotificacionPaciente.save()
            }
            if(usuarioMedico){
                let nuevaNotificacionMedico = new notificacionDB({
                    _idUsuario: usuarioMedico._id,
                    Timestamp: timestamp,
                    Titulo: `Resultados de solicitud #${examen.Numero}`,
                    Mensaje: 'Resultados',
                    Imagen: '/images/icons/icon.png',
                    idSocket: paciente.idSocket,
                    Tipo: 'Examen',
                    link: '/medico/examenes-atendidos',
                })
                await nuevaNotificacionMedico.save()
            }

            let data = {
                ok: true,
            }

            await otrosServiciosDB.findByIdAndUpdate(id,{
                PuntosTotales: examen.PuntosTotales,
                Comision: examen.Comision,
                PuntosMedico: examen.PuntosMedico,
                PuntosDescuento: examen.PuntosDescuento,
                PuntosNetos: examen.PuntosNetos,
                Estado: 'Atendido'
            }) 

            res.send(JSON.stringify(data))

        }else{

            await otrosServiciosDB.findByIdAndUpdate(id,{
                Estado: estado, 
                MotivoRechazo: motivoRechazo
            })

            let data = {
                ok: true,
            }

            res.send(JSON.stringify(data))

        }

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
        res.render('content/404', {
            layout: 'blank'
        })
    }

})


router.get('/mi-cuenta-afiliado', isAuthenticated, async(req, res) => {
    let usuario = await usersDB.findOne({ email: req.user.email })
    let personal = await afiliadosFichaDB.findOne({ email: req.user.email })
    let Historial = []
    let historial = await historialActividadDB.findOne({ _idUsuario: req.user._id })
    if (historial) {
        Historial = historial.Historial
    }
    Historial = Historial.map((data) => {
        return {
            Fecha: data.Fecha,
            Seccion: data.Seccion,
            Timestamp: data.Timestamp,
            Accion: data.Accion,
        }
    })
    let roles = ""
    usuario.Role.forEach(element => {
        roles += element + " "
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
    }
    let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
    

    res.render('content/mi-cuenta-afiliado', {
        layout: 'afiliado.hbs',
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        RutaImage: req.user.RutaImage,
        Historial,
        usuario
    })
})

router.get('/soporte-afiliado', isAuthenticatedAfiliado, async(req, res) => {

    let subcategorias = await subcategoriasDB.find().sort({Categoria: 1})
    let tickets = await ticketDB.find({$and: [{_idUsuario: req.user._id},{Estado:{$ne: "Anulado"}}]})
    tickets = tickets.map((data) =>{
        let Color = 'warning'
        if(data.Estado == 'En proceso'){
            Color = 'info'
        }
        if(data.Estado == 'Anulado'){
            Color = 'danger'
        }
        if(data.Estado == 'Cerrado'){
            Color = 'success'
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
        }
    })
    subcategorias = subcategorias.map((data) =>{
        return {
            Categoria: data.Categoria,
        }
    })

    let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5).lean()
    

    res.render('content/soporte', {
        layout: 'afiliado.hbs', 
        Apellido: `${req.user.Apellidos}`,
        RutaImage: req.user.RutaImage,
        Nombre: `${req.user.Nombres}`,
        _idUsuario: req.user._id,
        Tema: req.user.Tema,
        notificaciones,
        subcategorias,
        tickets,
        RutaImage: req.user.RutaImage,
    })
})


module.exports = router;