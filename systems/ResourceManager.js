
// Fetches all the small models ('worldparts') that other larger models may need to use dynamically
// and provides access to it.
class ResourceManager {
    constructor() {
        if (!ResourceManager.instance) {
            this.meshes = {};
            this.maps = {};
            this.fonts = {};

            ResourceManager.instance = this;
        }


        return ResourceManager.instance;
    }

    loadModel(name) {
        return new Promise(resolve => {
            loadModel(name).then(mesh => {
                this.meshes[name] = mesh;
                resolve(mesh);
            })
        })
    }

    loadModels() {
        const modelNames = ['backwheels', 'chassis', 'cop', 'dude', 'engine', 'frame', 'frontwheels', 'top', 'tree1'];

        const meshes = {};

        const modelPromises = modelNames.map(name => {
            return loadModel(name).then(mesh => {
                let fixMaterial = (material) => {
                    return new THREE.MeshBasicMaterial({ color: material.color, side: THREE.DoubleSide })
                }

                try {
                    for (let i = 0; i < mesh.children[0].material.length; i++) {
                        mesh.children[0].material[i] = fixMaterial(mesh.children[0].material[i]);
                    }
                } catch (e) {
                    mesh.children[0].material = fixMaterial(mesh.children[0].material);
                }

                meshes[name] = mesh;
            });
        });

        return Promise.all(modelPromises).then(() => {
            this.meshes = meshes;
        });
    }

    loadTextures() {
        const textureNames = [];

        const maps = {};

        const texturePromises = textureNames.map(name => {
            return loadTexture(name).then(map => {
                maps[name] = map;
            });
        });

        return Promise.all(texturePromises).then(() => {
            this.maps = maps;
        });
    }

    loadFonts() {
        const fontNames = [];

        const fonts = {};

        const fontPromises = fontNames.map(name => {
            return loadFont(name).then(font => {
                fonts[name] = font;
            });
        });

        return Promise.all(fontPromises).then(() => {
            this.fonts = fonts;
        });
    }

    mesh(name) {
        return this.meshes[name].clone();
    }

    map(name) {
        return this.maps[name].clone();
    }
}
