const mongoose = require("mongoose");
const { Schema } = mongoose;

const ticket = new Schema({
    FechaCompleta: { type: String, require: true },
    FechaCorta:{type: String, require: true},
    Timestamp:{type: Number, require: true},
    Usuario: {type: String, require: true},
    EmailUsuario: {type: String, require: true},
    _idUsuario: {type: String, require: true},
    Numero: {type: Number, require: true},
    Estado: {type: String, defualt:'Pendiente'},
    Categoria: {type: String, require: true},
    Subcategoria: {type: String, require: true},
    Titulo: {type: String, require: true},
    TipoUsuario: {type: String, require: true},
    Descripcion: {type: String, require: true},
    Respuestas: [{
        Timestamp: {type: Number, require: true},
        FechaCompleta: {type: String, require: true},
        FechaCorta: {type: String, require: true},
        TipoUsuario: {type: String, require: true},
        Usuario: {type: String, require: true},
        Respuesta: {type: String, require: true},
    }],
});

module.exports = mongoose.model('ticket', ticket)