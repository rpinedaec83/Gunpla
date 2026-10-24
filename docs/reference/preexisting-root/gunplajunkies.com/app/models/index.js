const Sequelize = require("sequelize");
console.log(process.env.MYSQLHOST)
const sequelize = new Sequelize(
  process.env.MYSQLDB,
  process.env.MYSQLUSER,
  process.env.MSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.empresa = require("../models/empresa.model.js")(sequelize, Sequelize);

db.empresa.hasMany(db.user, {foreignKey: 'empresaId'});
db.user.belongsTo(db.empresa, {foreignKey: 'empresaId'});

db.role.belongsToMany(db.user, {
  through: "user_roles"
});
db.user.belongsToMany(db.role, {
  through: "user_roles"
});

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;