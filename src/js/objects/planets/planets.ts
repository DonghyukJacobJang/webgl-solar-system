import { Mesh, MeshNormalMaterial, MeshPhongMaterial, SphereGeometry, TextureLoader } from 'three';
import AssetLoader from '../../utils/loading/asset-loader';

import assets from './assets';
import { planets } from './data';

export default class Planets {

  public mesh: Mesh;
  public planetMeshs: any = [];

  private earthTexture = null;

  constructor() {
    AssetLoader('planets', assets)
      .then(this.onAssetsLoaded)
      .catch(this.onAssetsError);
    const loader = new TextureLoader();

    Object.keys(planets).forEach((key) => {
      const radius = planets[key].radius / 6000;
      const distance = planets[key].distance / 6000 * 0.001;
      const texture = planets[key].texture && loader.load(planets[key].texture);
      const textureSpecular = planets[key].textureSpecular && loader.load(planets[key].textureSpecular);
      const textureNormal = planets[key].textureNormal && loader.load(planets[key].textureNormal);
      let material: MeshPhongMaterial | MeshNormalMaterial;
      const geometry = new SphereGeometry(radius, 32, 32);
        material = new MeshPhongMaterial({
          color: 0xAAAAAA,
          specular: 0x333333,
          shininess: 15,
          map: texture,
          specularMap: textureSpecular,
          normalMap: textureNormal
        });
      const planet: any = new Mesh(geometry, material);
      planet.position.x = distance;
      planet.planetName = key;
      planet.radius = radius;
      planet.distance = distance;
      planet.periodOfRevolution = planets[key].periodOfRevolution;

      this.planetMeshs.push(planet);
    });
  }

  public update(_time): void {
    const time = _time * 0.00125;

    this.planetMeshs.forEach((planet) => {
      planet.position.x = Math.cos(time / planet.periodOfRevolution * 10) * planet.distance || 0;
      planet.position.z = -Math.sin(time / planet.periodOfRevolution * 10) * planet.distance || 0;
    });
  }

  private onAssetsLoaded = (value: any) => {
    this.earthTexture = value;
    console.log('assets loaded', value);
  };

  private onAssetsError = (error: any) => {
    console.warn(error);
  };

}
