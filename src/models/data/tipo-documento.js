const mongoose = require("mongoose");
const { Schema } = mongoose;
const tipoDocumento = new Schema({
    Nombre: { type: String, require: true },
});

module.exports = mongoose.model("tipoDocumento", tipoDocumento);