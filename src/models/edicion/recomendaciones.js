const mongoose = require("mongoose");
const { Schema } = mongoose;
const recomendaciones = new Schema({
    Timestamp: { type: String, require: true },
    Fecha: { type: String, require: true },
    Titulo: { type: String, require: true },
    Descripcion: { type: String, require: true },
    TipoRecomendacion: { type: String, require: true },
    Imagen: { type: String, require: true },
    Activo: { type: Boolean, default: true },
});

module.exports = mongoose.model("recomendaciones", recomendaciones);