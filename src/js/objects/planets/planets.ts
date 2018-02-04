import {
  AdditiveBlending, Group, Mesh, MeshPhongMaterial, SphereGeometry,
  Sprite, SpriteMaterial, TextureLoader, TorusGeometry, Vector3
} from 'three';

import AssetLoader from '../../utils/loading/asset-loader';

import assets from './assets';
import { planets } from './data';

export default class Planets {

  public mesh: Mesh;
  public planetMeshs: any = [];

  private textures;

  constructor() {

    // preload all assets
    AssetLoader('planets', assets)
      .then(this.onAssetsLoaded)
      .catch(this.onAssetsError);
    const loader = new TextureLoader();

    Object.keys(planets).forEach((key) => {
      // initiate planets
      const planetRadius = planets[key].radius / 60;
      const planetDistance = planets[key].distance / 60 * 0.001 + 69600 / 60;
      const planetTexture = planets[key].texture && loader.load(planets[key].texture);
      const planetTextureSpecular = planets[key].textureSpecular && loader.load(planets[key].textureSpecular);
      const planetTextureNormal = planets[key].textureNormal && loader.load(planets[key].textureNormal);

      const planetGeometry = new SphereGeometry(planetRadius, 32, 32);
      const planetMaterial = new MeshPhongMaterial({
        color: 0xAAAAAA,
        specular: 0x333333,
        shininess: 15,
        map: planetTexture,
        specularMap: planetTextureSpecular,
        normalMap: planetTextureNormal
      });

      const planetMesh: any = new Mesh(planetGeometry, planetMaterial);
      planetMesh.position.x = planetDistance;
      planetMesh.planetName = key;
      planetMesh.radius = planetRadius;
      planetMesh.distance = planetDistance;
      planetMesh.periodOfRevolution = planets[key].periodOfRevolution;
      planetMesh.periodOfRotation = planets[key].periodOfRotation;
      const planetSpriteMaterial = new SpriteMaterial(
        {
          map: loader.load("./assets/webgl/images/glow.png"),
          color: planets[key].color,
          transparent: false,
          blending: AdditiveBlending
        });
      const planetSprite = new Sprite(planetSpriteMaterial);
      planetSprite.material.opacity = 0;
      planetSprite.scale.set(planetRadius * 4, planetRadius * 4, 1.0);
      planetMesh.add(planetSprite);

      if (planets[key].moons) {
        // initiate moons
        planetMesh.position.x = 0;
        planetMesh._planetPosition = new Vector3();
        planetMesh._isBelongToGroup = true;
        const moonData = planets[key].moons[0];
        const moonRadius = moonData.radius / 60;
        const moonDistance = moonData.distance / 60 * 0.075 + planetRadius;
        const moonTexture = moonData.texture && loader.load(moonData.texture);

        const moonGeometry = new SphereGeometry(moonRadius, 32, 32);
        const moonMaterial = new MeshPhongMaterial({
          color: 0xAAAAAA,
          specular: 0x333333,
          shininess: 15,
          map: moonTexture,
        });

        const moonMesh: any = new Mesh(moonGeometry, moonMaterial);
        moonMesh.position.x = moonDistance;
        moonMesh.planetName = 'moon';
        moonMesh.radius = moonRadius;
        moonMesh.distance = moonDistance;
        moonMesh.periodOfRevolution = moonData.periodOfRevolution;
        moonMesh.periodOfRotation = moonData.periodOfRotation;
        moonMesh._planetPosition = new Vector3();
        moonMesh._isBelongToGroup = true;
        const moonSpriteMaterial = new SpriteMaterial(
          {
            map: loader.load("./assets/webgl/images/glow.png"),
            color: planets[key].moons[0].color,
            transparent: false,
            blending: AdditiveBlending
          });
        const moonSprite = new Sprite(moonSpriteMaterial);
        moonSprite.material.opacity = 0;
        moonSprite.scale.set(moonRadius * 4, moonRadius * 4, 1.0);
        moonMesh.add(moonSprite);

        const group: any = new Group();
        group.add(planetMesh);
        group.add(moonMesh);
        group.position.x = planetDistance;
        group.planetName = key;
        group.radius = planetRadius;
        group.distance = planetDistance;
        group.periodOfRevolution = planets[key].periodOfRevolution;
        group.periodOfRotation = planets[key].periodOfRotation;

        this.planetMeshs.push(group);
      } else if (planets[key].rings) {
        // initiate rings
        planetMesh.position.x = 0;
        planetMesh._planetPosition = new Vector3();
        planetMesh._isBelongToGroup = true;
        const group: any = new Group();
        group.add(planetMesh);
        group.position.x = planetDistance;
        group.planetName = key;
        group.radius = planetRadius;
        group.distance = planetDistance;
        group.periodOfRevolution = planets[key].periodOfRevolution;
        group.periodOfRotation = planets[key].periodOfRotation;

        const ringData = planets[key].rings[0];
        const ringRadius = ringData.radius / 60;
        const ringTexture = ringData.texture && loader.load(ringData.texture);

        const ringGeometry = new TorusGeometry(ringRadius, ringData.tube, 16, 100);
        const ringMaterial = new MeshPhongMaterial({
          color: 0xAAAAAA,
          specular: 0x333333,
          shininess: 15,
          transparent: true,
          map: ringTexture
        });

        ringMaterial.opacity = ringData.opacity;

        const ringMesh: any = new Mesh(ringGeometry, ringMaterial);
        ringMesh.planetName = 'ring';
        ringMesh._planetPosition = new Vector3();
        ringMesh._isBelongToGroup = true;
        ringMesh.radius = ringRadius;
        ringMesh.rotation.x = ringData.rotation;
        ringMesh.scale.z = 0.1;

        group.add(ringMesh);

        this.planetMeshs.push(group);
      } else {
        this.planetMeshs.push(planetMesh);
      }

    });
  }

  public update(_time): void {
    // animate
    const time = _time * 0.00125;

    this.planetMeshs.forEach((planet) => {
      planet.position.x = Math.cos(time / planet.periodOfRevolution) * planet.distance || 0;
      planet.position.z = -Math.sin(time / planet.periodOfRevolution) * planet.distance || 0;
      planet.rotation.y += 0.005 / planet.periodOfRotation;

      if (planet.children.length > 0 && planet.children[0].type !== 'Sprite') {
        planet.children[0]._planetPosition = planet.position;
        planet.children[1]._planetPosition = planet.position;
      }

      if (planet.planetName === 'earth') {
        planet.children[1].position.x =
          Math.cos(time / planet.children[1].periodOfRevolution) * planet.children[1].distance || 0;
        planet.children[1].position.z =
          -Math.sin(time / planet.children[1].periodOfRevolution) * planet.children[1].distance || 0;

        planet.children[1].rotation.y += 0.005 / planet.children[1].periodOfRotation;
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
