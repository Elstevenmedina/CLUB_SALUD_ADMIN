const mongoose = require("mongoose");
const { Schema } = mongoose;
const mensajesWhatsapp = new Schema({
    NombreUsuario: { type: String, require: true },
    _idUsuario: { type: String, require: true },
    Mensaje: { type: String, require: true },
    Enviado: { type: Boolean, default: false },
});

module.exports = mongoose.model("mensajesWhatsapp", mensajesWhatsapp);