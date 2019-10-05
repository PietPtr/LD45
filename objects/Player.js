

class Player {
    constructor() {
        this.group = new THREE.Group();
        this.group.add(resources.mesh('dude'));
        this.group.position.z = 50;
        this.group.position.x = -ROAD_WIDTH / 3;

        this.rotaccel = 0;
        this.rotrate = 0;
        this.rotation = 0;

        this.acceleration = 0.1;
        this.speed = 10;
        this.velocity = new THREE.Vector3(0, 0, 1);

        this.items = {
            'chassis': false,
            'frontwheels': false,
            'backwheels': false,
            'engine': false,
            'frame': false,
            'top': false
        }

        this.playedRiskysound = false;
        this.startChase = new Date();
    }

    addItem(item) {

        if (!this.items[item.type]) {
            let mesh = resources.mesh(item.type);
            mesh.name = item.type;
            this.group.add(mesh);
            this.items[item.type] = true;
            return true;
        }

        if (item.type == 'frontwheels' && this.items['frontwheels'] && !this.items['backwheels']) {
            this.addItem({ type: 'backwheels' });
        }
        if (item.type == 'backwheels' && this.items['backwheels'] && !this.items['frontwheels']) {
            this.addItem({ type: 'frontwheels' });
        }

        return false
    }

    removeItem(item) {
        if (this.items[item]) {
            let mesh = this.group.getObjectByName(item);
            this.group.remove(mesh);
            this.items[item] = false;
            this.speed *= 0.7;
        }
    }

    onFrame(dt, time) {

        if (this.items.engine && this.items.frame && !this.playedRiskysound && new Date() - this.startChase > 45000) {
            riskySound.play();
            this.playedRiskysound = true;
        }

        let heading = new THREE.Vector3(0, 0, 0.01).applyAxisAngle(UP, this.rotation);
        let diff = heading.clone().add(this.velocity.clone()).normalize();
        this.velocity.add(diff).normalize();

        let grassMod = 1;

        if (this.group.position.x > ROAD_WIDTH/2 || this.group.position.x < -ROAD_WIDTH/2) {
            grassMod = GRASS_MODIFIER;
        }

        this.group.position.add(this.velocity.clone().multiplyScalar(this.speed * dt * grassMod));

        const ROT_ACCEL = 6;
        const FRICTION = 3;
        if (world.loop().gamestate == 'Going') {
            this.rotaccel = world.keys.KeyA ? ROT_ACCEL : (world.keys.KeyD ? -ROT_ACCEL : 0);
        }
        this.rotrate += this.rotaccel * dt;
        this.rotrate -= (this.rotrate / 3) * FRICTION * dt;
        this.rotation += this.rotrate * dt;

        this.group.rotation.y = this.rotation;

        this.acceleration = Object.values(this.items).filter(i => i).length / 5;
        this.speed += dt * this.acceleration;
    }

    hasEverything() {
        return this.items.top && this.items.engine && this.items.frame && this.items.frontwheels && this.items.backwheels && this.items.chassis;
    }
}
