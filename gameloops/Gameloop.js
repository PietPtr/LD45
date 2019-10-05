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
    }

    start() {

    }

    stop() {

    }

    onFrame(dt, time) {
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
        console.log(this.player.group.position.z);

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
        }

        if (Math.random() < 0.8 && new Date() - this.lastSpawn > 3000) {
            this.items.push(this.randomItem());
            this.lastSpawn = new Date();
        }

        if (Math.random() < 0.8 && new Date() - this.lastCopSpawn > 12000 && this.camstate != 'GoingUp') {
            this.cops.push(new Cop(this.player));
            this.lastCopSpawn = new Date();
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
        let index = randint(start, end)
        let type = ITEMS[index];
        return new Item(type, this.player.group.position.z + 100);
    }

    updateKeys(axes, buttons, dt, pressed) {
    }
}
