import { FontRenderer } from './canvas-3d/font-renderer';

const fontRenderer = new FontRenderer('main-canvas');
fontRenderer.startAnimation();

document.addEventListener('click', () => {
    fontRenderer.switchColorSceme();
});