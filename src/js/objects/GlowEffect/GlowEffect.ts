import { AdditiveBlending, Sprite, SpriteMaterial, TextureLoader } from 'three';
import BasicModel from '../../models/BasicModel';
import PlanetModel from '../../models/PlanetModel';

const SCALEMODIFIER = 4;

export default class GlowEffect {
  public sprite: Sprite;

  constructor(data: BasicModel | PlanetModel) {
    const loader = new TextureLoader();
    const planetSpriteMaterial = new SpriteMaterial({
      map: loader.load("./assets/webgl/images/glow.png"),
      color: data.color,
      transparent: false,
      blending: AdditiveBlending
    });

    this.sprite = new Sprite(planetSpriteMaterial);
    this.sprite.material.opacity = 0;
    this.sprite.scale.set(data.radius * 0.075, data.radius * 0.075, 1.0);
  }

}
