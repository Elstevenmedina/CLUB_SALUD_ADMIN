const mongoose = require("mongoose");
const { Schema } = mongoose;

const historialActividad = new Schema({
    Nombre: { type: String, require:true },
    _idUsuario: { type: String, require:true  },
    Historial: [{
        Fecha: { type: String, require: true },
        Seccion: { type: String, require: true },
        Timestamp: { type: Number, require: true },
        Accion: { type: String, require: true },
    }]
});

module.exports = mongoose.model("historialActividad", historialActividad);