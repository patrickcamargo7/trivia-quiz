(function(){

  /**
   * https://opentdb.com/api_config.php
   * 
    Tabela de tempos por dificuldade
    Difícil: 15 segundos
    Médio: 30 segundos
    Fácil: 45 segundos


    Tabela de pontuações
    Difícil

    Acerto: 10 pontos.
    Erro: -10 pontos.
    Responder mais tarde (acerto): 8 pontos.
    Médio

    Acerto: 8 pontos.
    Erro: -8 pontos.
    Responder mais tarde (acerto): 6 pontos.
    Fácil

    Acerto: 5 pontos.
    Erro: -5 pontos.
    Responder mais tarde (acerto): 3 pontos.
   *
   */

  const routes = {
    categories: 'https://opentdb.com/api_category.php'
  };

  const storageKeys = {
    categories: '_categories'
  };

  const gameDOM = {
    menuCategories: document.querySelector('#gameCategories')
  };

  let game = {
    categoryId: null,
    level: null,
  };

  buildHomeScreen();


  function buildHomeScreen() {
    buildCategoriesMenu();
  }

  function onClickSelectCategory(event) {
    removeCurrentSelectedCategory().then((data) => {
      game.categoryId = event.target.dataset.id;
      event.target.innerHTML = `<b>${event.target.innerHTML}</b>`;
    });
  }

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

  function removeCurrentSelectedCategory() {
    return new Promise((resolve, reject) => {
      game.categoryId = null;

      var children = gameDOM.menuCategories.childNodes;
  
      for (child in children) {
        let c = children[child].innerHTML + "";
        children[child].innerHTML = c.toString().replace(/<\/?[^>]+(>|$)/g, "");
      }

      resolve(true);
    });
  }

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

  function fetchQuestions(categoryId) {

  }

})();