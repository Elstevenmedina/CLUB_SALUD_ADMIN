const mongoose = require("mongoose");
const { Schema } = mongoose;

const tipoCanjes = new Schema({
    Nombre: { type: String, require: true },
    Puntos: { type: Number, require: true },
    Descripcion: { type: String, require: true },
    Activo: { type: Boolean, default: true },
});

module.exports = mongoose.model("tipoCanjes", tipoCanjes);