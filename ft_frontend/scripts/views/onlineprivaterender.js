const startPrivateMatch = async () => {
    gameSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type == 'game_info')
        {
            if (data.user_id !== localStorage.getItem('user_id')) {
                onlinPongGame.updatePositions(data.game_info.left_paddle, data.game_info.right_paddle, data.game_info.ball);
            }
        }
        if (data.type === 'score')
        {
            onlinPongGame.addScore(data.scores, data.who_scored);
        }
        if (data.type === 'player_disconnected')
        {
            gameSocket.close();
            gameSocket = null;
            onlinPongGame.stopAnimation();
            onlinPongGame = null;
            maincontent.innerHTML = `
                <style>
                    .custom-disconnect-container {
                        text-align: center;
                        background: #2e2e2e;
                        padding: 50px;
                        border-radius: 10px;
                        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
                    }
                    
                    .custom-disconnect-title {
                        font-size: 48px;
                        color: #ff4757;
                        margin-bottom: 20px;
                    }
                    
                    .custom-disconnect-message {
                        font-size: 24px;
                        color: #ffffff;
                        margin-bottom: 40px;
                    }
                    
                    .custom-return-home-button {
                        padding: 10px 20px;
                        font-size: 18px;
                        color: #fff;
                        background: #ff6b81;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background 0.3s ease;
                    }
                    
                    .custom-return-home-button:hover {
                        background: #ff4757;
                    }
                </style>
                <div class="custom-disconnect-container">
                    <h1 class="custom-disconnect-title">Player Disconnected</h1>
                    <p class="custom-disconnect-message">The other player has left the game.</p>
                    <button class="custom-return-home-button" onclick="returnHome()">Return Home</button>
                </div>
            `;
        }
        if (data.type === 'end_game')
        {
            gameSocket.close();
            gameSocket = null;
            onlinPongGame.stopAnimation();
            onlinPongGame = null;
            maincontent.innerHTML = `
                <style>
                    .custom-game-over-container {
                        text-align: center;
                        background: #2e2e2e;
                        padding: 50px;
                        border-radius: 10px;
                        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
                    }
                    
                    .custom-game-over-title {
                        font-size: 48px;
                        color: #ff4757;
                        margin-bottom: 20px;
                    }
                    
                    .custom-winner-message {
                        font-size: 24px;
                        color: #ffffff;
                        margin-bottom: 40px;
                    }
                    
                    #custom-winner {
                        font-weight: bold;
                        color: #ffcc00;
                    }
                    
                    .custom-play-again-button {
                        padding: 10px 20px;
                        font-size: 18px;
                        color: #fff;
                        background: #ff6b81;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background 0.3s ease;
                    }
                    
                    .custom-play-again-button:hover {
                        background: #ff4757;
                    }
                </style>
                <div class="custom-game-over-container">
                    <h1 class="custom-game-over-title">Game Over</h1>
                    <p class="custom-winner-message">${data.message}</p>
                    <button class="custom-play-again-button" id="play_again_btn">Main Menu</button>
                </div>
            `;
            document.querySelector('#play_again_btn').addEventListener('click', async (e) => {
                e.preventDefault();
                navigateTo('/');
            });
        }
    };

}

const createPrivateMatch = async () => {
    gameSocket = new WebSocket(`wss://${window.location.host}/ws/pong/creatematch/?user_id=${localStorage.getItem('user_id')}`);

    gameSocket.onopen = (e) => {
        console.log('Connected to server');
    }

    gameSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'Connected')
        {
            isOnlineRoomCreater = true;
        }

        if (data.type === 'start_game') {
            let username = data.user1_username;
            let opponentUsername = data.user2_username;
            maincontent.innerHTML = `
                <link rel="stylesheet" href="styles/singlepong/style.css">

                <div id="game-container">  
                    <div id="scoreboard">
                        <div class="player">
                            <img src="/api/media/avatars/${username}.jpg" alt="Player 1">
                            <div class="username">${username}</div>
                            <span id="player1-score">0</span>
                        </div>
                        <span class="divider">-</span>
                        <div class="player">
                            <img id="opponentAvatar" src="/api/media/avatars/${opponentUsername}.jpg" alt="Player 2">
                            <div class="username">${opponentUsername}</div>
                            <span id="player2-score">0</span>
                        </div>
                    </div>
                </div>
            `;

            onlinPongGame = new OnlinePongGame('game-container', gameSocket, isOnlineRoomCreater);
            startPrivateMatch(gameSocket);
        }
    };

    gameSocket.onclose = (e) => {
        console.log('Connection closed');
    }
}

