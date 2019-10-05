

class WorldStrip {
    constructor(z) {
        this.group = new THREE.Group();
        this.group.position.z = z;

        var geometry = new THREE.PlaneGeometry( ROAD_WIDTH, 1000, 1, 200 );
        geometry.rotateX(0.5 * Math.PI);
        var material = new THREE.MeshBasicMaterial( {color: 0x5454545, side: THREE.DoubleSide} );
        var road = new THREE.Mesh( geometry, material );
        this.group.add(road);

        var geometry = new THREE.PlaneGeometry( 20000, 1000 );
        geometry.rotateX(0.5 * Math.PI);
        var material = new THREE.MeshBasicMaterial( {color: 0x52aa5e, side: THREE.DoubleSide} );
        var plane = new THREE.Mesh( geometry, material );
        plane.position.y = -20;
        this.group.add(plane);

        var geometry = new THREE.PlaneGeometry( 0.3, 1000, 1, 200 );
        geometry.rotateX(0.5 * Math.PI);
        var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
        var line1 = new THREE.Mesh( geometry, material );
        line1.position.y = 0.1;
        line1.position.x = -(ROAD_WIDTH / 2 - 0.5);
        this.scene().add(line1);
        var line2 = line1.clone();
        line2.position.x = ROAD_WIDTH / 2 - 0.5;
        this.scene().add(line2);

        for (let w = -1; w < 2; w += 2) {
            for (let i = 0; i < 1000; i += 10) {
                let tree = resources.mesh('tree1');
                tree.position.x = (ROAD_WIDTH / 2 + 3) * w;
                tree.position.z = i;
                tree.rotation.y = Math.random() * Math.PI * 2;
                tree.scale.multiplyScalar(Math.random() + 1.5);
                this.group.add(tree);
            }
        }

        world.scene().add(this.group);
    }
}
