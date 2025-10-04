class OnlinePongGame {
	constructor(containerId, socket, is_left) {
		this.animationFrameId = null;
		this.containerId = containerId;

		this.socket = socket;

		this.is_left = is_left;

		this.ballCollisionFlag = true;

		this.cameraSettings = {
			fov: 75,
			near: 0.1,
			far: 1000,
			position: { x: 0, y: 30, z: 15 },
			lookAt: { x: 0, y: 0, z: 0 },
			shake: { intensity: 0.5, duration: 0.3 }
		};

		this.lightingsSettings = {
			ambientLight: { color: 0xffffff, intensity: 0.5 },
			directionalLight: { color: 0xffffff, intensity: 1.0, position: { x: 20, y: 60, z: 30 } }
		};

		this.ballSettings = {
			size: 0.3,
			segments: 32,
			speed: 0.15,
			color: 0xffffff,
			startPosition: { x: 0, y: 0.3, z: 0 },
			tail: {
				color: [0xff4500, 0xff8c00, 0xffd700],
				particleCount: 50,
				particleSize: 0.1,
				segments: 16,
				lifetime: 0.5,
				colors: [0xff4500, 0xff8c00, 0xffd700]
			},
			direction: new THREE.Vector3(1, 0, 1).normalize(),
			increaseSpeed: 1.1,
			collision: {
				top: 7.7,
				bottom: -7.7,
				left: -11.55,
				right: 11.55,
				goal: 12
			},
			bounce: { minAngle: 0, maxAngle: Math.PI / 4 }
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
			depth: 3,
			maxZ: 6.5,
			minZ: -6.5,
			startPosition: { x: -11.85, y: 0.6, z: 0 },
			playerPaddleSpeed: 0.2,
			aiPaddleSpeed: 0.2
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
			standPositionY: 4
		};

		this.keys = {};

		this.sceneBackgroundColor = 0x000000;
		this.leftPaddleColor = 0x00ff00;
		this.rightPaddleColor = 0xff00ff;

		this.tailParticles = [];
		this.spectators = [];
		this.confettiParticles = [];

		this.player1Score = 0;
		this.player2Score = 0;
		this.spectatorJumpTime = 0;

		this.ballSpeed = this.ballSettings.speed;
		this.ballDirection = this.ballSettings.direction;

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

		this.aspectRatio = window.innerWidth / window.innerHeight;

		this.init();
	}

	init() {
		this.cameraSettings.position.z = this.cameraSettings.position.z * (1 / this.aspectRatio);
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(this.sceneBackgroundColor);
		this.camera = new THREE.PerspectiveCamera(this.cameraSettings.fov, window.innerWidth / window.innerHeight, this.cameraSettings.near, this.cameraSettings.far);
		this.camera.position.set(this.cameraSettings.position.x, this.cameraSettings.position.y, this.cameraSettings.position.z);
		this.camera.lookAt(this.cameraSettings.lookAt.x, this.cameraSettings.lookAt.y, this.cameraSettings.lookAt.z);

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.getElementById(this.containerId).appendChild(this.renderer.domElement);

		const ambientLight = new THREE.AmbientLight(this.lightingsSettings.ambientLight.color, this.lightingsSettings.ambientLight.intensity);
		this.scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(this.lightingsSettings.directionalLight.color, this.lightingsSettings.directionalLight.intensity);
		directionalLight.position.set(this.lightingsSettings.directionalLight.position.x, this.lightingsSettings.directionalLight.position.y, this.lightingsSettings.directionalLight.position.z);
		this.scene.add(directionalLight);

		this.createStadium();
		this.createTable();
		this.createCenterLine();
		this.createPaddles();
		this.createBall();
		this.createSpectators();

		document.addEventListener('keydown', (e) => this.keys[e.code] = true);
		document.addEventListener('keyup', (e) => this.keys[e.code] = false);

		this.animate(0);
		window.addEventListener('resize', () => this.onResize());
	}

	createStadium() {
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
		const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x533483, side: THREE.DoubleSide });
		const roof = new THREE.Mesh(roofGeometry, roofMaterial);
		roof.position.y = this.stadiumSettings.standHeight;
		roof.rotation.x = -Math.PI / 2;
		stadiumGroup.add(roof);

		this.scene.add(stadiumGroup);
	}

	createTable() {
		const tableGeometry = new THREE.PlaneGeometry(this.gameTableSettings.width, this.gameTableSettings.height);
		const tableMaterial = new THREE.MeshLambertMaterial({ color: this.gameTableSettings.color, side: THREE.DoubleSide });
		const table = new THREE.Mesh(tableGeometry, tableMaterial);
		table.rotation.x = this.gameTableSettings.rotationX;
		table.position.y = this.gameTableSettings.positionY;
		this.scene.add(table);
	}

	createCenterLine() {
		const centerLineGeometry = new THREE.PlaneGeometry(this.centerLineSettings.width, this.centerLineSettings.height);
		const centerLineMaterial = new THREE.MeshLambertMaterial({ color: this.centerLineSettings.color, side: THREE.DoubleSide });
		const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
		centerLine.rotation.x = this.centerLineSettings.rotationX;
		centerLine.position.y = this.centerLineSettings.positionY;
		this.scene.add(centerLine);
	}

	createPaddles() {
		const paddleGeometry = new THREE.BoxGeometry(this.paddleSettings.width, this.paddleSettings.height, this.paddleSettings.depth);
		const paddleMaterial = new THREE.MeshLambertMaterial({ color: this.leftPaddleColor });

		this.leftPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
		this.leftPaddle.position.set(this.paddleSettings.startPosition.x, this.paddleSettings.startPosition.y, this.paddleSettings.startPosition.z);
		this.scene.add(this.leftPaddle);

		this.rightPaddle = new THREE.Mesh(paddleGeometry, new THREE.MeshLambertMaterial({ color: this.rightPaddleColor }));
		this.rightPaddle.position.set(-this.paddleSettings.startPosition.x, this.paddleSettings.startPosition.y, this.paddleSettings.startPosition.z);
		this.scene.add(this.rightPaddle);
	}

	createBall() {
		const ballGeometry = new THREE.SphereGeometry(this.ballSettings.size, this.ballSettings.segments, this.ballSettings.segments);
		const ballMaterial = new THREE.MeshLambertMaterial({ color: this.ballSettings.color });
		this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
		this.ball.position.set(this.ballSettings.startPosition.x, this.ballSettings.startPosition.y, this.ballSettings.startPosition.z);
		this.scene.add(this.ball);
	}

	createTailParticle(position) {
		const particleGeometry = new THREE.SphereGeometry(this.ballSettings.tail.particleSize, this.ballSettings.tail.segments, this.ballSettings.tail.segments);
		const particleMaterial = new THREE.MeshLambertMaterial({ color: this.ballSettings.tail.colors[Math.floor(Math.random() * this.ballSettings.tail.colors.length)] });
		const particle = new THREE.Mesh(particleGeometry, particleMaterial);
		particle.position.set(position.x, position.y, position.z);
		particle.userData.lifetime = this.ballSettings.tail.lifetime;
		this.scene.add(particle);
		this.tailParticles.push(particle);
	}

	updateTail(deltaTime) {
		for (let i = this.tailParticles.length - 1; i >= 0; i--) {
			const particle = this.tailParticles[i];
			particle.userData.lifetime -= deltaTime;
			if (particle.userData.lifetime <= 0) {
				this.scene.remove(particle);
				this.tailParticles.splice(i, 1);
			}
		}
	}

	createSpectators() {
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

	createConfetti(position) {
		for (let i = 0; i < this.confettiSettings.particleCount; i++) {
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

	updateConfetti() {
		for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
			const confetti = this.confettiParticles[i];
			confetti.position.add(confetti.userData.velocity);
			confetti.rotation.x += confetti.userData.rotationSpeed.x;
			confetti.rotation.y += confetti.userData.rotationSpeed.y;
			confetti.rotation.z += confetti.userData.rotationSpeed.z;
			confetti.userData.velocity.y -= this.confettiSettings.gravity;

			if (confetti.position.y < -5) {
				this.scene.remove(confetti);
				this.confettiParticles.splice(i, 1);
			}
		}
	}

	shakeCamera() {
		const intensity = this.cameraSettings.shake.intensity;
		const duration = this.cameraSettings.shake.duration;
		const startPosition = this.camera.position.clone();
		let currentTime = 0;

		return new Promise(resolve => {
			const update = () => {
				currentTime += 0.01;
				const shakeAmount = intensity * (1 - currentTime / duration);
				this.camera.position.set(
					startPosition.x + Math.random() * shakeAmount - shakeAmount / 2,
					startPosition.y + Math.random() * shakeAmount - shakeAmount / 2,
					startPosition.z + Math.random() * shakeAmount - shakeAmount / 2
				);
				if (currentTime < duration) {
					requestAnimationFrame(update);
				} else {
					this.camera.position.copy(startPosition);
					resolve();
				}
			};
			update();
		});
	}

	updateScoreDisplay() {
		document.getElementById('player1-score').textContent = this.player1Score;
		document.getElementById('player2-score').textContent = this.player2Score;
	}

	smoothMovePaddle(paddle, targetZ, speed, deltaTime) {
		const direction = targetZ - paddle.position.z;
		paddle.position.z += direction * speed * deltaTime;
	}

	movePaddles() {
		if (this.is_left)
		{
			if (this.keys['KeyW'] && this.leftPaddle.position.z > this.paddleSettings.minZ) this.leftPaddle.position.z -= this.paddleSettings.playerPaddleSpeed;
			if (this.keys['KeyS'] && this.leftPaddle.position.z < this.paddleSettings.maxZ) this.leftPaddle.position.z += this.paddleSettings.playerPaddleSpeed;
		}
		else
		{
			if (this.keys['KeyW'] && this.rightPaddle.position.z > this.paddleSettings.minZ) this.rightPaddle.position.z -= this.paddleSettings.playerPaddleSpeed;
			if (this.keys['KeyS'] && this.rightPaddle.position.z < this.paddleSettings.maxZ) this.rightPaddle.position.z += this.paddleSettings.playerPaddleSpeed;
		}
	}

	updateBall(deltaTime) {
		this.ball.position.add(this.ballDirection.clone().multiplyScalar(this.ballSpeed));
		this.createTailParticle(this.ball.position);

		if (Math.abs(this.ball.position.z) > this.ballSettings.collision.top) {
			this.ballDirection.z *= -1;
		}

		if (this.ball.position.x <= this.ballSettings.collision.left && this.ball.position.z >= this.leftPaddle.position.z - 1.5 && this.ball.position.z <= this.leftPaddle.position.z + 1.5) {
			const relativeHitPoint = (this.ball.position.z - this.leftPaddle.position.z) / (this.paddleSettings.height / 2);
			const maxAngle = this.ballSettings.bounce.maxAngle;
			const minAngle = this.ballSettings.bounce.minAngle;
			let bounceAngle = relativeHitPoint * maxAngle;
			bounceAngle = Math.sign(bounceAngle) * Math.max(minAngle, Math.min(Math.abs(bounceAngle), maxAngle));
			this.ballDirection.x = Math.cos(bounceAngle);
			this.ballDirection.z = Math.sin(bounceAngle);
			this.ballSpeed *= this.ballSettings.increaseSpeed;
		}

		if (this.ball.position.x >= this.ballSettings.collision.right && this.ball.position.z >= this.rightPaddle.position.z - 1.5 && this.ball.position.z <= this.rightPaddle.position.z + 1.5) {
			const relativeHitPoint = (this.ball.position.z - this.rightPaddle.position.z) / (this.paddleSettings.height / 2);
			const maxAngle = this.ballSettings.bounce.maxAngle;
			const minAngle = this.ballSettings.bounce.minAngle;
			let bounceAngle = relativeHitPoint * maxAngle;
			bounceAngle = Math.sign(bounceAngle) * Math.max(minAngle, Math.min(Math.abs(bounceAngle), maxAngle));
			this.ballDirection.x = -Math.cos(bounceAngle);
			this.ballDirection.z = Math.sin(bounceAngle);
			this.ballSpeed *= this.ballSettings.increaseSpeed;
		}
	}

	ballCollision() {
		if (this.ball.position.x < -this.ballSettings.collision.goal) {
			this.ballCollisionFlag = false;
			this.socket.send(JSON.stringify({
				type: 'score',
				user_id: localStorage.getItem('user_id'),
				who_scored: -1,
				scores: {
					player1: this.player1Score,
					player2: this.player2Score
				}
			}));
		} else if (this.ball.position.x > this.ballSettings.collision.goal) {
			this.ballCollisionFlag = false;
			this.socket.send(JSON.stringify({
				type: 'score',
				user_id: localStorage.getItem('user_id'),
				who_scored: 1,
				scores: {
					player1: this.player1Score,
					player2: this.player2Score
				}
			}));
		}
	}

	addScore(scores, flag) {
		this.player1Score = scores.user1Score;
		this.player2Score = scores.user2Score;
		this.createConfetti(this.ball.position);
		this.shakeCamera();
		this.resetBall(flag);
		this.spectatorJumpTime = this.spectatorSettings.jumpTime;
		this.ballCollisionFlag = true;
	}

	resetBall(direction) {
		this.ball.position.set(this.ballSettings.startPosition.x, this.ballSettings.startPosition.y, this.ballSettings.startPosition.z);
		this.ballDirection = new THREE.Vector3(direction, 0, Math.random() * 2 - 1).normalize();
		this.ballSpeed = this.ballSettings.speed;
		this.updateScoreDisplay();
	}

	updateSpectators(deltaTime) {
		if (this.spectatorJumpTime > 0) {
			this.spectatorJumpTime -= deltaTime;
			this.spectators.forEach(spectator => {
				spectator.position.y = spectator.userData.initialY + Math.abs(Math.sin(spectator.userData.jumpPhase)) * this.spectatorSettings.jumpHeight;
				spectator.userData.jumpPhase += deltaTime * this.spectatorSettings.jumpSpeed;
			});
		} else {
			this.spectators.forEach(spectator => {
				spectator.position.y = spectator.userData.initialY;
			});
		}
	}

	handleAI(deltaTime) {
		if (Math.abs(this.ball.position.z - this.rightPaddle.position.z) > 0.75)
			this.smoothMovePaddle(this.rightPaddle, this.ball.position.z, this.paddleSettings.aiPaddleSpeed * 10, deltaTime);
	}

	animate(time) {
		const deltaTime = (time - this.lastTime) / 1000;
		this.lastTime = time;

		//this.handleAI(deltaTime);
		this.movePaddles();
		if (this.is_left && this.ballCollisionFlag)
		{
			this.ballCollision();
		}
		this.updateBall(deltaTime);
		this.updateSpectators(deltaTime);
		this.updateConfetti();
		this.updateTail(deltaTime);
		this.renderer.render(this.scene, this.camera);

		this.socket.send(JSON.stringify({
            type: 'game_info',
            user_id: localStorage.getItem('user_id'),
            game_info: this.getGameInfos()
        }));

		this.socket.send(JSON.stringify({
			type: 'ball_position',
            user_id: localStorage.getItem('user_id'),
			ball_position: this.ball.position
		}));

		this.animationFrameId = requestAnimationFrame((t) => this.animate(t));
	}

	stopAnimation() {
		cancelAnimationFrame(this.animationFrameId);
	}

	onResize() {
		const aspectRatio = window.innerWidth / window.innerHeight;
		this.camera.position.z = this.cameraSettings.position.z * (1 / aspectRatio);
		this.camera.aspect = aspectRatio;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	getGameInfos() {
		return {
			left_paddle: this.leftPaddle.position.z,
			right_paddle: this.rightPaddle.position.z,
			ball: this.ball.position
		};
	}

	updatePositions(left_paddle, rightPaddle, ball) {
		if (this.is_left) {
			this.rightPaddle.position.z = rightPaddle;
		}
		else {
			this.leftPaddle.position.z = left_paddle;
			this.ball.position.set(ball.x, ball.y, ball.z);
		}
	}
	
}