import {
  Mesh, MeshPhongMaterial, SphereGeometry, TextureLoader
} from 'three';

import BasicModel from '../../models/BasicModel';
import PlanetModel from '../../models/PlanetModel';
import GlowEffect from '../GlowEffect/GlowEffect';

export default class Moon {

  public mesh: any;

  constructor(moonData?: BasicModel, parentPlanetData?: PlanetModel) {
    if (moonData && parentPlanetData) {
      const loader = new TextureLoader();

      const { radius, distance, texture, periodOfRevolution, periodOfRotation } = moonData;
      const moonRadius = radius / 60;
      const moonDistance = distance / 60 * 0.075 + parentPlanetData.radius / 60;
      const moonTexture = loader.load(texture);

      const moonGeometry = new SphereGeometry(moonRadius, 32, 32);
      const moonMaterial = new MeshPhongMaterial({
        color: 0xAAAAAA,
        specular: 0x333333,
        shininess: 15,
        map: moonTexture
      });

      this.mesh = new Mesh(moonGeometry, moonMaterial);
      this.mesh.position.x = moonDistance;
      this.mesh.name = 'moon';
      this.mesh.radius = moonRadius;
      this.mesh.distance = moonDistance;
      this.mesh.periodOfRevolution = periodOfRevolution;
      this.mesh.periodOfRotation = periodOfRotation;

      const moonSprite = new GlowEffect(moonData);
      this.mesh.add(moonSprite.sprite);
    } else {
      console.warn('[Moon] Data is missing');
    }
  }

  public update(_time: number): void {
    console.log(_time);
  }

}
