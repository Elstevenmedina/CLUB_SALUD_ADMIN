const mongoose = require("mongoose");
const { Schema } = mongoose;

const errores = new Schema({
    Descripcion: { type: String, require: true },
    Fecha: { type: String, require: true },
    Usuario: { type: String, require: true },
    Linea: { type: String, require: true },
});

module.exports = mongoose.model('errores', errores)