(function(){
  const routes = {
    categories: 'https://opentdb.com/api_category.php',
    questions: 'https://opentdb.com/api.php'
  };

  const storageKeys = {
    categories: '_categories',
    game: '_game',
  };

  const gameDOM = {
    levelItem: document.querySelectorAll('.levelItem'),
    menuCategories: document.querySelector('#gameCategories'),
    gameHome: document.querySelector("#home"),
    gameContainer: document.querySelector("#game"),
    btnStart: document.querySelector('#btnGameStart'),
    question: document.querySelector('#question'),
    selectedCategory: document.querySelector('#selectedCategory'),
    answersContainer: document.querySelector("#answersContainer"),
    btnNext: document.querySelector("#btnNext"),
    btnSkip: document.querySelector("#btnSkip"),
    chronometer: document.querySelector("#chronometer")
  };

  let game = {
    categoryId: null,
    level: null,
    loadGame: true,
    amount: 10,
    currentLevel: null,
    questions: null,
    levels: [
      {
        time: 45,
        assert: 5,
        error: -5,
        later: 3
      },
      {
        time: 30,
        assert: 8,
        error: -8,
        later: 6
      },
      {
        time: 15,
        assert: 10,
        error: -10,
        later: 8
      }
    ]
  };

  let chronometerInterval = null;

  gameDOM.btnStart.addEventListener('click', onClickGameStart);
  gameDOM.btnNext.addEventListener('click', nextLevel);
  gameDOM.levelItem.forEach((lvl) => {
    lvl.addEventListener('click', onClickSelectLevel);
  })

  initialize();

  /**
   * Initialize Game
   */
  function initialize() {

    checkForSavedGame().then((saved) => {
      game = saved;      
      loadGame();

    }).catch((error) => {
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
    console.log("game questions", game.questions);
    console.log("level ", game.currentLevel)

    if (chronometerInterval !== null) {
      clearInterval(chronometerInterval);
    }
    initChronometer(); 
    
    gameDOM.question.innerHTML = game.currentLevel + ") " + game.questions[game.currentLevel - 1].question;
    gameDOM.selectedCategory.innerHTML = game.questions[game.currentLevel - 1].category;

    gameDOM.answersContainer.innerHTML = "";

    let optionChar = 65;

    let correctPosition = Math.floor((Math.random() * (game.questions[game.currentLevel - 1].incorrect_answers.length)));

    game.questions[game.currentLevel - 1].incorrect_answers.map((answer, index) => {
      if (index == correctPosition) {
        appendQuestion(game.questions[game.currentLevel - 1].correct_answer, optionChar, true);
        optionChar++;      
      }
      appendQuestion(answer, optionChar, false);
      optionChar++;
    });
  }

  function initChronometer() {
    let seconds = game.levels[game.level - 1].time;
    gameDOM.chronometer.innerText = seconds + ' seg restantes';      

    chronometerInterval = setInterval(() => {
      seconds--;
      gameDOM.chronometer.innerText = seconds < 10 ? '0' + seconds  + ' seg restantes' : seconds + ' seg restantes';    

      if (seconds == 0) {
        clearInterval(chronometerInterval);
      }
    }, 1000);
  }

  /**
   * Append answer in Answers Container
   * @param {String} answer 
   * @param {String} optionChar 
   * @param {Bool} correct 
   */
  function appendQuestion(answer, optionChar, correct) {
    let child = document.createElement('div');
    child.classList.add("card");
    child.classList.add("answer");

    child.innerText = String.fromCharCode(optionChar) + ") " + answer;

    if (correct) {
      child.dataset.correct = true;
    }

    gameDOM.answersContainer.append(child);
  }

  /**
   * Start game
   */
  function gameStart() {
    fetchQuestions().then((response) => {
      gameDOM.gameHome.style.display = 'none';
      gameDOM.gameContainer.style.display = 'block';

      game.currentLevel = 1;

      storeGameState();
      buildGameScreen();

    }).catch((error) => {
      console.log("Error em busca questões", error);
    });
  }

  /**
   * LoadGame
   */
  function loadGame() {
    fetchQuestions().then((response) => {
      gameDOM.gameHome.style.display = 'none';
      gameDOM.gameContainer.style.display = 'block';

      storeGameState();
      buildGameScreen();

    }).catch((error) => {
      console.log("Error ao carregar jogo", error);
    });
  }

  function nextLevel(event) {

    calculateQuestionScore();

    game.currentLevel = game.currentLevel + 1;

    buildGameScreen();

    storeGameState();
  }

  /**
   * Calculate score 
   */
  function calculateQuestionScore() {

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
        .then((categories) => {
          categories.map((category, index) => {
            let node = document.createElement('li');
            node.innerHTML  = category.name;
            node.dataset.id = category.id;
            node.addEventListener('click', onClickSelectCategory, true);
  
            gameDOM.menuCategories.append(node);
          });

          resolve(true);
        })
        .catch((error) => reject(error));
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
    removeCurrentSelectedLevel().then((response) => {
      game.level = event.target.dataset.id;
      event.target.innerHTML = `<b>${event.target.innerHTML}</b>`;
    });
  } 

  /**
   * Handles Category click Event
   * @param {*} event 
   */
  function onClickSelectCategory(event) {
    removeCurrentSelectedCategory().then((data) => {
      game.categoryId = event.target.dataset.id;
      event.target.innerHTML = `<b>${event.target.innerHTML}</b>`;
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
      let c = children[child].innerHTML + "";
      children[child].innerHTML = c.toString().replace(/<\/?[^>]+(>|$)/g, "");
    }
  }

  /**
   * Fetch Categories from Api
   */
  function fetchCategories() {
    return new Promise((resolve, reject) => {
      let categories = localStorage.getItem(storageKeys.categories);

      if (categories == null) {
        axios.get(routes.categories)
          .then((response) => {
            categories = response.data.trivia_categories;
            localStorage.setItem(storageKeys.categories, JSON.stringify(categories));    

            resolve(response.data.trivia_categories);
          })
          .catch((error) => {
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
        axios.get(routes.questions + `?amount=${game.amount}&category=${game.categoryId}`)
          .then((response) => {
            game.questions = response.data.results;
            resolve(response.data.results);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(game.questions);
      }
    });
  }

})();