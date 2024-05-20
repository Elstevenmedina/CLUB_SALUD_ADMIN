const mongoose = require("mongoose");
const { Schema } = mongoose;
const calendario = new Schema({
    start: { type: String, require: true },
    color: { type: String, require: true },
    title: { type: String, require: true },
    _idUser: { type: String, require: true },
    id: { type: String, require: true },
    email: { type: String, require: true },
    Nombres: { type: String, require: true },
    Apellidos: { type: String, require: true },
});

module.exports = mongoose.model("calendario", calendario);