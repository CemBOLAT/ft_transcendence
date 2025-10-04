const localGameRender = async () => {
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
      let opponentAvatarSrc = "/imgs/42.webp";
      let opponentUsername = "";

      showAuthDiv(true);
      maincontent.innerHTML = `
        <style>
        .arena {
          background: #16213e;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          margin: 20px auto;
          max-width: 600px;
        }
        .fighters {
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
        }
        .fighter {
          text-align: center;
          margin: 10px;
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
          align-items: center; /* Centers the text vertically */
        }
        .username {
          margin-top: 10px;
          font-size: 18px;
          font-weight: bold;
          color: #fff;
        }
        #startButton, #loginButton, #logoutButton, #uploadButton, #openSettingsButton, #closeSettingsButton {
          background: #e94560;
          color: #fff;
          border: none;
          padding: 10px 20px;
          font-size: 18px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }
        #startButton:hover, #loginButton:hover, #logoutButton:hover, #uploadButton:hover, #openSettingsButton:hover, #closeSettingsButton:hover {
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
      
        /* Media Queries */
        @media (max-width: 600px) {
          .arena {
            padding: 10px;
          }
          .fighters {
            flex-direction: column;
          }
          .vs {
            font-size: 24px;
            margin: 10px 0;
          }
          .fighter img {
            width: 100px;
            height: 100px;
          }
          .username {
            font-size: 16px;
          }
          #scoreboard {
            top: 10px;
            padding: 5px 10px;
            font-size: 18px;
          }
          #scoreboard .player img {
            width: 30px;
            height: 30px;
          }
          #scoreboard .player .username {
            font-size: 14px;
          }
        }
      </style>
    
      <div role="alert" id="status-alert">
      </div>
      <div class="arena container">
          <div class="fighters">
            <div class="fighter">
              <img src="/api/media/avatars/${username}.jpg" width="150" height="150">
              <p class="username">${username}</p>
            </div>
            <div class="vs">VS</div>
            <div class="fighter" id="secondFighter">
              <button translate-id="addopponent" id="loginButton">Add Opponent</button>
            </div>
          </div>
          <div id="loginForm">
              <input translate-id="opponentUsername" type="text" id="opponentUsername" placeholder="Opponent Username">
              <button translate-id="addopponent" id="submitLogin">Add Opponent</button>
          </div>
          <div class="button-container">
              <button id="openSettingsButton"  style="display: none;" translate-id="OpenSettings">Open Settings</button>
              <button id="closeSettingsButton" style="display: none;">Close Settings</button>
          </div>
          <div id="settingsMenu">
              <label for="scoreToWin">Score To Win: <span id="scoreToWinValue">13</span></label>
              <input type="range" id="scoreToWin" min="1" max="31" value="13">

              <label for="leftPaddleColor" translate-id="leftPaddleColorLabel">Left Paddle Color:</label>
              <input type="color" id="leftPaddleColor" value="#00ff00">
              <label for="rightPaddleColor" translate-id="rightPaddleColorLabel">Right Paddle Color:</label>
              <input type="color" id="rightPaddleColor" value="#ff00ff">
              <label for="paddleSize" translate-id="paddleSizeLabel">Paddle Size:</label>
              <select id="paddleSize">
                  <option value="2" translate-id="paddleSizeSmall">Small</option>
                  <option value="3" translate-id="paddleSizeMedium"selected>Medium</option>
                  <option value="4" translate-id="paddleSizeLarge">Large</option>
              </select>
              <label for="paddleSpeed" translate-id="paddleSpeedLabel">Paddle Speed:</label>
              <select id="paddleSpeed">
                  <option value="8" translate-id="paddleSpeedSlow">Slow</option>
                  <option value="10"translate-id="paddleSpeedMedium" selected>Medium</option>
                  <option value="12"translate-id="paddleSpeedFast">Fast</option>
              </select>

              <label for="ballColor" translate-id="ballColorLabel">Ball Color:</label>
              <input type="color" id="ballColor" value="#ffffff">
              <label for="ballSpeed" translate-id="ballSpeedLabel">Ball Speed:</label>
              <select id="ballSpeed">
                  <option value="0.1" translate-id="ballSpeedSlow">Slow</option>
                  <option value="0.2" translate-id="ballSpeedMedium"selected>Medium</option>
                  <option value="0.3" translate-id="ballSpeedFast">Fast</option>
              </select>
              <label for="ballSize" translate-id="ballSizeLabel">Ball Size:</label>
              <select id="ballSize">
                  <option value="0.17" translate-id="ballSizeSmall">Small</option>
                  <option value="0.25" translate-id="ballSizeMedium"selected>Medium</option>
                  <option value="0.3"  translate-id="ballSizeLarge">Large</option>
              </select>
              <label for="ballMultiplier" >Ball Multiplier: <span id="ballMultiplierValue">1.1</span></label>
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
          <div class="button-container">
              <button id="startButton" style="display: none;" translate-id="StartGame">Start Game</button>
          </div>
          
      </div>
  `;
  await checkImgJs();
  document.getElementById('loginButton').addEventListener('click', () => {
      document.getElementById('loginForm').style.display = 'flex';
  });

  document.getElementById('opponentUsername').addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        await add_opponent();
      }
  });


  async function add_opponent() {
    opponentUsername = document.getElementById('opponentUsername').value;

      if (opponentUsername) {
          document.getElementById('secondFighter').innerHTML = `
              <img id="opponentAvatar" src="/imgs/42.webp" width="150" height="150">
              <p class="username">${opponentUsername}</p>
              <button translate-id="uploadImage" id="uploadButton">Upload Image</button>
              <button translate-id="removeOpponent" id="logoutButton">Remove Opponent</button>
              <input type="file" id="imageUpload" style="display: none;">
          `;
          document.getElementById('loginForm').style.display = 'none';
          document.getElementById('startButton').style.display = 'block';
          document.getElementById('openSettingsButton').style.display = 'block';

          // Add event listener for image upload button
          document.getElementById('uploadButton').addEventListener('click', () => {
              document.getElementById('imageUpload').click();
          });

          document.getElementById('imageUpload').addEventListener('change', (event) => {
              const file = event.target.files[0];
              if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                      opponentAvatarSrc = e.target.result;
                      document.getElementById('opponentAvatar').src = opponentAvatarSrc;
                  };
                  reader.readAsDataURL(file);
              }
          });

          // Add remove opponent event listener
          document.getElementById('logoutButton').addEventListener('click', () => {
              opponentAvatarSrc = `/imgs/42.webp`;
              document.getElementById('openSettingsButton').style.display = 'none';
              document.getElementById('closeSettingsButton').style.display = 'none';
              document.getElementById('secondFighter').innerHTML = `<button id="loginButton" translate-id="addopponent">Add Opponent</button>`;
              document.getElementById('loginButton').addEventListener('click', () => {
                  document.getElementById('loginForm').style.display = 'flex';
              });
              document.getElementById('startButton').style.display = 'none';
              document.getElementById('settingsMenu').style.display = 'none';

              document.getElementById('opponentUsername').value = '';
              changeLanguage();
          });
      } else {
          showAlert('Please enter an opponent username', 1);
      }
      changeLanguage()
  }

  document.getElementById('submitLogin').addEventListener('click', async () => {
    await add_opponent();
  });

  document.getElementById('scoreToWin').addEventListener('input', (event) => {
      document.getElementById('scoreToWinValue').textContent = event.target.value;
  });

  document.getElementById('ballMultiplier').addEventListener('input', (event) => {
      document.getElementById('ballMultiplierValue').textContent = event.target.value;
  });

  document.getElementById('openSettingsButton').addEventListener('click', () => {
      document.getElementById('settingsMenu').style.display = 'block';
      document.getElementById('openSettingsButton').style.display = 'none';
      document.getElementById('closeSettingsButton').style.display = 'block';
  });
