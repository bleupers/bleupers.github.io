// view query below for userData format
let userData = [];

// list retrieval functions
async function GetUserData() {
    let username = document.getElementById("user-id-input").value; // get inputed username
    if (username == null) return;
    let i = 1;
    userData = [];
    while (1) {
        let nextPage = await GetListPage(username, i); // get user's anime list 1 page at a time (50 entries per page)
        if (nextPage == true) {
            i++;
        }
        else break;
    }
    console.log(userData);
}
function GetListPage(nameInput, pageIndex) {
    return new Promise((resolve, reject) => {
        var query = `
          query($nameinput: String, $pagenum: Int){
                  Page(page: $pagenum, perPage:50) {
                    pageInfo{
                      hasNextPage
                    }
                    mediaList(userName: $nameinput, type: ANIME) {
                      score(format: POINT_10)
                      media {
                        title {
                          romaji
                        }
                        coverImage {
                          medium
                        }
                        genres
                        tags{
                            name
                            rank}
                      }
                    }
                  }
                 }
          `;

        var variables = {
            pagenum: pageIndex,
            nameinput: nameInput
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
            data.data.Page.mediaList.forEach((obj) => {
                userData = [...userData, obj];
            });
            let nextPage = data.data.Page.pageInfo.hasNextPage;
            resolve(nextPage);
        }

        function handleError(error) {
            alert('Error, check console');
            console.error(error);
        }
    });
}

// storage related functions
function SaveData() {
    window.localStorage.setItem("userList", JSON.stringify(userData)); // save user data as json
}
function LoadData() {
    let jsonUserData = window.localStorage.getItem("userList"); // get data from saved json
    userData = JSON.parse(jsonUserData); // set user data from json  
}

// start up
window.onload = function () {
    // LOAD USER DATA
    if (localStorage.getItem("userList") != null) {
        LoadData();
    }
};
