const mongoose = require("mongoose");
const { Schema } = mongoose;

const paciente = new Schema({
    Nombres: { type: String, require: true },
    Telefono: { type: String, require: true },
    Direccion: { type: String, require: true },
    Email: { type: String, require: true },
    FechaNacimiento: { type: String, require: true },
    TipoFactura: { type: String, require: true },
    TipoDocumento: { type: String, require: true },
    Documento: { type: String, require: true },
    Nota: { type: String, default: "" },
    Role: { type: String, require: true },
    Estado: { type: String, require: true },
    Clave: { type: String, require: true },
    Fecha_Registro: { type: String, require: true },
    Fecha_Modificacion: { type: String, require: true },
    Fecha_Eliminacion: { type: String, require: true },
    Usuario_Registro: { type: String, require: true },
    Medicos : [{
        _idMedico: { type: String, require: true },
        Medico: { type: String, require: true },
    }]
});

module.exports = mongoose.model("paciente", paciente);