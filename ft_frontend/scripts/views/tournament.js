/*
HERHANGİ BİR ŞEKİLDE SAYFA DEĞİŞİKLİĞİ OLDUĞU ZAMAN LOCALSTORAGE'DAKİ
VERİLERİ SİLMEMİZ LAZIM YOKSA NANEYİ YERİZ :P 
                                    - haSik_42
*/

const localTournamentRender = async () => {
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      navigateTo('/');
      return;
    }

    const userData = await response.json();
    const username = userData.username;
    const userAvatar = `/api/media/avatars/${username}.jpg`;

    let tournamentData = JSON.parse(localStorage.getItem('tournamentData'));
    if (!tournamentData) {
      console.log('tournamentData not found');
      tournamentData = {
        semifinals: [
          { player1: username, player1Avatar: userAvatar, player2: 'Player2', player2Avatar: '/imgs/42.webp', finished: false },
          { player1: 'Player3', player1Avatar: '/imgs/42.webp', player2: 'Player4', player2Avatar: '/imgs/42.webp', finished: false },
        ],
        finals: [
          { player1: '?', player1Avatar: '/imgs/42.webp', player2: '?', player2Avatar: '/imgs/42.webp', finished: false },
        ],
        currentMatchIndex: 0,
        settings: {
          gameScore: 5,
          gameDifficulty: 'easy'
        },
        tournamentStarted: false,
        semifinalsFinished: false,
        tournamentWinner: null
      };
    }

    const { semifinals, finals, settings, tournamentStarted, currentMatchIndex } = tournamentData;

    maincontent.innerHTML = `
      <style>
        .tournament {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #16213e;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          margin: 20px auto;
          max-width: 1200px;
          position: relative;
        }
        .trophy {
          width: 150px;
          height: 150px;
          background-image: url('trophy.png');
          background-size: cover;
          margin: 0 auto;
        }
        .round {
          display: flex;
          justify-content: space-around;
          width: 100%;
          margin-top: 20px;
        }
        .final-round {
          display: flex;
          justify-content: center;
          width: 100%;
          margin-top: 20px;
        }
        .match {
          background: #1a1a2e;
          border-radius: 10px;
          padding: 10px;
          margin: 10px;
          text-align: center;
          width: 220px;
          position: relative;
          border: 3px solid black;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .match.highlight {
          transform: scale(1.05);
          box-shadow: 0 0 20px 5px #e94560;
        }
        .semi-finals .match.highlight {
          box-shadow: 0 0 20px 5px red;
        }
        .finals .match.highlight {
          box-shadow: 0 0 20px 5px green;
        }
        .fighter {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .fighter img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #0f3460;
          margin-right: 10px;
        }
        .username {
          font-size: 16px;
          font-weight: bold;
          color: #fff;
        }
        .vs {
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0;
          color: #e94560;
        }
        .edit-button {
          margin-left: 10px;
          background: #e94560;
          color: #fff;
          border: none;
          padding: 5px 10px;
          font-size: 12px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .edit-button:hover {
          background: #c81d4e;
        }
        .edit-form {
          display: none;
          flex-direction: column;
          align-items: center;
          background: #1a1a2e;
          border-radius: 10px;
          padding: 20px;
          margin-top: 10px;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        .edit-form input {
          margin-bottom: 10px;
          padding: 10px;
          font-size: 14px;
          border-radius: 5px;
          border: 1px solid #ccc;
          width: 100%;
        }
        .edit-form button {
          background: #e94560;
          color: #fff;
          border: none;
          padding: 5px 10px;
          font-size: 14px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .selected_fighter{
          
        }
        .edit-form button:hover {
          background: #c81d4e;
        }

        .match-index {
          font-size: 16px;
          font-weight: bold;
          color: #fff;
        }

        .settings {
          display: none;
          flex-direction: column;
          align-items: center;
          background: #1a1a2e;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          width: 100%;
        }
        .settings label {
          color: #fff;
          font-size: 14px;
          margin: 5px 0;
        }
        .settings input,
        .settings select {
          padding: 10px;
          font-size: 14px;
          border-radius: 5px;
          border: 1px solid #ccc;
          margin-bottom: 10px;
          width: 100%;
        }
        .start-button {
          background: #e94560;
          color: #fff;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
          margin-top: 10px;
        }
        .start-button:hover {
          background: #c81d4e;
        }

        .bracket {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .round {
          display: flex;
          justify-content: space-around;
          width: 100%;
          margin-top: 20px;
        }
        .final-round {
          display: flex;
          justify-content: center;
          width: 100%;
          margin-top: 20px;
        }

        .quarter-finals .match {
          border: 3px solid black;
        }

        .semi-finals .match {
          border: 3px solid black;
        }

        .finals .match {
          border: 3px solid black;
        }

        .next-match-button {
          background: #e94560;
          color: #fff;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
          margin-top: 20px;
        }
        .next-match-button:hover {
          background: #c81d4e;
        }
        .winner-message {
          text-align: center;
          color: #fff;
          margin-top: 20px;
          font-size: 24px;
        }
        .back-button {
          background: #e94560;
          color: #fff;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
          margin-top: 20px;
        }
        .back-button:hover {
          background: #c81d4e;
        }
        @keyframes glow {
          0% {
            text-shadow: 0 0 5px #e94560, 0 0 10px #e94560, 0 0 20px #e94560, 0 0 40px #e94560, 0 0 80px #e94560;
          }
          50% {
            text-shadow: 0 0 20px #e94560, 0 0 40px #e94560, 0 0 80px #e94560, 0 0 160px #e94560;
          }
          100% {
            text-shadow: 0 0 5px #e94560, 0 0 10px #e94560, 0 0 20px #e94560, 0 0 40px #e94560, 0 0 80px #e94560;
          }
        }
        .winner {
          font-size: 24px;
          font-weight: bold;
          color: #e94560;
          text-align: center;
          animation: glow 1s infinite alternate;
        }
        .winner-name {
          font-size: 28px;
          font-weight: bold;
          color: #f1c40f;
          animation: glow 1s infinite alternate;
        }
        @media (max-width: 768px) {
          .round, .final-round {
            flex-direction: column;
            align-items: center;
          }
          .match {
            width: 90%;
          }
          .settings {
            width: 90%;
          }
      </style>
      <div role="alert" id="status-alert">
      </div>
      <div class="tournament">
        ${!tournamentStarted ? `
        <button id="toggle-settings" class="start-button" translate-id="toggleSettings">Ayarları Aç</button>
        <div class="settings" id="tournament-settings">
          <h2 style="color: #fff;" translate-id="tournamentSettingsHeader">Turnuva Ayarları</h2>
          <label for="scoreToWin">Score To Win: <span id="scoreToWinValue">13</span></label>
            <input type="range" id="scoreToWin" min="1" max="31" value="13">

            <label for="leftPaddleColor" translate-id="leftPaddleColorLabel">Left Paddle Color:</label>
            <input type="color" id="leftPaddleColor" value="#00ff00">
            <label for="rightPaddleColor" translate-id="rightPaddleColorLabel">Right Paddle Color:</label>
            <input type="color" id="rightPaddleColor" value="#ff00ff">
            <label for="paddleSize" translate-id="paddleSizeLabel">Paddle Size:</label>
            <select id="paddleSize">
                <option value="2" translate-id="paddleSizeSmall">Small</option>
                <option value="3" selected translate-id="paddleSizeMedium">Medium</option>
                <option value="4" translate-id="paddleSizeLarge">Large</option>
            </select>
            <label for="paddleSpeed" translate-id="paddleSpeedLabel">Paddle Speed:</label>
            <select id="paddleSpeed">
                <option value="8" translate-id="paddleSpeedSlow">Slow</option>
                <option value="10" selected translate-id="paddleSpeedMedium">Medium</option>
                <option value="12" translate-id="paddleSpeedFast">Fast</option>
            </select>

            <label for="ballColor" translate-id="ballColorLabel">Ball Color:</label>
            <input type="color" id="ballColor" value="#ffffff">
            <label for="ballSpeed" translate-id="ballSpeedLabel">Ball Speed:</label>
            <select id="ballSpeed">
                <option value="0.1" translate-id="ballSpeedSlow">Slow</option>
                <option value="0.2" selected translate-id="ballSpeedMedium">Medium</option>
                <option value="0.3" translate-id="ballSpeedFast">Fast</option>
            </select>
            <label for="ballSize" translate-id="ballSizeLabel">Ball Size:</label>
            <select id="ballSize">
                <option value="0.17" translate-id="ballSizeSmall">Small</option>
                <option value="0.25" selected translate-id="ballSizeMedium">Medium</option>
                <option value="0.3" translate-id="ballSizeLarge">Large</option>
            </select>
            <label for="ballMultiplier">Ball Multiplier: <span id="ballMultiplierValue">1.1</span></label>
            <input type="range" id="ballMultiplier" value="1.1" step="0.01" min="1" max="2">

            <label for="mapTheme" translate-id="mapThemeLabel">Map Theme:</label>
            <select id="mapTheme">
                <option value="dark" translate-id="mapThemeDark">Dark</option>
                <option value="light" translate-id="mapThemeLight">Light</option>
                <option value="forest" translate-id="mapThemeForest">Forest</option>
                <option value="ocean" translate-id="mapThemeOcean">Ocean</option>
                <option value="sunset" translate-id="mapThemeSunset">Sunset</option>
                <option value="desert" translate-id="mapThemeDesert">Desert</option>
                <option value="pastel" translate-id="mapThemePastel">Pastel</option>
            </select>

            <label for="ballTail" translate-id="ballTailLabel">Ball Tail:</label>
            <select id="ballTail">
                <option value="true" translate-id="ballTailOn">On</option>
                <option value="false" translate-id="ballTailOff">Off</option>
            </select>

            <label for="cameraShake" translate-id="cameraShakeLabel">Camera Shake:</label>
            <select id="cameraShake">
                <option value="true" translate-id="cameraShakeOn">On</option>
                <option value="false" translate-id="cameraShakeOff">Off</option>
            </select>

            <label for="confetti" translate-id="confettiLabel">Confetti:</label>
            <select id="confetti">
                <option value="true" translate-id="confettiOn">On</option>
                <option value="false" translate-id="confettiOff">Off</option>
            </select>
        </div>
        ` : ''}

        <div class="bracket">
          <div class="round quarter-finals" id="quarter-finals">
          </div>
          <div class="round semi-finals" id="semi-finals">
            <div id="semi-finals-left"></div>
            <div id="semi-finals-right"></div>
          </div>
          <div class="final-round finals" id="finals">
          </div>
        </div>
        <button class="start-button" id="start-game" style="display: ${!tournamentStarted ? 'block' : 'none'};" translate-id="startTournament">Turnuvayı Başlat</button>
        <button class="next-match-button" id="next-match-button" style="display: ${tournamentStarted ? 'block' : 'none'};" translate-id="nextMatch">Sıradaki Maç</button>
        <button class="next-match-button" id="finish-tournament-button" style="display: ${tournamentStarted ? (tournamentData.tournamentWinner ? 'none' : 'block') : 'none'};" translate-id="finishTournament">Turnuvayı Bitir</button>
        <div class="winner-message" id="winner-message" style="display: none;">
          <h2 translate-id="tournamentEnded">Turnuva Bitti!</h2>
          <p><span translate-id="winner">Kazanan:</span> <span class="winner-name" id="tournament-winner"></span></p>
          <button class="back-button" id="back-button" translate-id="backButton">Geri Dön</button>
        </div>
      </div>
    `;

    document.getElementById('finish-tournament-button').addEventListener('click', () => {
      localStorage.removeItem('tournamentData');
      location.reload();
    });

    function createMatchElement(match, index, editable = true) {
      const matchElement = document.createElement('div');
      matchElement.classList.add('match');
      if (match.finished) {
        const winner = match.winner === 1 ? match.player1 : match.player2;
        matchElement.innerHTML = `
          <h3 class="match-index"><span translate-id="matchIndex">Match</span> ${index + 1}</h3>
          <div class="winner">${winner}</div>
        `;
      } else {
        matchElement.innerHTML = `
          <h3 class="match-index"><span translate-id="matchIndex">Match</span> ${index + 1}</h3>
          <div class="fighter" id="player1-${index}">
            <img src="${match.player1Avatar}" alt="Player 1">
            <div class="username">${match.player1}</div>
            ${editable && match.player1 !== username ? `<button class="edit-button" onclick="editName(${index}, 1)" translate-id="edit">Edit</button>` : ''}
            <div class="edit-form" id="edit-form-${index}-1">
              <input type="text" id="edit-input-${index}-1" value="${match.player1}">
              <button onclick="saveName(${index}, 1)" translate-id="save">Save</button>
            </div>
          </div>
          <div class="vs" translate-id="vs">VS</div>
          <div class="fighter" id="player2-${index}">
            <img src="${match.player2Avatar}" alt="Player 2">
            <div class="username">${match.player2}</div>
            ${editable && !tournamentStarted ? `<button class="edit-button" onclick="editName(${index}, 2)" translate-id="edit">Edit</button>` : ''}
            <div class="edit-form" id="edit-form-${index}-2">
              <input type="text" id="edit-input-${index}-2" value="${match.player2}">
              <button onclick="saveName(${index}, 2)" translate-id="save">Save</button>
            </div>
          </div>
        `;
      }
      return matchElement;
    }

    const quarterFinalsContainer = document.getElementById('quarter-finals');
    semifinals.forEach((match, index) => {
      const matchElement = createMatchElement(match, index, !tournamentStarted);
      quarterFinalsContainer.appendChild(matchElement);
    });

    const semiFinalsLeftContainer = document.getElementById('semi-finals-left');
    const semiFinalsRightContainer = document.getElementById('semi-finals-right');

    const finalsContainer = document.getElementById('finals');
    const matchElement = createMatchElement(finals[0], 0, false);
    finalsContainer.appendChild(matchElement);
    if (tournamentStarted) {
      const matchElements = document.querySelectorAll('.match');
      const currentMatch = matchElements[currentMatchIndex];
      if (currentMatch) {
        currentMatch.classList.add('highlight');
      }
    }
    if (!tournamentStarted) {
      document.getElementById('start-game').addEventListener('click', () => {
        let gameSettings = {
          scoreToWin: document.getElementById('scoreToWin').value,
          leftPaddleColor: document.getElementById('leftPaddleColor').value,
          rightPaddleColor: document.getElementById('rightPaddleColor').value,
          paddleSize: document.getElementById('paddleSize').value,
          paddleSpeed: document.getElementById('paddleSpeed').value,
          ballColor: document.getElementById('ballColor').value,
          ballSpeed: document.getElementById('ballSpeed').value,
          ballSize: document.getElementById('ballSize').value,
          ballSpeedIncrease: document.getElementById('ballMultiplier').value,
          mapTheme: document.getElementById('mapTheme').value,
          ballTail: document.getElementById('ballTail').value,
          cameraShake: document.getElementById('cameraShake').value,
          confetti: document.getElementById('confetti').value
        };
        localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
        document.getElementById('start-game').style.display = 'none';
        document.getElementById('toggle-settings').style.display = 'none';
        document.getElementById('tournament-settings').style.display = 'none';
        document.getElementById('next-match-button').style.display = 'block';
        document.querySelectorAll('.edit-button').forEach(button => button.style.display = 'none');
        tournamentData.tournamentStarted = true;
        localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
        document.getElementById('finish-tournament-button').style.display = 'block';
        highlightNextMatch();
      });

      document.getElementById('toggle-settings').addEventListener('click', () => {
        const settingsDiv = document.getElementById('tournament-settings');
        const toggleButton = document.getElementById('toggle-settings');
        if (settingsDiv.style.display === 'none' || settingsDiv.style.display === '') {
          settingsDiv.style.display = 'flex';
          toggleButton.textContent = translations[localStorage.getItem('selectedLanguage')]['closeSettings'];
        } else {
          settingsDiv.style.display = 'none';
          toggleButton.textContent = translations[localStorage.getItem('selectedLanguage')]['openSettings'];
        }
      });
    }

    document.getElementById('next-match-button').addEventListener('click', () => {
      console.log('next match');
      const matchElements = document.querySelectorAll('.match');
      if (currentMatchIndex < matchElements.length) {
        const currentMatch = matchElements[currentMatchIndex];
        currentMatch.classList.remove('highlight');
        startGame(currentMatch.querySelector('.username').textContent, currentMatch.querySelectorAll('.username')[1].textContent, currentMatchIndex);
      }
    });

    if (!tournamentData.tournamentStarted)
    {
      document.getElementById('scoreToWin').addEventListener('input', () => {
        document.getElementById('scoreToWinValue').textContent = document.getElementById('scoreToWin').value;
      });
  
      document.getElementById('ballMultiplier').addEventListener('input', () => {
        document.getElementById('ballMultiplierValue').textContent = document.getElementById('ballMultiplier').value;
      });
    }

    function highlightNextMatch() {
      const matchElements = document.querySelectorAll('.match');
      if (currentMatchIndex < matchElements.length) {
        const nextMatch = matchElements[currentMatchIndex];
        nextMatch.classList.add('highlight');
      }
    }

    if (tournamentStarted && tournamentData.tournamentWinner) {
      document.getElementById('winner-message').style.display = 'block';
      document.getElementById('tournament-winner').textContent = tournamentData.tournamentWinner;
      document.getElementById('next-match-button').style.display = 'none';
      localStorage.removeItem('tournamentData');
      localStorage.removeItem('gameSettings');
    }

    function startGame(player1, player2, matchIndex) {
      maincontent.innerHTML = `
        <style>
          .arena {
            background: #16213e;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 20px auto;
            max-width: 600px;
            position: relative;
          }
          .fighters {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
          }
          .fighter {
            text-align: center;
          }
          .fighter img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            border: 3px solid #0f3460;
          }
          .vs {
            font-size: 48px;
            font-weight: bold;
            margin: 0 20px;
            color: #e94560;
          }
          .username {
            margin-top: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #fff;
          }
          #startButton, #loginButton, #logoutButton, #uploadButton {
            background: #e94560;
            color: #fff;
            border: none;
            padding: 10px 20px;
            font-size: 18px;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
          }
          #startButton:hover, #loginButton:hover, #logoutButton:hover, #uploadButton:hover {
            background: #c81d4e;
          }
          #loginForm {
            display: none;
            flex-direction: column;
            align-items: center;
            background: #1a1a2e;
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
          }
          #loginForm input {
            margin-bottom: 10px;
            padding: 10px;
            font-size: 16px;
            border-radius: 5px;
            border: 1px solid #ccc;
            width: 100%;
          }
          #submitLogin {
            background: #e94560;
            color: #fff;
            border: none;
            padding: 10px 20px;
            font-size: 18px;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
          }
          #submitLogin:hover {
            background: #c81d4e;
          }
          .button-container {
            text-align: center;
            margin-top: 20px;
          }
          #settingsMenu {
            display: none;
            margin-top: 20px;
            background: #1a1a2e;
            padding: 20px;
            border-radius: 10px;
            text-align: left;
          }
          #settingsMenu label {
            display: block;
            margin-bottom: 10px;
            color: #fff;
          }
          #settingsMenu input, #settingsMenu select {
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
            border: 1px solid #ccc;
          }
          #scoreToWinValue {
            color: #fff;
            margin-top: 10px;
          }
          #scoreboard {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            border: 2px solid #fff;
            border-radius: 10px;
            padding: 10px 20px;
            color: #ffffff;
            font-size: 24px;
            text-align: center;
            z-index: 100;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          }
          #scoreboard .player {
            display: inline-block;
            vertical-align: middle;
            text-align: center;
            margin: 0 10px;
          }
          #scoreboard .player img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid #fff;
            margin-bottom: 5px;
          }
          #scoreboard .player .username {
            font-size: 16px;
            color: #fff;
          }
          #scoreboard .divider {
            margin: 0 10px;
            color: #ff00ff; 
          }
          #game-over{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.7);
            border: 2px solid #fff;
            border-radius: 10px;
            padding: 20px;
            color: #ffffff;
            font-size: 24px;
            text-align: center;
            z-index: 100;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            display: block;
            margin-left: auto;
            margin-right: auto;
            align-items: center;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        </style>

        <div id="game-container">  
          <div id="scoreboard">
            <div class="player">
              <img src="${tournamentData.semifinalsFinished ? finals[0].player1Avatar : semifinals[matchIndex].player1Avatar}" alt="Player 1">
              <div class="username">${player1}</div>
              <span id="player1-score">0</span>
            </div>
            <span class="divider">-</span>
            <div class="player">
              <img src="${tournamentData.semifinalsFinished ? finals[0].player2Avatar : semifinals[matchIndex].player2Avatar}" alt="Player 2">
              <div class="username">${player2}</div>
              <span id="player2-score">0</span>
            </div>
          </div>
          <div id="game-over" style="display: none;">
            <div id="game-over-text">
              <h1 translate-id="gameOver">Game Over</h1>
            </div>
            <button id="restart-button" translate-id="restart" class="button-24">Return Tournament</button>
          </div>
        </div>
      `;

      localTournamentGame = new PongGame('game-container');

      document.getElementById('restart-button').addEventListener('click', () => {
        if (!semifinals[0].finished) {
          console.log('restart');
          tournamentData.semifinals[0].finished = true;

          tournamentData.semifinals[0].winner = localTournamentGame.winner === 0 ? 1 : 2;
          if (localTournamentGame.winner === 0) {
            tournamentData.finals[0].player1 = tournamentData.semifinals[0].player1;
            tournamentData.finals[0].player1Avatar = tournamentData.semifinals[0].player1Avatar;
          } else {
            tournamentData.finals[0].player1 = tournamentData.semifinals[0].player2;
            tournamentData.finals[0].player1Avatar = tournamentData.semifinals[0].player
          }
          tournamentData.currentMatchIndex++;
          localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
          localTournamentRender();
        } else if (!semifinals[1].finished) {
          console.log('restart');
          tournamentData.semifinals[1].finished = true;
          tournamentData.semifinals[1].winner = localTournamentGame.winner === 0 ? 1 : 2;
          tournamentData.semifinalsFinished = true;
          if (localTournamentGame.winner === 0) {
            tournamentData.finals[0].player2 = tournamentData.semifinals[1].player1;
            tournamentData.finals[0].player2Avatar = tournamentData.semifinals[1].player1Avatar;
          } else {
            tournamentData.finals[0].player2 = tournamentData.semifinals[1].player2;
            tournamentData.finals[0].player2Avatar = tournamentData.semifinals[1].player2Avatar;
          }
          tournamentData.currentMatchIndex++;
          localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
          localTournamentRender();
        } else if (!finals[0].finished) {
          console.log('restart');
          finals[0].finished = true;
          tournamentData.currentMatchIndex++;
          tournamentData.finals[0].winner = localTournamentGame.winner === 0 ? 1 : 2;
          if (localTournamentGame.winner === 0) {
            tournamentData.tournamentWinner = tournamentData.finals[0].player1;
          } else {
            tournamentData.tournamentWinner = tournamentData.finals[0].player2;
          }
          localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
          localTournamentRender();
        }
        localTournamentGame.stopAnimation();
        localTournamentGame = null;
      });

      highlightNextMatch();
    }

    document.getElementById('back-button').addEventListener('click', () => {
      localStorage.removeItem('tournamentData');
      location.reload();
    });

    window.editName = (index, player) => {
      document.getElementById(`edit-form-${index}-${player}`).style.display = 'flex';
      document.getElementById(`edit-input-${index}-${player}`).focus();
      document.querySelector('#edit-input-' + index + '-' + player).addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          saveName(index, player);
        }
      });
    }

    window.saveName = (index, player) => {
      const newName = document.getElementById(`edit-input-${index}-${player}`).value;
      const otherPlayers = [];
      semifinals.forEach((match, i) => {
        if (i !== index) {
          otherPlayers.push(match.player1);
          otherPlayers.push(match.player2);
        }
      });
      if (finals[0].player1 !== '?') {
        otherPlayers.push(finals[0].player1);
      }
      if (finals[0].player2 !== '?') {
        otherPlayers.push(finals[0].player2);
      }
      if (otherPlayers.includes(newName)) {
        showAlert('Name already taken by another player', 1);
        return;
      }
      if (player === 1) {
        tournamentData.semifinals[index].player1 = newName;
      } else {
        tournamentData.semifinals[index].player2 = newName;
      }
      localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
      localTournamentRender();
    }

  } catch (error) {
    console.error(error);
  }

  changeLanguage();
}