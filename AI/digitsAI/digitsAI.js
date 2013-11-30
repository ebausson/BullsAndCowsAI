var digitsAI = function() {};

//TODO: Array of possible value for each position, updated when a value is ruled out.
//TODO: Update generateGuess method, from possible values (said value being maximum once in final result)
//TODO: Write commonPostulate method, using an array of possible values, removing those ruled out from said array.
//			for exemple : {'1':{'not':['v1', 'v2]''}, '3':{'in':'v2'}, '4':{}...}      <- '2' not present because ruled out.


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
  // postulates that will be shared during the two parts
  this.commonPostulates = [];

  //reset already tried guesses.
  this.secondPartFlag = false;
  this.invalidGuess = [];

  this.isValidFn = null;

  // generating base postulates from game config
  this.generateBasePostulates(game);
  
  while ( this.tries.length == 0 || ! this.tries[this.tries.length-1].won) {
    this.isValidFn = null;
    var guess = this.generateGuess(game);
    var result = game.guess(guess);
    result.guess = guess;
    this.tries[this.tries.length] = result;
    
    this.verbose && console.log('result:' + JSON.stringify(result));
  }
}

digitsAI.prototype.generateGuess = function (game, attempt) {

  var guess = '';
  this.verbose && console.log();
  this.verbose && console.log(' * Round n° ' + (this.tries.length+1));
  
  if (this.tries.length > 0) {
    this.calculatePostulates(game, this.tries[this.tries.length-1]);
  }

  var result = '';
  if ( ! this.tries.length) {
    // first round
    for (var i=0; i<game.length && i<this.possibleValues.length; i++){
      result += this.possibleValues[i];
    }
  } else {
    //digits specific.
    var testvalue = this.tries[this.tries.length-1].guess;
    var valid = false;
    this.isValidGuess(testvalue);
    //console.log(this.isValidFn.toString());
    do {
      var zeroFlag = (testvalue.indexOf('0') == 0);
      ++testvalue;
      testvalue = (zeroFlag ? '0' : '' ) + testvalue;
      if (this.isValidGuess(testvalue)) {
        valid = true;
        result = testvalue;
      }
    } while (!valid);
  }
  return result;
}

digitsAI.prototype.calculatePostulates = function(game, attempt){
  var totalFoundValue = attempt.good + attempt.bad;

  //console.log('game length: ' + game.length);
  //console.log(totalFoundValue);

  // building common postulates.
  digitsAI.prototype.calculateCommonPostualtes = function(game, attempt) {
  	//TODO
  }

  // building part-related postulates.
  if (game.length != this.possibleValues.length) {
    this.calculateFirstPostulates(game, attempt);
    this.postulates = [].concat(this.basePostulates, this.firstPostulates, this.commonPostulates);
  } else {
    this.calculateSecondPostulates(game, attempt);
    this.postulates = [].concat(this.basePostulates, this.secondPostulates, this.commonPostulates);
  }
}

digitsAI.prototype.calculateFirstPostulates = function(game, attempt) {
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
  else if (totalFoundValue == game.length){
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
  } else {
    var postulateElems = [];
    for (var i=0; i<game.length; i++) {
      var postulateElemParts = [];
      var value = attempt.guess.slice(i, i+1);
      for (var j=0; j<game.length;j++) {
        postulateElemParts[j] = '(v[' + j + ']==' + value + ')';
      }
      postulateElems[i] = '(' + postulateElemParts.join('||') + ')';
    }
    var postulate = ' ( ' + postulateElems.join(' + ') + ' == ' + totalFoundValue + ' ) ';
    this.firstPostulates[this.firstPostulates.length] = postulate;
  }
}

digitsAI.prototype.calculateSecondPostulates = function(game, attempt) {

  if (attempt.good == 0) {
    // every current value is not in his correct place.
    for (var i=0; i<game.length;i++){
      var value = attempt.guess.slice(i, i+1);
      var newPostulate = ('(v[' + i + ']!=' + value + ')');
      this.secondPostulates[this.secondPostulates.length] = newPostulate; // maybe test if altrady there.
    }
  } else {
    var postulateElems = [];
    for (var i=0; i<game.length; i++) {
      var value = attempt.guess.slice(i, i+1);
      postulateElems[i] = '(v[' + i + ']==' + value + ')';
    }
    var postulate = ' ( ' + postulateElems.join(' + ') + ' == ' + attempt.good + ' ) ';
    // console.log(postulate);
    this.firstPostulates[this.firstPostulates.length] = postulate;
  }
}

digitsAI.prototype.generateBasePostulates = function(game){
  
  // postulate 'only one value for a given colum'.
  for (var column=0;column<game.length;column++){
    var postulateElems = [];
    for (var j=0; j<this.possibleValues.length; j++){
      postulateElems[j] = '(v[' + column + ']==\'' + this.possibleValues[j] + '\')';
    }
    var postulate = postulateElems.join('+');
    postulate = '(' + postulate + ' < 2)';
    this.basePostulates[this.basePostulates.length] = postulate;
  }
  
  
  //postulate 'one value only once'.
  for (var j=0; j<this.possibleValues.length; j++){
    var postulateElems = [];
    for (var column=0;column<game.length;column++){
      postulateElems[column] = '(v[' + column + ']==\'' + this.possibleValues[j] + '\')';
    }
    var postulate = postulateElems.join('+');
    postulate = '(' + postulate + ' < 2)';
    this.basePostulates[this.basePostulates.length] = postulate;
  }

  this.postulates = this.postulates.concat(this.basePostulates);
}

digitsAI.prototype.isValidGuess = function(guess) {
  if (this.isValidFn == null) {
    //defining variables
    var code = 'return ' + this.postulates.join(' && ');

    this.isValidFn = eval('f = function(v){' + code + '} ; f;');
    // var result = eval(code);
  }
  return this.isValidFn(guess);
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