const gameState = {
  selectedCategory: null,
  selectedLevel: null,
  questions: null,
  currentQuestion: null,
  selectedAnswer: null,
  currentTime: null,
  hits: 0,
  errors: 0,
  score: 0,
  loadedGame: false,
  levels: [
    {
      id: 1,
      name: 'Easy',
      time: 45,
      hit: 5,
      error: 5,
      later: 3
    },
    {
      id: 2,
      name: 'Medium',
      time: 30,
      hit: 8,
      error: 8,
      later: 6
    },
    {
      id: 3,
      name: 'Hard',
      time: 15,
      hit: 10,
      error: 10,
      later: 8
    }
  ]
};

export default gameState;