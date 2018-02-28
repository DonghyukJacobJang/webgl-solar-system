import { Expo, TweenLite } from 'gsap';
import {
  AxisHelper, Color, FogExp2, GridHelper, PerspectiveCamera, Raycaster, Vector2, Vector3
} from 'three';

import { DEV_HELPERS, DEV_STATS } from './constants';
import * as flags from './flags';
import OrbitControls from './lib/three/examples/OrbitControls';
import RenderStats from './lib/three/render-stats';

import cameras from './cameras';
import lights from './lights';
import { setQuery } from './params';
import renderer from './renderer';
import scene from './scene';
import { guiFlags } from './utils/gui';
import stats from './utils/stats';

// Objects
import MilkyWay from './objects/MilkyWay/MilkyWay';
import Planets from './objects/Planets/Planets';
import PlanetTracks from './objects/PlanetTrack/PlanetTrack';
import Stars from './objects/Stars/Stars';

class WebGLPrototype {

  private INTERSECTED;
  private INTERSECTEDSPRITE;
  private TARGETOBJECTS: any = [];
  private TARGETSUN = new Vector3(0, 0, 0);

  private isClosureLook = false;
  private isCameraAnimating = false;
  private controls: any;
  private mouse = new Vector2(100000, 100000);
  private raycaster = new Raycaster();
  private renderStats;
  private targetLook = new Vector3();

  private milkyWay: MilkyWay;
  private planets: Planets;
  private planetTracks: PlanetTracks;
  private stars: Stars;

  constructor() {
    // setting foggy environment
    // scene.background = new Color(0x0D0014);
    // scene.fog = new FogExp2(0x0D0014, 0.0000225);

    // Renderer
    document.body.appendChild(renderer.domElement);

    // Helpers
    if (DEV_HELPERS) {
      scene.add(new GridHelper(10, 10));
      // Need to wait for @types/three to update AxisHelper -> AxesHelper
      scene.add(new AxisHelper());
    }

    // Lights
    Object.keys(lights).forEach((light: string) => {
      scene.add(lights[light]);
    });

    // Stats
    if (DEV_STATS) {
      this.renderStats = RenderStats();
      this.renderStats.domElement.style.position = 'absolute';
      this.renderStats.domElement.style.left = '0px';
      this.renderStats.domElement.style.top = '48px';
      document.body.appendChild(this.renderStats.domElement);
      document.body.appendChild(stats.domElement);
    }

    // Controls
    this.controls = {
      dev: new OrbitControls(cameras.dev, renderer.domElement),
      main: new OrbitControls(cameras.main, renderer.domElement)
    };
    this.controls.main.maxDistance = 75000;

    // Flags
    guiFlags
      .add(flags, 'debugCamera')
      .onChange((val: string | boolean | number) => {
        setQuery('cameraDebug', val);
      });

    // add planet Objects
    this.planets = new Planets();
    this.planets.planetMeshes.forEach(planet => {
      scene.add(planet);
    });

    // initiate target objects
    this.TARGETOBJECTS = this.planets.targetMeshes;

    this.planetTracks = new PlanetTracks();
    this.planetTracks.trackMeshes.forEach(track => {
      scene.add(track);
    });

    // add stars
    this.stars = new Stars();
    scene.add(this.stars.points);

    // add MilkyWay
    this.milkyWay = new MilkyWay();
    scene.add(this.milkyWay.mesh);

    // Listeners
    window.addEventListener('resize', this.onResize, false);
    window.addEventListener('mousemove', this.handdleMouseMove.bind(this), false);
    window.addEventListener('keyup', this.handdleKeyUp.bind(this), false);
    window.addEventListener('click', this.handleClick.bind(this), false);

    this.update();
  }

  public handdleMouseMove(ev): void {
    ev.preventDefault();
    this.mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (ev.clientY / window.innerHeight) * 2 + 1;
  }

  public handdleKeyUp(ev): void {
    ev.preventDefault();

    if (ev.keyCode === 'Escape' || ev.keyCode === 27) {
      // reset camera view at (0, 0, 0)
      cameras.main.lookAt(this.TARGETSUN);
      this.isClosureLook = false;
    }
  }

