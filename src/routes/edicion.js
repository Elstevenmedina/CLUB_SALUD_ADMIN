const router = require("express").Router();
const notificacionDB = require("../models/herramientas/notificaciones");
const recomendacionesDB = require("../models/edicion/recomendaciones");
const misionDB = require("../models/edicion/mision");
const visionDB = require("../models/edicion/vision");
const nosotrosDB = require("../models/edicion/nosotros");
const errorDB = require("../models/soporte/errores");
const { isAuthenticatedMaster } = require("../helpers/auth");
const path = require('path')

const multer = require('multer');
const { stringify } = require("querystring");
const upload = multer({
    storage: multer.diskStorage({
        destination: 'src/public/images/recomendaciones',
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


router.get('/edicion-pagina-informativa', isAuthenticatedMaster, async (req, res, next) =>{
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
        res.render('edicion/index', {
            layout:'edicion.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            RutaImage: req.user.RutaImage,
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
        next(err) 
    }
})


router.get('/crear-recomendaciones', isAuthenticatedMaster, async (req, res) =>{
    try {
        let notificaciones = await notificacionDB.find({ _idUsuario: req.user._id }).sort({ Timestamp: -1 }).limit(5);
        let recomendaciones = await recomendacionesDB.find().sort({Timestamp:-1})
        recomendaciones = recomendaciones.map((data) =>{
            return {
                Timestamp: data.Timestamp,
                Titulo: data.Titulo,
                Descripcion: data.Descripcion,
                TipoRecomendacion: data.TipoRecomendacion,
                Imagen: data.Imagen,
                Activo: data.Activo,
                Fecha: data.Fecha,
                _id: data._id
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
        res.render('edicion/crear-recomendaciones', {
            layout:'edicion.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            recomendaciones,
            RutaImage: req.user.RutaImage,
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
        next(err) 
    }
})


router.post('/nueva-recomendacion', isAuthenticatedMaster, upload.single('Imagen'), async (req, res) =>{
    try{ 
        let timestamp = Date.now();
        let ruta = req.file.path
        ruta = ruta.substring(10,ruta.length)
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
        let {tipoRecomendacion, Titulo, Descripcion} = req.body
        let nuevarecomendaciones = new recomendacionesDB({
            Timestamp:timestamp, 
            Titulo:Titulo, 
            Descripcion:Descripcion, 
            TipoRecomendacion:tipoRecomendacion, 
            Imagen:ruta, 
            Fecha:Fecha_Registro,
        })
        await nuevarecomendaciones.save()
        req.flash('success','Recomendación creada correctamente')
        res.redirect('/crear-recomendaciones')
        
    }catch(err) {
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
        next(err)  
    }
})


router.post('/eliminar-recomendacion/:id', isAuthenticatedMaster, async (req, res, next) =>{
    try{
        await recomendacionesDB.findByIdAndDelete(req.params.id)
        res.send(JSON.stringify('ok'))
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
        next(err) 
    }
})

router.get('/mision-vision', isAuthenticatedMaster, async (req, res, next) =>{
    try {
        let mision = await misionDB.find()
        let vision = await visionDB.find()
        if(vision.length > 0){
            console.log(vision)
            vision = {
                Contenido: vision[0].Contenido
            }
        }else{
            vision = {
                Contenido: ''
            }
        }
        if(mision.length > 0){
            mision = {
                Contenido: mision[0].Contenido
            }
        }else{
            mision = {
                Contenido: ''
            }
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
        res.render('edicion/mision-vision', {
            layout:'edicion.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            mision,
            vision,
            RutaImage: req.user.RutaImage,
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
        next(err) 
    }
})

router.post('/guardar-informacion-vision', isAuthenticatedMaster ,async (req, res, next) =>{
    try {
        let {Vision} = req.body
        let vision = await visionDB.find()
        if(vision.length > 0){
            await visionDB.findByIdAndUpdate(vision[0]._id,{
                Contenido:Vision,
            })
        }else{
            let nuevaVision = new visionDB({
                Contenido:Vision,
            })
            await nuevaVision.save()
        }

        res.send(JSON.stringify('ok'))

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
        next(err) 
    }
})

router.post('/guardar-informacion-mision', isAuthenticatedMaster ,async (req, res, next) =>{
    try {
        let {Mision} = req.body
        let mision = await misionDB.find({})
        if(mision.length > 0){
            await misionDB.findByIdAndUpdate(mision[0]._id,{
                Contenido:Mision,
            })
        }else{
            let nuevaMision = new misionDB({
                Contenido:Mision,
            })

            await nuevaMision.save()
        }
        res.send(JSON.stringify('ok'))

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
        next(err) 
    }
})


router.get('/nosotros', isAuthenticatedMaster, async (req, res, next) =>{
    try{ 
        let Nosotros = await nosotrosDB.find()
        if(Nosotros.length > 0){
            Nosotros ={
                Contenido: Nosotros[0].Contenido
            }
            
        }else{
            Nosotros = {
                Contenido: ""
            }
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
        res.render('edicion/nosotros', {
            layout:'edicion.hbs',
            Apellido: `${req.user.Apellidos}`,
            RutaImage: req.user.RutaImage,
            Nombre: `${req.user.Nombres}`,
            _idUsuario: req.user._id,
            Tema: req.user.Tema,
            notificaciones,
            Nosotros,
            RutaImage: req.user.RutaImage,
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
        next(err) 
    }
})


router.post('/guardar-informacion-nosotros', isAuthenticatedMaster, async (req, res, next) =>{
    try {
        let {Nosotros} = req.body
        let nosotros = await nosotrosDB.find({})
        if(nosotros.length > 0){
            await nosotrosDB.findByIdAndUpdate(nosotros[0]._id,{
                Contenido:Nosotros,
            })
        }else{
            let nuevoNosotros = new nosotrosDB({
                Contenido:Nosotros,
            })

            await nuevoNosotros.save()
        }
        res.send(JSON.stringify('ok'))

    }catch(err) {
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
        next(err) 
    }
})

module.exports = router;
