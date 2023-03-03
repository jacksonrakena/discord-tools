const Eris = require("eris");
const config = require("./config.json");

module.exports = function init() {
  return {
    client: new Eris.Client(config.token, { restMode: true }),
  };
};
