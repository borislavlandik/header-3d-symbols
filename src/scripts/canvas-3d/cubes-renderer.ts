import { Mesh, Object3D } from 'three';
import { BaseRenderer } from './base-renderer';
import { IPerspectiveCameraSettings } from './base-renderer.interface';

export class RotationRenderer extends BaseRenderer {
    private meshes: Mesh[] = [];

    constructor(canvasId: string, cameraSettings: IPerspectiveCameraSettings) {
        super(canvasId, cameraSettings);
        this.camera.position.set(0, 1, 2);
        this.startAnimation();
    }

    addObject(object: Object3D): void {
        if (object instanceof Mesh) {
            this.meshes.push(object);
        }

        this.scene.add(object);
    }

    render(time: number): void {
        const secondsTime = time / 1000;

        this.meshes.forEach((mesh, index) => {
            const speed = 1 + index * .1;
            const rotation = secondsTime * speed;
    
            mesh.rotation.x = rotation;
            mesh.rotation.y = rotation;
        });
    }
}