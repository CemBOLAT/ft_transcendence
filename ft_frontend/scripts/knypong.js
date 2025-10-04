class PongGame
{
    constructor(container_id)
    {
        this.container_id = container_id;
        this.animationFrameId = null;
        this.gameOver = false;
        this.tailParticles = [];
        this.spectators = [];
        this.confettiParticles = [];
        this.player1Score = 0;
        this.player2Score = 0;
        this.spectatorJumpTime = 0;
        this.keys = {};
        this.lastTime = 0;
        this.confettiIntervalId = null;
        this.cameraShakeActive = false;
        this.cameraShakeId = null;
        this.winner = null;
        this.aiZRandom = 0;

        const localStorageSettings = localStorage.getItem('gameSettings');
        this.gameSettings = JSON.parse(localStorageSettings);

        if (!this.gameSettings)
        {
            this.defaultGameSettings();
        }
        else
        {
            this.gameSettings.aiActive = false;
        }

        this.ballSpeed = this.gameSettings.ballSpeed;

        this.initSettings();
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initLights();
        this.initGameElements();
        this.addEventListeners();

        this.animate(0);
    }

    defaultGameSettings()
    {
        this.gameSettings = {
            scoreToWin: 7,
            cameraShake: 'true',
            ballSize: 0.25,
            ballSpeed: 0.2,
            ballColor: 0xffffff,
            ballTail: 'true',
            ballSpeedIncrease: 1.1,
            leftPaddleColor: 0xff0000,
            rightPaddleColor: 0x0000ff,
            paddleSize: 3,
            paddleSpeed: 10,
            confetti: 'true',
            mapTheme: 'dark',
            aiActive: 'true'
        };
        this.ballSpeed = this.gameSettings.ballSpeed;
    }

    initSettings()
    {
        this.cameraSettings = {
            fov: 75,
            near: 0.1,
            far: 1000,
            position: { x: 0, y: 30, z: 15 },
            lookAt: { x: 0, y: 0, z: 0 },
            shake: {
                isActive: this.gameSettings.cameraShake === 'true',
                intensity: 0.5,
                duration: 0.3
            }
        };

        this.lightingsSettings = {
            ambientLight: { color: 0xffffff, intensity: 0.5 },
            directionalLight: {
                color: 0xffffff,
                intensity: 1.0,
                position: { x: 20, y: 60, z: 30 }
            }
        };

        this.ballSettings = {
            size: Number(this.gameSettings.ballSize),
            segments: 32,
            speed: Number(this.gameSettings.ballSpeed),
            color: this.gameSettings.ballColor,
            startPosition: { x: 0, y: 0.3, z: 0 },
            tail: {
                isActive: this.gameSettings.ballTail === 'true',
                color: [0xff4500, 0xff8c00, 0xffd700],
                particleCount: 50,
                particleSize: 0.1,
                segments: 16,
                lifetime: 0.5,
                colors: [0xff4500, 0xff8c00, 0xffd700]
            },
            direction: new THREE.Vector3(1, 0, 1).normalize(),
            increaseSpeed: Number(this.gameSettings.ballSpeedIncrease),
            collision: {
                top: 8 - Number(this.gameSettings.ballSize) / 2,
                bottom: -8 + Number(this.gameSettings.ballSize) / 2,
                left: -12 + Number(this.gameSettings.ballSize) / 2,
                right: 12 - Number(this.gameSettings.ballSize) / 2,
                goal: 12
            },
            bounce: {
                minAngle: 0,
                maxAngle: Math.PI / 4
            }
        };

        this.spectatorSettings = {
            size: 0.2,
            segments: 16,
            colors: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff],
            jumpHeight: 0.3,
            jumpSpeed: 5,
            jumpTime: 2,
            sphereRadius: 19,
            sphereHeight: 6,
            radialSteps: 64,
            numberOfTiers: 3,
            tierSpacing: 1.5,
            standInset: 0.75,
            seatingHeightAdjustment: 0.2
        };

        this.confettiSettings = {
            isActive: this.gameSettings.confetti === 'true',
            particleCount: 200,
            particleSize: 0.1,
            particleLifetime: 5,
            colors: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff],
            speed: 0.1,
            rotationSpeed: 0.1,
            gravity: 0.001
        };

        this.paddleSettings = {
            width: 0.3,
            height: 1.2,
            depth: Number(this.gameSettings.paddleSize),
            startPosition: { x: -11.85, y: 0.6, z: 0 },
            playerPaddleSpeed: Number(this.gameSettings.paddleSpeed),
            aiPaddleSpeed: 0.2,
            minZ: -8 + Number(this.gameSettings.paddleSize) / 2,
            maxZ: 8 - Number(this.gameSettings.paddleSize) / 2,
            collision:
            {
                top: -8 + Number(this.gameSettings.paddleSize) / 2,
                bottom: 8 - Number(this.gameSettings.paddleSize) / 2
            }
        };

        this.stadiumSettings = {
            floorCircleRadius: 18,
            floorCircleSegments: 64,
            floorCircleColor: 0x16213e,
            flooatCircleRotationX: -Math.PI / 2,
            standRadiusTop: 18,
            standRadiusBottom: 22,
            standHeight: 8,
            standRadialSegments: 64,
            standHeightSegments: 1,
            standColor: 0x0f3460,
            standPositionY: 4,
            roofColor: 0x533483
        };

        this.gameTableSettings = {
            width: 24,
            height: 16,
            color: 0xe94560,
            rotationX: -Math.PI / 2,
            positionY: 0.01
        };

        this.centerLineSettings = {
            width: 0.1,
            height: 16,
            color: 0xffffff,
            positionY: 0.02,
            rotationX: -Math.PI / 2
        };
    }

    initScene()
    {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.changeMapTheme();
    }

    initCamera()
    {
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(this.cameraSettings.fov, aspectRatio, this.cameraSettings.near, this.cameraSettings.far);
        this.camera.position.set(this.cameraSettings.position.x, this.cameraSettings.position.y, this.cameraSettings.position.z);
        this.camera.lookAt(this.cameraSettings.lookAt.x, this.cameraSettings.lookAt.y, this.cameraSettings.lookAt.z);
    }

    initRenderer()
    {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
        document.getElementById(this.container_id).appendChild(this.renderer.domElement);

        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '50%';
        this.renderer.domElement.style.left = '50%';
        this.renderer.domElement.style.transform = 'translate(-50%, -50%)';
    }

    initLights()
    {
        const ambientLight = new THREE.AmbientLight(this.lightingsSettings.ambientLight.color, this.lightingsSettings.ambientLight.intensity);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(this.lightingsSettings.directionalLight.color, this.lightingsSettings.directionalLight.intensity);
        directionalLight.position.set(this.lightingsSettings.directionalLight.position.x, this.lightingsSettings.directionalLight.position.y, this.lightingsSettings.directionalLight.position.z);
        this.scene.add(directionalLight);
    }

    changeMapTheme()
    {
        const theme = this.gameSettings.mapTheme;
        // Dark, Light, Forest, Ocean, Sunset, Desert, Pastel
        switch (theme)
        {
            case 'dark':
                this.scene.background = new THREE.Color(0x000000);
                this.stadiumSettings.floorCircleColor = 0x16213e;
                this.stadiumSettings.standColor = 0x0f3460;
                this.stadiumSettings.roofColor = 0x533483;
                this.gameTableSettings.color = 0xe94560;
                this.centerLineSettings.color = 0xffffff;
                break;
            case 'light':
                this.scene.background = new THREE.Color(0xf0f0f0);
                this.stadiumSettings.floorCircleColor = 0xe0e0e0;
                this.stadiumSettings.standColor = 0xadd8e6;
                this.stadiumSettings.roofColor = 0x87ceeb;
                this.gameTableSettings.color = 0xffffff;
                this.centerLineSettings.color = 0x333333;
                break;
            case 'forest':
                this.scene.background = new THREE.Color(0x228b22);
                this.stadiumSettings.floorCircleColor = 0x2e8b57;
                this.stadiumSettings.standColor = 0x556b2f;
                this.stadiumSettings.roofColor = 0x8fbc8f;
                this.gameTableSettings.color = 0x8fbc8f;
                this.centerLineSettings.color = 0xffffff;
                break;
            case 'ocean':
                this.scene.background = new THREE.Color(0x1e90ff);
                this.stadiumSettings.floorCircleColor = 0x00bfff;
                this.stadiumSettings.standColor = 0x4682b4;
                this.stadiumSettings.roofColor = 0x87ceeb;
                this.gameTableSettings.color = 0x5f9ea0;
                this.centerLineSettings.color = 0xffffff;
                break;
            case 'sunset':
                this.scene.background = new THREE.Color(0xff4500);
                this.stadiumSettings.floorCircleColor = 0xff6347;
                this.stadiumSettings.standColor = 0xffa07a;
                this.stadiumSettings.roofColor = 0xfa8072;
                this.gameTableSettings.color = 0xdb7093;
                this.centerLineSettings.color = 0x2f4f4f;
                break;
            case 'desert':
                this.scene.background = new THREE.Color(0xffe4b5);
                this.stadiumSettings.floorCircleColor = 0xf4a460;
                this.stadiumSettings.standColor = 0xd2b48c;
                this.stadiumSettings.roofColor = 0xdeaa88;
                this.gameTableSettings.color = 0xcd853f;
                this.centerLineSettings.color = 0x8b4513;
                break;
            case 'pastel':
                this.scene.background = new THREE.Color(0xffe4e1);
                this.stadiumSettings.floorCircleColor = 0xffdab9;
                this.stadiumSettings.standColor = 0xffb6c1;
                this.stadiumSettings.roofColor = 0xffc0cb;
                this.gameTableSettings.color = 0xffd700;
                this.centerLineSettings.color = 0x9370db;
                break;
        }
    }

    initGameElements()
    {
        this.createStadium();
        this.createTable();
        this.createEdges();
        this.createCenterLine();
        this.createPaddles();
        this.createBall();
        this.createSpectators();
    }

    createStadium()
    {
        const stadiumGroup = new THREE.Group();

        const fieldGeometry = new THREE.CircleGeometry(this.stadiumSettings.floorCircleRadius, this.stadiumSettings.floorCircleSegments);
        const fieldMaterial = new THREE.MeshLambertMaterial({ color: this.stadiumSettings.floorCircleColor, side: THREE.DoubleSide });
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.rotation.x = this.stadiumSettings.flooatCircleRotationX;
        stadiumGroup.add(field);

        const numberOfTiers = 3;
        const tierHeight = this.stadiumSettings.standHeight / numberOfTiers;

        for (let i = 0; i < numberOfTiers; i++) {
            const tierGeometry = new THREE.CylinderGeometry(
                this.stadiumSettings.standRadiusTop + i * 1.5,
                this.stadiumSettings.standRadiusBottom + i * 1.5,
                tierHeight,
                this.stadiumSettings.standRadialSegments,
                this.stadiumSettings.standHeightSegments,
                true
            );
            const tierMaterial = new THREE.MeshLambertMaterial({ color: this.stadiumSettings.standColor, side: THREE.DoubleSide });
            const tier = new THREE.Mesh(tierGeometry, tierMaterial);
            tier.position.y = tierHeight / 2 + i * tierHeight;
            stadiumGroup.add(tier);
        }

        const roofGeometry = new THREE.RingGeometry(18, 22, 64);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: this.stadiumSettings.roofColor, side: THREE.DoubleSide });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = this.stadiumSettings.standHeight;
        roof.rotation.x = -Math.PI / 2;
        stadiumGroup.add(roof);

        this.scene.add(stadiumGroup);
    }

    createTable()
    {
        const tableGeometry = new THREE.PlaneGeometry(this.gameTableSettings.width, this.gameTableSettings.height);
        const tableMaterial = new THREE.MeshLambertMaterial({ color: this.gameTableSettings.color, side: THREE.DoubleSide });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.rotation.x = this.gameTableSettings.rotationX;
        table.position.y = this.gameTableSettings.positionY;
        this.scene.add(table);
    }

    createEdges()
    {
        const edgeLineGeometryVertical = new THREE.PlaneGeometry(this.centerLineSettings.width, this.gameTableSettings.height);
        const edgeLineGeometryHorizontal = new THREE.PlaneGeometry(this.gameTableSettings.width, this.centerLineSettings.width);

        const edgeLineMaterial = new THREE.MeshLambertMaterial({ color: this.centerLineSettings.color, side: THREE.DoubleSide });

        const leftEdgeLine = new THREE.Mesh(edgeLineGeometryVertical, edgeLineMaterial);
        leftEdgeLine.rotation.x = this.centerLineSettings.rotationX;
        leftEdgeLine.position.set(-this.gameTableSettings.width / 2, this.centerLineSettings.positionY, 0);
        this.scene.add(leftEdgeLine);

        const rightEdgeLine = new THREE.Mesh(edgeLineGeometryVertical, edgeLineMaterial);
        rightEdgeLine.rotation.x = this.centerLineSettings.rotationX;
        rightEdgeLine.position.set(this.gameTableSettings.width / 2, this.centerLineSettings.positionY, 0);
        this.scene.add(rightEdgeLine);

        const topEdgeLine = new THREE.Mesh(edgeLineGeometryHorizontal, edgeLineMaterial);
        topEdgeLine.rotation.x = this.centerLineSettings.rotationX;
        topEdgeLine.position.set(0, this.centerLineSettings.positionY, this.gameTableSettings.height / 2);
        this.scene.add(topEdgeLine);

        const bottomEdgeLine = new THREE.Mesh(edgeLineGeometryHorizontal, edgeLineMaterial);
        bottomEdgeLine.rotation.x = this.centerLineSettings.rotationX;
        bottomEdgeLine.position.set(0, this.centerLineSettings.positionY, -this.gameTableSettings.height / 2);
        this.scene.add(bottomEdgeLine);
    }

    createCenterLine()
    {
        const centerLineGeometry = new THREE.PlaneGeometry(this.centerLineSettings.width, this.centerLineSettings.height);
        const centerLineMaterial = new THREE.MeshLambertMaterial({ color: this.centerLineSettings.color, side: THREE.DoubleSide });
        const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
        centerLine.rotation.x = this.centerLineSettings.rotationX;
        centerLine.position.y = this.centerLineSettings.positionY;
        this.scene.add(centerLine);
    }

    createPaddles()
    {
        const paddleGeometry = new THREE.BoxGeometry(this.paddleSettings.width, this.paddleSettings.height, this.paddleSettings.depth);
        const leftPaddleMaterial = new THREE.MeshLambertMaterial({ color: this.gameSettings.leftPaddleColor });

        this.leftPaddle = new THREE.Mesh(paddleGeometry, leftPaddleMaterial);
        this.leftPaddle.position.set(this.paddleSettings.startPosition.x, this.paddleSettings.startPosition.y, this.paddleSettings.startPosition.z);
        this.scene.add(this.leftPaddle);

        const rightPaddleMaterial = new THREE.MeshLambertMaterial({ color: this.gameSettings.rightPaddleColor });
        this.rightPaddle = new THREE.Mesh(paddleGeometry, rightPaddleMaterial);
        this.rightPaddle.position.set(-this.paddleSettings.startPosition.x, this.paddleSettings.startPosition.y, this.paddleSettings.startPosition.z);
        this.scene.add(this.rightPaddle);
    }

    createBall()
    {
        const ballGeometry = new THREE.SphereGeometry(this.ballSettings.size, this.ballSettings.segments, this.ballSettings.segments);
        const ballMaterial = new THREE.MeshLambertMaterial({ color: this.ballSettings.color });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.position.set(this.ballSettings.startPosition.x, this.ballSettings.startPosition.y, this.ballSettings.startPosition.z);
        this.scene.add(this.ball);
    }

    createSpectators()
    {
        const spectatorGeometry = new THREE.SphereGeometry(this.spectatorSettings.size, this.spectatorSettings.segments, this.spectatorSettings.segments);

        const radialSteps = this.spectatorSettings.radialSteps;
        const numberOfTiers = this.spectatorSettings.numberOfTiers;
        const tierHeight = this.stadiumSettings.standHeight / numberOfTiers;

        for (let j = 0; j < numberOfTiers - 1; j++) {
            for (let i = 0; i < radialSteps; i++) {
                const angle = (i / radialSteps) * Math.PI * 2;
                const radius = this.stadiumSettings.standRadiusTop + j * this.spectatorSettings.tierSpacing + this.spectatorSettings.standInset;
                const height = tierHeight / 2 + j * tierHeight + tierHeight / 2 - this.spectatorSettings.seatingHeightAdjustment;

                const spectatorMaterial = new THREE.MeshLambertMaterial({
                    color: this.spectatorSettings.colors[Math.floor(Math.random() * this.spectatorSettings.colors.length)]
                });
                const spectator = new THREE.Mesh(spectatorGeometry, spectatorMaterial);
                spectator.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );
                spectator.lookAt(0, spectator.position.y, 0);
                spectator.userData = {
                    initialY: spectator.position.y,
                    jumpPhase: Math.random() * Math.PI * 2
                };
                this.scene.add(spectator);
                this.spectators.push(spectator);
            }
        }
    }

    createTailParticle(position)
    {
        const particleGeometry = new THREE.SphereGeometry(this.ballSettings.tail.particleSize, this.ballSettings.tail.segments, this.ballSettings.tail.segments);
        const particleMaterial = new THREE.MeshLambertMaterial({
            color: this.ballSettings.tail.colors[Math.floor(Math.random() * this.ballSettings.tail.colors.length)]
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(position.x, position.y, position.z);
        particle.userData.lifetime = this.ballSettings.tail.lifetime;
        this.scene.add(particle);
        this.tailParticles.push(particle);
    }

    updateTail(deltaTime)
    {
        for (let i = this.tailParticles.length - 1; i >= 0; i--) {
            const particle = this.tailParticles[i];
            particle.userData.lifetime -= deltaTime;
            if (particle.userData.lifetime <= 0) {
                this.scene.remove(particle);
                this.tailParticles.splice(i, 1);
            }
        }
    }

    createConfetti(position)
    {
        if (!this.confettiSettings.isActive) return;
        for (let i = 0; i < this.confettiSettings.particleCount; i++)
        {
            const geometry = new THREE.PlaneGeometry(this.confettiSettings.particleSize, this.confettiSettings.particleSize);
            const material = new THREE.MeshBasicMaterial({
                color: this.confettiSettings.colors[Math.floor(Math.random() * this.confettiSettings.colors.length)],
                side: THREE.DoubleSide
            });
            const confetti = new THREE.Mesh(geometry, material);
            confetti.position.set(
                position.x + (Math.random() - 0.5) * 5,
                position.y + Math.random() * 5,
                position.z + (Math.random() - 0.5) * 5
            );
            confetti.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * this.confettiSettings.speed,
                    Math.random() * this.confettiSettings.speed,
                    (Math.random() - 0.5) * this.confettiSettings.speed
                ),
                rotationSpeed: {
                    x: Math.random() * this.confettiSettings.rotationSpeed,
                    y: Math.random() * this.confettiSettings.rotationSpeed,
                    z: Math.random() * this.confettiSettings.rotationSpeed
                }
            };
            this.scene.add(confetti);
            this.confettiParticles.push(confetti);
        }
    }

    updateConfetti()
    {
        for (let i = this.confettiParticles.length - 1; i >= 0; i--)
        {
            const confetti = this.confettiParticles[i];
            confetti.position.add(confetti.userData.velocity);
            confetti.rotation.x += confetti.userData.rotationSpeed.x;
            confetti.rotation.y += confetti.userData.rotationSpeed.y;
            confetti.rotation.z += confetti.userData.rotationSpeed.z;
            confetti.userData.velocity.y -= this.confettiSettings.gravity;

            if (confetti.position.y < -5)
            {
                this.scene.remove(confetti);
                this.confettiParticles.splice(i, 1);
            }
        }
    }

    shakeCamera()
    {
        if (!this.cameraSettings.shake.isActive) return;
        const intensity = this.cameraSettings.shake.intensity;
        const duration = this.cameraSettings.shake.duration;
        const startPosition = this.camera.position.clone();
        let currentTime = 0;

        this.cameraShakeActive = true;

        return new Promise(resolve => {
            const update = () => {
                if (!this.cameraShakeActive) {
                    this.camera.position.copy(startPosition);
                    resolve();
                    return;
                }
                currentTime += 0.01;
                const shakeAmount = intensity * (1 - currentTime / duration);
                this.camera.position.set(
                    startPosition.x + Math.random() * shakeAmount - shakeAmount / 2,
                    startPosition.y + Math.random() * shakeAmount - shakeAmount / 2,
                    startPosition.z + Math.random() * shakeAmount - shakeAmount / 2
                );
                if (currentTime < duration)
                {
                    this.cameraShakeId = requestAnimationFrame(update);
                }
                else
                {
                    this.camera.position.copy(startPosition);
                    resolve();
                }
            };
            update();
        });
    }

    openGameOverScreen()
    {
        document.querySelector('#game-over').style.display = 'block';
    }

    checkWin()
    {
        if (this.player1Score >= this.gameSettings.scoreToWin)
        {
            this.gameOver = true;
            this.createFinishGameConfetti();
            this.createMultipleConfettiExplosions(5, 1000);
            this.cameraSettings.shake.intensity = 1;
            this.cameraSettings.shake.duration = 5;
            this.shakeCamera();
            this.winner = 0;
            this.openGameOverScreen();
        }
        else if (this.player2Score >= this.gameSettings.scoreToWin)
        {
            this.gameOver = true;
            this.createFinishGameConfetti();
            this.createMultipleConfettiExplosions(5, 1000);
            this.cameraSettings.shake.intensity = 1;
            this.cameraSettings.shake.duration = 5;
            this.shakeCamera();
            this.winner = 1;
            this.openGameOverScreen();
        }
    }

    updateScoreDisplay()
    {
        document.getElementById('player1-score').textContent = this.player1Score;
        document.getElementById('player2-score').textContent = this.player2Score;
        this.checkWin();
    }

    movePaddles(deltaTime)
    {
        if (this.gameOver) return;
    
        // Left paddle control
        if (this.keys['KeyW'] && this.leftPaddle.position.z > this.paddleSettings.minZ)
        {
            this.leftPaddle.position.z -= this.paddleSettings.playerPaddleSpeed * deltaTime;
        }
        if (this.keys['KeyS'] && this.leftPaddle.position.z < this.paddleSettings.maxZ)
        {
            this.leftPaddle.position.z += this.paddleSettings.playerPaddleSpeed * deltaTime;
        }
    
        if (this.gameSettings.aiActive === 'true') return;
    
        // Right paddle control
        if (this.keys['ArrowUp'] && this.rightPaddle.position.z > this.paddleSettings.minZ)
        {
            this.rightPaddle.position.z -= this.paddleSettings.playerPaddleSpeed * deltaTime;
        }
        if (this.keys['ArrowDown'] && this.rightPaddle.position.z < this.paddleSettings.maxZ)
        {
            this.rightPaddle.position.z += this.paddleSettings.playerPaddleSpeed * deltaTime;
        }
    }

    updateBall(deltaTime)
    {
        if (this.gameOver) return;
        this.ball.position.add(this.ballSettings.direction.clone().multiplyScalar(this.ballSpeed));
        if (this.ballSettings.tail.isActive)
        {
            this.createTailParticle(this.ball.position);
        }

        if (this.ball.position.z < this.ballSettings.collision.bottom && this.ballSettings.direction.z < 0)
        {
            this.ballSettings.direction.z *= -1;
        }
        else if (this.ball.position.z > this.ballSettings.collision.top && this.ballSettings.direction.z > 0)
        {
            this.ballSettings.direction.z *= -1;
        }

        // Left paddle collision check
        if (this.ball.position.x - ((this.ballSettings.size / 2) + (this.paddleSettings.width)) <= this.ballSettings.collision.left &&
            this.ball.position.z >= this.leftPaddle.position.z - this.paddleSettings.depth / 2 &&
            this.ball.position.z <= this.leftPaddle.position.z + this.paddleSettings.depth / 2)
        {

            const relativeHitPoint = (this.ball.position.z - this.leftPaddle.position.z) / (this.paddleSettings.height / 2);
            const maxAngle = this.ballSettings.bounce.maxAngle;
            const minAngle = this.ballSettings.bounce.minAngle;
            let bounceAngle = relativeHitPoint * maxAngle;

            bounceAngle = Math.sign(bounceAngle) * Math.max(minAngle, Math.min(Math.abs(bounceAngle), maxAngle));

            this.ballSettings.direction.x = Math.cos(bounceAngle);
            this.ballSettings.direction.z = Math.sin(bounceAngle);

            this.ballSpeed *= this.ballSettings.increaseSpeed;

            this.changeAIZRandom();
        }
        // Right paddle collision check
        if (this.ball.position.x + ((this.ballSettings.size) + (this.paddleSettings.width)) >= this.ballSettings.collision.right &&
            this.ball.position.z >= this.rightPaddle.position.z - this.paddleSettings.depth / 2 &&
            this.ball.position.z <= this.rightPaddle.position.z + this.paddleSettings.depth / 2)
        {

            const relativeHitPoint = (this.ball.position.z - this.rightPaddle.position.z) / (this.paddleSettings.height / 2);
            const maxAngle = this.ballSettings.bounce.maxAngle;
            const minAngle = this.ballSettings.bounce.minAngle;
            let bounceAngle = relativeHitPoint * maxAngle;

            bounceAngle = Math.sign(bounceAngle) * Math.max(minAngle, Math.min(Math.abs(bounceAngle), maxAngle));

            this.ballSettings.direction.x = -Math.cos(bounceAngle);
            this.ballSettings.direction.z = Math.sin(bounceAngle);

            this.ballSpeed *= this.ballSettings.increaseSpeed;

            this.changeAIZRandom();
        }

        if (this.ball.position.x < -this.ballSettings.collision.goal)
        {
            this.player2Score++;
            this.createConfetti(this.ball.position);
            this.resetBall(1);
            this.spectatorJumpTime = this.spectatorSettings.jumpTime;
            this.shakeCamera();
        }
        else if (this.ball.position.x > this.ballSettings.collision.goal)
        {
            this.player1Score++;
            this.createConfetti(this.ball.position);
            this.resetBall(-1);
            this.spectatorJumpTime = this.spectatorSettings.jumpTime;
            this.shakeCamera();
        }
    }



    resetBall(direction)
    {
        this.ball.position.set(this.ballSettings.startPosition.x, this.ballSettings.startPosition.y, this.ballSettings.startPosition.z);
        this.ballSettings.direction = new THREE.Vector3(direction, 0, Math.random() * 2 - 1).normalize();
        this.ballSpeed = this.ballSettings.speed;
        this.updateScoreDisplay();
    }

    updateSpectators(deltaTime)
    {
        if (this.spectatorJumpTime > 0)
        {
            this.spectatorJumpTime -= deltaTime;
            this.spectators.forEach(spectator => {
                spectator.position.y = spectator.userData.initialY + Math.abs(Math.sin(spectator.userData.jumpPhase)) * this.spectatorSettings.jumpHeight;
                spectator.userData.jumpPhase += deltaTime * this.spectatorSettings.jumpSpeed;
            });
        }
        else
        {
            this.spectators.forEach(spectator => {
                spectator.position.y = spectator.userData.initialY;
            });
        }
    }

    handleAI(deltaTime)
    {
        const aiSpeed = this.paddleSettings.playerPaddleSpeed * deltaTime;
        let predictedZ = this.ball.position.z;
        let predictedX = this.ball.position.x;
        let ballDirection = this.ballSettings.direction.clone();
        let maxIterations = 1000;
        let iterations = 0;

        while (predictedX < this.gameTableSettings.width / 2 && iterations < maxIterations)
        {
            predictedZ += ballDirection.z * this.ballSpeed;
            predictedX += ballDirection.x * this.ballSpeed;

            if (predictedZ < this.ballSettings.collision.bottom && ballDirection.z < 0) 
            {
                ballDirection.z *= -1;
            }
            else if (predictedZ > this.ballSettings.collision.top && ballDirection.z > 0)
            {
                ballDirection.z *= -1;
            }

            if (predictedX - this.ballSettings.size / 2 < this.ballSettings.collision.left)
            {
                if (predictedZ >= this.leftPaddle.position.z - this.paddleSettings.depth / 2 &&
                    predictedZ <= this.leftPaddle.position.z + this.paddleSettings.depth / 2)
                {
                    break;
                }
            }

            if (predictedX + this.ballSettings.size / 2 > this.ballSettings.collision.right)
            {
                if (predictedZ >= this.rightPaddle.position.z - this.paddleSettings.depth / 2 &&
                    predictedZ <= this.rightPaddle.position.z + this.paddleSettings.depth / 2)
                {
                    break;
                }
            }

            iterations++;
        }

        predictedZ += this.aiZRandom;

        if (Math.abs(this.rightPaddle.position.z - predictedZ) > aiSpeed)
        {
            if (this.rightPaddle.position.z < predictedZ)
            {
                this.rightPaddle.position.z += aiSpeed;
            }
            else
            {
                this.rightPaddle.position.z -= aiSpeed;
            }
        }

        if (this.rightPaddle.position.z < this.paddleSettings.minZ)
        {
            this.rightPaddle.position.z = this.paddleSettings.minZ;
        }
        if (this.rightPaddle.position.z > this.paddleSettings.maxZ) 
        {
            this.rightPaddle.position.z = this.paddleSettings.maxZ;
        }
    }

    changeAIZRandom()
    {
        this.aiZRandom = Math.random() * (this.paddleSettings.depth / 3) - (this.paddleSettings.depth / 3);
    }

    animate(time)
    {
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;
        if (this.gameSettings.aiActive === 'true') this.handleAI(deltaTime);
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        this.updateBall(deltaTime);
        this.movePaddles(deltaTime);
        this.updateSpectators(deltaTime);
        this.updateConfetti();
        this.updateTail(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }

    stopAnimation()
    {
        cancelAnimationFrame(this.animationFrameId);
    }

    onResize()
    {
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.camera.aspect = aspectRatio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
    }

    addEventListeners()
    {
        document.addEventListener('keydown', (e) => this.keys[e.code] = true);
        document.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('resize', this.onResize.bind(this));

        const container = document.getElementById(this.container_id);
        container.addEventListener('touchstart', (e) => this.onTouchStart(e), false);
        container.addEventListener('touchmove', (e) => this.onTouchMove(e), false);
        container.addEventListener('touchend', (e) => this.onTouchEnd(e), false);
    }

    onTouchStart(e)
    {
        e.preventDefault();
        this.touchActive = true;
        this.handleTouch(e);
    }

    onTouchMove(e)
    {
        e.preventDefault();
        if (this.touchActive) this.handleTouch(e);
    }

    onTouchEnd(e)
    {
        e.preventDefault();
        this.touchActive = false;
        this.keys['KeyW'] = false;
        this.keys['KeyS'] = false;
        this.keys['ArrowUp'] = false;
        this.keys['ArrowDown'] = false;
    }

    handleTouch(e)
    {
        const touch = e.touches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        const container = document.getElementById(this.container_id);
        const containerRect = container.getBoundingClientRect();
    
        if (touchX < containerRect.width / 2)
        {
            if (touchY < window.innerHeight / 2)
            {
                this.keys['KeyW'] = true;
                this.keys['KeyS'] = false;
            }
            else
            {
                this.keys['KeyW'] = false;
                this.keys['KeyS'] = true;
            }
        }
        else
        {
            if (touchY < window.innerHeight / 2)
            {
                this.keys['ArrowUp'] = true;
                this.keys['ArrowDown'] = false;
            }
            else
            {
                this.keys['ArrowUp'] = false;
                this.keys['ArrowDown'] = true;
            }
        }
    }

    createFinishGameConfetti()
    {
        if (!this.confettiSettings.isActive) return;
        for (let i = 0; i < this.confettiSettings.particleCount * 5; i++)
        {
            const geometry = new THREE.PlaneGeometry(this.confettiSettings.particleSize * 2, this.confettiSettings.particleSize * 2);
            const material = new THREE.MeshBasicMaterial({
                color: this.confettiSettings.colors[Math.floor(Math.random() * this.confettiSettings.colors.length)],
                side: THREE.DoubleSide
            });
            const confetti = new THREE.Mesh(geometry, material);
            confetti.position.set(
                (Math.random() - 0.5) * 30,
                Math.random() * 20 + 10,
                (Math.random() - 0.5) * 30
            );
            confetti.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * this.confettiSettings.speed,
                    Math.random() * this.confettiSettings.speed,
                    (Math.random() - 0.5) * this.confettiSettings.speed
                ),
                rotationSpeed: {
                    x: Math.random() * this.confettiSettings.rotationSpeed,
                    y: Math.random() * this.confettiSettings.rotationSpeed,
                    z: Math.random() * this.confettiSettings.rotationSpeed
                }
            };
            this.scene.add(confetti);
            this.confettiParticles.push(confetti);
        }
    }

    createMultipleConfettiExplosions(count, interval)
    {
        if (!this.confettiSettings.isActive) return;
        let explosionsLeft = count;
        this.confettiIntervalId = setInterval(() => {
            if (explosionsLeft > 0)
            {
                this.createFinishGameConfetti();
                explosionsLeft--;
            }
            else
            {
                if (this.confettiIntervalId)
                {
                    clearInterval(this.confettiIntervalId);
                }
            }
        }, interval);
    }

    destroyParticles()
    {
        this.tailParticles.forEach(particle => this.scene.remove(particle));
        this.confettiParticles.forEach(particle => this.scene.remove(particle));
        this.tailParticles = [];
        this.confettiParticles = [];
    }

    restartGame()
    {
        clearInterval(this.confettiIntervalId);
        if (this.cameraShakeActive)
        {
            this.cameraShakeActive = false;
            if (this.cameraShakeId)
            {
                cancelAnimationFrame(this.cameraShakeId);
                this.cameraShakeId = null;
            }
        }
        this.destroyParticles();

        this.player1Score = 0;
        this.player2Score = 0;
        this.updateScoreDisplay();

        this.resetBall(1);

        this.leftPaddle.position.set(this.paddleSettings.startPosition.x, this.paddleSettings.startPosition.y, this.paddleSettings.startPosition.z);
        this.rightPaddle.position.set(-this.paddleSettings.startPosition.x, this.paddleSettings.startPosition.y, this.paddleSettings.startPosition.z);

        this.spectatorJumpTime = 0;
        this.gameOver = false;

        this.cameraSettings.shake.intensity = 0.5;
        this.cameraSettings.shake.duration = 0.3;
    }
}
