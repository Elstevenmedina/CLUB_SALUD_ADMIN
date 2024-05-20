const helpers = {};

//ingresa al inicio de facturacion
helpers.isAuthenticated = (req, res, next) => {

    if (req.isAuthenticated()) {
        let Master = req.user.Role.find((element) => element == "Master");
        let Medico = req.user.Role.find((element) => element == "Medico");
        let Paciente = req.user.Role.find((element) => element == "Paciente");
        let SubMaster = req.user.Role.find((element) => element == "Sub-master");
        let Soporte = req.user.Role.find((element) => element == "Soporte");
        let Servicios = req.user.Role.find((element) => element == "Servicios");
        let Data = req.user.Role.find((element) => element == "Data");
        let Red = req.user.Role.find((element) => element == "Red");
        let Herramientas = req.user.Role.find((element) => element == "Herramientas");
        let Afiliado = req.user.Role.find((element) => element == "Afiliado");

        if (req.isAuthenticated() && (
                Master ||
                Medico ||
                Paciente ||
                SubMaster ||
                Soporte ||
                Servicios ||
                Data ||
                Red ||
                Herramientas ||
                Afiliado
            )) {
            return next();
        }
    }
    req.flash("error", "Sesión finalizada");
    res.redirect("/");
};

//Ingreso a facturacion
helpers.isAuthenticatedMaster = (req, res, next) => {
    if (req.isAuthenticated()) {
        let autentificacion = req.user.Role.find((element) => element == "Master");

        if (req.isAuthenticated() && (autentificacion)) {
            return next();
        }
    }
    req.flash("error", "Usuario no autorizado");
    res.redirect("/inicio");
};

helpers.isAuthenticatedSubMaster = (req, res, next) => {
    if (req.isAuthenticated()) {
        let Autentificacion = req.user.Role.find((element) => element == "Master" || element == "Sub-master");
        if (req.isAuthenticated() && (Autentificacion)) {
            return next();
        }
    }
    req.flash("error", "Usuario no autorizado");
    res.redirect("/inicio");
};

helpers.isAuthenticatedSoporte = (req, res, next) => {
    if (req.isAuthenticated()) {
        let Autentificacion = req.user.Role.find((element) => element == "Master" || element == "Soporte" || element == "Sub-master");
        if (req.isAuthenticated() && (Autentificacion)) {
            return next();
        }
    }
    req.flash("error", "Usuario no autorizado");
    res.redirect("/inicio");
};

helpers.isAuthenticatedServicios = (req, res, next) => {
    if (req.isAuthenticated()) {
        let Autentificacion = req.user.Role.find((element) => element == "Master" || element == "Servicios" || element == "Sub-master");
        if (req.isAuthenticated() && (Autentificacion)) {
            return next();
        }
    }
    req.flash("error", "Usuario no autorizado");
    res.redirect("/inicio");
};

helpers.isAuthenticatedData = (req, res, next) => {
    if (req.isAuthenticated()) {
        let Autentificacion = req.user.Role.find((element) => element == "Master" || element == "Data" || element == "Sub-master");
        if (req.isAuthenticated() && (Autentificacion)) {
            return next();
        }
    }
    req.flash("error", "Usuario no autorizado");
    res.redirect("/inicio");
};


helpers.isAuthenticatedRed = (req, res, next) => {
    if (req.isAuthenticated()) {
        let Autentificacion = req.user.Role.find((element) => element == "Master" || element == "Red" || element == "Sub-master");
        if (req.isAuthenticated() && (Autentificacion)) {
            return next();
        }
    }
    req.flash("error", "Usuario no autorizado");
    res.redirect("/inicio");
};

helpers.isAuthenticatedHerramientas = (req, res, next) => {
    if (req.isAuthenticated()) {
        let Autentificacion = req.user.Role.find((element) => element == "Master" || element == "Herramientas" || element == "Sub-master");
        if (req.isAuthenticated() && (Autentificacion)) {
            return next();
        }
    }
    req.flash("error", "Usuario no autorizado");
    res.redirect("/inicio");
};


helpers.isAuthenticatedMedico = (req, res, next) => {
    if (req.isAuthenticated()) {
        let Autentificacion = req.user.Role.find((element) => element == "Medico");
        if (req.isAuthenticated() && (Autentificacion)) {
            return next();
        }
    }
    req.flash("error", "Sesión finalizada");
    res.redirect("/");
};


helpers.isAuthenticatedPaciente = (req, res, next) => {
    if (req.isAuthenticated()) {
        let Autentificacion = req.user.Role.find((element) => element == "Paciente");
        if (req.isAuthenticated() && (Autentificacion)) {
            return next();
        }
    }
    req.flash("error", "Sesión finalizada");
    res.redirect("/");
};



helpers.isAuthenticatedAfiliado = (req, res, next) => {
    if (req.isAuthenticated()) {
        let Autentificacion = req.user.Role.find((element) => element == "Afiliado");
        if (req.isAuthenticated() && (Autentificacion)) {
            return next();
        }
    }
    req.flash("error", "Sesión finalizada");
    res.redirect("/");
};



module.exports = helpers;