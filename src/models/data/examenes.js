const mongoose = require("mongoose");
const { Schema } = mongoose;

const examenes = new Schema({
    Nombre: { type: String, require: true },
    Tipo: { type: String, require: true },
    Puntos: { type: Number, require: true },
    SubTipo1: { type: String },
    SubTipo2: { type: String },
    SubTipo3: { type: String },
    CampoTexto: { type: Boolean, default: false },
    CantidadMaxima: { type: Number, default: 1 }, 
    AgregadoPosterior: { type: String },
    Estado: { type: String, require: true },
    Fecha_Registro: { type: String, require: true },
    Fecha_Modificacion: { type: String, require: true },
    Fecha_Eliminacion: { type: String, default: "-" },
    Usuario_Registro: { type: String, require: true },
    clase: {type: String, default: 'text-info'},
    Comisiones: {type: Boolean, require: true},
    OrdenPetitorio: { type: Number, require: true },
    Especialidad: [{ type: String, require: true }],
    Perfiles: [{ type: String, require: true }],
    OrdenPerfil: [{ 
        Perfil: { type: String, require: true },
        Orden: { type: Number, require: true },
    }],

});

module.exports = mongoose.model('examenes', examenes)