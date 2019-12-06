'use strict';

import gameDom from './gameDom.js';
import service from './service.js';

export function createGameDom() {
  return gameDom;
}

export function createGameService() {
  return service;
}

export default { createGameDom, createGameService };
