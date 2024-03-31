import { radian } from './utils';
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { gsap } from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import Lenis from '@studio-freight/lenis';


class Main {
  constructor() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.canvas = document.querySelector("#canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.viewport.width, this.viewport.height);

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('libs/draco/');
    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.dracoLoader);

    this.model = null;
    this.animations = null;
    this.mixer = null;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.groupChild = new THREE.Group();
    this.scene.add(this.group);
    this.group.add(this.groupChild);
    this.camera = null;
    this.mesh = null;

    // this.controls = null;

    this.lenis = new Lenis({
      duration: 1.2,
    });
    this.lenis.stop();

    this.cursor = {
      x: 0,
      y: 0
    };

    this._init();

    this._addEvent();
  }

  _setCamera() {
    //ウインドウとWebGL座標を一致させる
    const fov = 45;
    const fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
    const distance = (this.viewport.height / 2) / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
    this.camera = new THREE.PerspectiveCamera(fov, this.viewport.width / this.viewport.height, 1, distance * 5);
    this.camera.position.z = distance;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
  }

  // _setControlls() {
  //   this.controls = new OrbitControls(this.camera, this.canvas);
  //   this.controls.enableDamping = true;
  // }

  _setEnvTexture() {
    const rgbeLoader = new RGBELoader();
    rgbeLoader.setPath('texture/');
    rgbeLoader.load('room.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      // this.scene.background = texture;
      this.scene.environment = texture;
    });
  }

  _setLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1.8);
    light.position.set(1, 200, 1);
    this.scene.add(light);
    
    // // helper
    // const directionalLightHelper = new THREE.DirectionalLightHelper(light, 50);
    // this.scene.add(directionalLightHelper);


    const ambLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
    this.scene.add(ambLight);

  }

  _addModel() {
    this.loader.load('model/spoon.glb', (gltf) => {
      const model = gltf.scene;

      // モデルに環境マッピングを適用
      const envMap = this.scene.environment;
      model.traverse((child) => {
        if (child.isMesh) {
          console.log(child);
          child.material.envMap = envMap;
          child.material.envMapIntensity = 2.5; // 環境マッピングの強さ 明るさの調整
        }
      });

      // model.scale.set(100.0, 100.0, 100.0);
      model.scale.set(this.viewport.width * 0.1, this.viewport.width * 0.1, this.viewport.width * 0.1);

      this.model = model;

      this.groupChild.add(this.model);

      this._loadAnimation();
      this._scrollAnimation();

      this._update();
    });
  }

  // _addMesh() {
  //   const geometry = new THREE.BoxGeometry(50, 50, 50);
  //   const material = new THREE.MeshStandardMaterial({color: 0xff0000});
  //   this.mesh = new THREE.Mesh(geometry, material);
  //   this.mesh.position.set(0, 100, 0);
  //   this.scene.add(this.mesh);
  // }

  _initAnimation() {
    this.group.position.y = -this.viewport.height * 0.8;
  }

  _loadAnimation() {

    // gsap.set(this.model.rotation, {
    //   y: radian(-120),
    // });

    const tlLoadAnimation = gsap.timeline();
    tlLoadAnimation.to(this.group.position, {
      y: 0,
      duration: 2.4,
      ease: 'power4.out',
    })
    .to(this.model.rotation, {
      y: 0,
      duration: 2.4,
      ease: 'power4.out',
    }, '<')
    .to('.js-ttl', {
      opacity: 1,
      // delay: 0.2,
    })
    .to('.js-ttl-txts', {
      y: 0,
      // delay: 0.1,
      duration: 0.6,
      // ease: 'circ.inOut',
      ease: 'circ.out',
      stagger: 0.03,
      onComplete: () => {
        this.lenis.start();
      }
    });
  }

  _scrollAnimation() {
    const tlScrollTtl = gsap.timeline({
      scrollTrigger: {
        trigger: '.js-section-02',
        start: 'top 96%',
        onLeaveBack: () => tlScrollTtl.reverse(), // 逆再生させる
        // markers: true,
      }
    });
    tlScrollTtl.to('.js-ttl-txts', {
      duration: 0.9,
      ease: 'circ.inOut',
      y: '-100%',
    })

    const tlScrollModel01 = gsap.timeline({
      scrollTrigger: {
        trigger: '.js-section-02',
        start: 'top 96%',
        end: 'bottom bottom',
        scrub: 1,
        // markers: true,
      }
    });
    tlScrollModel01.to(this.model.rotation, {
      // x: radian(32),
      x: radian(392),
      // y: radian(220),
      y: radian(570),
      duration: 1,
      ease: 'power4.inOut',
    })
    .to(this.model.position, {
      x: this.viewport.width * 0.12,
      duration: 1,
      ease: 'power4.inOut',
    }, '<')
    .to(this.model.position, {
      z: -this.viewport.width * 0.25,
      duration: 0.4,
      ease: 'power4.inOut',
    }, '<')
    .to(this.model.position, {
      z: this.viewport.width * 0.25,
      y: this.viewport.height * 0.1,
      duration: 0.6,
      delay: 0.4,
      ease: 'power4.inOut',
    }, '<');


    const tlScrollModel02 = gsap.timeline({
      scrollTrigger: {
        trigger: '.js-section-03',
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1,
        // markers: true,
      }
    });
    tlScrollModel02.to(this.model.rotation, {
      x: radian(90),
      y: radian(90),
      duration: 1,
      ease: 'power4.inOut',
    })
    .to(this.model.position, {
      x: this.viewport.width * 0.25,
      y: -this.viewport.height * 0.25,
      z: 0,
      duration: 1,
      ease: 'power4.inOut',
    }, '<')
    .to(this.groupChild.rotation, {
      y: radian(-20),
      duration: 1.0,
      ease: 'power4.inOut',
    }, '<');


    const tlScrollModel03 = gsap.timeline({
      scrollTrigger: {
        trigger: '.js-section-04',
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1,
        // markers: true,
      }
    });
    tlScrollModel03.to(this.model.rotation, {
      x: radian(90),
      y: radian(90),
      duration: 1,
      ease: 'expo.inOut',
    })
    .to(this.model.position, {
      x: -this.viewport.width * 0.25,
      y: -this.viewport.height * 0.25,
      z: 0,
      duration: 1,
      ease: 'power4.inOut',
    }, '<')
    .to(this.groupChild.rotation, {
      // y: radian(740),
      y: radian(740),
      duration: 1.0,
      // delay: 0.2,
      ease: 'power4.inOut',
    }, '<');


    const tlScrollModel04 = gsap.timeline({
      scrollTrigger: {
        trigger: '.js-section-05',
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1,
        // markers: true,
      }
    });
    tlScrollModel04.to(this.model.rotation, {
      x: 0,
      y: radian(180),
      duration: 1,
      ease: 'power4.inOut',
    })
    .to(this.model.position, {
      x: 0,
      y: 0,
      duration: 1,
      ease: 'power4.inOut',
    }, '<')
    .to(this.groupChild.rotation, {
      y: 0,
      duration: 1.0,
      ease: 'power4.inOut',
    }, '<');

    
  }

  _init() {
    this._initAnimation();

    this._setCamera();
    // this._setControlls();
    this._setLight();
    this._setEnvTexture();

    // this._addMesh();

    this._addModel();

    // this._loadAnimation();
    // this._scrollAnimation();
  }

  _update(time) {

    const parallaxX = this.cursor.x;
    const parallaxY = - this.cursor.y;

    this.group.rotation.x += ((parallaxY * 0.1) - this.group.rotation.x) * 0.1;
    this.group.rotation.y += ((parallaxX * 0.1) - this.group.rotation.y) * 0.1;


    this.lenis.raf(time);

    //レンダリング
    this.renderer.render(this.scene, this.camera);
    // this.controls.update();
    requestAnimationFrame(this._update.bind(this));

  }

  _onResize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    // レンダラーのサイズを修正
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    // カメラのアスペクト比を修正
    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();
  }

  _onMousemove(e) {
    this.cursor.x = e.clientX / this.viewport.width - 0.5;
    this.cursor.y = e.clientY / this.viewport.height - 0.5;
  }

  _scrollReset() {
    window.scrollTo(0, 0);
  }

  _addEvent() {
    window.addEventListener("resize", this._onResize.bind(this));
    window.addEventListener("beforeunload", this._scrollReset.bind(this));
    window.addEventListener("mousemove", this._onMousemove.bind(this));
  }

}

new Main();



