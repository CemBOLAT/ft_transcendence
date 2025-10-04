(function(){
    const canvas = document.getElementById("pong");
    const ctx = canvas.getContext("2d");
    let pauseResumeBtn = null;
    let interval = null;
    let matchIsOver = false;

    let ballVelocityGeneral = 5;

    // mobil için movement işi var!

    canvas.width = 1280;
    canvas.height = 720;

    const pong = {
        endPoit : -1,
        ball: {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 10,
            speed: ballVelocityGeneral,
            velocityX: ballVelocityGeneral,
            velocityY: ballVelocityGeneral,
            color: "WHITE",
        },
        // paddle
        paddle: {
            width: 10,
            height: 100,
            x: 0,
            y: canvas.height / 2 - 50,
            color: "WHITE",
            score: 0,
            computerLevel : 0.04,
        },
        // opponent paddle
        opponent: {
            width: 10,
            height: 100,
            x: canvas.width - 10,
            y: canvas.height / 2 - 50,
            color: "WHITE",
            score: 0,
        },
        // net
        net: {
            x: canvas.width / 2 - 1,
            y: 0,
            width: 2,
            height: 10,
            color: "WHITE",
        },
        };

    // draw net
    function drawNet() {
        for (let i = 0; i <= canvas.height; i += 15) {
            drawRect(pong.net.x, pong.net.y + i, pong.net.width, pong.net.height, pong.net.color);
        }
    }

    // draw text
    function drawText(text, x, y) {
        ctx.fillStyle = "#FFF";
        ctx.font = "75px fantasy";
        ctx.fillText(text, x, y);
    }

    // draw rect

    function drawRect(x, y, w, h, color) {

        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    // draw circle

    function drawCircle(x, y, r, color) {

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    }

    // render game

    function render() {
        // clear canvas
        drawRect(0, 0, canvas.width, canvas.height, "BLACK");

        // draw net
        drawNet();

        // draw score
        drawText(pong.paddle.score, canvas.width / 4, canvas.height / 5);
        drawText(pong.opponent.score, 3 * canvas.width / 4, canvas.height / 5);

        // draw paddles
        drawRect(pong.paddle.x, pong.paddle.y, pong.paddle.width, pong.paddle.height, pong.paddle.color);
        drawRect(pong.opponent.x, pong.opponent.y, pong.opponent.width, pong.opponent.height, pong.opponent.color);

        // draw ball
        drawCircle(pong.ball.x, pong.ball.y, pong.ball.radius, pong.ball.color);
    }

    // game loop
    function game() {
        render();

        // ball movement
        pong.ball.x += pong.ball.velocityX;
        pong.ball.y += pong.ball.velocityY;

        // ai movement
        pong.opponent.y += (pong.ball.y - (pong.opponent.y + pong.opponent.height / 2)) * pong.opponent.computerLevel;

        // collision detection
        let player = pong.paddle;
        let opponent = pong.opponent;
        let ball = pong.ball;

        // ball collision with top and bottom walls
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.velocityY = -ball.velocityY;
        }

        // ball collision with paddles
        let playerCollision = ball.x < canvas.width / 2 ? player : opponent;

        if (collision(ball, playerCollision)) {
            let collidePoint = ball.y - (playerCollision.y + playerCollision.height / 2);
            collidePoint = collidePoint / (playerCollision.height / 2);

            let angleRad = (Math.PI / 4) * collidePoint;

            let direction = ball.x < canvas.width / 2 ? 1 : -1;

            ball.velocityX = direction * ball.speed * Math.cos(angleRad);
            ball.velocityY = ball.speed * Math.sin(angleRad);

            ball.speed += 0.5;
        }

        // update score
        if (ball.x - ball.radius < -ball.radius) {
            pong.opponent.score++;
            if (pong.opponent.score >= pong.endPoit)
            {
                matchIsOver = true;
                pauseResumeBtn.innerHTML = "Start";
                render();
                drawText("You Lose", canvas.width / 2 - 100, canvas.height / 2);
                clearInterval(interval);
            }
            resetBall();
        } else if (ball.x + ball.radius > canvas.width + ball.radius) {
            pong.paddle.score++;
            if (pong.paddle.score >= pong.endPoit)
            {
                pauseResumeBtn.innerHTML = "Start";
                matchIsOver = true;
                render();
                drawText("You Win", canvas.width / 2 - 100, canvas.height / 2);
                clearInterval(interval);
            }
            resetBall();
        }
    }

    function resetBall() {
        pong.ball.x = canvas.width / 2;
        pong.ball.y = canvas.height / 2;
        pong.ball.speed = ballVelocityGeneral;
        pong.ball.velocityX = -pong.ball.velocityX;
        pong.ball.velocityY = -pong.ball.velocityY;
    }

    function collision(b, p) {
        p.top = p.y;
        p.bottom = p.y + p.height;
        p.left = p.x;
        p.right = p.x + p.width;

        b.top = b.y - b.radius;
        b.bottom = b.y + b.radius;
        b.left = b.x - b.radius;
        b.right = b.x + b.radius;

        return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
    }

    // players paddle movement

    function movePaddle(evt) {
        let rect = canvas.getBoundingClientRect();

        pong.paddle.y = evt.clientY - rect.top - pong.paddle.height / 2;
    }

    document.querySelector("#startgamebtn").addEventListener("click", function(e) {
        e.preventDefault();
        const ballVelocity = document.querySelector("#ballvelocity").value;
        const endGame = document.querySelector("#endPoint").value;
        const singlegamesettings = document.querySelector("#singlegamesettings");
        const framePerSecond = 60;
        document.querySelector('.content').remove();
        document.querySelector("#canvas-container").setAttribute("style", "display: block;")
        pong.ball.velocityX = Number(ballVelocity);
        pong.ball.velocityY = Number(ballVelocity);
        pong.ball.speed = Number(ballVelocity);
        pong.paddle.score = 0;
        pong.opponent.score = 0;
        pong.endPoit = Number(endGame);
        ballVelocityGeneral = Number(ballVelocity);
        if (interval)
        {
            clearInterval(interval);
        }
        if (!pauseResumeBtn)
        {
                pauseResumeBtn = document.querySelector("#pauseResumeBtn");
                pauseResumeBtn.addEventListener("click", function(e) {
                    e.preventDefault();
                    if (matchIsOver)
                    {
                        pong.paddle.score = 0;
                        pong.opponent.score = 0;
                        matchIsOver = false;
                        resetBall();
                        interval = setInterval(game, 1000 / framePerSecond);
                    }
                    else
                    {
                        if (interval)
                        {
                            clearInterval(interval);
                            pauseResumeBtn.innerHTML = "Resume";
                            interval = null;
                        }
                        else
                        {
                            interval = setInterval(game, 1000 / framePerSecond);
                            pauseResumeBtn.innerHTML = "Pause";
                        }
                    }
            });
        }
        interval = setInterval(game, 1000 / framePerSecond);
        singlegamesettings.setAttribute("style", "display: none;");
    });

    const aiDifficultySlider = document.getElementById('aiDifficulty');
    const aiDifficultyValue = document.getElementById('aiDifficultyValue');

    document.querySelector("#canvas-container").setAttribute("style", "display: none;")

    canvas.addEventListener("mousemove", movePaddle);

    aiDifficultyValue.textContent = parseInt(aiDifficultySlider.value / 20);
    pong.opponent.computerLevel = parseFloat(aiDifficultySlider.value) / 1000;
    aiDifficultySlider.addEventListener('input', function() {
        aiDifficultyValue.textContent = parseInt(this.value / 20);
        pong.opponent.computerLevel = parseFloat(this.value) / 1000;
    });
})()