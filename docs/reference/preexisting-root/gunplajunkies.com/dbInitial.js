require("dotenv").config();
const db = require("./app/models");
const Role = db.role;
const Empresa = db.empresa;
db.sequelize.sync({ force: true }).then(() => {
    console.log('Drop and Resync Db');
    initial();
});
function initial() {
    Empresa.create({
        name: "x-codec"
    })

    Role.create({
        id: 1,
        name: "user"
    });

    Role.create({
        id: 2,
        name: "moderator"
    });

    Role.create({
        id: 3,
        name: "admin"
    });
}

