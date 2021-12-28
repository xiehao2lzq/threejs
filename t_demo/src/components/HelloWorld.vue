<template>
  <div id="c">

  </div>
</template>

<script>
import * as THREE from "../../public/build/three.module"
import { OrbitControls } from '../../public/rely/jsm/controls/OrbitControls';
let camera, controls, scene, renderer;
export default {
  data () {
    return {
      
    }
  },
  mounted () {
    this.init()
    this.animate()
  },
  methods: {
    init() {

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0xcccccc );
				scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 60000 );
				camera.position.set( 1800, 60000, 0 );

				// controls

				controls = new OrbitControls( camera, renderer.domElement );
				controls.listenToKeyEvents( window ); // optional

				//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

				controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
				controls.dampingFactor = 0.05;

				controls.screenSpacePanning = false;

				controls.minDistance = 10;
				controls.maxDistance = 50000;

				//controls.maxPolarAngle = Math.PI / 2;
        //skybox
				const urls = [
					require("../../public/image/left.jpg"), require("../../public/image/right.jpg"),
					require("../../public/image/top.jpg"), require("../../public/image/bottom.jpg"),
					require("../../public/image/back.jpg"), require("../../public/image/front.jpg")
				];

				const textureCube = new THREE.CubeTextureLoader().load( urls );

				scene = new THREE.Scene();
				scene.background = textureCube;
				// world

				const geometry = new THREE.CylinderGeometry( 10, 10, 30, 41, 11 );
				const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );

				for ( let i = 0; i < 500; i ++ ) {

					const mesh = new THREE.Mesh( geometry, material );
					mesh.position.x = Math.random() * 1600 - 800;
					mesh.position.y = 0;
					mesh.position.z = Math.random() * 1600 - 800;
					mesh.updateMatrix();
					mesh.matrixAutoUpdate = false;
					scene.add( mesh );

				}

				// lights

				const dirLight1 = new THREE.DirectionalLight( 0xffffff );
				dirLight1.position.set( 1, 1, 1 );
				scene.add( dirLight1 );

				const dirLight2 = new THREE.DirectionalLight( 0x002288 );
				dirLight2.position.set( - 1, - 1, - 1 );
				scene.add( dirLight2 );

				// const ambientLight = new THREE.AmbientLight( 0x222222 );
				// scene.add( ambientLight );

				//

				window.addEventListener( 'resize', this.onWindowResize );

			},
      animate() {

				requestAnimationFrame( this.animate );

				controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

				this.render();

			},
      render() {

				renderer.render( scene, camera );

			},
      onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
