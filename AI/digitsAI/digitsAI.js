var digitsAI = function() {
  this.possibleValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  
};

digitsAI.prototype.play = function (game) {
	console.log(game);
	console.log(game.guess(game.goal));
	console.log(game);
	console.log();
}

exports = module.exports = new digitsAI;





