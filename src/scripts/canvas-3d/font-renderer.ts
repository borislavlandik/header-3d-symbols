import { Color, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Raycaster, ShaderMaterial, Vector3 } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import TWEEN from '@tweenjs/tween.js';
import { BaseRenderer } from './base-renderer';
import { map } from '../utils';

export class FontRenderer extends BaseRenderer {
    private plane: Mesh = {} as Mesh;
    private meshes: Mesh[] = [];
    private pointer = new Vector3(0, 0, 0);
    private raycaster = new Raycaster();

    private colorSceme: 'black' | 'white' = 'black';
    private mainColor = 0x000000;
    private fontHeight = 4;
    private fontSize = 5;
    
    constructor(canvasId: string) {
        super(canvasId);
        this.configureCamera();
        this.listenMousePosition();
        this.createBasePlane();

        const fontLoader = new FontLoader();
        fontLoader.load('./assets/fonts/JetBrainsMonoExtraBold.json', (font) => this.generateText(font));

        this.startAnimation();
    }

    protected createCamera(): void {
        this.camera = new OrthographicCamera(-30, 30, 30, -30, 0.1, 100);
    }
    
    protected render(_time: number): void {
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects([ this.plane ]);

        if (intersects.length == 0) {
            return;
        }

        const intersectionPoint = intersects[0].point;
        intersectionPoint.z = 0;

        for(const mesh of this.meshes) {
            const position = mesh.position.clone();

            position.z = 0;
            position.x += this.fontSize / 2 - this.fontSize / 5;
            position.y += this.fontSize / 2;

            const distance = position.distanceTo(intersectionPoint);
            const zPosition = map(distance, 3, 10, this.fontHeight, 0);

            mesh.position.setZ(Math.min(zPosition, 0));
        }

        TWEEN.update();
    }

    public switchColorSceme(): void {
        const mainColor = new Color(this.mainColor);
        new TWEEN.Tween(mainColor)
            .to(new Color(this.colorSceme === 'black' ? 0xffffff : 0x000000), 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this.meshes.forEach(mesh => {
                    const material = mesh.material as ShaderMaterial;
                    material.uniforms.color2.value = mainColor;
                    material.needsUpdate = true;
                });
        
                const planeMaterial = this.plane.material as MeshBasicMaterial;
                planeMaterial.color.set(mainColor);
                planeMaterial.needsUpdate = true;
            })
            .onComplete(() => {
                this.colorSceme = this.colorSceme === 'black' ? 'white' : 'black';
                this.mainColor = mainColor.getHex();
            })
            .start();
    }

    private getTextMesh(font: Font, text: string): Mesh {
        const geometry = new TextGeometry(text, {
            font: font,
            size: this.fontSize,
            height: this.fontHeight,
        });

        geometry.computeBoundingBox();
        const material = new ShaderMaterial({
            uniforms: {
                color1: {
                    value: new Color(0x20e831),
                },
                color2: {
                    value: new Color(this.mainColor),
                },
                bboxMin: {
                    value: geometry.boundingBox?.min || 0,
                },
                bboxMax: {
                    value: geometry.boundingBox?.max || 0,
                }
            },
            vertexShader: `
                uniform vec3 bboxMin;
                uniform vec3 bboxMax;
            
                varying vec2 vUv;
            
                void main() {
                    vUv.y = (position.z - bboxMin.z) / (bboxMax.z - bboxMin.z);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
            
                varying vec2 vUv;
                
                void main() {
                    gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
                }
            `
        });

        return new Mesh(geometry, material);
    }

    private getRandomElement<T>(array: Array<T>): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    private generateText(font: Font): void {
        const xStart = -this.fontSize * 10, 
            xEnd = this.fontSize * 10, 
            yStart = -this.fontSize * 10, 
            yEnd = this.fontSize * 10;

        const textSymbols: Mesh[] = [
            this.getTextMesh(font, '0'),
            this.getTextMesh(font, '1'),
        ];

        for (let y = yStart; y <= yEnd; y += this.fontSize + 1) {
            for (let x = xStart; x <= xEnd; x += this.fontSize - 1) {
                const randomMesh = this.getRandomElement(textSymbols).clone();
                randomMesh.position.set(x, y, this.fontHeight);
                this.scene.add(randomMesh);
                this.meshes.push(randomMesh);       
            }
        }
    }

    private configureCamera(): void {
        this.camera.position.set(30, 0, 35);
        this.camera.rotateX(0.5);
        this.camera.rotateY(0.7);
    }

    private listenMousePosition(): void {
        window.addEventListener('pointermove', (event) => {
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
        });
    }

    private createBasePlane(): void {
        const planeGeomerty = new PlaneGeometry(300, 300);
        const planeMaterial = new MeshBasicMaterial({ color: this.mainColor });
        this.plane = new Mesh(planeGeomerty, planeMaterial);
        this.plane.position.set(0, 0, 0);
        this.scene.add(this.plane);
    }
}