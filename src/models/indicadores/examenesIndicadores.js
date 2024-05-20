const mongoose = require("mongoose");
const { Schema } = mongoose;

const examenesIndicadores = new Schema({
    Medico: { type: String, require: true },
    _idMedico: { type: String, require: true },
    Mes: { type: String, require: true },
    NumeroMes: { type: Number, require: true },
    Cantidad: { type: Number, require: true },
    Anio: { type: String, require: true },
});

module.exports = mongoose.model("examenesIndicadores", examenesIndicadores);