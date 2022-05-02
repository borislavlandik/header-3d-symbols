// import { BoxGeometry, DirectionalLight, GridHelper, Mesh, MeshPhongMaterial } from 'three';
// import { RotationRenderer } from './canvas-3d/cubes-renderer';

import { FontRenderer } from './canvas-3d/font-renderer';

// function getCube(geomtetry: BoxGeometry, color = 0x44aa88, xPos = 0): Mesh {
//     const material = new MeshPhongMaterial({ color });

//     const cube = new Mesh(geomtetry, material);
//     cube.position.x = xPos;
    
//     return cube;
// }

// const rotationRenderer = new RotationRenderer('main-canvas', { fov: 75, aspect: 2, near: 0.1, far: 5});

// const geomtetry = new BoxGeometry(1, 1, 1);

// rotationRenderer.addObject(getCube(geomtetry, 0xf14212, 0));
// rotationRenderer.addObject(getCube(geomtetry, 0xf41f10, -2));
// rotationRenderer.addObject(getCube(geomtetry, 0x00f3cc, 2));

// const firstLight = new DirectionalLight(0xffffff, 1);
// firstLight.position.set(-1, 2, 4);

// const secondLight = new DirectionalLight(0xffffff, 1);
// secondLight.position.set(1, 2, 4);

// rotationRenderer.addObject(firstLight);
// rotationRenderer.addObject(secondLight);

// const gridHelper = new GridHelper(1000, 10000);

// rotationRenderer.addObject(gridHelper);

const fontRenderer = new FontRenderer('main-canvas');
fontRenderer.startAnimation();