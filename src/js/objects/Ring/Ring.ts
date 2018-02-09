import {
  Mesh, MeshPhongMaterial, SphereGeometry, TextureLoader, TorusGeometry, Vector3
} from 'three';

import PlanetModel from '../../models/PlanetModel';
import RingModel from '../../models/RingModel';

export default class Ring {

  public mesh: any;

  constructor(ringData?: RingModel, parentPlanetData?: PlanetModel) {
    if (ringData && parentPlanetData) {
      const loader = new TextureLoader();

      const { radius, tube, rotation, opacity, texture } = ringData;

      const ringRadius = radius / 60;

      const ringGeometry = new TorusGeometry(ringRadius, tube, 16, 100);
      const ringMaterial = new MeshPhongMaterial({
        color: 0xAAAAAA,
        specular: 0x333333,
        shininess: 15,
        transparent: true,
        opacity
      });
      if (texture) {
        ringMaterial.map = loader.load(texture);
      }

      this.mesh = new Mesh(ringGeometry, ringMaterial);
      this.mesh.name = 'ring';
      this.mesh._planetPosition = new Vector3();
      this.mesh._isBelongToGroup = true;
      this.mesh.radius = ringRadius;
      this.mesh.rotation.x = rotation;
      this.mesh.scale.z = 0.1;

    } else {
      console.warn('[Ring] Data is missing');
    }
  }

}
