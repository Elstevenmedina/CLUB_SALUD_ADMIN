const mongoose = require("mongoose");
const { Schema } = mongoose;

const puntosMensualesIndicadores = new Schema({
    Mes: { type: String, require: true },
    NumeroMes: { type: Number, require: true },
    Monto: { type: Number, require: true },
    Anio: { type: String, require: true },
});

module.exports = mongoose.model("puntosMensualesIndicadores", puntosMensualesIndicadores);