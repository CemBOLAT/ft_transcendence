const renderProfile = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        navigateTo('/');
        return;
    }

    try {
        const userId = localStorage.getItem('user_id');
        const response = await authFetch(`api/user/${userId}/profile/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            navigateTo('/');
            return;
        }
        const userData = await response.json();
        const username = userData.username;
        const timestamp = new Date().getTime();
        showAuthDiv(true);
        maincontent.innerHTML = `
            <link rel="stylesheet" href="./styles/user/style.css">
            <div class="outerSite">
                <div id="outerUser" class="container">
                    <div class="row gutters-sm">
                        <div class="col-sm-2"></div>
                        <div class="col-md-3 mb-3">
                            <div class="card">
                                <div class="card-body profileCardBG" id="myusercard">
                                    <div class="d-flex flex-column align-items-center text-center">
                                        <img class="setAvatar" src="/api/media/avatars/${username}.jpg?t=${timestamp}" style="border-radius: 60%; border: 2px solid grey;" id="profileImage" class="rounded-circle" width="150">
                                        <div class="mt-3">
                                            <p class="text-muted mb-1" id="user">${userData.username}</p>
                                            <button class="btn btn-primary" id="change-avatar-btn" translate-id="uploadavatar">Upload Avatar</button>
                                        </div>
                                        <div id="online-status"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="card mt-3" id="userScore">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                        <h6 class="mb-0" id="profile-total-match" translate-id="totalmatches">Total Matches</h6>
                                        <span class="text-secondary">${Number(userData.win) + Number(userData.lose)}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                        <h6 class="mb-0" id="profile-win" translate-id="win">Win</h6>
                                        <span class="text-secondary">${Number(userData.win)}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                        <h6 class="mb-0" id="profile-lose" translate-id="lose">Lose</h6>
                                        <span class="text-secondary">${Number(userData.lose)}</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="mt-3">
                                <button class="btn btn-primary" id="settings-btn" translate-id="settings">Settings</button>
                            </div>
                            <div class="friends mt-3" id="friend_list_content">
                                <div class="card">
                                    <div class="card-body profileCardBG" id="friendBox">
                                        <h5 class="card-title" translate-id="friends">Friends</h5>
                                        <hr>
                                        <ul class="list-group list-group-flush" id="friends-list">
                                        </ul>
                                        <div class="friends-box">
                                            <button class="btn btn-primary button-56" id="friends-btn" translate-id="allfriends">All friends</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card mb-3 profileCardBG">
                                <div class="card-body" id="card-inner">
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <h6 class="mb-0" id="profile-username" translate-id="nickname">Nick Name</h6>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="text-muted mb-0">${userData.nickname}</p>
                                            <button class="btn btn-primary btn-sm" id="change-username-btn" translate-id="changeusername">Change Username</button>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <h6 class="mb-0" id="profile-email" translate-id="email">Email</h6>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="text-muted mb-0">${userData.email}</p>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <h6 class="mb-0" id="profile-firstname" translate-id="username">User Name</h6>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="text-muted mb-0">${userData.username}</p>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <h6 class="mb-0" id="profile-password" translate-id="password">Password</h6>
                                        </div>
                                        <div class="col-sm-9">
                                            <button class="btn btn-danger btn-sm" id="change-password-btn" translate-id="changepassword">Change Password</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="card proCard mb-3 profileCardBG">
                                    <div class="card-body">
                                    <h5 class="card-title" id="profile-match-history" translate-id="matchhistory">Match History</h5>
                                        <div class="table-responsive">
                                            <table class="table table-borderless card-table">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">#</th>
                                                        <th scope="col" id="profile-hs-user1" translate-id="user">User</th>
                                                        <th scope="col" id="profile-hs-score1" translate-id="score">Score</th>
                                                        <th scope="col" id="profile-hs-vs" translate-id="vs">VS</th>
                                                        <th scope="col" id="profile-hs-score2" translate-id="score">Score</th>
                                                        <th scope="col" id="profile-hs-user2" translate-id="user">User</th>
                                                        <th scope="col" id="profile-hs-date" translate-id="date">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="match-history">
                                                    
                                                </tbody>
                                            </table>
                                            <div class="pagination">
                                                <button id="prev-page" class="btn btn-secondary">Previous</button>
                                                <button id="next-page" class="btn btn-secondary">Next</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (userData.is_42_student) {
            document.querySelector('#change-password-btn').style.display = 'none';
        }

        // user listesi
        const friendListContent = document.querySelector('#friends-list');
        const friendListResponse = await authFetch(`api/user/${localStorage.getItem('user_id')}/friendlist`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const friendListData = await friendListResponse.json();

        for (let i = 0; i < friendListData.length; i++) {
            let username = friendListData[i].username;
            let isOnline = friendListData[i].is_online;
            let friendId = friendListData[i].id;
            let onlineStatusClass = isOnline ? 'online' : 'offline';

            friendListContent.innerHTML += `
                <div class="friends-box">
                    <li class="list-group item"><button class="friend-name" friend-id="${friendId}">${username}</button></li>
                    <div class="online-status ${onlineStatusClass}"></div>
                </div>
                <hr>
            `;
        }

        // match history pagination
        let currentPage = 1;
        const itemsPerPage = 5;
        let matchHistoryData = [];

        const loadMatchHistory = async () => {
            const matchHistoryResponse = await authFetch(`/api/user/${localStorage.getItem('user_id')}/games`, {
                method: 'GET',
            });
            matchHistoryData = await matchHistoryResponse.json();
            matchHistoryData = matchHistoryData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            renderMatchHistory();
        };

        const renderMatchHistory = () => {
            const matchHistoryContent = document.querySelector('#match-history');
            matchHistoryContent.innerHTML = '';
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const currentItems = matchHistoryData.slice(start, end);
            
            currentItems.forEach((match, i) => {
                let dateObj = new Date(match.created_at);

                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');

                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                const seconds = String(dateObj.getSeconds()).padStart(2, '0');

                const datePart = `${year}-${month}-${day}\n`;
                const timePart = `${hours}:${minutes}:${seconds}`;

                matchHistoryContent.innerHTML += `
                    <tr>
                        <th scope="row">${start + i + 1}</th>
                        <td>${match.user1_username}</td>
                        <td>${match.user1Score}</td>
                        <td>VS</td>
                        <td>${match.user2Score}</td>
                        <td>${match.user2_username}</td>
                        <td>
                            ${datePart}
                            </br>
                            ${timePart}
                        </td>
                    </tr>
                `;
            });

            document.querySelector('#prev-page').disabled = currentPage === 1;
            document.querySelector('#next-page').disabled = end >= matchHistoryData.length;
        };

        document.querySelector('#prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderMatchHistory();
            }
        });

        document.querySelector('#next-page').addEventListener('click', () => {
            if ((currentPage * itemsPerPage) < matchHistoryData.length) {
                currentPage++;
                renderMatchHistory();
            }
        });

        loadMatchHistory();

        document.querySelectorAll('.friend-name').forEach(friend => {
            friend.addEventListener('click', () => {
                const frId = friend.getAttribute('friend-id');
                navigateTo(`/user?userid=${frId}`);
            })
        });

        document.querySelector('#change-avatar-btn').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/settings');
        });

        document.querySelector('#settings-btn').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/settings');
        });

        document.querySelector('#change-username-btn').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/settings');
        });

        document.querySelector('#change-password-btn').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/changepassword');
        });

        document.querySelector('#friends-btn').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/friends');
        });
    } catch (e) {
        console.log("fetch error", e);
        navigateTo('/');
    }

    changeLanguage();
}
