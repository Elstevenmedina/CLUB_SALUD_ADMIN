const mongoose = require("mongoose");
const { Schema } = mongoose;

const sucursal = new Schema({
    Nombre: { type: String, require: true },
});

module.exports = mongoose.model("sucursal", sucursal);