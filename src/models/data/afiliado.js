const mongoose = require("mongoose");
const { Schema } = mongoose;
const afiliados = new Schema({
    Nombre: { type: String, require: true },
});

module.exports = mongoose.model("afiliados", afiliados);