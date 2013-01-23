var BullsAndCowsAI = function() {};
var digitsAI = require('./AI/digitsAI/digitsAI.js');

BullsAndCowsAI.prototype.play = function (game) {
  if (game.mode == 'digits') {
    digitsAI.play(game);
  }
}

BullsAndCowsAI.prototype.reset = function () {
  digitsAI.reset();
}

module.exports = exports = BullsAndCowsAI;
