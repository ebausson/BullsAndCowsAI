var digitsAI = function() {};

digitsAI.prototype.play = function (game) {
  this.reset(game);
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
    result.guess = guess;
    this.tries[this.tries.length] = result;
    
    this.verbose && console.log('result:' + JSON.stringify(result));
  }
}

digitsAI.prototype.generateGuess = function (game) {
  var guess = '';
  this.verbose && console.log();
  this.verbose && console.log();
  this.verbose && console.log(' * Round n° ' + (this.tries.length+1));
  
  if ( ! this.tries.length) {
    // first round
    for (var i=0; i<game.length && i<this.possibleValues.length; i++){
      guess += this.possibleValues[i];
    }
    return guess;
  } else {
    // other rounds
    this.calculatePostulates(game, this.tries[this.tries.length-1])
    
    do {
      guess = this.getRandomGuess(game.length);
    } while ( ! this.isValidGuess(guess));
  }
  return guess;
}

digitsAI.prototype.calculatePostulates = function(game, attempt){
  var totalFoundValue = attempt.good + attempt.bad;
  
  // case none 'in'
  if (totalFoundValue == 0){
    // remove searched values from possible values.
    var newPossibleValues = [];
    var j = 0;
    for (var i = 0; i < this.possibleValues.length; i++){
      if (attempt.guess.indexOf(this.possibleValues[i]) < 0){
        newPossibleValues[j] = this.possibleValues[i];
        j++;
      }
    }
    this.possibleValues = newPossibleValues;
  }
  
  // case all 'in'
  if (totalFoundValue == game.length){
    // set possible values as last attempt values
    var newPossibleValues = [];
    var j = 0;
    for (var i = 0; i < this.possibleValues.length; i++){
      if (attempt.guess.indexOf(this.possibleValues[i]) >= 0){
        newPossibleValues[j] = this.possibleValues[i];
        j++;
      }
    }
    this.possibleValues = newPossibleValues;
  }
  
  // TODO....
  
  
}

digitsAI.prototype.generateBasePostulates = function(game){
  
  
  // postulate 'only one value for a given colum'.
  for (var column=1;column<=game.length;column++){
    var postulateElems = [];
    for (var j=0; j<this.possibleValues.length; j++){
      postulateElems[j] = '(v' + column + '==\'' + this.possibleValues[j] + '\')';
    }
    var postulate = postulateElems.join('+');
    postulate = '(' + postulate + ' < 2)';
    this.postulates[this.postulates.length] = postulate;
  }
  
  
  //postulate 'one value only once'.
  for (var j=0; j<this.possibleValues.length; j++){
    var postulateElems = [];
    for (var column=1;column<=game.length;column++){
      postulateElems[column-1] = '(v' + column + '==\'' + this.possibleValues[j] + '\')';
    }
    var postulate = postulateElems.join('+');
    postulate = '(' + postulate + ' < 2)';
    this.postulates[this.postulates.length] = postulate;
  }
  
  
  //TODO : there may be rules I forgot to add here
  
  this.verbose && console.log('');
  this.verbose && console.log('Base postulates : ');
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
}

digitsAI.prototype.isValidGuess = function(guess) {
  
  //defining variables
  var code = '';
  for (var i = 0; i < guess.length; i++){
    code += 'var v' + (i+1) + '=\'' + guess[i] + '\'; ';
  }
  
  code += 'var result = ' + this.postulates.join(' && ');
  code += '; result;';
  var result = eval(code);
  return result;
}

digitsAI.prototype.reset = function(game) {
  this.tries = [];
  this.postulates = [];
  this.possibleValues = [];
  if (game && game.alphabet){
    for (var i = 0; i < game.alphabet.length; i++){
      this.possibleValues[i] = game.alphabet[i];
    }
  }
}

exports = module.exports = new digitsAI;
