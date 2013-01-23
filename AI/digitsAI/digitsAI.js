var digitsAI = function() {};
var possibleValues;
var tries;
var postulates;


digitsAI.prototype.play = function (game) {
  this.reset();
  var verbose = !!game.verbose;
  verbose && console.log();
  verbose && console.log('Game summary :');
  verbose && console.log(game);
  verbose && console.log();
  verbose && console.log();
  
  this.generateBasePostulates();
  while ( tries.length == 0 || ! tries[tries.length-1].won) {
    var guess = this.generateGuess(game, verbose);
    var result = game.guess(guess);
    console.log(result);
    tries[tries.length] = result;
  }
}

digitsAI.prototype.generateGuess = function (game, verbose) {
  var guess = '';
  verbose && console.log();
  verbose && console.log();
  verbose && console.log(' * Round n° ' + (tries.length+1));
  verbose && console.log(' * Tries until now:');
  verbose && console.log(tries);
  verbose && console.log();
  console.log(game);
  
  if ( ! tries.length) {
    // first round
    for (var i=0; i<game.length && i<possibleValues.length; i++){
      guess += possibleValues[i];
    }
    return guess;
  } else {
    // other rounds
    this.calculatePostulates(tries[tries.length-1])
    
    
    
    guess = game.goal;
    verbose && console.log(guess);
  }
  return guess;
}
digitsAI.prototype.calculatePostulates = function(attempt){
  
}

digitsAI.prototype.reset = function() {
  var possibleValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  tries = [];
  postulates = [];
}

exports = module.exports = new digitsAI;
