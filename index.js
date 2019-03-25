const GUI = require('./GUI')

module.exports = function createGUI(ctx) {
  return new GUI(ctx)
}
