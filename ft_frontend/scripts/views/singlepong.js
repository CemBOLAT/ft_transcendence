const renderSinglePong = () => {
    maincontent.innerHTML = `
    <link rel="stylesheet" href="styles/singlepong/style.css">

    <div id="game-container">  
        <div id="scoreboard"><span id="player1-score">0</span><span class="divider">-</span><span id="player2-score">0</span></div>
        <div id="game-over" style="display: none;">
            <div id="game-over-text">
            <h1>Game Over</h1>
            </div>
            <button id="restart-button" class="button-24">Restart</button>
        </div>
    </div> 
    `

    document.getElementById("restart-button").addEventListener("click", () => {
        document.getElementById("game-over").style.display = "none";
        document.getElementById("player1-score").innerText = 0;
        document.getElementById("player2-score").innerText = 0;
        localPongGame.restartGame();
    }
    );

    localPongGame = new PongGame("game-container");

    //changeLanguage();
}
