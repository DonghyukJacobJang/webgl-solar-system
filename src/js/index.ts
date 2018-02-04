import { Expo, TweenLite } from 'gsap';
import {
  AdditiveBlending, AxisHelper, BufferGeometry, Color, Float32BufferAttribute, FogExp2, GridHelper,
  PerspectiveCamera, Points, Raycaster, ShaderMaterial, Sprite, SpriteMaterial, TextureLoader, Vector2, Vector3
} from 'three';

import cameras from './cameras';
import { DEV_HELPERS, DEV_STATS } from './constants';
import * as flags from './flags';
import OrbitControls from './lib/three/examples/OrbitControls';
import RenderStats from './lib/three/render-stats';
import lights from './lights';
import { setQuery } from './params';
import renderer from './renderer';
import scene from './scene';
import { guiFlags } from './utils/gui';
import stats from './utils/stats';

// Objects
import Planets from './objects/planets/planets';

class WebGLPrototype {

  public raycaster = new Raycaster();
  public mouse = new Vector2();
  public INTERSECTED;

  private renderStats: RenderStats;
  private controls: any;
  private planets: Planets;
  private sceneChilldren: any = [];
  private targetLook = new Vector3();
  private targetSun = new Vector3();
  private isCameraAnimating = false;
  private shouldLookAt = false;

  constructor() {

    // setting foggy environment
    scene.background = new Color(0x0D0014);
    scene.fog = new FogExp2(0x0D0014, 0.0000325);

    this.mouse.x = 100000;
    this.mouse.y = 100000;
    this.targetSun.x = 0;
    this.targetSun.y = 0;
    this.targetSun.z = 0;

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
    const uniforms = {
      texture: { value: new TextureLoader().load("./assets/webgl/images/lensflare_alpha.png") }
    };;
    const shaderMaterial = new ShaderMaterial({
      uniforms: uniforms,
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent,
      blending: AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    });

    const particles = 25000;
    const radius = 10000;
    const geometry = new BufferGeometry();
    const positions: any = [];
    const colors: any = [];
    const sizes: any = [];
    const color = new Color();
    for (let i = 0; i < particles; i++) {
      positions.push((Math.random() * 2 - 1) * radius);
      positions.push((Math.random() * 2 - 1) * radius);
      positions.push((Math.random() * 2 - 1) * radius);
      color.setHSL(1.0, (Math.random() * 0.5 - 0.5), 0.5);
      colors.push(color.r, color.g, color.b);
      sizes.push(100);
    }
    geometry.addAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.addAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.addAttribute('size', new Float32BufferAttribute(sizes, 1).setDynamic(true));
    const particleSystem = new Points(geometry, shaderMaterial);
    scene.add(particleSystem);

    const spriteMap = new TextureLoader().load("./assets/webgl/images/cloud.jpg");
    const spriteMaterial = new SpriteMaterial({
      map: spriteMap,
      color: 0xffffff,
      blending: AdditiveBlending
    });
    spriteMaterial.opacity = 0.1;
    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set(200000, 200000, 1);

    scene.add(sprite);

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
      // reset camera view
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

    this.raycaster.setFromCamera(this.mouse, cameras.main);

    const intersects = this.raycaster.intersectObjects(this.sceneChilldren);

    if (intersects.length > 0) {
      if (this.INTERSECTED !== intersects[0].object) {
        if (this.INTERSECTED && this.INTERSECTED.children[0] && this.INTERSECTED.children[0].type === 'Sprite') {
          // this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
          // this.INTERSECTED.children[0].visible = false;
          // this.INTERSECTED.children[0].material.opacity = 0;
          this.animateOpacity(this.INTERSECTED.children[0].material, 0);
        }


        this.INTERSECTED = intersects[0].object;

        if (this.INTERSECTED.children[0] && this.INTERSECTED.children[0].type === 'Sprite') {
          // this.INTERSECTED.children[0].visible = true;
          // this.INTERSECTED.children[0].material.opacity = 1;
          this.animateOpacity(this.INTERSECTED.children[0].material, 1);
        }
        // this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
        // this.INTERSECTED.material.emissive.setHex(0xffffff);
      }
    } else {
      if (this.INTERSECTED && this.INTERSECTED.children[0]) {
        // this.INTERSECTED.children[0].visible = false;
        // this.INTERSECTED.children[0].material.opacity = 0;
        this.animateOpacity(this.INTERSECTED.children[0].material, 0);
        // this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
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
