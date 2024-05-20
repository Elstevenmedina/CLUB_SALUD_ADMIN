const jwt = require('jsonwebtoken');
const secret = 'mi_secreto_super_secreto';

let tokenJSON = {}

// Generar un token JWT para el usuario

tokenJSON.generateToken = (userId) => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // El token expirará en 1 hora
  };
  return jwt.sign(payload, secret);
};

// Verificar si el token JWT es válido
tokenJSON.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (err) {
    return null;
  }
};



module.exports = tokenJSON;