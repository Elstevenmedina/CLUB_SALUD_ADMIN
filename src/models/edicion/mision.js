const mongoose = require("mongoose");
const { Schema } = mongoose;
const mision = new Schema({
    Contenido: { type: String, require: true },
});

module.exports = mongoose.model("mision", mision);