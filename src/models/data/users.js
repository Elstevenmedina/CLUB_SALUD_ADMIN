const mongoose = require("mongoose");

const { Schema } = mongoose;
const bcrypt = require('bcryptjs')

const usersCollection = new Schema({
    Nombres: { type: String, require: true },
    Apellidos: { type: String, require: true },
    Cedula: { type: String, require: true },
    Role: [{ type: String, require: true }],
    Contactos: [{ type: String, require: true }],
    email: { type: String, require: true },
    password: { type: String, require: true },
    Sucursal : { type: String},
    
    TipoUsuario: { type: String, require: true },
    status: { type: String, require: true },
    RutaImage: { type: String, default: '/assets/images/users/avatar-3.jpg' },
    Tema: { type: String, default: "light" },
    Visibilidad: { type: Boolean, default: true },
    Whatsapp: { type: Boolean, require: false },
    Promociones: { type: Boolean, default: true },
    Fecha_Registro: { type: String, require: true },
    Fecha_Ultimo_Acceso: { type: String, require: true },
    Fecha_Ultima_Modificacion: { type: String, require: true },
    Fecha_Ultimo_Cambio_Password: { type: String, require: true },
    Usuario_Registro: { type: String, require: true },
    Usuario_Ultimo_Cambio_Password: { type: String, require: true },
    Usuario_Ultima_Modificacion: { type: String, require: true },
    idSocket: { type: String, default: "" },
    Activo: { type: Boolean },
    token : { type: String, default: "" },
    
});

//encriptando contraseña
usersCollection.methods.encryptPassword = async(password) => {
    return bcrypt.hashSync(password, 10)
};
usersCollection.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}


module.exports = mongoose.model("usersCollection", usersCollection);