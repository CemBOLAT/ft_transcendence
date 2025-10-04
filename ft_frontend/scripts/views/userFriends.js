const renderFriendRequests = async () => {
    const accessToken = localStorage.getItem('access_token');
    let userId = localStorage.getItem('user_id');

    if (!accessToken) {
        navigateTo('/');
        return;
    }

    try {
        const response = await authFetch(`/api/user/${userId}/friendrequests/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const friendRequests = await response.json();
        const friendRequestsList = document.getElementById('friend-requests-list');
        const timestamp = new Date().getTime();
        friendRequestsList.innerHTML = '';
        document.querySelector("#g-friend-not-btn").setAttribute("style", "background: rgba(2,0,36,1);"); 

        friendRequests.forEach(user => {
            const li = document.createElement('li');
            li.className = 'friend-item';
            li.innerHTML = `
                <img src="/api/media/avatars/${user.from_user_username}.jpg?t=${timestamp}" alt="${user.from_user_username}" class="friend-avatar">
                <div class="friend-info">
                    <div class="friend-name">${user.from_user_username}</div>
                </div>
                <button class="button accept-friend" data-userid="${user.from_user_id}">✓</button>
                <button class="button reject-friend" data-userid="${user.from_user_id}">×</button>
            `;
            friendRequestsList.appendChild(li);
        });

        document.querySelectorAll('.accept-friend').forEach(button => {
            button.addEventListener('click', async (event) => {
                const friendId = event.target.getAttribute('data-userid');
                await handleFriendRequest(friendId, 'accept');
                await renderActiveFriendList();
                await renderFriendRequests();
            });
        });

        document.querySelectorAll('.reject-friend').forEach(button => {
            button.addEventListener('click', async (event) => {
                const friendId = event.target.getAttribute('data-userid');
                await handleFriendRequest(friendId, 'reject');
            });
        });
    } catch (error) {
        console.error('Fetch error:', error);
    }
    checkImgJs();
};

const handleFriendRequest = async (friendId, action) => {
    const accessToken = localStorage.getItem('access_token');
    let userId = localStorage.getItem('user_id');
    if (!accessToken) {
        navigateTo('/');
        return;
    }

    try {
        const response = await authFetch(`/api/user/${userId}/${action}friendrequest/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ friend_id: friendId })
        });

        if (response.ok) {
            showAlert(translations[localStorage.getItem('selectedLanguage')]['friendrequesthandled']);
            await renderFriendRequests();
        } else {
            showAlert(translations[localStorage.getItem('selectedLanguage')]['friendrequesthandlefailed'], 1);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const renderActiveFriendList = async() => {
    const userId = localStorage.getItem('user_id');
    const friendListContent = document.querySelector('#active-friend-list');
    const accessToken = localStorage.getItem('access_token');
    const friendListResponse = await authFetch(`/api/user/${userId}/friendlist`, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const friendListData = await friendListResponse.json();
    const timestamp = new Date().getTime();
    
    friendListContent.innerHTML = '';

    for (let i = 0; i < friendListData.length; i++) {
        let username = friendListData[i].username;
        let friendId = Number(friendListData[i].id);

        friendListContent.innerHTML += `
            <li class="friend-item">
                <img src="/api/media/avatars/${username}.jpg?t=${timestamp}" alt="Friend 1" class="friend-avatar">
                <div class="friend-info">
                    <div class="friend-name">${username}</div>
                </div>
                <button class="button remove-friend" id="remove-friend-btn${i}" friend_id="${friendId}">-</button>
            </li>
        `;
    }
    
    for (let i = 0; i < friendListData.length; i++) {
        document.querySelector(`#remove-friend-btn${i}`).addEventListener('click', async (e) => {
            e.preventDefault();
            let friendId = e.target.getAttribute('friend_id');

            const response = await authFetch(`/api/user/${userId}/removefriend/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ friend_id: friendId })
            });

            if (response.ok) {
                showAlert(translations[localStorage.getItem('selectedLanguage')]['friendremoved']);
                renderActiveFriendList();
            } else {
                showAlert(translations[localStorage.getItem('selectedLanguage')]['friendremovefailed'], 1);
            }
        });
    }
    checkImgJs()
}

const searchUser = async() => {
    const timestamp = new Date().getTime();
    let userId = localStorage.getItem('user_id');

    document.querySelector('#newfr-search-button').addEventListener('click', async () => {
        const query = document.querySelector('#newfr-search-input').value.trim();
        if (!query) return;
    
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            navigateTo('/');
            return;
        }
    
        try {
            const response = await authFetch(`/api/user/searchusers/?query=${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.ok) {
                const users = await response.json();
                displayUsers(users);
            } else {
                console.error('Arama başarısız:', response.statusText);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    });
    
    function displayUsers(users) {
        const friendList = document.querySelector('#search-friend-list');
        friendList.innerHTML = '';
        let counter = 0;

        for (let i = 0; i < users.length; i++)
        {
            let username = users[i].username;

            friendList.innerHTML += `
                <li class="friend-item">
                    <img src="/api/media/avatars/${username}.jpg?t=${timestamp}" alt="${username}" class="friend-avatar">
                    <div class="friend-info">
                        <div class="friend-name">${username}</div>
                    </div>
                    <button class="button add-friend" id="add-friend-btn${i}" userid="${users[i].id}">+</button>
                </li>
                `;
            counter++;
        }
        for (let i = 0;i < counter; i++)
        {
            document.querySelector(`#add-friend-btn${i}`).addEventListener('click', async (e)=>{
                e.preventDefault();
                const newFriendId = Number(e.target.getAttribute('userid'));
                await addFriend(newFriendId)
            });
        }
        checkImgJs();
    }

    async function addFriend(friendId) {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            navigateTo('/');
            return;
        }

        try {
            const response = await authFetch(`/api/user/${userId}/sendfriendrequest/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ friend_id: friendId })
            });
    
            if (response.ok) {
                showAlert(translations[localStorage.getItem('selectedLanguage')]['friendrequestsent']);
            } else {
                showAlert(translations[localStorage.getItem('selectedLanguage')]['friendrequestfailed'], 1);
            }
        } catch (error) {
            console.log('Fetch error:', error);
        }
    }
    checkImgJs();
}

const renderFriends = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        navigateTo('/');
        return;
    }

    try {
        const userId = localStorage.getItem('user_id');
        const response = await authFetch(`/api/user/${userId}/profile/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) { // https status
            // localStorage.removeItem('access_token');
            // localStorage.removeItem('refresh_token');
            // localStorage.removeItem('user_id');
            navigateTo('/');
            return;
        }

        const userData = await response.json();
        showAuthDiv(true);
        maincontent.innerHTML = `
        <link rel="stylesheet" href="styles/friends/style.css">
        <div role="alert" id="status-alert">
        </div>
        <div class="alignMid">
            <div class="addFriendDiv">
                <h1 translate-id="addfriendheader">Add Friend</h1>
                <div class="search">
                    <input type="text" class="search-input" id="newfr-search-input" placeholder="Search Friends" translate-id="searchfriends">
                    <button class="button-56 search-button" id="newfr-search-button" translate-id="search">Search</button>
                </div>
                <ul class="friend-list" id="search-friend-list">
                    
                </ul>
            </div>
            <hr>
            <div class="friendRequestsDiv">
                <h1 translate-id="friendrequests">Friend Requests</h1>
                <ul class="friend-list" id="friend-requests-list">
                </ul>
            </div>
            <hr>
            <div>
                <h1>${userData.username} <span translate-id="friends">Friends</span></h1>
                <div class="search">
                    <input type="text" class="search-input" placeholder="Search Friends" translate-id="searchfriends">
                    <button class="button-56 search-button" translate-id="search">Search</button>
                </div>
                <ul class="friend-list" id="active-friend-list">
                </ul>
            </div>
        </div>
        `

        // friend request list
        await renderFriendRequests();

        // friend list
        await renderActiveFriendList();

        // search friend
        searchUser();
        

    } catch (e) {
        console.log("fetch error", e);
        navigateTo('/');
    }

    changeLanguage();
}
