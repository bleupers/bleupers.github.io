function play(filename) {
  var audioclip = new Audio("audio/" + filename);
  audioclip.currentTIme = 0;
  audioclip.volume = .5;
  audioclip.play();
}

function lookup(inputid) {
  var query = `
		query ($id: Int) { # Define which variables will be used in the query (id)
		Media (id: $id, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
			id
            coverImage {
                extraLarge
            }
			title {
        romaji
        english
        native
			}
      genres
      averageScore
      source
      description
      episodes
		  }
		}
		`;

  // Define our query variables and values that will be used in the query request
  var variables = {
    id: inputid
  };

  // Define the config we'll need for our Api request
  var url = 'https://graphql.anilist.co',
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    };


  // Make the HTTP Api request
  fetch(url, options).then(handleResponse)
    .then(handleData)
    .catch(handleError);

  function handleResponse(response) {
    return response.json().then(function (json) {
      return response.ok ? json : Promise.reject(json);
    });
  }

  function handleData(data) {
    const jsonData = JSON.stringify(data, null, 2);
    const obj = JSON.parse(jsonData);
    return obj;
  }

  function handleError(error) {
    console.error(error);
  }
}

function RandomAnime() {
  return new Promise((resolve, reject) => {
    let pageIndex = Math.floor(Math.random() * (908)) + 1;
    var query = `
      query ($id: Int, $page: Int, $search: String) {
        Page (page: $page, perPage: 1) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media (id: $id, search: $search, popularity_greater: 50000, type:ANIME) {
            id
            title {
              romaji
            }
            popularity
            averageScore
            coverImage{
              extraLarge
            }
          }
        }
      }
      `;

    var variables = {
      page: pageIndex
    };

    var url = 'https://graphql.anilist.co',
      options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: variables
        })
      };

    fetch(url, options).then(handleResponse)
      .then(handleData)
      .catch(handleError);

    function handleResponse(response) {
      return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
      });
    }

    function handleData(data) {
      let returnedAnime = data.data.Page.media[0];
      resolve(returnedAnime);
    }

    function handleError(error) {
      alert('Error, check console');
      console.error(error);
    }
  });
}
let canClick = false;
let animeOne;
let animeTwo;

let score = 0;
let highScore = 0;
async function StartGame() {
  try {
    const labImageElement = document.getElementById("left-anime-image");
    const rabImageElement = document.getElementById("right-anime-image");
    const labTitleElement = document.getElementById("left-anime-title");
    const rabTitleElement = document.getElementById("right-anime-title");
    const labElement = document.getElementById("left-anime-rating");
    const rabElement = document.getElementById("right-anime-rating");
    document.getElementById("animebg").style.background = "white";
    document.getElementById("left-anime-button").style.background = "white";
    document.getElementById("right-anime-button").style.background = "white";
    labElement.textContent = "";
    rabElement.textContent = "";

    animeOne = await RandomAnime();
    animeTwo = await RandomAnime();

    labImageElement.src = animeOne.coverImage.extraLarge; // Set the image URL as the src attribute
    rabImageElement.src = animeTwo.coverImage.extraLarge; // Set the image URL as the src attribute
    labTitleElement.textContent = animeOne.title.romaji;
    rabTitleElement.textContent = animeTwo.title.romaji;

    canClick = true;

  } catch (error) {
    console.error(error);
  }
}

function MakeGuess(id) {
  if (canClick) {
    const backgroundElement = document.getElementById("animebg");
    const labElement = document.getElementById("left-anime-rating");
    const rabElement = document.getElementById("right-anime-rating");
    labElement.textContent = animeOne.averageScore;
    rabElement.textContent = animeTwo.averageScore;
    switch (id) {
      case 1:
        if (animeOne.averageScore >= animeTwo.averageScore) {
          // Correct
          document.getElementById("left-anime-button").style.background = "#39FF14";
          backgroundElement.style.background = "green";
          score++;
          if (score > highScore) {
            highScore = score;
            window.localStorage.setItem("highScore", JSON.stringify(highScore)); // save score as json
          }
        }
        else {
          document.getElementById("left-anime-button").style.background = "#FF3131";
          backgroundElement.style.background = "red";
          score = 0;
        }
        break;
      case 2:
        if (animeTwo.averageScore >= animeOne.averageScore) {
          // Correct
          document.getElementById("right-anime-button").style.background = "#39FF14";
          backgroundElement.style.background = "green";
          score++;
          if (score > highScore) {
            highScore = score;
            window.localStorage.setItem("highScore", JSON.stringify(highScore)); // save score as json
          }
        }
        else {
          document.getElementById("right-anime-button").style.background = "#FF3131";
          backgroundElement.style.background = "red";
          score = 0;
        }
        break;
    }
    document.getElementById("animegame-subtitle").textContent = `your current score is ${score}`;
    document.getElementById("animegame-subtitle-two").textContent = `your high score is ${highScore}`;

    canClick = false;
  }
}


