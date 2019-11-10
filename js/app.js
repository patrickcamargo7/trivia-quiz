(function () {
  const routes = {
    categories: 'https://opentdb.com/api_category.php',
    questions: 'https://opentdb.com/api.php'
  };

  const storageKeys = {
    categories: '_categories',
    game: '_game'
  };

  const gameDOM = {
    levelItem: document.querySelectorAll('.levelItem'),
    menuCategories: document.querySelector('#gameCategories'),
    gameHome: document.querySelector('#home'),
    gameContainer: document.querySelector('#game'),
    btnStart: document.querySelector('#btnGameStart'),
    question: document.querySelector('#question'),
    selectedCategory: document.querySelector('#selectedCategory'),
    answersContainer: document.querySelector('#answersContainer'),
    btnNext: document.querySelector('#btnNext'),
    btnSkip: document.querySelector('#btnSkip'),
    chronometer: document.querySelector('#chronometer'),
    chronometerContainer: document.querySelector('#chronometerContainer'),
    seconds: document.querySelector('#seconds'),
    score: document.querySelector('#points')
  };

  let game = {
    categoryId: null,
    level: null,
    loadGame: true,
    amount: 10,
    questions: null,
    laterQuestion: null,
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

  let chronometerInterval = null;

  gameDOM.btnStart.addEventListener('click', onClickGameStart);
  gameDOM.btnNext.addEventListener('click', nextLevel);
  gameDOM.levelItem.forEach(lvl => {
    lvl.addEventListener('click', onClickSelectLevel);
  });

  initialize();

  /**
   * Initialize Game
   */
  function initialize() {
    checkForSavedGame()
      .then(saved => {
        game = saved;
        loadGame();
      })
      .catch(error => {
        buildHomeScreen();
      });
  }

  /**
   * Check if exists saved game
   */
  function checkForSavedGame() {
    return new Promise((resolve, reject) => {
      if (storageKeys.game in localStorage && game.loadGame) {
        resolve(JSON.parse(localStorage.getItem(storageKeys.game)));
      }
      reject(false);
    });
  }

  /**
   * Build home Screen
   */
  function buildHomeScreen() {
    gameDOM.gameHome.style.display = 'block';
    gameDOM.gameContainer.style.display = 'none';

    buildCategoriesMenu();
  }

  /**
   * Build game Screen
   */
  function buildGameScreen() {
    console.log('game questions', game.questions);
    console.log('level ', game.level);

    if (chronometerInterval !== null) {
      clearInterval(chronometerInterval);
    }
    initChronometer();

    let currentLevel = getCurrentLevel();
    let currentQuestion = getCurrentQuestion();

    gameDOM.question.innerHTML = game.currentQuestion + ') ' + game.questions[currentQuestion].question;
    gameDOM.selectedCategory.innerHTML = game.questions[currentQuestion].category;

    gameDOM.answersContainer.innerHTML = '';

    let optionChar = 65;

    let correctPosition = Math.floor(Math.random() * game.questions[currentQuestion].incorrect_answers.length);
    let shuffleAnswers = shuffle(game.questions[currentQuestion].incorrect_answers);

    shuffleAnswers.map(
      (answer, index) => {
        if (index == correctPosition) {
          appendQuestion(
            game.questions[currentQuestion].correct_answer,
            optionChar,
            true
          );
          optionChar++;
        }
        appendQuestion(answer, optionChar, false);
        optionChar++;
      }
    );
  }

  /**
   * Chronometer
   */
  function initChronometer() {
    let seconds = game.levels[getCurrentLevel()].time;
    gameDOM.chronometer.innerText = seconds;
    gameDOM.chronometerContainer.style.display = 'flex';
    gameDOM.chronometer.style.color = 'gray';
    gameDOM.chronometer.style.fontWeight = '400';
    gameDOM.seconds.style.color = 'gray';
    gameDOM.seconds.style.fontWeight = '400';

    chronometerInterval = setInterval(() => {
      seconds--;
      gameDOM.chronometer.innerText = seconds < 10 ? '0' + seconds : seconds;

      if (seconds < 10) {
        gameDOM.chronometer.style.color = 'red';
        gameDOM.chronometer.style.fontWeight = '600';
        gameDOM.seconds.style.color = 'red';
        gameDOM.seconds.style.fontWeight = '600';
      }

      if (seconds == 0) {
        gameDOM.chronometerContainer.setAttribute('style', 'display: none !important');
        clearInterval(chronometerInterval);

        timeOut();
      }
    }, 1000);
  }

  /**
   * Question timeout
   */
  function timeOut() {
    let answers = document.querySelectorAll('.answer');

    let correct = false;

    answers.forEach((answer) => {
      answer.style.pointerEvents = 'none';

      if (answer.dataset.selected) {
        if (answer.dataset.correct !== undefined) {
          correct = true;
        }
        delete (answer.dataset.selected);
      }

      if (answer.dataset.correct) {
        answer.classList.add('answer-correct');
      } else {
        answer.classList.add('answer-erase');
      }
    });

    if (correct) {
      addCounterHit();
    } else {
      addCounterError();
    }
    gameDOM.score.innerText = game.score;
  }

  /**
   * Append answer in Answers Container
   * @param {String} answer
   * @param {String} optionChar
   * @param {Bool} correct
   */
  function appendQuestion(answer, optionChar, correct) {
    let child = document.createElement('div');
    child.classList.add('card');
    child.classList.add('answer');

    child.innerText = String.fromCharCode(optionChar) + ') ' + answer;

    if (correct) {
      child.dataset.correct = true;
    }

    child.addEventListener('click', onClickAnswer);

    gameDOM.answersContainer.append(child);
  }

  /**
   * Start game
   */
  function gameStart() {
    fetchQuestions()
      .then(response => {
        game.score = 0;

        gameDOM.gameHome.style.display = 'none';
        gameDOM.gameContainer.style.display = 'block';

        game.currentQuestion = 1;


        storeGameState();
        buildGameScreen();
      })
      .catch(error => {
        console.log('Error em busca questões', error);
      });
  }

  /**
   * LoadGame
   */
  function loadGame() {
    fetchQuestions()
      .then(response => {
        gameDOM.gameHome.style.display = 'none';
        gameDOM.gameContainer.style.display = 'block';

        gameDOM.score.innerText = game.score;

        storeGameState();
        buildGameScreen();
      })
      .catch(error => {
        console.log('Error ao carregar jogo', error);
      });
  }

  function nextLevel(event) {
    game.currentQuestion = game.currentQuestion + 1;

    buildGameScreen();

    storeGameState();
  }
     
  /**
   * Store Game State
   */
  function storeGameState() {
    localStorage.setItem(storageKeys.game, JSON.stringify(game));
  }

  /**
   * Build Categories menu
   */
  function buildCategoriesMenu() {
    return new Promise((resolve, reject) => {
      fetchCategories()
        .then(categories => {
          categories.map((category, index) => {
            let node = document.createElement('li');
            node.innerHTML = category.name;
            node.dataset.id = category.id;
            node.addEventListener('click', onClickSelectCategory, true);

            gameDOM.menuCategories.append(node);
          });

          resolve(true);
        })
        .catch(error => reject(error));
    });
  }

  /**
   * Handle start game button click
   * @param {*} event
   */
  function onClickGameStart(event) {
    if (game.level !== null && game.categoryId !== null) {
      gameStart();
    }
  }

  /**
   * Handles Level click Event
   * @param {*} event
   */
  function onClickSelectLevel(event) {
    removeCurrentSelectedLevel().then(response => {
      game.level = event.target.dataset.id;
      event.target.innerHTML = `<b>${event.target.innerHTML}</b>`;
    });
  }

  /**
   * Handles Category click Event
   * @param {*} event
   */
  function onClickSelectCategory(event) {
    removeCurrentSelectedCategory().then(data => {
      game.categoryId = event.target.dataset.id;
      event.target.innerHTML = `<b>${event.target.innerHTML}</b>`;
    });
  }

  function onClickAnswer(event) {
    clearAllStyleOfAnswer().then((response) => {
      event.target.classList.add('answer-selected');
      event.target.dataset.selected = true;
    });
  }

  /**
   * 
   */
  function clearAllStyleOfAnswer() {
    return new Promise((resolve, reject) => {
      let answers = document.querySelectorAll('.answer');

      answers.forEach((answer) => {
        if (answer.classList.contains('answer-selected')) {
          answer.classList.remove('answer-selected');
        }
        if (answer.dataset.selected) {
          delete (answer.dataset.selected);
        }
      });

      resolve(true);
    });
  }

  /**
   * Remove current Selection from Level
   */
  function removeCurrentSelectedLevel() {
    return new Promise((resolve, reject) => {
      game.level = null;

      var children = gameDOM.levelItem;
      reformatChildrenNodes(children);

      resolve(true);
    });
  }

  /**
   * Remove current Selection from Category
   */
  function removeCurrentSelectedCategory() {
    return new Promise((resolve, reject) => {
      game.categoryId = null;

      var children = gameDOM.menuCategories.childNodes;
      reformatChildrenNodes(children);

      resolve(true);
    });
  }

  /**
   * Remove Bold from Element Childrens
   * @param {*} children
   */
  function reformatChildrenNodes(children) {
    for (const child in children) {
      let c = children[child].innerHTML + '';
      children[child].innerHTML = c.toString().replace(/<\/?[^>]+(>|$)/g, '');
    }
  }

  /**
   * Fetch Categories from Api
   */
  function fetchCategories() {
    return new Promise((resolve, reject) => {
      let categories = localStorage.getItem(storageKeys.categories);

      if (categories == null) {
        axios
          .get(routes.categories)
          .then(response => {
            categories = response.data.trivia_categories;
            localStorage.setItem(
              storageKeys.categories,
              JSON.stringify(categories)
            );

            resolve(response.data.trivia_categories);
          })
          .catch(error => {
            reject(error);
          });
      } else {
        resolve(JSON.parse(categories));
      }
    });
  }

  /**
   * Fetch Questions from Api
   */
  function fetchQuestions() {
    return new Promise((resolve, reject) => {
      if (!game.questions) {
        axios
          .get(
            routes.questions +
            `?amount=${game.amount}&category=${game.categoryId}`
          )
          .then(response => {
            game.questions = shuffle(response.data.results);
            resolve(game.questions);
          })
          .catch(error => {
            reject(error);
          });
      } else {
        resolve(game.questions);
      }
    });
  }

  /**
   * Util Functions
   */

  function getCurrentLevel() {
    return game.level !== null ? game.level - 1 : null;
  }

  function getCurrentQuestion() {
    return game.currentQuestion !== null ? game.currentQuestion - 1 : null;
  }

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  function addCounterHit() {
    game.score = game.score + game.levels[game.level - 1].assert;
  }

  function addCounterError() {
    game.score = game.score - game.levels[game.level - 1].error;
  }

})();
