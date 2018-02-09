import {
  AdditiveBlending, Sprite, SpriteMaterial, TextureLoader, Vector2
} from 'three';

export default class StarField {
  public sprite: Sprite;

  constructor() {
    const spriteMaterial = new SpriteMaterial({
      map: new TextureLoader().load("./assets/webgl/images/cloud.jpg"),
      color: 0xffffff,
      blending: AdditiveBlending
    });
    spriteMaterial.opacity = 0.1;

    this.sprite = new Sprite(spriteMaterial);
    this.sprite.scale.set(200000, 200000, 1);
  }

  public update(mouse: Vector2) {
    console.log(mouse);
  }

}
