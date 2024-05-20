const mongoose = require("mongoose");
const { Schema } = mongoose;

const historialIngreso = new Schema({
    _idUsuario: { type: String, require: true },
    Historial: [{
        Fecha: { type: String, require: true },
    }]
});

module.exports = mongoose.model("historialIngreso", historialIngreso);