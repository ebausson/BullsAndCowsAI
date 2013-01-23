#!/usr/bin/node

var AI = require('./index.js');
var gameEngine = require('./node_modules/bulls-and-cows/game.js');

var game = new gameEngine({
  mode   : 'digits',
  length : 4
});

game.verbose = true;

new AI().play(game);