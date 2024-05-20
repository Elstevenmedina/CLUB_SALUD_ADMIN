const mongoose = require("mongoose");
const { Schema } = mongoose;

const visitasIndicadores = new Schema({
    Mes: { type: String, require: true },
    NumeroMes: { type: Number, require: true },
    Cantidad: { type: Number, require: true },
    Anio: { type: String, require: true },
});

module.exports = mongoose.model("visitasIndicadores", visitasIndicadores);