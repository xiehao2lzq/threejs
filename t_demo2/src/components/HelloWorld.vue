<template>
  <div id="c"></div>
</template>

<script>
import * as THREE from "../../static/build/three.module";
import { OrbitControls } from "../../static/rely/jsm/controls/OrbitControls";
import { GLTFLoader } from "../../static/rely/jsm/loaders/GLTFLoader";
import { EffectComposer } from "../../static/rely/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../../static/rely/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "../../static/rely/jsm/postprocessing/OutlinePass.js";
import { ShaderPass } from "../../static/rely/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "../../static/rely/jsm/shaders/FXAAShader.js";
let camera,
  controls,
  scene,
  renderer,
  raycaster,
  main,
  Lightcircle,
  outlinePass,
  composer;
let INTERSECTED;
const pointer = new THREE.Vector2();
const mouse = new THREE.Vector2();
let selectedObjects = [];
export default {
  data() {
    return {
      targetEvl: 0,
      nowEvl: -60,
    };
  },
  mounted() {
    this.init();
    this.animate();
  },
  methods: {
    init() {
      // 实例化场景
      {
        scene = new THREE.Scene();
      }
      // 实例化渲染器 并配置参数
      {
        renderer = new THREE.WebGLRenderer({ antialias: true,logarithmicDepthBuffer: true });
        //renderer.shadowMap.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
      }
      // 实例化相机 并配置参数
      {
        camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          0.1,
          30000
        );
        camera.position.set(-500, 1000, 20);
      }

      // 实例化交互控制插件 并配置参数
      {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.listenToKeyEvents(window); // optional
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 10;
        controls.maxDistance = 2000;
        controls.maxPolarAngle = Math.PI / 2.1;
      }
      //添加天空盒
      {
        const urls = [
          "../../static/image/dark/left.bmp",
          "../../static/image/dark/right.bmp",
          "../../static/image/dark/top.bmp",
          "../../static/image/dark/bottom.bmp",
          "../../static/image/dark/back.bmp",
          "../../static/image/dark/front.bmp",
        ];
        const textureCube = new THREE.CubeTextureLoader().load(urls);
        scene.background = textureCube;
      }
      // 创建地面
      {
        // 纹理
        const texture = new THREE.TextureLoader().load(
          require("../../static/image/ground.jpg")
        );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4000, 4000);

        const ground = new THREE.Mesh(
          // 形状
          new THREE.CircleGeometry(5000, 300),
          // 材质
          new THREE.MeshPhongMaterial({ map: texture })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        scene.add(ground);
      }
      {
        const loader = new GLTFLoader();
        let _this = this
        loader.load(
          "../../static/model/组.glb",
          function (gltf) {
            main = gltf.scene;
            console.log(main)
            main.position.set(0, _this.nowEvl, 0);
            // main.traverse(function (child) {
            //   if (child instanceof THREE.Mesh) {
            //     child.receiveShadow = true;
            //     child.castShadow = true;
            //   }
            // });
            scene.add(main);
            _this.openAnimation()
            //_this.createCircle()
          },
          undefined,
          function (error) {
            console.error(error);
          }
        );
      }
      {
        // 初步只添加环境光 后续在研究其它
        // const ambientLight = new THREE.AmbientLight(0x222222, 5);
        // scene.add(ambientLight);
        scene.add(new THREE.AmbientLight(0xaaaaaa, 1));

        // const light = new THREE.DirectionalLight( 0xddffdd, 1 );
				// light.position.set( 500, 100, 0 );
				// light.castShadow = true;
				// light.shadow.mapSize.width = 512;
				// light.shadow.mapSize.height = 512;

				// const d = 100;
        // console.log(light.shadow)
				// light.shadow.camera.left = - d;
				// light.shadow.camera.right = d;
				// light.shadow.camera.top = d;
				// light.shadow.camera.bottom = - d;
				// light.shadow.camera.far = 1000;

				// scene.add( light );
        // const targetObject = new THREE.Object3D();
        // scene.add(targetObject);
        // light.target = targetObject;
      }
      {
        // postprocessing

        composer = new EffectComposer(renderer);
        // 新建场景通道
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        outlinePass = new OutlinePass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          scene,
          camera
        );
        composer.addPass(outlinePass);
        const effectFXAA = new ShaderPass(FXAAShader);
        effectFXAA.uniforms["resolution"].value.set(
          1 / window.innerWidth,
          1 / window.innerHeight
        );
        composer.addPass(effectFXAA);
        var params = {
          edgeStrength: 2,
          edgeGlow: 1,
          edgeThickness: 1.0,
          pulsePeriod: 0,
          usePatternTexture: false,
        };

        outlinePass.edgeStrength = params.edgeStrength;
        outlinePass.edgeGlow = params.edgeGlow;
        outlinePass.visibleEdgeColor.set(0xffffff);
        outlinePass.hiddenEdgeColor.set(0xffffff);
      }
      // 自适应界面填充屏幕
      window.addEventListener("resize", this.onWindowResize);
      // 监听点击事件
      renderer.domElement.style.touchAction = "none";
      renderer.domElement.addEventListener("pointermove", this.onPointerMove);
      renderer.domElement.addEventListener("dblclick", this.mousePosition);
      // 实例化射线
      raycaster = new THREE.Raycaster();
    },
    // 移入模型高亮轮廓 方法组
    onPointerMove(event) {
      if (event.isPrimary === false) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.checkIntersection();
    },
    checkIntersection() {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(scene);
      if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        this.addSelectedObject(selectedObject);
        outlinePass.selectedObjects = selectedObjects;
      } else {
        // outlinePass.selectedObjects = [];
      }
    },
    addSelectedObject(object) {
      selectedObjects = [];
      selectedObjects.push(object);
    },
    // 点击事件
    bindModelClick() {
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      //console.log(intersects)
      if (intersects.length > 0) {
        INTERSECTED = intersects[0].object;
        //INTERSECTED.material.emissive.setHex(0xff0000);
        console.log(INTERSECTED)
      }
    },
    mousePosition(event) {
      //alert(123)
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.bindModelClick();
    },
    // 帧渲染
    animate() {
      requestAnimationFrame(this.animate);
      controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
      //renderer.render(scene, camera);
      composer.render();
    },
    // 自适应窗口
    onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    //开启模型加载之后的动画
    openAnimation() {
      this.riseAnimation();
    },
    // 抬升动画
    riseAnimation() {
      var timer = requestAnimationFrame(this.riseAnimation);
      this.nowEvl += 0.5;
      if (this.nowEvl >= this.targetEvl){
        (this.nowEvl = this.targetEvl), cancelAnimationFrame(timer);
      }
      main.position.set(-10, this.nowEvl, 0);
    },
    // 圆环闪烁

    // 创建几何体
    createCircle() {
      const geometry = new THREE.CircleGeometry(5, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      Lightcircle = new THREE.Mesh(geometry, material);

      scene.add(Lightcircle);
      Lightcircle.position.set(0, 0.01, -2);
      Lightcircle.rotation.x = -Math.PI / 2;
      console.log(Lightcircle.scale);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