const joinPrivateMatch = async (join_id) => {
    gameSocket = new WebSocket(`wss://${window.location.host}/ws/pong/joinmatch/?user_id=${localStorage.getItem('user_id')}&room_owner_id=${join_id}`);

    gameSocket.onopen = (e) => {
        console.log('Connected to server');
    }

    gameSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'errormessage')
        {
            maincontent.innerHTML = `
                <style>
                    body, html {
                    height: 100%;
                    }
                    .bg-dark {
                    
                    }
                    .centered {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    }
                    .centered h1 {
                    font-size: 10rem;
                    color: #fff;
                    }
                    .centered h3 {
                    color: #aaa;
                    }
                    .btn-home {
                    margin-top: 30px;
                    }
                </style>
                <div>
                    <div class="centered">
                        <h1>404</h1>
                        <h3>${data.message}</h3>
                    </div>
                </div>
            `;
            gameSocket.close();
            gameSocket = null;
        }

        if (data.type === 'Connected')
        {
            isOnlineRoomCreater = false;
        }

        if (data.type === 'start_game') {
            let username = data.user1_username;
            let opponentUsername = data.user2_username;
            maincontent.innerHTML = `
                <link rel="stylesheet" href="styles/singlepong/style.css">

                <div id="game-container">  
                    <div id="scoreboard">
                        <div class="player">
                            <img src="/api/media/avatars/${username}.jpg" alt="Player 1">
                            <div class="username">${username}</div>
                            <span id="player1-score">0</span>
                        </div>
                        <span class="divider">-</span>
                        <div class="player">
                            <img id="opponentAvatar" src="/api/media/avatars/${opponentUsername}.jpg" alt="Player 2">
                            <div class="username">${opponentUsername}</div>
                            <span id="player2-score">0</span>
                        </div>
                    </div>
                </div>
            `;

            onlinPongGame = new OnlinePongGame('game-container', gameSocket, isOnlineRoomCreater);
            startPrivateMatch(gameSocket);
        }
    };

    gameSocket.onclose = (e) => {
        console.log('Connection closed');
    }
}

