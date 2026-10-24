module.exports = (sequelize, Sequelize) => {
    const Empresa = sequelize.define("empresas", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING
      }
    });
  
    return Empresa;
  };