"use strict";
//=====================
//GLOBAL VARIABLES + TYPES
//=====================
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
// storage variable
let sessionUrlList;
//shorturlAPI
const apiUrl = "https://cleanuri.com/api/v1/shorten";
//Global variables containing ref to various dom elements
let form;
let input;
let submitBtn;
let urlListDiv;
//=====================
//LOCAL STORAGE : GET SET
//=====================
function getLocalStorageUrlList() {
  const urlList = localStorage.getItem("urlList");
  if (urlList !== null) {
    try {
      return JSON.parse(urlList);
    } catch (error) {
      console.error("Error parsing URL list from localStorage:", error);
      return [];
    }
  }
  return [];
}
function setLocalStorageUrlList(newValue) {
  localStorage.setItem("urlList", JSON.stringify(newValue));
}
//=====================
//SESSION STORAGE: LOAD ADD REMOVE ISIN
//=====================
function loadFromBrowser() {
  sessionUrlList = getLocalStorageUrlList();
  refresh();
}
function addToUrlList(urlPair) {
  sessionUrlList.push(urlPair);
  setLocalStorageUrlList(sessionUrlList);
  refresh();
}
function removeFromUrlList(urlPair) {
  sessionUrlList = sessionUrlList.filter((curr) => curr.id !== urlPair.id);
  setLocalStorageUrlList(sessionUrlList);
  refresh();
}
function isInUrlList(baseUrl) {
  return sessionUrlList.some((urlPair) => urlPair.base === baseUrl);
}
//=====================
//    DOM CREATION
//=====================
//Utility
function createElement(
  tag,
  className,
  textContent = undefined // default value is undefined
) {
  const element = document.createElement(tag);
  element.classList.add(className);
  if (textContent !== undefined) {
    element.textContent = textContent;
  }
  return element;
}
// URL LINE CREATION
/* Return something like :

<div class="url-pair">
  <p class="url-pair__base">https://www.frontendmentor.io</p>
  <a class="url-pair__short" href="https://tinyurl.com/2s3tdar2">
  https://tinyurl.com/2s3tdar2
  </a>
  <div class="url-pair__controls">
    <button class="url-pair__copy-link url-pair__copy-link--copied">
       Copied !
    </button>
    <button class="url-pair_delete">Delete</button>
  </div>
</div>

*/
//Delete Button
/*function createDeleteButton(): HTMLElement{


}*/
function createURLPairElement(urlPair) {
  const container = createElement("div", "url-pair");
  const base = createElement("p", "url-pair__base", urlPair.base);
  const short = createElement("a", "url-pair__short", urlPair.short);
  short.setAttribute("href", urlPair.short);
  const controls = createElement("div", "url-pair__controls");
  const copyBtn = createElement("button", "url-pair__copy-link", "Copy");
  const deleteBtn = createElement("button", "url-pair__copy-link", "Delete");
  deleteBtn.addEventListener("click", () => {
    removeFromUrlList(urlPair);
  });
  controls.append(copyBtn, deleteBtn);
  container.append(base, short, controls);
  return container;
}
//=====================
//DISPLAY refresh
//=====================
function clearChilds(element) {
  while (element.firstChild) {
    element.firstChild.remove();
  }
}
function refresh() {
  clearChilds(urlListDiv);
  sessionUrlList.forEach((urlPair) =>
    urlListDiv === null || urlListDiv === void 0
      ? void 0
      : urlListDiv.append(createURLPairElement(urlPair))
  );
}
//=====================
//API CALL : Create urlPair
//=====================
// curl -XPOST -d 'url=https%3A%2F%2Fgoogle.com%2F' 'https://cleanuri.com/api/v1/shorten'
function createURLPair(baseURL) {
  return __awaiter(this, void 0, void 0, function* () {
    console.log(baseURL);
    const response = yield fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `url=${encodeURIComponent(baseURL)}`,
    });
    if (!response.ok) {
      throw new Error(`Failed to shorten URL. HTTP Status: ${response.status}`);
    }
    const data = yield response.json();
    yield data;
    console.log(data.result_url);
    return {
      base: baseURL,
      short: data.result_url,
      id: data.result_url.split("/").pop(),
    };
  });
}
document.addEventListener("DOMContentLoaded", () => {
  //querying for the various dom elements
  try {
    const formQuery = document.querySelector(".form");
    const inputQuery = document.querySelector(".main-input");
    const submitBtnQuery = document.querySelector(".shorten-btn");
    const urlListDivQuery = document.querySelector(".url-list");
    if (!formQuery || !inputQuery || !submitBtnQuery || !urlListDivQuery) {
      throw new Error(
        "Cant find in the DOM one of the following is null { form :" +
          formQuery +
          " input : " +
          inputQuery +
          " submit : " +
          submitBtnQuery +
          " div : " +
          urlListDivQuery +
          "}"
      );
    }
    form = formQuery;
    input = inputQuery;
    submitBtn = submitBtnQuery;
    urlListDiv = urlListDivQuery;
  } catch (error) {
    console.error("Error occurred while initializing elements:", error);
  }
  //abonne toé petite form !
  form.addEventListener("submit", (e) =>
    __awaiter(void 0, void 0, void 0, function* () {
      e.preventDefault();
      if (!isInUrlList(input.value)) {
        let newPairPromise = createURLPair(input.value);
        newPairPromise.then((result) => {
          addToUrlList(result);
        });
      } else {
        console.warn(
          "url : " + input.value + " is already somewhere in the list !"
        );
      }
      input.value = "";
    })
  );
  // load local Storage
  loadFromBrowser();
});
