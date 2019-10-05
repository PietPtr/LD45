const ITEMS = ['chassis', 'frontwheels', 'backwheels', 'engine', 'frame', 'top'];

class Gameloop {
    constructor() {

    }

    init() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setClearColor(new THREE.Color('#1ac8ed'), 1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }, false);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 10000000);
        this.camera.position.set(-2.5, 5, -15);
        this.controls = new THREE.OrbitControls(this.camera);

        this.player = new Player();

        this.items = [];
        this.lastSpawn = new Date() - 3000;
        this.lastCopSpawn = new Date() - 12000;

        this.cops = [];

        world.scene().add(this.player.group);

        this.camstate = 'GoingUp';

        this.lastWorldStripAddedAt = -500;

        this.gamestate = 'Start'
    }

    start() {

    }

    stop() {

    }

    onFrame(dt, time) {
        if (this.gamestate == 'Start') {
            this.controls.update();
        } else if (this.gamestate == 'Going') {
            if (this.camstate == 'GoingUp') {
                this.controls.panUp(3 * dt);
                this.controls.update();

                if (this.controls.theta < -3 && this.controls.phi < 0.5) {
                    this.camstate = 'ToTheLeft';
                }
            } else if (this.camstate == 'ToTheLeft') {
                this.controls.panLeft(2 * dt);
                this.controls.update();

                if (this.controls.theta > 2.5 && this.controls.theta < 2.7) {
                    this.camstate = 'ToTheRight';
                }
            } else if (this.camstate == 'ToTheRight') {
                this.controls.panLeft(-2 * dt);
                this.controls.update();

                if (this.controls.theta > -2.7 && this.controls.theta < -2.5) {
                    this.camstate = 'ToTheLeft';
                }
            }

            this.player.onFrame(dt, time);
            this.controls.target.copy(this.player.group.position);
            this.camera.position.z = this.player.group.position.z + -15;

            for (let i = this.items.length - 1; i >= 0; i--) {
                let item = this.items[i];
                item.onFrame(dt, time);

                if (item.collides(this.player.group.position)) {
                    let result = this.player.addItem(item);
                    if (result) {
                        world.scene().remove(item.mesh);
                        this.items.splice(i, 1);
                    }
                }
            }

            for (let cop of this.cops) {
                cop.onFrame(dt, time, this.player.group.position.clone());

                if (this.player.group.position.distanceTo(cop.mesh.position) < 2 && !cop.exploded) {
                    cop.explode();
                    let has = this.player.items;
                    let toRemove = '';
                    if (has.top) {
                        toRemove = 'top';
                    } else if (has.frame) {
                        toRemove = 'frame';
                    } else if (has.engine) {
                        toRemove = 'engine';
                    } else if (has.backwheels) {
                        toRemove = 'backwheels';
                    } else if (has.frontwheels) {
                        toRemove = 'frontwheels';
                    } else if (has.chassis) {
                        toRemove = 'chassis';
                    } else {
                        continue; // nothing to drop
                    }
                    this.player.removeItem(toRemove);
                    this.items.push(new Item(toRemove, this.player.group.position.z - 5));
                }
            }

            for (let strip of world.strips) {
                strip.onFrame(dt, time, [this.player.group.position].concat(this.cops.map(c => c.mesh.position)))
            }

            if (Math.random() < 0.08 && new Date() - this.lastSpawn > 3000) {
                let item = this.randomItem();
                if (item) {
                    this.items.push(item);
                }
                this.lastSpawn = new Date();
            }

            if (Math.random() < 0.08 && new Date() - this.lastCopSpawn > 12000 && this.camstate != 'GoingUp') {
                this.cops.push(new Cop(this.player));
                this.lastCopSpawn = new Date();
            }



            if (this.player.hasEverything()) {
                this.gamestate = 'End';
                this.player.velocity = new THREE.Vector3(0, 0, 1);
                this.player.rotation = 0;
                this.player.rotrate = 0;
                this.player.rotaccel = 0;
                this.controls.object.position.set(-2.5, 10, 20);
                this.controls.update();

                document.getElementById('youwon1').style.opacity = 0.5;
                document.getElementById('youwon2').style.opacity = 1;
            }
        } else if (this.gamestate == 'End') {
            this.player.onFrame(dt, time);
            this.controls.target.copy(this.player.group.position);
            this.camera.position.z = this.player.group.position.z + -10;
            this.camera.position.x = this.player.group.position.x + 20;
            this.camera.position.y = this.player.group.position.y + 10;
            // this.controls.object.position.set(-2.5, 10, );
            this.controls.update();

            for (let cop of this.cops) {
                cop.onFrame(dt, time, this.player.group.position.clone());
            }

            for (let strip of world.strips) {
                strip.onFrame(dt, time, [this.player.group.position].concat(this.cops.map(c => c.mesh.position)))
            }

            if (Math.random() < 0.08 && new Date() - this.lastCopSpawn > 12000 && this.camstate != 'GoingUp') {
                this.cops.push(new Cop(this.player));
                this.lastCopSpawn = new Date();
            }
        }

        if (this.player.group.position.z - this.lastWorldStripAddedAt > 700) {
            this.lastWorldStripAddedAt += 1000;
            world.strips.push(new WorldStrip(this.lastWorldStripAddedAt + 1500));

            if (world.strips.length > 3) {
                world.strips[0].remove();
                delete world.strips[0];
                world.strips.shift();
            }
        }


        this.renderer.render( world.getScene('world'), this.camera );
    }

    randomItem() {
        let start = 0
        let end = 2;

        let has = this.player.items;
        if (has.chassis && has.frontwheels && has.backwheels) {
            start = 3;
            end = 4;
        }
        if (has.chassis && has.frontwheels && has.backwheels && has.engine && has.frame) {
            start = 5;
            end = 5;
        }
        if (has.chassis && has.frontwheels && has.backwheels && has.engine && has.frame && has.top) {
            return false;
        }
        let index = randint(start, end)
        let type = ITEMS[index];
        return new Item(type, this.player.group.position.z + 100);
    }

    updateKeys(axes, buttons, dt, pressed) {
    }
}