  public handleClick(ev): void {
    ev.preventDefault();
    if (this.INTERSECTED) {
      this.isClosureLook = true;
      this.targetLook = this.INTERSECTED.position;
      console.log(this.targetLook);

      if (this.INTERSECTED.name === 'moon') {
        this.targetLook.x += this.INTERSECTED.parent.position.x;
        this.targetLook.y += this.INTERSECTED.parent.position.y;
        this.targetLook.z += this.INTERSECTED.parent.position.z;
        console.log(this.targetLook);
      }

      this.animateCamera();
    }
  }

  private onResize = () => {
    cameras.dev.aspect = window.innerWidth / window.innerHeight;
    cameras.main.aspect = window.innerWidth / window.innerHeight;

    cameras.dev.updateProjectionMatrix();
    cameras.main.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private animateCamera(): void {
    /*
    // backup original rotation
    var startRotation = new THREE.Euler().copy( camera.rotation );

    // final rotation (with lookAt)
    camera.lookAt( object.position );
    var endRotation = new THREE.Euler().copy( camera.rotation );

    // revert to original rotation
    camera.rotation.copy( startRotation );

    // Tween
    new TWEEN.Tween( camera ).to( { rotation: endRotation }, 600 ).start();
     */
    if (this.isCameraAnimating) { return; }

    this.isCameraAnimating = true;

    const targetRadius = this.INTERSECTED.radius;
    const targetPosition = this.INTERSECTED.position;
    if (this.INTERSECTED.name === 'moon') {
      targetPosition.x += this.INTERSECTED.parent.position.x;
      targetPosition.y += this.INTERSECTED.parent.position.y;
      targetPosition.z += this.INTERSECTED.parent.position.z;
    }

    TweenLite.to(cameras.main.position, 1.4, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z - targetRadius * 2,
      onComplete: ()=> {
        this.isCameraAnimating = false;
      }
    });
  }

  private animateOpacity(_target: any, _opacity: number): void {
    TweenLite.to(_target, 0.4, {
      opacity: _opacity,
      ease: Expo.easeOut
    });
  }

  private render(
    camera: PerspectiveCamera,
    left: number,
    bottom: number,
    width: number,
    height: number
  ) {
    left *= window.innerWidth;
    bottom *= window.innerHeight;
    width *= window.innerWidth;
    height *= window.innerHeight;

    renderer.setViewport(left, bottom, width, height);
    renderer.setScissor(left, bottom, width, height);
    renderer.setClearColor(0x121212);
    renderer.render(scene, camera);
  }

  private update = () => {
    requestAnimationFrame(this.update);

    if (DEV_STATS) {
      stats.begin();
    }

    // this.controls.dev.update();
    // this.controls.main.update();

    // Objects
    const time = Date.now();
    if (this.planets) this.planets.update(time);
    if (this.stars && this.stars.points.visible) this.stars.update(time);

    this.raycaster.setFromCamera(this.mouse, cameras.main);

    const intersects = this.raycaster.intersectObjects(this.TARGETOBJECTS);

    // detect objects in the scene
    if (intersects.length > 0) {
      if (this.INTERSECTED !== intersects[0].object) {
        if (this.INTERSECTED && this.INTERSECTEDSPRITE) {
          this.animateOpacity(this.INTERSECTEDSPRITE.material, 0);
        }

        this.INTERSECTED = intersects[0].object;
        this.INTERSECTEDSPRITE = this.INTERSECTED && this.INTERSECTED.children[this.INTERSECTED.children.length - 1];

        if (this.INTERSECTEDSPRITE && this.INTERSECTEDSPRITE.type === 'Sprite') {
          this.animateOpacity(this.INTERSECTEDSPRITE.material, 1);
        }
      }
    } else {
      if (this.INTERSECTED && this.INTERSECTEDSPRITE) {
        this.animateOpacity(this.INTERSECTEDSPRITE.material, 0);
      }

      this.INTERSECTED = null;
    }

    if (this.targetLook && this.isClosureLook) {
      cameras.main.lookAt(this.targetLook);
    }

    if (flags.debugCamera) {
      this.render(cameras.dev, 0, 0, 1, 1);
      this.render(cameras.main, 0, 0.75, 0.25, 0.25);
    } else {
      this.render(cameras.main, 0, 0, 1, 1);
    }

    if (DEV_STATS) {
      this.renderStats.update(renderer);
      stats.end();
    }
  };

}

export default new WebGLPrototype();