const renderPrivateMatch = async (params) => {
    if (params.userId != null) {
        await joinPrivateMatch(params.userId);
        return;
    }
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

        if (!response.ok) {
            // localStorage.removeItem('access_token');
            // localStorage.removeItem('refresh_token');
            // localStorage.removeItem('user_id');
            navigateTo('/');
            return;
        }

        const userData = await response.json();

        const timestamp = new Date().getTime();

        showAuthDiv(true);
        maincontent.innerHTML = `
            <style>
            
            #matchmaking-container {
                background: #1e1e1e;
                border-radius: 15px;
                padding: 20px 30px;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
                text-align: center;
            }
            
            #matchmaking-container h2 {
                font-size: 24px;
                margin-bottom: 20px;
                color: #00bcd4;
            }
            
            #matchmaking-options {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .button-56 {
                background: linear-gradient(135deg, #ff4081, #ff80ab);
                border: none;
                color: white;
                padding: 15px 25px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                border-radius: 25px;
                cursor: pointer;
                transition: background 0.3s ease-in-out;
            }
            
            .button-56:hover {
                background: linear-gradient(135deg, #ff80ab, #ff4081);
            }
            
            /* Match status styling */
            #match-status {
                font-size: 18px;
                margin-top: 20px;
                color: #ffcc00;
            }
            
            /* Game container styling */
            #game-container {
                margin-top: 30px;
            }
            
            #scoreboard {
                font-size: 24px;
                color: #ffffff;
            }
            
            #player1-score, #player2-score {
                font-weight: bold;
            }
            
            .divider {
                margin: 0 10px;
                font-weight: normal;
            }
            </style>
            <link rel="stylesheet" href="styles/singlepong/style.css">
            <div id="matchmaking-container">
                <h2>Private game</h2>
                <div id="matchmaking-options">
                    <button class="button-56" id="find-match-btn">Create Match</button>
                </div>
            </div>
        `;

        document.getElementById('find-match-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            
            maincontent.innerHTML = `
                <style>
                .match-container {
                    background: #34495e;
                    border-radius: 15px;
                    padding: 30px;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
                    text-align: center;
                    width: 400px;
                    margin-right: auto;
                    margin-left: auto;
                }
        
                .match-container h2 {
                    font-size: 24px;
                    margin-bottom: 20px;
                    color: #00bcd4;
                }
        
                .match-form-group {
                    margin-bottom: 20px;
                }
        
                .match-form-group label {
                    font-size: 18px;
                    margin-right: 10px;
                    color: #ecf0f1;
                }
        
                .match-form-group input {
                    padding: 10px;
                    font-size: 16px;
                    border-radius: 5px;
                    border: none;
                    width: 100px;
                    text-align: center;
                }
        
                .match-player-card {
                    display: flex;
                    align-items: center;
                    background: #3e3e3e;
                    border-radius: 10px;
                    padding: 20px;
                    margin-top: 20px;
                }
        
                .match-player-card img {
                    border-radius: 50%;
                    width: 80px;
                    height: 80px;
                    margin-right: 20px;
                    border: 2px solid grey;
                }
        
                .match-player-info {
                    text-align: left;
                }
        
                .match-player-info h4 {
                    margin: 0;
                    font-size: 20px;
                    color: #ffffff;
                }
        
                .match-player-info p {
                    margin: 5px 0 0;
                    color: #cccccc;
                }
        
                .button-create-match {
                    background: linear-gradient(135deg, #ff4081, #ff80ab);
                    border: none;
                    color: white;
                    padding: 15px 25px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    border-radius: 25px;
                    cursor: pointer;
                    transition: background 0.3s ease-in-out;
                    margin-top: 20px;
                }
        
                .button-create-match:hover {
                    background: linear-gradient(135deg, #ff80ab, #ff4081);
                }
        
                #friend-list {
                    width: 100%;
                    margin-top: 30px;
                    padding: 20px;
                    background-color: #34495e; /* Same as match-container */
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
                    border-radius: 10px;
                }
        
                #friend-list h2 {
                    margin: 0 0 20px;
                    text-align: center;
                    color: #00bcd4;
                }
        
                #friends-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
        
                .friend-card {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    border-bottom: 1px solid #2c3e50;
                    width: 100%;
                }
        
                .friend-card img {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    margin-right: 10px;
                }
        
                .friend-card span {
                    flex-grow: 1;
                    font-size: 16px;
                    color: #ecf0f1;
                }
        
                .invite-button {
                    padding: 8px 12px;
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
        
                .invite-button:hover {
                    background-color: #0056b3;
                }
                </style>
                <div class="match-container">
                    <h2>Create Match</h2>
                    <div id="players-container">
                        <div class="match-player-card" id="player1-card">
                            <img src="/api/media/avatars/${userData.username}.jpg?t=${timestamp}" alt="Player 1 Avatar">
                            <div class="match-player-info">
                                <h4 id="player1-username">${userData.username}</h4>
                                <p id="player1-status">Connected</p>
                            </div>
                        </div>
                        <div class="match-player-card" id="player2-card">
                            <img src="imgs/player2.jpg" alt="Player 2 Avatar">
                            <div class="match-player-info">
                                <h4 id="player2-username">Player 2</h4>
                                <p id="player2-status">Waiting...</p>
                            </div>
                        </div>
                    </div>
                    <div id="friend-list">
                        <h2>Friends</h2>
                        <div id="friends-container">
                            <!-- Add more friends here -->
                        </div>
                    </div>
                </div>
            `;

            const friendListContent = document.querySelector('#friends-container');
            const friendListResponse = await authFetch(`/api/user/${localStorage.getItem('user_id')}/friendlist`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const friendListData = await friendListResponse.json();

            for (let i = 0; i < friendListData.length; i++) {
                let username = friendListData[i].username;
                let isOnline = friendListData[i].is_online;
                let friendId = friendListData[i].id;
                let onlineStatusClass = isOnline ? 'Invite' : 'Offline';

                friendListContent.innerHTML += `
                    <div class="friend-card">
                        <img src="/api/media/avatars/${username}.jpg?t=${timestamp}" alt="Player 2 Avatar">
                        <span> ${username} </span>
                        <button class="invite-button" id="invite-friend-btn" friend-id="${friendId}" friend-username="${username}">${onlineStatusClass}</button>
                    </div>
                `;
            }

            document.querySelectorAll('#invite-friend-btn').forEach((button) => {
                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    let friendId = button.getAttribute('friend-id');
                    gameSocket.send(JSON.stringify({
                        type: 'game_invite',
                        user_id: friendId,
                    }));
                    button.innerText = 'Invited';
                });
            });

            await createPrivateMatch();
        });

    } catch (e) {
        console.log("fetch error", e);
        navigateTo('/');
    }
}