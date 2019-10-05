

class Gameloop {
    constructor() {

    }

    init() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        // this.renderer.setClearColor(new THREE.Color('#6a7b76'), 1);
        this.renderer.setClearColor(new THREE.Color('#0c1021'), 1);
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
        this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 100000 );
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
            inTheHole: this.stateInTheHole,
            toThePortal: this.stateToThePortal,
            inPortal: this.stateInPortal,
            revealPlus: this.stateRevealPlus
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
            },
            'aroundTheCorner': {
                'inTheHole': () => {
                    this.blocky.velocity.set(0, 0, 0);
                }
            },
            'inTheHole': {
                'toThePortal': () => {
                    this.blocky.velocity.set(0, 0, 0);
                }
            },
            'toThePortal': {
                'inPortal': () => {
                    this.blocky.velocity.set(0, 0, 0);
                    this.blocky.mesh.position.set(this.blocky.mesh.position.x, PORTALPOS.y, PORTALPOS.z);
                    world.scene().remove(world.portal);
                }
            },
            'inPortal': {
                'revealPlus': () => {

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
        this.blocky.walk(new THREE.Vector3(xdir, 0, 0), 80);

        let x = this.blocky.mesh.position.x;

        if (xdir == 0) {
            this.blocky.velocity.x *= 0.9;
        }
        if (x < -70) {
            this.blocky.mesh.position.x = -70
            this.blocky.velocity.set(0, 0, 0);
        } else {
            this.blocky.updatePos(dt);
        }

        if (x > 50 && x < 90) {
            this.camera.position.x = this.blocky.mesh.position.x - 50;
        } else if (x > 90) {
            let rotation = Math.min(0.9, ((x - 90) / 50) * Math.PI / 4);
            let newPos = CAM_START_POS.clone()
                .applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation);

            this.camera.position.x = x - 50 + newPos.x;
            this.camera.position.y = newPos.y;
            this.camera.position.z = newPos.z;
            this.camera.rotation.y = rotation;

            if (rotation >= 0.9) {
                this.aroundTheCornerStartZ = newPos.z;
                this.switchState('aroundTheCorner');
            }
        }
    }

    stateAroundTheCorner(dt) {
        let zdir = world.keys.KeyW ? -1 : (world.keys.KeyS ? 1 : 0);
        this.blocky.walk(new THREE.Vector3(0, 0, zdir), 160);
        if (zdir == 0) {
            this.blocky.velocity.z *= 0.9;
        }

        let z = this.blocky.mesh.position.z;
        if (z > 150) {
            this.blocky.mesh.position.z = 150;
            this.blocky.velocity.set(0, 0, 0);
        } else {
            this.blocky.updatePos(dt);
        }

        if (z < -50 && z > -250) {
            this.camera.position.z = this.aroundTheCornerStartZ + z + 50;
        } else if (z < -250) {
            let rotation = Math.min(0.5 * Math.PI, -((z + 250) / 100) * Math.PI / 4 + 0.9);
            let newPos = CAM_START_POS.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation);

            this.camera.position.x = this.blocky.mesh.position.x - 50 + newPos.x;
            this.camera.position.y = newPos.y;
            this.camera.position.z = z + 50 + newPos.z;
            this.camera.rotation.y = rotation;

            if (rotation >= 0.5 * Math.PI) {
                this.switchState('inTheHole');
            }
        }
    }

    stateInTheHole(dt) {
        let zdir = world.keys.KeyA ? 1 : (world.keys.KeyD ? -1 : 0);
        let ydir = world.keys.KeyW ? 1 : (world.keys.KeyS ? -1 : 0);
        this.blocky.walk(new THREE.Vector3(0, ydir, zdir), 80);
        if (zdir == 0) {
            this.blocky.velocity.z *= 0.9;
        }
        if (ydir == 0) {
            this.blocky.velocity.y *= 0.9;
        }

        this.blocky.updatePos(dt);

        let z = this.blocky.mesh.position.z + 5;
        let y = this.blocky.mesh.position.y + 5;
        let pz = PORTALPOS.z;
        let py = PORTALPOS.y;

        if (z > pz && z < pz + 10 && y > py && y < py + 10) {
            this.switchState('toThePortal');
        }
    }

    stateToThePortal(dt) {
        let diff = new THREE.Vector3(this.blocky.mesh.position.x, PORTALPOS.y, PORTALPOS.z).clone().sub(new THREE.Vector3(2.5,2.5,2.5)).sub(this.blocky.mesh.position).add(new THREE.Vector3(3, 3, 3));
        this.blocky.velocity.copy(diff);
        this.blocky.updatePos(dt);

        if (diff.length() < 1) {
            this.switchState('inPortal');
        }
    }

    stateInPortal(dt) {
        this.blocky.mesh.scale.sub(new THREE.Vector3(1, 1, 1).multiplyScalar(dt));

        if (this.blocky.mesh.scale.x < 0) {
            this.switchState('revealPlus');
        }
    }

    stateRevealPlus(dt) {
        // this.camera.lookAt(this.plus.mesh.position.x, this.plus.mesh.position.y, this.plus.mesh.position.z);
        if (this.camera.zoom > 0.05) {
            this.camera.zoom -= 0.1 * dt;
            this.camera.updateProjectionMatrix();
        }

        // let ROTSPEED = 0.1;
        // let rotation = this.camera.rotation;
        // if ((rotation.x % (2*Math.PI)) < 0.7) {
        //     rotation.x += ROTSPEED * dt;
        //     console.log(rotation.x)
        // }
        // if (rotation.y % (2*Math.PI) < 0.47) {
        //     rotation.y -= ROTSPEED * dt;
        //     console.log(rotation.y)
        // }
        // if (rotation.z % (2*Math.PI) < 0.4) {
        //     rotation.z += ROTSPEED * dt;
        //     console.log(rotation.z)
        // }

        let POSSPEED = 300;
        let position = this.camera.position;
        // if (position.x < 500) {
        //     position.x += POSSPEED * dt;
        //     console.log(position.x)
        // }
        // if (position.y < 1000) {
        //     position.y += POSSPEED * dt;
        //     console.log(position.y)
        // }
        // if (position.z < 1100) {
        //     position.z += POSSPEED * dt;
        //     console.log(position.z)
        // }

        let meshquat = this.plus.mesh.quaternion;
        if (!(Math.round(meshquat.y * 10) / 10 == 0.3 && Math.round(meshquat.z * 10) / 10 == 0.3)) {
            let quat = new THREE.Quaternion(
                0,
                -0.25 * dt,
                -0.25 * dt,
                1
            ).normalize();

            this.plus.mesh.quaternion.multiply(quat);
        }
    }
}
