const mongoose = require("mongoose");
const { Schema } = mongoose;

const examenesSerivicio = new Schema({
    Fecha: { type: String, require: true },
    FechaAtencion: { type: String },
    FechaRechazo: { type: String },
    ObservacionRechazo: { type: String },
    Timestamp: { type: Number, require: true },
    Tipo: { type: String, default: 'Nuevo' },
    Resolicitado: { type: Boolean, default: false },
    Numero: { type: String, require: true },
    ExamenesTotales: { type: String, require: true },
    Comision: { type: String, require: true },
    PuntosTotales: { type: String, require: true },
    PuntosMedico: { type: String, require: true },
    PuntosDescuento: { type: Number },
    PuntosNetos: { type: Number, require: true },
    Medico: { type: String, require: true },
    Editado: { type: Boolean, default: false },
    UsuarioEdicion :{ type: String},
    FechaEdicion :{ type: String},
    CedulaMedico: { type: String, require: true },
    FormaPagoMedico: { type: String, require: true },
    _idMedico: { type: String, require: true },
    Paciente: { type: String, require: true },
    DocumentoPaciente: { type: String, default:"" },
    DireccionPaciente: { type: String, default:"" },
    FechaNacimientoPaciente: { type: String, default:"" },
    TelefonoPaciente: { type: String, default:"" },
    _idPaciente: { type: String, default:"" },
    Observacion: { type: String, require: true },
    AplicarDescuento: { type: Boolean, require: true },
    noGeneraComision: { type: Boolean, require: true },
    noGenerarPuntos: { type: Boolean, require: true },
    Sucursal : { type: String},
    Estado: { type: String, default: 'Pendiente' },
    ComisionCancelada: { type: Boolean, default: false },
    Resultado: [{ 
        Ruta: { type: String, require: true },
        Enviado: { type: Boolean, default: false },
    }],
    Resultados:{ type: String, default: 'false' },
    ListaExamenes: [{
        id: { type: String, require: true },
        nombre: { type: String, require: true },
        puntos: { type: Number, require: true },
        cantidad: { type: Number, require: true },
        subtipo: { type: String },
        tipo: { type: String, require: true },
        agregadoPosterior: { type: String }
    }]
});





module.exports = mongoose.model("examenesSerivicio", examenesSerivicio);