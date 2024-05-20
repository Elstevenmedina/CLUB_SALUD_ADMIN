const mongoose = require("mongoose");
const { Schema } = mongoose;
const afiliados_ficha = new Schema({
    Afiliado: { type: String, require: true },
    Servicio: { type: String, require: true },
    Nombre: { type: String, require: true },
    Cedula: { type: String, require: true },
    Email: { type: String, require: true },
    Estado: { type: String, default: "Por activar" },
});

module.exports = mongoose.model("afiliados_ficha", afiliados_ficha);
