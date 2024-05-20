const mongoose = require("mongoose");
const { Schema } = mongoose;

const constanciasCanje = new Schema({
    Medico: { type: String, require: true },
    _idMedico: { type: String, require: true },
    Cedula: { type: String, require: true },
    PuntosAntes: { type: String, require: true },
    PuntosMovidos: { type: String, require: true },
    PuntosPendientes: { type: String, require: true },
    FechaRecibo: { type: String, require: true },
    FechaPago: { type: String, require: true },
    Numero: { type: String, require: true },
    _idUsuario: { type: String, require: true },
    NombresUsuario : { type: String, require: true },
    Timestamp: { type: String, require: true },
});

module.exports = mongoose.model("constanciasCanje", constanciasCanje);