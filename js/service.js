"use strict";

import { shuffle } from './util.js';

const routes = {
  categories: 'https://opentdb.com/api_category.php',
  questions: 'https://opentdb.com/api.php'
};

const storageKeys = {
  categories: '_categories',
  gameState: '_gamestate'
};

const service = {
  saveGameState: function(gameState) {
    gameState.loadedGame = true;
    localStorage.setItem(storageKeys.gameState, JSON.stringify(gameState));
  },
  fetchGameSavedState: function () {
    if (storageKeys.gameState in localStorage) {
      return JSON.parse(localStorage.getItem(storageKeys.gameState));
    }
    return false;
  },
  fetchCategories: function() {
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
  },
  fetchQuestions: function (amount, categoryId, state) {
    return new Promise((resolve, reject) => {
      if (!state.questions) {
        axios
          .get(
            routes.questions +
              `?amount=${amount}&category=${categoryId}`
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
};

export default service;
