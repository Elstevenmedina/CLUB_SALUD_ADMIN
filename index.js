if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const expressSession = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const flash = require("connect-flash");
const MongoStore = require('connect-mongo');
const http = require("http");
const socketio = require("socket.io");
const notificacionDB = require("./src/models/herramientas/notificaciones");
const usersDB = require("./src/models/data/users");
const chatDB = require("./src/models/data/chat");


//Inicializacion
const app = express();
const server = http.createServer(app);
const io = socketio(server);


//rutas de bd y passport
require("./src/database");
require("./src/config/passport")

//Configuraciones

//incializacion socket io

io.on("connection", async(socket) => {
    const userId = socket.id

    //enviando id socket
    io.to(userId).emit('id', userId);

    //actualizando ID Socket
    socket.on('actualizarId', async(data) => {

        await usersDB.findByIdAndUpdate(data.idActive, {
            idSocket: data.userId
        })
    })

    //escuchando el chat
    socket.on("chatMessage", async data => {
        let chat = await chatDB.findOne({ $or: [{ $and: [{ _idUsuario1: data._idReq }, { _idUsuario2: data._id }] }, { $and: [{ _idUsuario1: data._id }, { _idUsuario2: data._idReq }] }] })
        let usuario1 = await usersDB.findOne({ _id: data._id })
        let usuario2 = await usersDB.findOne({ _id: data._idReq })
        let Timestamp = Date.now();
        let time = new Date();
        let idTo1 = usuario1.idSocket
        let idTo2 = usuario2.idSocket
        time = time.toString()
        time = time.split(' ');
        time = time[4];
        time = time.split(':');
        time = time[0] + ':' + time[1];
        if (chat) {
            let nuevoMensaje = {
                Usuario: `${usuario2.Nombres} ${usuario2.Apellidos}`,
                _idUsuario: data._idReq,
                Tiempo: time,
                RutaImagen: usuario2.RutaImage,
                Mensaje: data.message,
                Posicion: 'odd',
                Timestamp: Timestamp,
            }
            await chatDB.updateOne({ _id: chat._id }, { $push: { Mensajes: nuevoMensaje } })
        } else {
            let mensajes = [{
                Usuario: `${usuario2.Nombres} ${usuario2.Apellidos}`,
                _idUsuario: data._idReq,
                Tiempo: time,
                RutaImagen: usuario2.RutaImage,
                Mensaje: data.message,
                Posicion: 'odd',
                Timestamp: Timestamp,
            }]
            let nuevoChat = new chatDB({
                NombresUsuario1: usuario1.Nombres,
                ApellidosUsuario1: usuario1.Apellidos,
                NombresUsuario2: usuario2.Nombres,
                ApellidosUsuario2: usuario2.Apellidos,
                _idUsuario1: usuario1._id,
                _idUsuario2: usuario2._id,
                Mensajes: mensajes
            })
            await nuevoChat.save()
        }
        chat = await chatDB.findOne({ $or: [{ $and: [{ _idUsuario1: data._idReq }, { _idUsuario2: data._id }] }, { $and: [{ _idUsuario1: data._id }, { _idUsuario2: data._idReq }] }] })
        let mensajes = chat.Mensajes.map((doc) => {
            if (doc._idUsuario == data._idReq) {
                doc.Posicion = 'odd'
            } else {
                doc.Posicion = ''
            }
            return {
                Usuario: doc.Usuario,
                _idUsuario: doc._idUsuario,
                Timestamp: doc.Timestamp,
                Tiempo: doc.Tiempo,
                RutaImagen: doc.RutaImagen,
                Mensaje: doc.Mensaje,
                Posicion: doc.Posicion,
            }
        })

        let dataEnvio = {
            time: mensajes[mensajes.length - 1].Tiempo,
            username: mensajes[mensajes.length - 1].Usuario,
            rutaImagen: mensajes[mensajes.length - 1].RutaImagen,
            text: mensajes[mensajes.length - 1].Mensaje,
            Posicion: mensajes[mensajes.length - 1].Posicion,
            notificaciones: [],
        }
        io.to(idTo1).to(idTo2).emit("message", dataEnvio);
        if (usuario1.Activo === false) {
            //notificacion campana
            let link = '/Chat'
            if (usuario1.TipoUsuario == 'Medico') {
                link = '/medico/Chat'
            }
            if (usuario1.TipoUsuario == 'Paciente') {
                link = '/paciente/Chat'
            }
            let nuevaNotificacion = new notificacionDB({
                _idUsuario: usuario1._id,
                Timestamp: Timestamp,
                Titulo: `Mensaje de ${usuario2.Nombres} ${usuario2.Apellidos}`,
                Mensaje: dataEnvio.text.substring(0, 20) + '...',
                Imagen: usuario2.RutaImage,
                idSocket: usuario1.idSocket,
                Tipo: 'chat',
                link: link,
            })
            await nuevaNotificacion.save()
            let campana = await notificacionDB.find({ $and: [{ _idUsuario: usuario1._id }, { Notification: true }] }).sort({ Timestamp: -1 })
            io.to(idTo1).emit("campana", campana);
        }
        io.to(idTo1).emit("notificacion", dataEnvio);

        //enviar lista de chat actualizada 
        let contactosAgregados = []
        let contactos2 = usuario1.Contactos
        let contactos = []
        for(r=0; r< contactos2.length; r++){
            let usuarioExiste = await usersDB.findById(contactos2[r])
            if(usuarioExiste){
                contactos.push(contactos2[r])
            }
        }
     
        for (i = 0; i < contactos.length; i++) {
            let chat = await chatDB.findOne({ $or: [{ $and: [{ _idUsuario1: usuario1._id }, { _idUsuario2: contactos[i] }] }, { $and: [{ _idUsuario1: contactos[i] }, { _idUsuario2: usuario1._id }] }] })
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
            if (mensajes._idUsuario == usuario1._id) {
                contactosAgregados[i].Notificacion = false
            }
        }
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
                _idReq: usuario1._id,
                _id: data._id,
                Mensaje: data.Mensaje,
                Tiempo: data.Tiempo,
                Timestamp: data.Timestamp,
                Notificacion: data.Notificacion
            }
        })
        contactosAgregados.sort(function(a, b) {
            if (a.Tiempo > b.Tiempo) {
                return -1;
            }
            if (a.Tiempo < b.Tiempo) {
                return 1;
            }
            return 0;
        });
        io.to(idTo1).emit("actualizarLista", contactosAgregados);
        contactosAgregados = []
        contactos2 = usuario2.Contactos
        contactos = []

        for(r=0; r< contactos2.length; r++){
            let usuarioExiste = await usersDB.findById(contactos2[r])
            if(usuarioExiste){
                contactos.push(contactos2[r])
            }
        }
     
        for (i = 0; i < contactos.length; i++) {
            let chat = await chatDB.findOne({ $or: [{ $and: [{ _idUsuario1: usuario2._id }, { _idUsuario2: contactos[i] }] }, { $and: [{ _idUsuario1: contactos[i] }, { _idUsuario2: usuario2._id }] }] })
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
            if (mensajes._idUsuario == usuario2._id) {
                contactosAgregados[i].Notificacion = false
            }
        }
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
                _idReq: usuario2._id,
                _id: data._id,
                Timestamp: data.Timestamp,
                Mensaje: data.Mensaje,
                Tiempo: data.Tiempo,
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
        io.to(idTo2).emit("actualizarLista", contactosAgregados);
    })

    //Actualizando estado de usuario
    socket.on('activo', async(idActive) => {
        await usersDB.findByIdAndUpdate(idActive, {
            Activo: true,
        })
    })

    //Actualizando estado de usuario
    socket.on('inactivo', async(idActive) => {
        await usersDB.findByIdAndUpdate(idActive, {
            Activo: false,
        })
    })
})


app.set("port", process.env.PORT || 3300);
app.set("views", path.join(__dirname, "src", "views"));
app.engine(
    ".hbs",
    exphbs.engine({
        defaultLayout: "main",
        layoutsDir: path.join(app.get("views"), "layout"),
        partialsDir: path.join(app.get("views"), "partials"),
        extname: ".hbs",
    })
);
app.set("view engine", ".hbs");

//Middlewears

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(
    expressSession({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: process.env.DB_HOST
        })
    })
);
app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(flash())

//Variables globales
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.warning_msg = req.flash('warning_msg')
    next()
})
app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    next()
})
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    next()
})
app.use((req, res, next) => {
    res.locals.warning = req.flash('warning');
    next()
})

//Rutas
app.use(require("./src/routes/index"));
app.use(require("./src/routes/medicos"));
app.use(require("./src/routes/pacientes"));
app.use(require("./src/routes/edicion"));
app.use(require("./src/routes/afiliados"));


//Archivos estaticos

app.use(express.static(path.join(__dirname, "src", "public")));
app.use(function(req, res, next) {
    res.status(404);
    res.render('content/404', {
        layout: 'blank'
    })
});


server.listen(app.get("port"), () => {
    console.log("Escuchando en " + app.get("port"));
});