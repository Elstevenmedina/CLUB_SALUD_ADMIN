const mongoose = require("mongoose");
const { Schema } = mongoose;

const otrosServicios = new Schema({
    Medico: { type: String, require: true },
    CedulaMedico: { type: String, require: true },
    _idMedico: { type: String, require: true },
    Paciente: { type: String, require: true },
    _idPaciente: { type: String, require: true },
    DocumentoPaciente: { type: String, require: true },
    DireccionPaciente: { type: String, require: true },
    FechaNacimientoPaciente: { type: String, require: true },
    TelefonoPaciente: { type: String, require: true },
    _idServicio : { type: String, require: true },
    Servicio : { type: String, require: true },
    Afiliado : { type: String, require: true },
    _idAfiliado : { type: String, require: true },
    Descripcion : { type: String, require: true },
    Fecha : { type: String, require: true },
    Timestamp : { type: String, require: true },
    Numero : { type: String, require: true },
    PuntosTotales: { type: String },
    Comision: { type: String },
    PuntosMedico: { type: String },
    PuntosDescuento: { type: Number },
    PuntosNetos: { type: Number },
    MotivoRechazo: { type: String },
    Estado: { type: String, default: 'Pendiente' },

});



module.exports = mongoose.model("otrosServicios", otrosServicios);