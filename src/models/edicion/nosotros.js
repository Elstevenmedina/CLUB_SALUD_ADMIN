const mongoose = require("mongoose");
const { Schema } = mongoose;
const nosotros = new Schema({
    Contenido: { type: String, require: true },
});

module.exports = mongoose.model("nosotros", nosotros);