const mongoose = require("mongoose");
const { Schema } = mongoose;

const historialPuntos = new Schema({
    Medico: { type: String, require: true },
    DocumentoMedico: { type: String, require: true },
    _idMedico: { type: String, require: true },
    Historial: [{
        Timestamp: { type: String, require: true },
        TipoMovimiento: { type: String, require: true },
        PuntosAnteriores: { type: Number, require: true },
        PuntosMovidos: { type: Number, require: true },
        PuntosActuales: { type: Number, require: true },
        Paciente: { type: String, default: "" },
        Fecha: { type: String, require: true },
        Usuario: { type: String, require: true },
        Comentario: { type: String, require: true },
        Color: { type: String, require: true },
    }]
});



module.exports = mongoose.model("historialPuntos", historialPuntos);