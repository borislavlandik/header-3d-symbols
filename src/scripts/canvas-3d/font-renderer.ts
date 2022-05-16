import { Color, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Raycaster, ShaderMaterial, Vector3 } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import TWEEN from '@tweenjs/tween.js';
import { BaseRenderer } from './base-renderer';
import { map } from '../utils';

interface IColorSceme {
    name: string;
    mainColor: Color;
    accentColor: Color;
}

export class FontRenderer extends BaseRenderer {
    private plane: Mesh = {} as Mesh;
    private meshes: Mesh[] = [];
    private pointer = new Vector3(0, 0, 0);
    private raycaster = new Raycaster();

    private colorScemes: IColorSceme[] = [
        {
            name: 'matrix',
            mainColor: new Color('#000000'),
            accentColor: new Color('#13ed51'),
        },
        {
            name: 'white-matrix',
            mainColor: new Color('#ffffff'),
            accentColor: new Color('#13ed51'),
        },
        {
            name: 'blue',
            mainColor: new Color('#0b1354'),
            accentColor: new Color('#3491fa'),
        },
        {
            name: 'pink',
            mainColor: new Color('#ffd4dc'),
            accentColor: new Color('#f765a3'),
        },
        {
            name: 'coral',
            mainColor: new Color('#fc766a'),
            accentColor: new Color('#5b84b1'),
        },
        {
            name: 'forest',
            mainColor: new Color('#2c5f2d'),
            accentColor: new Color('#97bc62'),
        },
        {
            name: 'blazing-yellow',
            mainColor: new Color('#101820'),
            accentColor: new Color('#fee715'),
        },
    ];
    private currentSceme: IColorSceme = this.colorScemes[0];

    private fontHeight = 3;
    private fontSize = 5;
    
    constructor(canvasId: string) {
        super(canvasId);
        this.configureCamera();
        this.listenMousePosition();
        this.createBasePlane();

        const fontLoader = new FontLoader();
        fontLoader.load('./assets/fonts/JetBrainsMonoExtraBoldFull.json', (font) => 
            this.generateText(
                font,
                ['angular', 'react', 'vue', 'svelte'],
                // ['<html>', '<script>', '<meta>', '#id', '.class', '[attr]', '@media', '@keyframes']
            )
        );

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
            const zPosition = map(distance, 1, 13, this.fontHeight, 0);

            mesh.position.setZ(Math.min(zPosition, 0));
        }

        TWEEN.update();
    }

    public switchColorSceme(): void {
        const currentIndex = this.colorScemes.findIndex(f => f === this.currentSceme);
        const nextSceme = this.colorScemes[(currentIndex + 1) % this.colorScemes.length];

        const currentColors: IColorSceme = { 
            ...this.currentSceme,
            mainColor: this.currentSceme.mainColor.clone(),
            accentColor:  this.currentSceme.accentColor.clone(),
        };
        const nextColors: IColorSceme = { 
            ...nextSceme,
            mainColor: nextSceme.mainColor.clone(),
            accentColor:  nextSceme.accentColor.clone(),
        };

        new TWEEN.Tween(currentColors)
            .to(nextColors, 1000)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .onUpdate(() => {
                this.meshes.forEach(mesh => {
                    const material = mesh.material as ShaderMaterial;
                    material.uniforms.color1.value = currentColors.accentColor;
                    material.uniforms.color2.value = currentColors.mainColor;
                    material.needsUpdate = true;
                });
        
                const planeMaterial = this.plane.material as MeshBasicMaterial;
                planeMaterial.color.set(currentColors.mainColor);
                planeMaterial.needsUpdate = true;
            })
            .onComplete(() => {
                this.currentSceme = nextSceme;
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
                    value: this.currentSceme.accentColor,
                },
                color2: {
                    value: this.currentSceme.mainColor,
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

    private generateText(font: Font, words: string[]): void {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        const cameraMultiplier = 4;
        const overflowAddition = this.fontSize * 3;

        const xStart = - Math.floor(screenWidth / (this.fontSize * cameraMultiplier) / 2) - overflowAddition;
        const xEnd = Math.floor(screenWidth / (this.fontSize * cameraMultiplier) / 2) + overflowAddition;
        const yStart = - overflowAddition; 
        const yEnd = Math.floor(screenHeight / (this.fontSize * cameraMultiplier)) + overflowAddition;

        const textMeshesMap: Map<string, Mesh> = new Map();;
        for (const word of words) {
            const symbols = word.split('');

            for (const symbol of symbols) {
                textMeshesMap.set(symbol, this.getTextMesh(font, symbol));
            }
        }

        for (let y = yStart; y <= yEnd; y += this.fontSize + 1) {
            let x = xStart;

            while (x <= xEnd) {
                const randomWord = this.getRandomElement(words);

                for (const symbol of randomWord) {
                    const randomMesh = textMeshesMap.get(symbol)!.clone();
                    randomMesh.position.set(x, y, this.fontHeight);

                    this.scene.add(randomMesh);
                    this.meshes.push(randomMesh);

                    x += this.fontSize - 1;
                }
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
        const planeMaterial = new MeshBasicMaterial({ color: this.currentSceme.mainColor });
        this.plane = new Mesh(planeGeomerty, planeMaterial);
        this.plane.position.set(0, 0, 0);
        this.scene.add(this.plane);
    }
}