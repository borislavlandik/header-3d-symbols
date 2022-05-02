import { Camera, OrthographicCamera, PerspectiveCamera, Renderer, Scene, WebGLRenderer } from 'three';

export abstract class BaseRenderer {
    protected renderer: Renderer;
    protected scene: Scene;
    protected camera: Camera = {} as Camera;
    
    constructor (canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        
        this.renderer = new WebGLRenderer({ canvas });
        this.scene = new Scene();

        this.createCamera();

        this.renderer.render(this.scene, this.camera);
    }

    protected abstract render(time: number): void;
    protected abstract createCamera(): void;

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

            if (this.camera instanceof PerspectiveCamera) {
                this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
                this.camera.updateProjectionMatrix();
            }

            if (this.camera instanceof OrthographicCamera) {
                const camFactor = 50;
                this.camera.left = -window.innerWidth / camFactor;
                this.camera.right = window.innerWidth / camFactor;
                this.camera.top = window.innerHeight / camFactor;
                this.camera.bottom = -window.innerHeight / camFactor;
                this.camera.updateProjectionMatrix();
            }
        }
    
        this.render(time);
    
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame((time) => this.renderAnimationFrame(time));
    }

    public startAnimation(): void {
        requestAnimationFrame((time) => this.renderAnimationFrame(time));
    }
}