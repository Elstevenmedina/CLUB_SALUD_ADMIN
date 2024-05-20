const mongoose = require("mongoose");
const { Schema } = mongoose;

const puntosSemanalesIndicadoresMedico = new Schema({
    Medico: { type: String, require: true },
    _idMedico: { type: String, require: true },
    Mes: { type: String, require: true },
    NumeroMes: { type: Number, require: true },
    Anio: { type: Number, require: true },
    Timestamp: { type: Number, require: true },
    Dia: { type: String, require: true },
    FechaCompleta: { type: String, require: true },
    Cantidad: { type: Number, require: true },
});

module.exports = mongoose.model("puntosSemanalesIndicadoresMedico", puntosSemanalesIndicadoresMedico);