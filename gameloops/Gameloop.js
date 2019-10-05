

class Gameloop {
    constructor() {

    }

    init() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setClearColor(new THREE.Color('#6a7b76'), 1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.antialias = false;
        this.renderer.setPixelRatio(1);
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }, false);

        let width = window.innerWidth / 10;
        let height = window.innerHeight / 10;
        this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
        this.camera.position.copy(CAM_START_POS);
        world.scene().add(this.camera);

        this.controls = new Controls();

        this.blocky = new Blocky();
        this.plus = new Plus();

        world.scene().add(this.plus.mesh);

        window.addEventListener('click', Controls.firstClick);

        setTimeout(Controls.firstClick, 3000);

        this.state = 'start';
        this.stateFunctions = {
            start: this.stateStart,
            falling: this.stateFalling,
            oneDeeWalking: this.stateOneDeeWalking,
            aroundTheCorner: this.stateAroundTheCorner,
        };

        for (let func in this.stateFunctions) {
            this.stateFunctions[func] = this.stateFunctions[func].bind(this);
        }

        this.states = [ 'start', 'falling', 'oneDeeWalking' ];
        this.transitions = {
            'start': {
                'falling': () => {
                    console.log('start -> falling');
                    world.scene().add(this.blocky.mesh);
                    window.removeEventListener('click', Controls.firstClick);
                } // plop!
            },
            'falling': {
                'oneDeeWalking': () => {
                    this.blocky.velocity.set(0, 0, 0);
                    this.blocky.mesh.scale.y = 1;
                } // auw.
            },
            'oneDeeWalking': {
                'aroundTheCorner': () => {
                    this.blocky.velocity.set(0, 0, 0);
                }
            }
        }
    }

    start() {

    }

    stop() {

    }

    onFrame(dt, time) {
        this.blocky.onFrame(dt, time);

        // Apply state functions
        this.stateFunctions[this.state](dt, time);

        // Switch state based on current gamestate
        switch (this.state) {
            case 'start':
                break;
            default:
        }

        this.renderer.render( world.getScene('world'), this.camera );
    }

    updateKeys(axes, buttons, dt, pressed) {

    }

    switchState(newState) {
        let transition = this.transitions[this.state][newState];

        if (transition) {
            this.state = newState;
            transition();
            return true;
        } else {
            return false;
        }
    }

    stateStart(dt) {

    }

    stateFalling(dt) {
        this.blocky.velocity.y -= dt * FALL_SPEED;
        this.blocky.updatePos(dt);

        this.blocky.mesh.scale.y = Math.abs(this.blocky.velocity.y) / 320 + 1;

        if (this.blocky.mesh.position.y < -40 && this.blocky.velocity.y < 0) {
            this.blocky.velocity.y += dt * 40 * FALL_SPEED;
        }

        if (this.blocky.velocity.y > 0) {
            this.switchState('oneDeeWalking');
        }
    }

    stateOneDeeWalking(dt) {
        let xdir = world.keys.KeyA ? -1 : (world.keys.KeyD ? 1 : 0);
        this.blocky.walk(new THREE.Vector2(xdir, 0), 80);

        let x = this.blocky.mesh.position.x;
        console.log(this.blocky.velocity);

        this.blocky.velocity.x *= 0.9;
        if (x < -70) {
            this.blocky.mesh.position.x = -70
            this.blocky.velocity.set(0, 0, 0);
        } else {
            this.blocky.updatePos(dt);
        }

        if (x > 50 && x < 90) {
            this.camera.position.x = this.blocky.mesh.position.x - 50;
        } else if (x > 90) {
            let rotation = ((x - 90) / 50) * Math.PI / 4;
            let newPos = CAM_START_POS.clone()
                .applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation);
            // this.camera.position.set(newPos);
            this.camera.position.x = x - 50 + newPos.x;
            this.camera.position.y = newPos.y;
            this.camera.position.z = newPos.z;
            this.camera.rotation.y = rotation;

            if (rotation > 0.9) {
                this.switchState('aroundTheCorner');
            }
        }
    }

    stateAroundTheCorner(dt) {
        let zdir = world.keys.KeyW ? -1 : (world.keys.KeyS ? 1 : 0);
        this.blocky.walk(new THREE.Vector2(0, zdir), 160);
        this.blocky.velocity.z *= 0.9;

        let z = this.blocky.mesh.position.z;
        if (z > 150) {
            this.blocky.mesh.position.z = 150;
            this.blocky.velocity.set(0, 0, 0);
        } else {
            this.blocky.updatePos(dt);
        }

        console.log(this.blocky.mesh.position.z);


    }
}