// minigame scripts
let userData;
let characterInfo = {};
let poolData = {};

window.onload = function () {
  // LOAD USER DATA
  if (localStorage.getItem("userData") === null) {
    userData = { ownedId: [], flowers: 0 };
    SaveData();
  }
  if (localStorage.getItem("highScore") != null) {
    highScore = JSON.parse(window.localStorage.getItem("highScore"));
  }
  LoadData();
  // LOAD CHARACTER DATA
  fetch('character_data.json')
    .then(response => response.json())
    .then(data => {
      characterInfo = data.data;
      poolData = data.pooldata;
    })
    .catch(error => {
      console.error('Error:', error);
    });
};


function SaveData() {
  window.localStorage.setItem("userData", JSON.stringify(userData)); // save user data as json
}

function LoadData() {
  let jsonUserData = window.localStorage.getItem("userData"); // get data from saved json
  userData = JSON.parse(jsonUserData); // set user data from json  
}

function RollCharacter() {
  // GET CHARACTER
  let odd = Math.floor(Math.random() * 100) + 1;
  let character;
  if (odd <= 2) {
    let keys = Object.keys(poolData.four);
    let i = keys.length;
    let k = Math.floor(Math.random() * i);
    let id = poolData.four[k];
    character = characterInfo[id];
  } else if (odd <= 10) {
    let keys = Object.keys(poolData.three);
    let i = keys.length;
    let k = Math.floor(Math.random() * i);
    let id = poolData.three[k];
    character = characterInfo[id];
  } else if (odd <= 50) {
    let keys = Object.keys(poolData.two);
    let i = keys.length;
    let k = Math.floor(Math.random() * i);
    let id = poolData.two[k];
    character = characterInfo[id];
  } else if (odd <= 100) {
    let keys = Object.keys(poolData.one);
    let i = keys.length;
    let k = Math.floor(Math.random() * i);
    let id = poolData.one[k];
    character = characterInfo[id];
  }
  // SAVE CHARACTER
  const cArray = userData.ownedId || [];
  if (cArray.includes(character.id)) {
    userData.flowers += 20;
  }
  else {
    const newArray = [...cArray, character.id];
    userData.ownedId = newArray;
  }
  SaveData();
  DisplayCharacter(character);
}

function DisplayCharacter(character) {
  let element = document.querySelector("#rcName");
  element.textContent = character.name;

  element = document.querySelector("#rcDesc");
  let stars = "⭐".repeat(character.rarity);
  element.textContent = stars;

  element = document.querySelector("#rcIcon");
  element.setAttribute("src", character.image);

}

function ToggleDiv(name) {
  let div;
  // hide all
  div = document.getElementById("collection-div");
  div.style.display = "none";
  div = document.getElementById("animegame-div");
  div.style.display = "none";
  div = document.getElementById("home-div");
  div.style.display = "none";
  switch (name) {
    case "home":
      div = document.getElementById("home-div");
      div.style.display = "block";
      break;
    case "collection":
      generateBoxes()
      div = document.getElementById("collection-div");
      div.style.display = "block";
      break;
    case "game":
      div = document.getElementById("animegame-div");
      div.style.display = "block";
      break;
  }
}

function generateBoxes() {
  const container = document.getElementById('boxContainer');
  container.innerHTML = '';
  for (const item in userData.ownedId) {
    const _character = userData.ownedId[item];
    const character = characterInfo[_character];

    const box = document.createElement('div');
    box.className = 'box';

    const img = document.createElement('img');
    img.src = character.image;
    img.alt = character.name;
    box.appendChild(img);

    const title = document.createElement('h2');
    title.textContent = character.name;
    box.appendChild(title);

    const description = document.createElement('p');
    let stars = "⭐".repeat(character.rarity);
    description.textContent = stars;
    box.appendChild(description);

    container.appendChild(box);
  }
}