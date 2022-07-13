module.exports = (sequelize, type) => {
  return sequelize.define('movie', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: type.STRING,
    yesr: type.INTEGER,
    rank: type.FLOAT,
  });
};
