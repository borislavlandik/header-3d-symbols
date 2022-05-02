import { Color, DirectionalLight, DoubleSide, Euler, GridHelper, Mesh, MeshBasicMaterial, MeshPhongMaterial, OrthographicCamera, PerspectiveCamera, PlaneGeometry, ShaderLib, ShaderMaterial } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { BaseRenderer } from './base-renderer';

export class FontRenderer extends BaseRenderer {
    private mainColor = 0x000000;

    private meshes: Mesh[] = [];
    
    constructor(canvasId: string) {
        super(canvasId);
        this.configureCamera();

        // const gridHelper = new GridHelper(1000, 10000);
        // this.scene.add(gridHelper);

        const planeGeomerty = new PlaneGeometry(150, 150);
        const doublesideMaterial = new MeshBasicMaterial( { color: this.mainColor, side: DoubleSide } );
        const plane = new Mesh(planeGeomerty, doublesideMaterial);

        this.scene.add(plane);

        const firstLight = new DirectionalLight(0xffffff, 1);
        firstLight.position.set(-1, 2, 4);
        firstLight.castShadow = true;

        const secondLight = new DirectionalLight(0xffffff, 1);
        secondLight.position.set(1, 2, 4);
        secondLight.castShadow = true;

        this.scene.add(firstLight);
        this.scene.add(secondLight);

        const fontLoader = new FontLoader();
        fontLoader.load('./assets/fonts/Share Tech Mono_Regular.json', (font) => this.generateText(font));

        this.startAnimation();
    }

    protected createCamera(): void {
        this.camera = new OrthographicCamera(-30, 30, 30, -30, 0.1, 100 );
    }
    
    protected render(time: number): void {
        const secondsTime = time / 1000;

        // this.meshes.forEach((mesh, index) => {
        //     const speed = 1 + index * .2;
        //     const position = - secondsTime * speed;
    
        //     mesh.position.z = position;
        // });
    }

    private getTextMesh(font: Font, fontSize: number, fontHeight: number, text: string): Mesh {
        const geometry = new TextGeometry(text, {
            font: font,
            size: fontSize,
            height: fontHeight,
        });

        geometry.computeBoundingBox();
        const material = new ShaderMaterial({
            uniforms: {
                color1: {
                value: new Color(0x20e831)
                },
                color2: {
                value: new Color(this.mainColor)
                },
                bboxMin: {
                value: geometry.boundingBox?.min || 0
                },
                bboxMax: {
                value: geometry.boundingBox?.max || 0
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
        const fontSize = 15;
        const fontHeight = 7;
        const xStart = -fontSize * 5, xEnd = fontSize * 4, yStart = -fontSize, yEnd = fontSize * 4;

        const textSymbols: Mesh[] = [
            this.getTextMesh(font, fontSize, fontHeight, '0'),
            this.getTextMesh(font, fontSize, fontHeight, '1'),
        ];

        for (let y = yStart; y <= yEnd; y += fontSize + 2) {
            for (let x = xStart; x <= xEnd; x += fontSize + 1) {
                const randomMesh = this.getRandomElement(textSymbols).clone();
                randomMesh.position.set(x, y, fontHeight);
                this.scene.add(randomMesh);
                this.meshes.push(randomMesh);       
            }
        }
    }

    private configureCamera(): void {
        this.camera.position.set(20, 0, 40);
        this.camera.rotateX(0.5);
        this.camera.rotateY(0.7);
    }
}