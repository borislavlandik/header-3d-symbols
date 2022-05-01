import { WebGLRenderer, PerspectiveCamera, Scene, BoxGeometry, Material, Mesh, Renderer, DirectionalLight, Light, MeshPhongMaterial } from 'three';

export function setScene(): void {
    const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    const renderer = new WebGLRenderer({ canvas });

    const camera = getCamera();
    camera.position.z = 2;

    const scene = getScene();
    const geomtetry = getBoxGeomerty();

    const cubes = [
        getCube(scene, geomtetry, 0xf14212, 0),
        getCube(scene, geomtetry, 0xf41f10, 2),
        getCube(scene, geomtetry, 0x00f3cc, -2),
    ];

    const light = getLightSource();
    light.position.set(-1, 2, 4);

    scene.add(light);

    renderer.render(scene, camera);

    render({ meshes: cubes, renderer, scene, camera }, 0);
}

function render(renderParams: {
    meshes: Mesh[],
    renderer: Renderer,
    scene: Scene,
    camera: PerspectiveCamera
}, time: number): void {
    const { meshes, renderer, scene, camera } = renderParams;
    const secondsTime = time * 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    meshes.forEach((mesh, index) => {
        const speed = 1 + index * .1;
        const rotation = secondsTime * speed;

        mesh.rotation.x = rotation;
        mesh.rotation.y = rotation;
    });

    renderer.render(scene, camera);

    requestAnimationFrame((time) => render(renderParams, time));
}

function resizeRendererToDisplaySize(renderer: Renderer): boolean {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

function getCamera(): PerspectiveCamera {
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;
    return new PerspectiveCamera(fov, aspect, near, far);
}

function getScene(): Scene {
    return new Scene();
}

function getCube(scene: Scene, geomtetry: BoxGeometry, color = 0x44aa88, xPos = 0): Mesh {
    const material = getColorMaterial(color);

    const cube = new Mesh(geomtetry, material);
    cube.position.x = xPos;

    scene.add(cube);
    
    return cube;
}

function getBoxGeomerty(width = 1, height = 1, depth = 1): BoxGeometry {
    return new BoxGeometry(width, height, depth);
}

function getColorMaterial(color = 0x44aa88): Material {
    return new MeshPhongMaterial({ color });
}

function getLightSource(color = 0xffffff, intensity = 1): Light {
  return new DirectionalLight(color, intensity);
}