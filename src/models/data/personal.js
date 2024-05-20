const mongoose = require("mongoose");
const { Schema } = mongoose;
const personal = new Schema({
    Nombres: { type: String, require: true },
    Apellidos: { type: String, require: true },
    Cedula: { type: String, require: true },
    Direccion: { type: String, require: true },
    Email: { type: String, require: true },
    Role: [{ type: String, require: true }],
    FechaNacimiento: { type: String, require: true },
    Cargo: { type: String, require: true },
    RutaImage: { type: String, require: true },
    Visibilidad: { type: Boolean, require: true },
    Promociones: { type: Boolean, require: true },
    Estado: { type: String, require: true },
    Fecha_Registro: { type: String, require: true },
    Fecha_Modificacion: { type: String, require: true },
    Fecha_Eliminacion: { type: String, require: true },
    Usuario_Registro: { type: String, require: true },
    Sucursal: { type: String, require: true },
});

module.exports = mongoose.model("personal", personal);