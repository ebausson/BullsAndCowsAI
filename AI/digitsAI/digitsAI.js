var digitsAI = function() {};

digitsAI.prototype.play = function (game) {
  this.reset(game);
  this.verbose = !!game.verbose;
  this.verbose && console.log();
  this.verbose && console.log('Game summary :');
  this.verbose && console.log(game);
  this.verbose && console.log();
  this.verbose && console.log();
  

  // all currently used postulates.
  this.postulates = [];
  // postulates we have at the start of the game, the game 'rules'
  this.basePostulates = [];
  // postulates for the first part, when we try to determine which symbols are part of the solution.
  this.firstPostulates = [];
  // postulates for the second part, when we know the symbols and try to determine their order.
  this.secondPostulates = [];

  // generating base postulates from game config
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
    console.log(this.postulates);
    do {
      guess = this.getRandomGuess(game.length);
    } while ( ! this.isValidGuess(guess));
  }
  return guess;
}

digitsAI.prototype.calculatePostulates = function(game, attempt){
	var totalFoundValue = attempt.good + attempt.bad;

	// rafining possible values, (first part).
	if (game.length != this.possibleValues.length) {
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
	  } else
	  
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
	}



	// building second part postulates
	if (totalFoundValue == game.length) {
		if ( ! attempt.good) {
			// every current value is not in his correct place.
			for (var i=0; i<game.length;i++){
				var value = attempt.guess.slice(i, i+1);
				var newPostulate = ('(v' + i + '!=' + value + ')');
				this.secondPostulates[this.secondPostulates.length] = newPostulate; // maybe test if altrady there.
			}
		}
	} else if (totalFoundValue > 0) {

	} // else if totalfound==0, values are removed, so that's it.

  //case no 'bad'
  if ( attempt.good > 0 && attempt.bad == 0) {
    var permutations = this.permute(attempt.guess, attempt.length - attempt.good );
    var postulateElems = [];
    for (var i = 0; i < permutations.length; i++) {
      var postulateElemParts = [];
      for (var j = 0; j < attempt.guess.length; j++) {
        if (j < attempt.good) {
          postulateElemParts[j] = '(v' + (j+1) + '==\'' + permutations[i][j] + '\')';
        } else {
          postulateElemParts[j] = '(v' + (j+1) + '!=\'' + permutations[i][j] + '\')';
        }
      }
      postulateElems[i] = '(' + postulateElemParts.join('&&') + ')';
    }
    var postulate = ' ( ' + postulateElems.join(' || ') + ' ) ';
    this.postulates[this.postulates.length] = postulate;
    
    
    
  } else
  
  // case no 'good'
  if ( ! attempt.good) {
  }
  
  // all other case
  else {
  }
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
    this.basePostulates[this.basePostulates.length] = postulate;
  }
  
  
  //postulate 'one value only once'.
  for (var j=0; j<this.possibleValues.length; j++){
    var postulateElems = [];
    for (var column=1;column<=game.length;column++){
      postulateElems[column-1] = '(v' + column + '==\'' + this.possibleValues[j] + '\')';
    }
    var postulate = postulateElems.join('+');
    postulate = '(' + postulate + ' < 2)';
    this.basePostulates[this.basePostulates.length] = postulate;
  }
  
  
  //TODO : there may be rules I forgot to add here
  
  this.verbose && console.log('');
  this.verbose && console.log('Base postulates : ');
  this.verbose && console.log(this.basePostulates);

  this.postulates = this.basePostulates;
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

// Return every permutation of input stream.
digitsAI.prototype.permute = function(lastGuess, distance) {
    var permArr = [];
    var usedChars = [];
    var input = lastGuess.split('');
    function main(input){
        var i, ch;
        for (i = 0; i < input.length; i++) {
            ch = input.splice(i, 1)[0];
            usedChars.push(ch);
            if (input.length == 0) {
                permArr.push(usedChars.slice());
            }
            main(input);
            input.splice(i, 0, ch);
            usedChars.pop();
        }
        return permArr;
    };
    var result = main(input);
    if ((typeof distance == 'number') && (distance>0) && distance < lastGuess.length){

	    var distanceFn = function(guess1, guess2){
	    	if (guess1.length != guess2.length) {
	    		//shound't happen
	    		return -1;
	    	}
	    	var result=0;
	    	for (var i=0; i<guess1.length; i++){
	    		result += guess1[i] != guess2[i];
	    	}
	    	return result;
	    };

    	for (var i = result.length-1; i>=0; i--){
    		if (distanceFn(lastGuess, result[i]) > distance) {
    			result.pop(i);
    		}
    	}
    }
    return result;
}

digitsAI.prototype.basicSort = function(a, b){
  return a>b;
}

exports = module.exports = new digitsAI;