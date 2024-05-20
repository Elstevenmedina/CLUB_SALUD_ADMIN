const mongoose = require("mongoose");
const { Schema } = mongoose;

const categoria = new Schema({
    Categoria: { type: String, require: true },
});

module.exports = mongoose.model('categoria', categoria)