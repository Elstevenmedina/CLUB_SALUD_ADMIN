const mongoose = require("mongoose");
const { Schema } = mongoose;

const especialidades = new Schema({
    Nombre: { type: String, require: true },
});

module.exports = mongoose.model('especialidades', especialidades)