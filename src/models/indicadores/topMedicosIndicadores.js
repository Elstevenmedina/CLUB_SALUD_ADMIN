const mongoose = require("mongoose");
const { Schema } = mongoose;

const topMedicosIndicadores = new Schema({
    Top:[{
        Nombre:{ type: String, require: true },
        PuntosComisiones:{ type: String, require: true },
        CantidadExamenes:{ type: String, require: true },
        PuntosGenerales:{ type: String, require: true },
       }]
});

module.exports = mongoose.model("topMedicosIndicadores", topMedicosIndicadores);