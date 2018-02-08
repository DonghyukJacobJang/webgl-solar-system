import {
  AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute,
  Points, ShaderMaterial, TextureLoader, VertexColors
} from 'three';

import * as Shader from './shader.glsl';

const PARTICLES = 25000;
const RADIUS = 10000;

export default class Stars {

  public points: Points;

  private material: ShaderMaterial;

  constructor() {
    this.material = new ShaderMaterial({
      uniforms: {
        texture: {
          value: new TextureLoader().load("./assets/webgl/images/lensflare_alpha.png")
        }
      },
      vertexShader: Shader.vertexShader,
      fragmentShader: Shader.fragmentShader,
      blending: AdditiveBlending
    });
    this.material.depthTest = false;
    this.material.transparent = true;
    this.material.vertexColors = VertexColors;

    const positions: any = [];
    const colors: any = [];
    const sizes: any = [];
    const color = new Color();

    for (let i = 0; i < PARTICLES; i++) {
      positions.push((Math.random() * 2 - 1) * RADIUS);
      positions.push((Math.random() * 2 - 1) * RADIUS);
      positions.push((Math.random() * 2 - 1) * RADIUS);
      color.setHSL(1.0, (Math.random() * 0.5 - 0.5), 0.5);
      colors.push(color.r, color.g, color.b);
      sizes.push(100);
    }

    const geometry = new BufferGeometry();
    geometry.addAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.addAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.addAttribute('size', new Float32BufferAttribute(sizes, 1).setDynamic(true));

    this.points = new Points(geometry, this.material);
  }

  public update(delta: number) {
    this.points.rotation.y = delta * 0.000001;
    this.points.rotation.z = delta * 0.000001;

    const sizes = this.points.geometry.attributes.size.array;

    for (let i = 0; i < PARTICLES; i++) {
      sizes[i] = 100 * (1 + Math.sin(0.1 * i + delta * 0.0005));
    }

    this.points.geometry.attributes.size.needsUpdate = true;
  }

}
