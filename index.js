const GUI = require('./GUI')

module.exports = function createGUI(ctx, opts) {
  return new GUI(ctx, opts)
}
