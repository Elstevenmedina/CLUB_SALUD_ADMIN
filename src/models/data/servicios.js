const mongoose = require("mongoose");
const { Schema } = mongoose;
const servicios = new Schema({
    Nombre: { type: String, require: true },
});

module.exports = mongoose.model("servicios", servicios);