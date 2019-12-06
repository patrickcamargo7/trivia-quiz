"use strict";

const gameState = {
  categoryId: null,
  level: null,
  loadGame: true,
  amount: 10,
  questions: null,
  laterQuestions: [],
  currentQuestion: null,
  score: 0,
  levels: [
    {
      time: 45,
      assert: 5,
      error: 5,
      later: 3
    },
    {
      time: 30,
      assert: 8,
      error: 8,
      later: 6
    },
    {
      time: 15,
      assert: 10,
      error: 10,
      later: 8
    }
  ],
};

export function setState() {

}

const game = {

};

export function createGame() {


}


export default { gameState, game, setState };