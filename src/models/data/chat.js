const mongoose = require("mongoose");
const { Schema } = mongoose;

const chat = new Schema({
    NombresUsuario1: { type: String, require: true },
    ApellidosUsuario1: { type: String, require: true },
    NombresUsuario2: { type: String, require: true },
    ApellidosUsuario2: { type: String, require: true },
    _idUsuario1: { type: String, require: true },
    _idUsuario2: { type: String, require: true },
    Mensajes: [{
        Usuario: { type: String, require: true },
        _idUsuario: { type: String, require: true },
        Timestamp: { type: String, require: true },
        Tiempo: { type: String, require: true },
        RutaImagen: { type: String, require: true },
        Mensaje: { type: String, require: true },
        Posicion: { type: String, require: true },
        Notificacion: { type: Boolean, default: true }
    }]
});

module.exports = mongoose.model('chat', chat)