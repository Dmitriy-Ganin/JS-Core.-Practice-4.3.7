const parePageSize = 5;
const debounceMs = 400;

const containerForm = document.querySelector(".container__form");
const containerRepo = document.querySelector(".container__repo");
const form = document.querySelector(".form");
const input = document.querySelector(".search-field");
const message = document.querySelector(".hidden");
let autoComplete;
let repos;

containerForm.addEventListener("submit", validForm);
containerRepo.addEventListener("click", closeRepo);

//Валидация формы (проверка введенных данных)

function validForm(event) {
  event.preventDefault();
  cleanAutoComplete(autoComplete);
  cleanMessage();
  input.value = "";
}

//Удаление репозитория при нажатии на кнопку

function closeRepo(event) {
  if (event.target.tagName !== "BUTTON") return;
  toClearRepo(event.target.closest("div"));
}
//мой дебонс)
const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, debounceTime);
  };
};

const debounceFn = debounce(dataInput, debounceMs);
input.addEventListener("input", debounceFn);

//Получение данных с сервера

async function dataAcquisition() {
  let url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", input.value);
  // Нам нужно только 5 репозиториев
  url.searchParams.set("per_page", parePageSize);
  if (input.value.trim()) {
    // Проверяем успешность запроса или выкидываем ошибку
    try {
      let response = await fetch(url);
      let result = await response.json();
      return result.items;
    } catch (error) {
      throw new Error(
        `Ошибка при получении данных. Попробуйте перезагрузить страницу`
      );
    }
  }
}

//Изменения поля ввода

async function dataInput() {
  try {
    repos = await dataAcquisition();
    if (!repos.length) {
      throw new Error("Не найден репозиторий. Попробуте ввести другое название");
    }
    if (containerForm.contains(autoComplete)) {
      cleanAutoComplete(autoComplete);
      cleanMessage();
      autoComplete = createElements();
      containerForm.append(autoComplete);
    } else if (!containerForm.contains(autoComplete)) {
      cleanMessage();
      autoComplete = createElements();
      containerForm.append(autoComplete);
    }
  } catch (error) {
    cleanAutoComplete(autoComplete);
    createMessage(error.message);
  }
  if (!input.value.trim()) {
    cleanAutoComplete(autoComplete);
    cleanMessage();
  }
}

//Создание подсказки - автокомплита

function createElements() {
  let autoComplete = document.createElement("div");
  autoComplete.classList.add("autoComplete");
  repos.forEach((repo) => {
    const item = document.createElement("div");
    item.classList.add("autoComplete-item");
    item.textContent = repo.name;
    autoComplete.append(item);
    autoComplete.addEventListener("click", showRepositories);
  });
  return autoComplete;
}

//Вывод сообщения об ошибке

function createMessage(text) {
  message.classList.remove("hidden");
  message.classList.add("message");
  message.textContent = text;
}

//Удаление сообщения об ошибке

function cleanMessage() {
  message.classList.remove("message");
  message.classList.add("hidden");
  message.textContent = "";
}

//Очистка автокомплита

function cleanAutoComplete(item) {
  item.removeEventListener("click", showRepositories);
  item.remove();
}

// Добавляем репозиторий в избранное

function showRepositories(event) {
  let selectedRepo = document.createElement("div");
  let selectedRepoInfo = document.createElement("div");
  let selectedRepoButton = document.createElement("button");
  selectedRepo.classList.add("selectedRepo");
  selectedRepoInfo.classList.add("selectedRepo-info");
  selectedRepoButton.classList.add("selectedRepo-button");
  repos.forEach((repo) => {
    if (repo.name === event.target.textContent) {
      //выводим необходимые параметры
      selectedRepoInfo.innerHTML = `
          <div>name: ${repo.name}</div> 
          <div>owner: ${repo.owner.login}</div>
          <div>stars: ${repo.stargazers_count}</div>`;
    }
  });
  selectedRepo.append(selectedRepoInfo);
  selectedRepo.append(selectedRepoButton);
  containerRepo.append(selectedRepo);
  validForm(event);
}

//Удаление выбранного репозитория

function toClearRepo(item) {
  item.remove();
}
