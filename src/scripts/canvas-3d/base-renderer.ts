import { PerspectiveCamera, Renderer, Scene, WebGLRenderer } from 'three';
import { IPerspectiveCameraSettings } from './base-renderer.interface';

export abstract class BaseRenderer {
    protected renderer: Renderer;
    protected camera: PerspectiveCamera;
    protected scene: Scene;
    
    constructor (canvasId: string, cameraSettings: IPerspectiveCameraSettings) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        
        this.renderer = new WebGLRenderer({ canvas });
        this.camera = this.createCameraInstance(cameraSettings);
        this.scene = new Scene();

        this.renderer.render(this.scene, this.camera);
    }

    private createCameraInstance(cameraSettings: IPerspectiveCameraSettings): PerspectiveCamera {
        const { fov, aspect, near, far } = cameraSettings;
        return new PerspectiveCamera(fov, aspect, near, far);
    }

    private resizeRendererToDisplaySize(): boolean {
        const canvas = this.renderer.domElement;

        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
    
        if (needResize) {
          this.renderer.setSize(width, height, false);
        }
    
        return needResize;
    }

    private renderAnimationFrame(time: number): void {
        if (this.resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }
    
        this.render(time);
    
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame((time) => this.renderAnimationFrame(time));
    }

    public abstract render(time: number): void;

    public startAnimation(): void {
        requestAnimationFrame((time) => this.renderAnimationFrame(time));
    }
}