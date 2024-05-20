const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserSchema = require("../models/data/users");
const historialIngresoDB = require("../models/servicios/historialIngresos");



passport.use(
    'local',
    new LocalStrategy({
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true,
        },
        async(req, email, password, done) => {
            email = email.toLowerCase();
            const user = await UserSchema.findOne({ email: email });
            if (!user) {
                return done(null, false, { message: "Correo electronico no registrado" });
            }
            if (!user.comparePassword(password)) {
                return done(null, false, { message: "Contraseña incorrecta" });
            }
            if(user.status != "Activo" && user.status != "activo"){
                return done(null, false, { message: "Usuario inactivo" });
            }
            let time = new Date();
            time = time.toString()
            time = time.split(' ');
            time = time[4];
            time = time.split(':');
            time = time[0] + ':' + time[1];
            let Fecha = new Date();
            let dia;
            let mes;
            let año = Fecha.getFullYear();
            if (Fecha.getDate() < 10) {
                dia = `0${Fecha.getDate()}`;
            } else {
                dia = Fecha.getDate();
            }
            if (Fecha.getMonth() + 1 < 10) {
                mes = `0${Fecha.getMonth() + 1}`;
            } else {
                mes = Fecha.getMonth() + 1;
            }
            Fecha = `${dia}/${mes}/${año} ${time}`;
            let validacionHistorial = await historialIngresoDB.findOne({ _idUsuario: user._id });
            if (validacionHistorial) {
                let dataHistorial = {
                    Fecha: Fecha
                }
                await historialIngresoDB.findByIdAndUpdate(validacionHistorial._id, {
                    $push: { Historial: dataHistorial }
                });
            } else {
                let dataHistorial = {
                    Fecha: Fecha
                }
                let nuevoHistorial = new historialIngresoDB({
                    _idUsuario: user._id,
                    Historial: [dataHistorial]
                })
                await nuevoHistorial.save()
            }
            return done(null, user);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    UserSchema.findById(id, (err, user) => {
        done(err, user);
    });
});