const mongoose = require("mongoose");
const { Schema } = mongoose;

const perfiles = new Schema({
    Nombre: { type: String, require: true },
    Precio: { type: Number, require: true },
    Orden: { type: Number, require: true },
});

module.exports = mongoose.model('perfiles', perfiles)