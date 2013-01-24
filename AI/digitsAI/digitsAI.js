var digitsAI = function() {};

digitsAI.prototype.play = function (game) {
  this.reset();
  this.verbose = !!game.verbose;
  this.verbose && console.log();
  this.verbose && console.log('Game summary :');
  this.verbose && console.log(game);
  this.verbose && console.log();
  this.verbose && console.log();
  
  this.generateBasePostulates(game);
  
  while ( this.tries.length == 0 || ! this.tries[this.tries.length-1].won) {
    var guess = this.generateGuess(game);
    var result = game.guess(guess);
    this.verbose && console.log(result);
    this.tries[this.tries.length] = result;
  }
}

digitsAI.prototype.generateGuess = function (game) {
  var guess = '';
  this.verbose && console.log();
  this.verbose && console.log();
  this.verbose && console.log(' * Round n° ' + (this.tries.length+1));
  this.verbose && console.log(' * Tries until now:');
  this.verbose && console.log(this.tries);
  this.verbose && console.log
  
  if ( ! this.tries.length) {
    // first round
    for (var i=0; i<game.length && i<this.possibleValues.length; i++){
      guess += this.possibleValues[i];
    }
    return guess;
  } else {
    // other rounds
    this.calculatePostulates(this.tries[this.tries.length-1])
    
    do {
      guess = this.getRandomGuess(game.length);
    } while ( ! this.isValidGuess(guess));
    this.verbose && console.log('This round guess: ' + guess);
  }
  return guess;
}
digitsAI.prototype.calculatePostulates = function(attempt){
  
}

digitsAI.prototype.generateBasePostulates = function(game){
  // postulate 'only one value for a given colum'.
  for (var column=1;column<=game.length;column++){
    var postulateElems = [];
    for (var j=0; j<this.possibleValues.length; j++){
      postulateElems[j] = '(c' + column + '==' + this.possibleValues[j] + ')';
    }
    var postulate = postulateElems.join('^');
    postulate = '(' + postulate + ' < 2)';
    this.postulates[this.postulates.length] = postulate;
  }
  
  
  //postulate 'one value only once'.
  for (var j=0; j<this.possibleValues.length; j++){
    var postulateElems = [];
    for (var column=1;column<=game.length;column++){
      postulateElems[column-1] = '(c' + column + '==' + this.possibleValues[j] + ')';
    }
    var postulate = postulateElems.join('^');
    postulate = '(' + postulate + ' < 2)';
    this.postulates[this.postulates.length] = postulate;
  }
  
  
  
  
  
  //TODO
  //...
  
  
  this.verbose && console.log(this.postulates);
}


digitsAI.prototype.getRandomGuess = function(gameSize) {
  var result = '';
  for (var i=0; i<gameSize; i++) {
    var aValue = Math.floor(Math.random() * (this.possibleValues.length+1));
    if (aValue >= this.possibleValues.length) {
      aValue = this.possibleValues.length-1;
    }
    result += this.possibleValues[aValue];
  }
  return result;
  //TODO
}

digitsAI.prototype.isValidGuess = function(guess) {
  //TODO
  return true;
}

digitsAI.prototype.reset = function() {
  this.possibleValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  this.tries = [];
  this.postulates = [];
}

exports = module.exports = new digitsAI;
