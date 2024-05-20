const mongoose = require("mongoose");
const { Schema } = mongoose;

const medico = new Schema({
  NroAfiliado: { type: String, require: true },
  Nombres: { type: String, require: true },
  Apellidos: { type: String, require: true },
  Cedula: { type: String, require: true },
  Direccion: { type: String, require: true },
  Email: { type: String, require: true },
  Estado: { type: String, require: true },
  Telefono: { type: String, require: true },
  Especialidad: { type: String, require: true },
  FechaNacimiento: { type: String, require: true },
  Cuenta: { type: String, require: true },
  Medalla: { type: String, default: "Bronce" },
  Comision: { type: Number, require: true },
  NumeroCIV: { type: String, require: true },
  GrupoSanguineo: { type: String, require: true },
  PuntosCanjeables: { type: Number, default: 0 },
  PuntosCanjeados: { type: Number, default: 0 },
  PuntosObtenidos: { type: Number, default: 0 },
  Fecha_Registro: { type: String, require: true },
  Fecha_Modificacion: { type: String, require: true },
  Usuario_Registro: { type: String, require: true },
  Fecha_Eliminacion: { type: String, require: true },
  Role: { type: String, default: "Medico" },
  Visibilidad: { type: Boolean, require: true },
  Promociones: { type: Boolean, require: true },
  Whatsapp: { type: Boolean, require: false },
});

module.exports = mongoose.model("medico", medico);
