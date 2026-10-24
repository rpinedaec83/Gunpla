const { verifySignUp, authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  // #swagger.tags = ['Users']
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
      authJwt.verifyEmpresa
    ],
    controller.signup
  );

  app.post("/api/auth/signin",[authJwt.verifyEmpresa], controller.signin);

  app.post("/api/auth/signout", controller.signout);
};