3
  document.getElementById('closeSettingsButton').addEventListener('click', () => {
      document.getElementById('settingsMenu').style.display = 'none';
      document.getElementById('openSettingsButton').style.display = 'block';
      document.getElementById('closeSettingsButton').style.display = 'none';
  });

  document.getElementById('startButton').addEventListener('click', async () => {
    document.getElementById('settingsMenu').style.display = 'none';
    
    setTimeout(async () => {
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
                      <img id="opponentAvatar" src="${opponentAvatarSrc}" alt="Player 2">
                      <div class="username">${opponentUsername}</div>
                      <span id="player2-score">0</span>
                  </div>
              </div>
              <div id="game-over" style="display: none;">
                  <div id="game-over-text">
                  <h1 translate-id="game-over">Game Over</h1>
                  </div>
                  <button id="restart-button" class="button-24" translate-id="restart">restart</button>
              </div>
          </div>
      `;

      document.getElementById('restart-button').addEventListener('click', () => {
          document.getElementById('game-over').style.display = 'none';
          document.getElementById('player1-score').textContent = '0';
          document.getElementById('player2-score').textContent = '0';
          localPongGame.restartGame();
      }
      );

      changeLanguage();

      await checkImgJs();
      localPongGame = new PongGame('game-container');
    }, 1000);
  });

  } catch (error) {
      console.error(error);
  }
  changeLanguage();
}
