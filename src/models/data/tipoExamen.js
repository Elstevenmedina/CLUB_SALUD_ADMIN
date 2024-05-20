const mongoose = require("mongoose");
const { Schema } = mongoose;

const tipoExamen = new Schema({
    Nombre: { type: String, require: true },
    Orden : { type: Number, require: true },
});

module.exports = mongoose.model('tipoExamen', tipoExamen)