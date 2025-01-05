let username;
let mangaCount;
let mangaArray;
let sortedArray;

async function UserSearch(event) {
    event.preventDefault(); // Prevent default form submission
    const form = document.getElementById('username-form'); // Make sure the ID matches the form's actual ID
    const formData = new FormData(form);
    username = formData.get('username');
    var query = `
        query ($name: String) {
            User (name:$name){
              statistics {
                manga {
                    count
                    }
                }
            }
        }  `;

    var variables = {
        name: username
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
        mangaCount = data.data.User.statistics.manga.count;
        GetManga();
    }

    function handleError(error) {
        alert('Error, check console');
        console.error(error);
    }
}

async function GetManga() {
    let totalPages = Math.ceil(mangaCount / 50);
    let index = 0;
    mangaArray = [];
    for (let i = 1; i < totalPages + 1; i++) {
        var query = `
        query ($page: Int, $username: String){
            Page (page: $page, perPage: 50) {
                mediaList (userName:$username, type:MANGA) {
                    media {
                        title {
                            romaji
                        }
                        coverImage{
                            extraLarge
                        }
                        startDate {
                            year     			
                        }
                    }
                }
            }
        } `;

        var variables = {
            page: i,
            username: username
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
            let newData = data.data.Page.mediaList;
            for (i in newData){
                mangaArray.push(newData[i].media);
                index++;
            }
            if(index==mangaCount){
                SortManga();
            }
        }

        function handleError(error) {
            alert('Error, check console');
            console.error(error);
        }
    }
}

async function SortManga(){
    sortedArray = [];
    for (let i = 1940; i < 2024; i++){
        let obj = {year: i, data:[]};
        sortedArray.push(obj);
    }
    for (const i in mangaArray){
        let yearToFind = mangaArray[i].startDate.year;
        let foundObject = sortedArray.find(item => item.year === yearToFind);
        foundObject.data.push(mangaArray[i]);
    }
    generateBoxes();
}

function generateBoxes() {
    const container = document.getElementById('boxContainer');
    container.innerHTML = '';
    for (const item in sortedArray) {
        if (sortedArray[item].data.length > 0){
            const box = document.createElement('div');
            box.className = 'box';      
            box.style.width = (sortedArray[item].data.length * 200) + 'px';
            const title = document.createElement('h2');
            title.textContent = sortedArray[item].year;
            box.appendChild(title);      
            for (const innerItem in sortedArray[item].data){
                const button = document.createElement('button')
                button.classList.add("anime-button");
                box.appendChild(button);          
                const img = document.createElement('img');
                img.src = sortedArray[item].data[innerItem].coverImage.extraLarge;
                button.appendChild(img);
                const breake = document.createElement('br');
                button.appendChild(breake);
                const description = document.createElement('span');
                description.textContent = sortedArray[item].data[innerItem].title.romaji;
                button.appendChild(description);
            }
            container.appendChild(box);
        }  
    }
  }