const mongoose = require("mongoose");
const { Schema } = mongoose;

const subcategoria = new Schema({
    Categoria: { type: String, require: true },
    Subcategorias: [{type: String, require: true}]
});

module.exports = mongoose.model('subcategoria', subcategoria)