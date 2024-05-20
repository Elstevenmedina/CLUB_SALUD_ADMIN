const mongoose = require("mongoose");
const { Schema } = mongoose;

const medallas = new Schema({
    Nombre: { type: String, require: true },
    Comision: { type: Number, require: true },
    Desde: { type: Number, require: true },
    Hasta: { type: Number, require: true },
    Imagen: { type: String, require: true },
});

module.exports = mongoose.model("medallas", medallas);