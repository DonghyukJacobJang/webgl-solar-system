import { Mesh, MeshBasicMaterial, SphereBufferGeometry, TextureLoader } from 'three';

export default class MilkyWay {

  public mesh;

  constructor() {
    const loader = new TextureLoader();
    const geometry = new SphereBufferGeometry(70000, 60, 40);
    geometry.scale(-1, 1, 1);

    const material = new MeshBasicMaterial({
      map: loader.load('./assets/webgl/images/milky-way-map.jpg')
    });

    this.mesh = new Mesh(geometry, material);
    this.mesh.rotation.x = 90;
    this.mesh.rotation.z = 90;
  }
}
