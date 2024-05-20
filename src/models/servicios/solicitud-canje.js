const mongoose = require("mongoose");
const { Schema } = mongoose;

const solicitudCanje = new Schema({
   Numero: { type: String, require: true },
   Medico: { type: String, require: true },
   _idMedico: { type: String, require: true },
   Cedula: { type: String, require: true },
   PuntosCanjeados: { type: Number, require: true },
   TipoCanje: { type: String, require: true },
   _idTipoCanje: { type: String, require: true },
   FechaCanje: { type: String, require: true },
   Estado : { type: String, default:'Pendiente' },
   FechaEntrega: { type: String},
   ComentarioRechazo: { type: String},
});

module.exports = mongoose.model("solicitudCanje", solicitudCanje);