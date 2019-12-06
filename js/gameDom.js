'use strict';

import { shuffle } from './util.js';

const gameSelectors = {
  levelsContainer: document.querySelector('#gameLevel'),
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

function createListener() {
  return {
    state: {
      observers: []
    },
    subscribe: function(observerFunction) {
      this.state.observers.push(observerFunction);
    },
    notifyAll: function(command) {
      console.log(`Notifying ${this.state.observers.length} observers`);

      for (const observerFunction of this.state.observers) {
        observerFunction(command);
      }
    }
  };
}

const gameDom = {
  listeners: {
    categorySelect: createListener(),
    levelSelect: createListener(),
    gameStart: createListener(),
    nextLevel: createListener(),
    jumpQuestion: createListener(),
    answerSelect: createListener()
  },
  hideHomeScreen: function() {
    gameSelectors.gameHome.style.display = 'none';
    gameSelectors.gameContainer.style.display = 'block';
  },
  buildHomeScreen: function(levels, categories) {
    this.buildLevelsMenu(levels);
    this.buildCategoriesMenu(categories);
    this.buildButtonStartGame();
    this.buildLevelsButtons();
  },
  buildButtonStartGame: function() {
    gameSelectors.btnStart.addEventListener('click', () => {
      this.listeners.gameStart.notifyAll(true);
    });
  },
  buildLevelsButtons: function () {
    gameSelectors.btnNext.addEventListener('click', () => {
      this.listeners.nextLevel.notifyAll();
    });
    gameSelectors.btnSkip.addEventListener('click', () => {
      this.listeners.jumpQuestion.notifyAll();
    });
  },
  buildLevelsMenu: function(levels) {
    levels.map((lvl, index) => {
      let node = document.createElement('li');
      node.innerHTML = lvl.name;
      node.addEventListener('click', () => this.onClickSelectLevel(lvl), true);
      gameSelectors.levelsContainer.append(node);
    });
  },
  buildCategoriesMenu: function(categories) {
    categories.map((category, index) => {
      let node = document.createElement('li');
      node.innerHTML = category.name;
      node.addEventListener(
        'click',
        () => this.onClickSelectCategory(category),
        true
      );
      gameSelectors.menuCategories.append(node);
    });
  },
  onClickSelectCategory: function(category) {
    this.removeCurrentSelectedCategory.call(this).then(data => {
      this.listeners.categorySelect.notifyAll(category);
      event.target.innerHTML = `<b>${event.target.innerHTML}</b>`;
    });
  },
  onClickSelectLevel: function(level) {
    this.removeCurrentSelectedLevel.call(this).then(response => {
      this.listeners.levelSelect.notifyAll(level);
      event.target.innerHTML = `<b>${event.target.innerHTML}</b>`;
    });
  },
  removeCurrentSelectedCategory: function() {
    return new Promise((resolve, reject) => {
      var children = gameSelectors.menuCategories.childNodes;
      this.reformatChildrenNodes(children);

      resolve(true);
    });
  },
  removeCurrentSelectedLevel: function() {
    return new Promise((resolve, reject) => {
      var children = gameSelectors.levelsContainer.childNodes;
      this.reformatChildrenNodes(children);

      resolve(true);
    });
  },
  reformatChildrenNodes: function(children) {
    for (const child in children) {
      let c = children[child].innerHTML + '';

      if (children[child].innerHTML !== undefined) {
        children[child].innerHTML = c.toString().replace(/<\/?[^>]+(>|$)/g, '');
      }
    }
  },
  buildGameScreen: function(current, question) {
    this.hideHomeScreen();

    gameSelectors.question.innerHTML = (current + 1) + ') ' + question.question;
    gameSelectors.selectedCategory.innerHTML = question.category;
    gameSelectors.answersContainer.innerHTML = '';

    let optionChar = 65;

    /**
     * Refactor
     */
    let correctPosition = Math.floor(
      Math.random() * question.incorrect_answers.length
    );
    let shuffleAnswers = shuffle(question.incorrect_answers);

    let context = this;

    shuffleAnswers.map((answer, index) => {
      if (index == correctPosition) {
        context.appendQuestion(
          question.correct_answer,
          optionChar,
          true
        );
        optionChar++;
      }
      context.appendQuestion(answer, optionChar, false);
      optionChar++;
    });
  },
  appendQuestion: function(answer, optionChar, correct) {
    let child = document.createElement('div');
    child.classList.add('card');
    child.classList.add('answer');

    child.innerText = String.fromCharCode(optionChar) + ') ' + answer;

    if (correct) {
      child.dataset.correct = true;
    }

    child.addEventListener('click', () => this.onClickAnswer(answer));

    gameSelectors.answersContainer.append(child);
  },
  onClickAnswer: function(answer) {
    this.listeners.answerSelect.notifyAll(answer);
    this.clearAllStyleOfAnswer.call(this).then((response) => {
      event.target.classList.add('answer-selected');
      event.target.dataset.selected = true;
    });
  },
  clearAllStyleOfAnswer: function() {
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
  },
  writeScore: function(score) {
    gameSelectors.score.innerHTML = score;
  },
  showCorrect: function () {
    let answers = document.querySelectorAll('.answer');

    console.log("Exibindo correta...");

    answers.forEach((answer) => {
      answer.style.pointerEvents = 'none';

      if (answer.dataset.selected) {
        delete (answer.dataset.selected);
      }

      if (answer.dataset.correct) {
        answer.classList.add('answer-correct');
      } else {
        answer.classList.add('answer-erase');
      }
    });
  },
  writeTime: function(seconds) {
    gameSelectors.chronometer.innerText = seconds < 10 ? '0' + seconds : seconds;
    gameSelectors.chronometerContainer.style.display = 'flex';
    gameSelectors.chronometer.style.color = 'gray';
    gameSelectors.chronometer.style.fontWeight = '400';
    gameSelectors.seconds.style.color = 'gray';
    gameSelectors.seconds.style.fontWeight = '400';

    if (seconds <= 0) {
      gameSelectors.chronometerContainer.style.display = 'none';
    }
    else if (seconds < 10) {
      gameSelectors.chronometer.style.color = 'red';
      gameSelectors.chronometer.style.fontWeight = '600';
      gameSelectors.seconds.style.color = 'red';
      gameSelectors.seconds.style.fontWeight = '600';
    }
  }
};

export default gameDom;
