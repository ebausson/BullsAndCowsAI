var BullsAndCowsAI = function() {};

BullsAndCowsAI.prototype.play = function (game) {
  
  var digitsAI = require('./AI/digitsAI/digitsAI.js');
  digitsAI.play(game);
  
  /*
  if (game & game.options & game.options.mode) {
    if (game.options.mode == 'numbers') {
      var digitsAI = require('AI/digitsAI/digitsAI.js');
      digitsAI.play(game);
    } else {
      console.log('Unknown game mode.');
    return;
    }
  } else {
    console.log('Game mode not defined.');
    return;
  }
  */
}

module.exports = exports = BullsAndCowsAI;
