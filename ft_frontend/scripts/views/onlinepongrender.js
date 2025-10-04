async function findMatch() {
    const userId = localStorage.getItem('user_id');
    gameSocket = new WebSocket(`wss://${window.location.host}/ws/pong/findmatch/?user_id=${userId}`);

    gameSocket.onopen = () => {
        console.log('Connected to find match');
    };

    gameSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'Connected')
        {
            isOnlineRoomCreater = data.room_creator;
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
            startGame(gameSocket);
        }
    };

    gameSocket.onerror = (error) => {
        console.log('WebSocket Error: ', error);
    };

    gameSocket.onclose = () => {
        console.log('WebSocket connection closed');
    }
}

function startGame(socket) {

    socket.onmessage = (event) => {
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
            console.log('Player disconnected');
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
                    <button class="custom-play-again-button" id="play_again_btn">Play Again</button>
                </div>
            `;
            document.querySelector('#play_again_btn').addEventListener('click', async (e) => {
                e.preventDefault();
                navigateTo('/online');
            });
        }
    };

    socket.onclose = () => {
        console.log('Gane WebSocket connection closed');
    };
}

const onlinePongRender = async () => {
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
            // localStorage.removeItem('access_token');
            // localStorage.removeItem('refresh_token');
            // localStorage.removeItem('user_id');
            navigateTo('/');
            return;
        }

        const userData = await response.json();
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
                <h2>Online Pong Matchmaking</h2>
                <div id="matchmaking-options">
                    <button class="button-56" id="find-match-btn">Find Match</button>
                </div>
            </div>
        `;

        document.getElementById('find-match-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            maincontent.innerHTML = `
                <style>
                    .match-search-container {
                        text-align: center;
                        background-color: #20232a;
                        padding: 2rem;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    
                    .match-search-container h1 {
                        font-size: 2rem;
                        margin-bottom: 2rem;
                    }
                    
                    .loader {
                        position: relative;
                        width: 80%;
                        max-width: 600px;
                        height: 20px;
                        background-color: #444;
                        border-radius: 10px;
                        overflow: hidden;
                        margin: 0 auto;
                    }
                    
                    .loader-bar {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(to right, #61dafb, #21a1f1);
                        animation: loading 2s infinite linear;
                    }
                    
                    @keyframes loading {
                        0% {
                            transform: translateX(-100%);
                        }
                        100% {
                            transform: translateX(100%);
                        }
                    }
                </style>
    
                <div class="match-search-container">
                    <h1>Maç Aranıyor...</h1>
                    <div class="loader">
                        <div class="loader-bar"></div>
                    </div>
                </div>
            `;

            await findMatch();
        });

    } catch (e) {
        console.log("fetch error", e);
        navigateTo('/');
    }
}