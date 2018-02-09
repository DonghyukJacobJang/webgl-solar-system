import {
  Mesh, MeshPhongMaterial, SphereGeometry, TextureLoader
} from 'three';

import GlowEffect from '../GlowEffect/GlowEffect';
import Moon from '../Moon/Moon';
import Ring from '../Ring/Ring';

import PlanetModel from '../../models/PlanetModel';

import AssetLoader from '../../utils/loading/asset-loader';
import assets from './assets';
import { planets } from './data';

const SUNRADIUS = 69600;

export default class Planets {

  public planetMeshes: any = [];

  private textures;

  constructor() {
    // preload all assets
    AssetLoader('planets', assets)
      .then(this.onAssetsLoaded)
      .catch(this.onAssetsError);
    const loader = new TextureLoader();

    Object.keys(planets).forEach((key) => {
      // planet data
      const planetData: PlanetModel = planets[key];
      const { radius, distance, texture, textureNormal, textureSpecular } = planetData;
      const planetRadius = radius / 60;
      const planetDistance = distance / 60 * 0.001 + SUNRADIUS / 60;
      const planetTexture = loader.load(texture);

      const planetGeometry = new SphereGeometry(planetRadius, 32, 32);
      const planetMaterial = new MeshPhongMaterial({
        color: 0xAAAAAA,
        specular: 0x333333,
        shininess: 15,
        map: planetTexture
      });

      if (textureSpecular) {
        planetMaterial.specularMap = loader.load(textureSpecular);
      }
      if (textureNormal) {
        planetMaterial.normalMap = loader.load(textureNormal);
      }

      const planetMesh: any = new Mesh(planetGeometry, planetMaterial);
      planetMesh.position.x = planetDistance;
      planetMesh.name = key;
      planetMesh.radius = planetRadius;
      planetMesh.distance = planetDistance;
      planetMesh.periodOfRevolution = planetData.periodOfRevolution;
      planetMesh.periodOfRotation = planetData.periodOfRotation;

      if (planetData.moons) {
        // initiate moons
        const moon = new Moon(planetData.moons[0], planetData);
        planetMesh.add(moon.mesh);
      } else if (planetData.rings) {
        // initiate rings
        const ring = new Ring(planetData.rings[0], planetData);
        planetMesh.add(ring.mesh);
      }

      const planetSprite = new GlowEffect(planetData);
      planetMesh.add(planetSprite.sprite);

      this.planetMeshes.push(planetMesh);
    });
  }

  public update(_time: number): void {
    const time = _time * 0.00125;

    this.planetMeshes.forEach((planet) => {

      planet.rotation.y += 0.005 / planet.periodOfRotation;
      planet.position.x = Math.cos(time / planet.periodOfRevolution) * planet.distance || 0;
      planet.position.z = -Math.sin(time / planet.periodOfRevolution) * planet.distance || 0;

      if (planet.name === 'earth' && planet.children[0].name === 'moon') {
        // animate moon
        planet.children[0].position.x =
          Math.cos(time / planet.children[0].periodOfRevolution) * planet.children[0].distance || 0;
        planet.children[0].position.z =
          -Math.sin(time / planet.children[0].periodOfRevolution) * planet.children[0].distance || 0;

        planet.children[0].rotation.y += 0.005 / planet.children[0].periodOfRotation;
      }
    });
  }

  private onAssetsLoaded = (value: any) => {
    this.textures = value;
    console.log('assets loaded', value);
  };

  private onAssetsError = (error: any) => {
    console.warn(error);
  };

}
