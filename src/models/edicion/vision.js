const mongoose = require("mongoose");
const { Schema } = mongoose;
const vision = new Schema({
    Contenido: { type: String, require: true },
});

module.exports = mongoose.model("vision", vision);