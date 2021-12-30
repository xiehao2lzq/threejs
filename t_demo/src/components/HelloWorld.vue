<template>
  <div id="c"></div>
</template>

<script>
import * as THREE from "public/static/build/three.module";
import { OrbitControls } from "public/static/rely/jsm/controls/OrbitControls";
import {OBJLoader} from 'public/static/rely/jsm/loaders/OBJLoader';
import {MTLLoader} from 'public/static/rely/jsm/loaders/MTLLoader';
let camera, controls, scene, renderer;
export default {
  data() {
    return {
      publicPath: process.env.BASE_URL,

    };
  },
  mounted() {
    this.init();
    this.animate();
  },
  methods: {
    loadJsV1(url) {
      return new Promise(resolve => {
        var script = document.createElement('script')
        script.type = 'text/javascript'
        if (script.readyState) { // IE
          script.onreadystatechange = function() {
            if (script.readyState == 'loaded' || script.readyState == 'complete') {
              script.onreadystatechange = null
              resolve()
            }
          }
        } else {
          script.onload = function() {
            resolve()
          }
        }
        script.src = url
        document.getElementsByTagName('head')[0].appendChild(script)
      })
    },
    init() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xcccccc);
      //scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        30000
      );
      camera.position.set(150, 10, 0);

      // controls

      controls = new OrbitControls(camera, renderer.domElement);
      controls.listenToKeyEvents(window); // optional

      //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

      controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      controls.dampingFactor = 0.05;

      controls.screenSpacePanning = false;

      controls.minDistance = 10;
      controls.maxDistance = 12000;

      controls.maxPolarAngle = Math.PI / 2.1;
      //skybox
      const urls = [
        require("public/static/image/left.jpg"),
        require("public/static/image/right.jpg"),
        require("public/static/image/top.jpg"),
        require("public/static/image/bottom.jpg"),
        require("public/static/image/back.jpg"),
        require("public/static/image/front.jpg"),
      ];

      const textureCube = new THREE.CubeTextureLoader().load(urls);

      scene = new THREE.Scene();
      scene.background = textureCube;
      
      // Ground

      {
        const texture = new THREE.TextureLoader().load(
          require("public/static/image/ground.jpg")
        );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(40, 40);

        const ground = new THREE.Mesh(
          new THREE.CircleGeometry(15000, 300),
          new THREE.MeshPhongMaterial({ map:texture })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        scene.add(ground);

        // const grid = new THREE.GridHelper(60000, 20, 0x000000, 0x000000);
        // grid.material.opacity = 0.2;
        // grid.material.transparent = true;
        // grid.position.y = -75;
        // scene.add(grid);
      }
	  {
		const mtlLoader = new MTLLoader();
    console.log(this.publicPath+"static/model/大场景.mtl")
		mtlLoader.load("static/model/大场景.mtl", (mtl) => {
		mtl.preload();
		const objLoader = new OBJLoader();
		//   for(let key  in mtl.materials){
		//     mtl.materials[key].side = THREE.DoubleSide
		//   }
		//mtl.materials.Material.side = THREE.DoubleSide;
		console.log(mtl)
		objLoader.setMaterials(mtl);
		
		objLoader.load("static/model/大场景.obj", (root) => {
			scene.add(root);
			root.position.set(-10,0,0)
		});
		});
	}
      // lights

      const dirLight1 = new THREE.DirectionalLight(0xffffff);
      dirLight1.position.set(1, 1, 1);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x002288);
      dirLight2.position.set(-1, -1, -1);
      scene.add(dirLight2);

      // const ambientLight = new THREE.AmbientLight( 0x222222 );
      // scene.add( ambientLight );

      //

      window.addEventListener("resize", this.onWindowResize);
    },
    animate() {
      requestAnimationFrame(this.animate);

      controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

      this.render();
    },
    render() {
      renderer.render(scene, camera);
    },
    onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
