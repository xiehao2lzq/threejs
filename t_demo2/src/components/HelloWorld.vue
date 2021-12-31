<template>
  <div id="c"></div>
</template>

<script>
import * as THREE from "../../static/build/three.module";
import { OrbitControls } from "../../static/rely/jsm/controls/OrbitControls";
import { GLTFLoader } from "../../static/rely/jsm/loaders/GLTFLoader";
import { OBJLoader } from "../../static/rely/jsm/loaders/OBJLoader";
import { MTLLoader } from "../../static/rely/jsm/loaders/MTLLoader";
let camera, controls, scene, renderer, raycaster,main,Lightcircle;
let INTERSECTED;
const pointer = new THREE.Vector2();
export default {
  data() {
    return {
      targetEvl:0,
      nowEvl:-2
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
        renderer = new THREE.WebGLRenderer();
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
        camera.position.set(-50, 10, 20);
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
          new THREE.CircleGeometry(500, 300),
          // 材质
          new THREE.MeshPhongMaterial({ map: texture })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        scene.add(ground);
      }
      {
        // const mtlLoader = new MTLLoader();
        // mtlLoader.setPath("");
        // mtlLoader.load("../../static/model/untitled6.mtl", (mtl) => {
        //   mtl.preload();
        //   const objLoader = new OBJLoader();
        //   //   for(let key  in mtl.materials){
        //   //     mtl.materials[key].side = THREE.DoubleSide
        //   //   }
        //   //mtl.materials.Material.side = THREE.DoubleSide;
        //   console.log(mtl);
        //   objLoader.setMaterials(mtl);
        //   objLoader.setPath("");
        //   objLoader.load("../../static/model/untitled6.obj", (root) => {
        //     main = root
        //     scene.add(main);
        //     console.log(main)
        //     scene.traverse((child) => {
        //       if (child.isMesh) {
        //         //console.log(child.id)
        //         if(child.name =='配电室.002'){
        //           console.log(child)
        //         }
        //       }
        //     });
        //     main.position.set(-10, -2, 0);
        //     this.openAnimation()
        //     this.createCircle()
        //   });
        // });
        const loader = new GLTFLoader();
        loader.load( '../../static/model/组.glb', function ( gltf ) {
            
            // scene.add(solarSystem);
            // solarSystem.add(gltf.scene )
            // solarSystem.position.x = 0
            // solarSystem.position.y = 0
            // solarSystem.position.z = 0
            main = gltf.scene
            main.position.set(-10, 0, 0);
            //this.openAnimation()
            //this.createCircle()
            scene.add( main );
            console.log(gltf.scene)

        }, undefined, function ( error ) {
            console.error( error );
        } );
      }
      {
        // 初步只添加环境光 后续在研究其它
        const ambientLight = new THREE.AmbientLight(0x222222, 5);
        scene.add(ambientLight);
      }
      // 自适应界面填充屏幕
      window.addEventListener("resize", this.onWindowResize);
      // 监听点击事件
      window.addEventListener("dblclick", this.mousePosition, false);
      // 实例化射线
      raycaster = new THREE.Raycaster();
    },
    // 点击事件
    bindModelClick() {
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      console.log(intersects[0]);
      if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
          INTERSECTED = intersects[0].object;
          //INTERSECTED.material.emissive.setHex(0xff0000);
        }
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
      renderer.render(scene, camera);
    },
    // 自适应窗口
    onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    //开启模型加载之后的动画
    openAnimation(){
      this.riseAnimation()
    },
    // 抬升动画
    riseAnimation(){
      var timer = requestAnimationFrame(this.riseAnimation)
      this.nowEvl += 0.02
      if(this.nowEvl>=this.targetEvl) this.nowEvl = this.targetEvl,cancelAnimationFrame(timer)
      main.position.set(-10, this.nowEvl, 0);
    },
    // 圆环闪烁

    // 创建几何体
    createCircle(){
      const geometry = new THREE.CircleGeometry( 5, 32 );
      const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
      Lightcircle = new THREE.Mesh( geometry, material );
      
      scene.add( Lightcircle );
      Lightcircle.position.set(0, 0.01, -2);
      Lightcircle.rotation.x = -Math.PI / 2;
      console.log(Lightcircle.scale)
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
