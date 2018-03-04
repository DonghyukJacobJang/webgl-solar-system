import { CircleGeometry, Group, Line, LineBasicMaterial } from 'three';
import { planets } from '../Planets/data';

import { DEV } from '../../constants';
import { guiObjects } from '../../utils/gui';

const SUNRADIUS = 69600;

export default class GlowEffect {

  public trackMeshes: any = [];

  private trackGui = {
    visible: false
  };

  constructor() {
    Object.keys(planets).forEach((key) => {
      const { distance, color } = planets[key];
      if (distance === 0) return;

      const planetDistance = distance / 60 * 0.001 + SUNRADIUS / 60;

      const lineMaterial = new LineBasicMaterial({ color });
      const circleGeometry = new CircleGeometry(planetDistance, 64, 0, 6.3);

      // Remove center vertex
      circleGeometry.vertices.shift();
      circleGeometry.rotateX(- Math.PI / 2);

      const track = new Line(circleGeometry, lineMaterial);
      track.visible = false;

      this.trackMeshes.push(track);
    });

    if (DEV) {
      const gui = guiObjects.addFolder('tracks');
      gui.add(this.trackGui, 'visible').onChange((val: boolean) => {
        this.trackMeshes.forEach( track => {
          track.visible = val;
        });
      });;
    }
  }

}
