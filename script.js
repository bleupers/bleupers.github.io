


function play(filename) {
  var audioclip = new Audio("audio/" + filename);
  audioclip.currentTIme = 0;
  audioclip.volume = .5;
  audioclip.play();
}

function lookup() {
  var inputstring = prompt("Name?");

  var query = `
		query ($search: String) { # Define which variables will be used in the query (id)
		Media (search: $search, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
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
            source
            status
            description
            episodes
		}
		}
		`;

  // Define our query variables and values that will be used in the query request
  var variables = {
    search: inputstring
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
    console.log(obj);
  }

  function handleError(error) {
    console.error(error);
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

function DisplayCharacter(character){
  let element = document.querySelector("#rcName");
  element.textContent = character.name;

  element = document.querySelector("#rcDesc");
  let stars = "⭐".repeat(character.rarity);
  element.textContent = stars;

  element = document.querySelector("#rcIcon");
  element.setAttribute("src", character.image);

}