const mongoose = require("mongoose");
const { Schema } = mongoose;

const historialExamenes = new Schema({
    Tipo: { type: String, require: true },
    Nombre: { type: String, require: true },
    _idExamen: { type: String, require: true },
    Historial: [{
        Timestamp: { type: Number, require: true },
        Numero: { type: Number, require: true },
        TipoExamen: { type: String, require: true },
        Medico: { type: String, require: true },
        Paciente: { type: String, require: true },
        Puntos: { type: Number, require: true },
        Fecha: { type: String, require: true },
    }]
});

module.exports = mongoose.model("historialExamenes", historialExamenes);