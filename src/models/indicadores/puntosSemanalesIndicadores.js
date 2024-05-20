const mongoose = require("mongoose");
const { Schema } = mongoose;

const puntosSemanalesIndicadores = new Schema({
    Mes: { type: String, require: true },
    NumeroMes: { type: Number, require: true },
    Anio: { type: Number, require: true },
    Timestamp: { type: Number, require: true },
    Dia: { type: String, require: true },
    FechaCompleta: { type: String, require: true },
    Cantidad: { type: Number, require: true },
});

module.exports = mongoose.model("puntosSemanalesIndicadores", puntosSemanalesIndicadores);