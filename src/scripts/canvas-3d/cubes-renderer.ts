import { Mesh, Object3D, PerspectiveCamera } from 'three';
import { BaseRenderer } from './base-renderer';

export class RotationRenderer extends BaseRenderer {
    private meshes: Mesh[] = [];

    constructor(canvasId: string) {
        super(canvasId);
        this.camera.position.set(0, 1, 2);
        this.startAnimation();
    }

    protected createCamera(): void {
        this.camera = new PerspectiveCamera(75, 2, 0.1, 5);
    }

    protected render(time: number): void {
        const secondsTime = time / 1000;

        this.meshes.forEach((mesh, index) => {
            const speed = 1 + index * .1;
            const rotation = secondsTime * speed;
    
            mesh.rotation.x = rotation;
            mesh.rotation.y = rotation;
        });
    }

    addObject(object: Object3D): void {
        if (object instanceof Mesh) {
            this.meshes.push(object);
        }

        this.scene.add(object);
    }
}