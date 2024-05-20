const mongoose = require("mongoose");
const { Schema } = mongoose;
const notificacion = new Schema({
    _idUsuario: { type: String, require: true },
    Timestamp: { type: String, require: true },
    Fecha: { type: String, require: true },
    Titulo: { type: String, require: true },
    Mensaje: { type: String, require: true },
    Imagen: { type: String, require: true },
    Notificacion: { type: Boolean, default: true },
    idSocket: { type: String, require: true },
    Tipo: { type: String, require: true },
    link: { type: String, require: true }
});

module.exports = mongoose.model("notificacion", notificacion);