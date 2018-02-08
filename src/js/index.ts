import { Expo, TweenLite } from 'gsap';
import {
  AdditiveBlending, AxisHelper, Color, FogExp2, GridHelper,
  PerspectiveCamera, Raycaster, Sprite, SpriteMaterial, TextureLoader, Vector2, Vector3
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
import Planets from './objects/planets/planets';
import Stars from './objects/stars/stars';

class WebGLPrototype {

  public raycaster = new Raycaster();
  public mouse = new Vector2(100000, 100000);
  public INTERSECTED;

  private renderStats: RenderStats;
  private controls: any;
  private targetLook = new Vector3();
  private targetSun = new Vector3(0, 0, 0);
  private isCameraAnimating = false;
  private shouldLookAt = false;

  private planets: Planets;
  private stars: Stars;
  private sceneChilldren: any = [];

  constructor() {
    // setting foggy environment
    scene.background = new Color(0x0D0014);
    scene.fog = new FogExp2(0x0D0014, 0.0000225);

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
      this.renderStats = new RenderStats();
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

    // Objects
    this.planets = new Planets();
    this.planets.planetMeshs.forEach(planet => {
      scene.add(planet);
    });

    // need to flatten with a better way
    scene.children.forEach(child => {
      if ((child.type === 'Mesh' || 'Group') && child.children.length > 0 && child.children[0].type !== 'Sprite') {
        child.children.forEach(cChild => {
          this.sceneChilldren.push(cChild);
        });
      } else {
        this.sceneChilldren.push(child);
      }
    });

    // This will add a starfield to the background of a scene
    this.stars = new Stars();
    scene.add(this.stars.points);

    const spriteMap = new TextureLoader().load("./assets/webgl/images/cloud.jpg");
    const spriteMaterial = new SpriteMaterial({
      map: spriteMap,
      color: 0xffffff,
      blending: AdditiveBlending
    });
    spriteMaterial.opacity = 0.1;
    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set(200000, 200000, 1);

    // scene.add(sprite);

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
    this.shouldLookAt = false;

    // detect ESC key
    if (ev.keyCode === 'Escape' || ev.keyCode === 27) {
      // reset camera view at (0, 0, 0)
      cameras.main.lookAt(this.targetSun);
    }
  }

  public handleClick(ev): void {
    ev.preventDefault();
    if (this.INTERSECTED) {
      console.log(this.INTERSECTED);

      this.shouldLookAt = true;
      this.targetLook = (this.INTERSECTED as any).parent.type === 'Group'
        ? (this.INTERSECTED as any).parent.position
        : this.INTERSECTED.position;

      this.animateCamera(this.INTERSECTED);
    }
  }

  private onResize = () => {
    cameras.dev.aspect = window.innerWidth / window.innerHeight;
    cameras.main.aspect = window.innerWidth / window.innerHeight;

    cameras.dev.updateProjectionMatrix();
    cameras.main.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private animateCamera(_target: any): void {

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

    const targetRadius = _target.radius;
    let targetPosition = new Vector3();
    if (_target._isBelongToGroup) {
      targetPosition = _target._planetPosition;
      console.log(targetPosition);
    } else {
      targetPosition = _target.position;
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

    this.planets.update(time);
    this.stars.update(time);

    this.raycaster.setFromCamera(this.mouse, cameras.main);

    const intersects = this.raycaster.intersectObjects(this.sceneChilldren);

    if (intersects.length > 0) {
      if (this.INTERSECTED !== intersects[0].object) {
        if (this.INTERSECTED && this.INTERSECTED.children[0] && this.INTERSECTED.children[0].type === 'Sprite') {
          this.animateOpacity(this.INTERSECTED.children[0].material, 0);
        }

        this.INTERSECTED = intersects[0].object;

        if (this.INTERSECTED.children[0] && this.INTERSECTED.children[0].type === 'Sprite') {
          this.animateOpacity(this.INTERSECTED.children[0].material, 1);
        }
      }
    } else {
      if (this.INTERSECTED && this.INTERSECTED.children[0]) {
        this.animateOpacity(this.INTERSECTED.children[0].material, 0);
      }

      this.INTERSECTED = null;
    }

    if (this.targetLook && this.shouldLookAt) {
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
