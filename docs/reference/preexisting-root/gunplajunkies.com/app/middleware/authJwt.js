const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;
const Empresa = db.empresa;

verifyToken = (req, res, next) => {
  let token = req.session.token;

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token,
    process.env.jwtSecret,
    (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!",
        });
      }
      req.userId = decoded.id;
      next();
    });
};

isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        return next();
      }
    }

    return res.status(403).send({
      message: "Require Admin Role!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate User role!",
    });
  }
};

isModerator = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "moderator") {
        return next();
      }
    }

    return res.status(403).send({
      message: "Require Moderator Role!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate Moderator role!",
    });
  }
};

isModeratorOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "moderator") {
        return next();
      }

      if (roles[i].name === "admin") {
        return next();
      }
    }

    return res.status(403).send({
      message: "Require Moderator or Admin Role!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate Moderator or Admin role!",
    });
  }
};

verifyEmpresa = async (req, res, next) => {
  try {
    if (!req.session.empresa || !req.body.empresa) {
      req.session.empresa = process.env.EMPRESA;
    }
    else{
      req.session.empresa = req.body.empresa;
    }
    let empresa = await Empresa.findOne({
      where: {
        id: req.session.empresa
      }
    });

    if (!empresa) {
      return res.status(400).send({
        message: "No ha enviado una empresa valida"
      });
    }
    return next()
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
}


const authJwt = {
  verifyToken,
  verifyEmpresa,
  isAdmin,
  isModerator,
  isModeratorOrAdmin,
};
module.exports = authJwt;