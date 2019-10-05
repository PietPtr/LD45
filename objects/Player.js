

class Player {
    constructor() {
        this.group = new THREE.Group();
        this.group.add(resources.mesh('dude'));
        this.group.position.z = 50;

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
    }

    addItem(item) {
        if (!this.items[item.type]) {
            this.group.add(resources.mesh(item.type));
            this.items[item.type] = true;
            return true;
        }
        return false
    }

    removeItem(item) {
        if (this.items[item.type]) {
            this.group.remove(item.mesh);
            this.items[item.type] = false;
        }
    }

    onFrame(dt, time) {
        let heading = new THREE.Vector3(0, 0, 0.01).applyAxisAngle(UP, this.rotation);
        let diff = heading.clone().add(this.velocity.clone()).normalize();
        this.velocity.add(diff).normalize();

        this.group.position.add(this.velocity.clone().multiplyScalar(this.speed * dt));

        const ROT_ACCEL = 6;
        const FRICTION = 3;
        this.rotaccel = world.keys.KeyA ? ROT_ACCEL : (world.keys.KeyD ? -ROT_ACCEL : 0);
        this.rotrate += this.rotaccel * dt;
        this.rotrate -= (this.rotrate / 3) * FRICTION * dt;
        this.rotation += this.rotrate * dt;

        this.group.rotation.y = this.rotation;

        this.acceleration = Object.values(this.items).filter(i => i).length / 5;
        this.speed += dt * this.acceleration;
    }
}
