//引入threejs生态各种资源包

import * as THREE from "./build/three.module.js";
import {
  OrbitControls
} from "./rely/jsm/controls/OrbitControls.js";
import {
  GLTFLoader
} from "./rely/jsm/loaders/GLTFLoader.js";
import {
  EffectComposer
} from "./rely/jsm/postprocessing/EffectComposer.js";
import {
  RenderPass
} from "./rely/jsm/postprocessing/RenderPass.js";
import {
  OutlinePass
} from "./rely/jsm/postprocessing/OutlinePass.js";
import {
  ShaderPass
} from "./rely/jsm/postprocessing/ShaderPass.js";
import {
  FXAAShader
} from "./rely/jsm/shaders/FXAAShader.js";

import Stats from './rely/jsm/libs/stats.module.js';

import {
  CSS3DRenderer,
  CSS3DObject
} from './rely/jsm/renderers/CSS3DRenderer.js';
import {
  Water
} from './rely/jsm/objects/Water.js';

// TWEEN可以监听动画进程【onStart】

// tween开始动画前的回调函数。

// 【onStop】

// tween结束动画后的回调函数。

// 【onUpdate】

// 在tween每次被更新后执行。

// 【onComplete】
import {
  TWEEN
} from './rely/jsm/libs/tween.module.min.js';


import {
  FontLoader
} from './rely/jsm/loaders/FontLoader.js';
import {
  TextGeometry
} from './rely/jsm/geometries/TextGeometry.js';

import * as echarts from './otherjs/echarts.esm.js';
let camera,
  controls,
  scene,
  ground,
  renderer,
  renderer2,
  raycaster,
  main,
  outlinePass,
  composer,
  stats,
  threejsCanvas,
  parameters,
  line,
  uniforms,
  flash
let env = -83
let river = []
let roads = []
let pipeline = []
// 雪花
const materials = [];
let particlesGroup
let INTERSECTED;
const pointer = new THREE.Vector2();
const mouse = new THREE.Vector2();
let selectedObjects = [];
//射线开关
let allowRay = true
// 精灵面板
let Sprites = []

//切换层级 触发目标
let triggerTag = ' ' //一级场景默认没有
let level = 1 // 层级
let baseModelUrl = `static/model/`
function init() {
  // 实例化场景
  {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);
    // 创建基础场景 天空 地面
    addSky()
    addGround()
  }
  // 实例化渲染器
  {
    //三维场景
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true
    });
    renderer.shadowMap.enabled = true;
    renderer.toneMappingExposure = 0.5;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = 0;
    renderer.domElement.style.zIndex = "1"; // required 

    renderer2 = new CSS3DRenderer();
    renderer2.setSize(window.innerWidth, window.innerHeight);
    renderer2.domElement.style.position = 'absolute';
    renderer2.domElement.style.top = 0;
    renderer2.domElement.style.zIndex = "2"; // required 

    threejsCanvas = document.getElementById('three');
    threejsCanvas.appendChild(renderer.domElement)
    threejsCanvas.appendChild(renderer2.domElement)

  }
  // 实例化相机 并配置参数
  {
    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      30000
    );
    camera.position.set(
      1042.9044878950897,
      1265.759804369018,
      1124.6139231151224
    );
    camera.lookAt(0, 0, 0);
  }
  // 实例化交互控制插件 并配置参数
  controls = new OrbitControls(camera, threejsCanvas);
  controls.listenToKeyEvents(window); // optional
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 5000;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.addEventListener('change', function () {
    Sprites.forEach(Sprite=>{
      Sprite.lookAt(camera.position)
    })
  })
  // 实例化射线
  raycaster = new THREE.Raycaster();
  // 射线方法
  raySelect()
  // 自适应界面填充屏幕
  window.addEventListener("resize", onWindowResize);
  // 监听点击事件
  threejsCanvas.style.touchAction = "none";
  threejsCanvas.addEventListener("pointermove", onPointerMove);
  threejsCanvas.addEventListener("dblclick", onPointerClick);
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);
  loaderModel()
  addLight()
  animate()
}
// 帧渲染
function animate() {
  requestAnimationFrame(animate);
  // 模拟河流流水效果
  river.forEach(water => {
    water.material.uniforms['time'].value += 1.0 / 60.0;
  })
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  stats.update();
  renderer2.render(scene, camera);
  composer.render();
  TWEEN.update();
  if(level===1){
    addSnowAnimate()
  }
}
// 添加地面
function addGround() {
  {
    // 纹理
    const texture = new THREE.TextureLoader().load(
      "static/image/ground3.jpg"
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(300, 300);

    ground = new THREE.Mesh(
      // 形状
      new THREE.CircleGeometry(2500, 300),
      // 材质
      new THREE.MeshPhongMaterial({
        map: texture
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -30.1;
    ground.receiveShadow = true;
    scene.add(ground);
  }
}
// 天空盒子
function addSky() {
  //添加天空盒
  {
    const urls = [
      "static/image/dark/left.bmp",
      "static/image/dark/right.bmp",
      "static/image/dark/top.bmp",
      "static/image/dark/bottom.bmp",
      "static/image/dark/back.bmp",
      "static/image/dark/front.bmp",
    ];
    const textureCube = new THREE.CubeTextureLoader().load(urls)
    scene.background = textureCube;
  }
}
// 模型加载
function loaderModel() {
  // 模型加载器
  {
    const loader = new GLTFLoader()
    console.log(`${baseModelUrl}${triggerTag===' '?'index':triggerTag}.glb`)
    loader.load(
      `${baseModelUrl}${triggerTag===' '?'index':triggerTag}.glb`,
      function (gltf) {
        // 判断所处的层级
        switch (level) {
          case 1:
            main && main.removeFromParent () 
            Sprites.forEach(item=>{
              console.log(item)
              item.remove(item.children[0])
            })
            Sprites = []
            // 将模型设置成全局变量后
            main = gltf.scene;
            console.log(main)
            main.position.setY(env)
            // 对模型处理
            dealWithModel(main)
            // 添加模型
            scene.add(main);
            // 相机动画
            tweenCamera({
              x: 13.711615431197156,
              y: 137.75293769086073,
              z: 214.81867174635983
            })
            // 光环
            addflash()
            // 雪花
            addSnow()
            break;
          case 2:
            console.log(gltf)
            main && main.removeFromParent () 
            particlesGroup && particlesGroup.removeFromParent () 
            Sprites.forEach(item=>{
              item.remove(item.children[0])
            })
            Sprites = []
            // 将模型设置成全局变量后
            main = gltf.scene;
            scene.add(main)
            console.log(main)
            //main.geometry.center()
            main.position.set(0,env,0)
            modelRising()
            break;
          default:
            break;
        }
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }
}
// 添加灯光
function addLight() {
  {
    // 初步只添加环境光 后续在研究其它
    // const ambientLight = new THREE.AmbientLight(0x222222, 5);
    // scene.add(ambientLight);
    scene.add(new THREE.AmbientLight(0xaaaaaa, 1));

    const light = new THREE.DirectionalLight(0xddffdd, 1);
    light.position.set(500, 500, 0);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;

    const d = 100;

    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 1000;

    scene.add(light);
    const targetObject = new THREE.Object3D();
    scene.add(targetObject);
    light.target = targetObject;
  }
}

// 射线法选取
function raySelect() {
  {
    // postprocessing 后期通道处理
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
      edgeGlow: 3,
      edgeThickness: 2.0,
      pulsePeriod: 0,
      usePatternTexture: false,
    };

    outlinePass.edgeStrength = params.edgeStrength;
    outlinePass.edgeGlow = params.edgeGlow;

    outlinePass.visibleEdgeColor.set(0xff7500);
    outlinePass.hiddenEdgeColor.set(0xd6ecf0);
  }
}

// 定位鼠标移入位置
function onPointerMove(event) {
  if (event.isPrimary === false) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  checkIntersection();
}
// 选取射线穿透的模型
function checkIntersection() {
  if (allowRay) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(scene)
    if (intersects.length > 0) {
      const selectedObject = intersects[0].object;
      filterRaySelected(selectedObject)
      outlinePass.selectedObjects = selectedObjects;
    } else {
      outlinePass.selectedObjects = [];
    }
  } else {
    outlinePass.selectedObjects = [];
  }
}
// 筛选和射线相交的目标，射线相交的部位可能是某一模型的一部分，需要选出来整体模型
function filterRaySelected(object) {
  let {
    userData
  } = object
  if (userData.eventType === 'next') {
    selectedObjects = [];
    selectedObjects.push(object);
  } else {
    if (object.parent) {
      filterRaySelected(object.parent)
    } else {
      selectedObjects = [];
    }
  }
}


function onPointerClick(event) {
  //alert(123)
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  bindModelClick();
}

function bindModelClick() {

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  //console.log(intersects)
  if (intersects.length > 0) {
    INTERSECTED = intersects[0].object;
    //INTERSECTED.material.emissive.setHex(0xff0000);
    let userData = INTERSECTED.userData
    if(userData.isEvent){
      switch (userData.eventType) {
        case 'next':
          level++
          triggerTag = userData.childName
          //console.log(triggerTag)
          loaderModel()
          break;
        default:
          break;
      }
    }
    
  }
}

// 自适应窗口
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
// 模型整理，读取的gltf模型对齐参数和其中个体进行设置整理
function dealWithModel(main) {
  main.traverse((child) => {
    if (child.isMesh) {
      // 开启模型阴影效果
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material.map) {
        child.material.map.anisotropy = 8;
      }
      console.log(child)
      // child.material.side = THREE.DoubleSide
      // child.material.transparent = true
      // child.material.opacity = 0.1
      
      // // child.material.blendDstAlpha = 1
      // // child.material.alphaTest = 0.5
      // // child.material.premultipliedAlpha  = true
      // // child.material.alphaToCoverage = true
      // child.material.needsUpdate  = true
      // 根据名字
      switch (child.name) {
        case 'water001':
        case '水':
          
          const waterGeometry = child.geometry
          const water = new Water(
            waterGeometry, {
              textureWidth: 256,
              textureHeight: 256,
              waterNormals: new THREE.TextureLoader().load('static/image/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
              }),
              distortionScale: 1,
              waterColor: 0x666666
            }
          )
          water.material.transparent = true
          water.material.opacity = 0
          child.material = water.material
          
          child.material.needsUpdate = true;
          river.push(child)
          break;
        case '污水管-材质1':
        case '回流管道-材质001':
          pipeline.push(child)
          break;
        default:
          break;
      }
    }else if(child.userData.isGetData==='false'&&child.userData.panelTitle){
      const element = document.createElement('div');
      element.className = 'element';
      element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')'
      element.style.opacity = 0
      element.innerText = child.userData.panelTitle
      const objectCSS = new CSS3DObject(element)
      child.scale.set(0.05, 0.05, 0.05)
      child.add(objectCSS)
      Sprites.push(child)
    }
  })
  // 开启管道动画
  pipelineFlow()

}
// 抬升动画
function modelRising() {
  new TWEEN.Tween(main.position).to({
      x: 0,
      y: -27,
      z: 0
    }, 2000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onComplete(function(){
      $('.element').css('opacity',1)
    })
    .start()
}
// 管道流动动画
function pipelineFlow() {
  function animate() {
    let timer = requestAnimationFrame(animate)
    !pipeline.length && cancelAnimationFrame(timer)
    pipeline.forEach(item => {
      item.material.map.offset.y -= 0.02
    })
  }
  animate()
}
// 相机动画
function tweenCamera(endCamera) {
  new TWEEN.Tween(camera.position).to(endCamera, 2000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onComplete(createFont)
    .start()
}

// html元素渲染
function renderHtml() {

  const table = [
    "Hao", "Hydrogen", "1.00794", 1, 1,
  ]
  for (let i = 0; i < table.length; i += 5) {

    const element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

    const number = document.createElement('div');
    number.className = 'number';
    number.textContent = (i / 5) + 1;
    element.appendChild(number);

    const symbol = document.createElement('div');
    symbol.className = 'symbol';
    symbol.textContent = table[i];
    element.appendChild(symbol);

    const details = document.createElement('div');
    details.className = 'details';
    details.innerHTML = table[i + 1] + '<br>' + table[i + 2];

    element.appendChild(details);


    const objectCSS = new CSS3DObject(element)
    const Sprite = scene.getObjectByProperty("name", "Sprite")
    Sprite.scale.set(0.05, 0.05, 0.05)
    Sprite.position.set(0, 20, 0)
    //Sprite.add(objectCSS)
    Sprites.push(Sprite)
    //console.log(objectCSS, Sprite)


    // 当移入html属性的时候禁用射线监测
    element.addEventListener('mouseover', function (e) {
      allowRay = false
    })
    element.addEventListener('mouseleave', function (e) {
      allowRay = true
    })
    element.addEventListener('mousedown', function (e) {
      console.log(e.target)
    })

    // 创建echart图表

    const chartBox = document.createElement('div')
    chartBox.style.width = '600px'
    chartBox.style.height = '400px'
    chartBox.className = 'chart'
    var myChart = echarts.init(chartBox)
    // 指定图表的配置项和数据
    var option = {
      color: ['#5A7BE6', '#4BB25C', '#F2AA1C', '#F77158'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        textStyle: {
          color: 'rgba(255, 255,255, .6)'
        }
      },
      xAxis: {
        type: 'category', // type为time时,不要传xAxis.data的值,x轴坐标的数据会根据传入的时间自动展示
        boundaryGap: false, // false横坐标两边不需要留白
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255,255, .6)'
          }
        },

        data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
      },
      yAxis: {
        type: 'value',
        min: 'dataMin',
        splitLine: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255,255, .6)'
          }
        }

      },
      grid: {
        // left: 24,
        // right: 24,
        // top: '15%',
        left: '10%',
        right: '10%',
        top: '20%',
        bottom: '20%',
        containLabel: false
        // containLabel: true
      },
      series: [
        {
          name: '销量',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20]
        }
      ]
    }

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    const myChartCSS = new CSS3DObject(chartBox)
    myChartCSS.position.setX = 400
    Sprite.add(myChartCSS)
    
  }
}
// 添加雪花场景 
function addSnow() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const textureLoader = new THREE.TextureLoader();
  const sprite1 = textureLoader.load('static/image/sprites/snowflake1.png');
  const sprite2 = textureLoader.load('static/image/sprites/snowflake2.png');
  const sprite3 = textureLoader.load('static/image/sprites/snowflake3.png');
  const sprite4 = textureLoader.load('static/image/sprites/snowflake4.png');
  const sprite5 = textureLoader.load('static/image/sprites/snowflake5.png');

  for (let i = 0; i < 500; i++) {

    const x = Math.random() * 1500 - 1000;
    const y = Math.random() * 1500 - 1000;
    const z = Math.random() * 1500 - 1000;

    vertices.push(x, y, z);

  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  parameters = [
    [
      [1.0, 0.2, 0.5], sprite2, 20
    ],
    [
      [0.95, 0.1, 0.5], sprite3, 15
    ],
    [
      [0.90, 0.05, 0.5], sprite1, 10
    ],
    [
      [0.85, 0, 0.5], sprite5, 8
    ],
    [
      [0.80, 0, 0.5], sprite4, 5
    ]
  ];
  particlesGroup = new THREE.Group();
  for (let i = 0; i < parameters.length; i++) {

    const color = parameters[i][0];
    const sprite = parameters[i][1];
    const size = parameters[i][2];

    materials[i] = new THREE.PointsMaterial({
      size: size,
      map: sprite,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    });
    materials[i].color.setHSL(color[0], color[1], color[2]);

    const particles = new THREE.Points(geometry, materials[i]);

    particles.rotation.x = Math.random() * 6;
    particles.rotation.y = Math.random() * 6;
    particles.rotation.z = Math.random() * 6;

    particlesGroup.add(particles);

  }
  scene.add(particlesGroup)
}

// 添加雪花动画
function addSnowAnimate() {
  if(!particlesGroup) return
  const time = Date.now() * 0.00005;
  for (let i = 0; i < particlesGroup.children.length; i++) {

    const object = particlesGroup.children[i];

    if (object instanceof THREE.Points) {

      object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));

    }

  }
  for (let i = 0; i < materials.length; i++) {

    const color = parameters[i][0];

    const h = (360 * (color[0] + time) % 360) / 360;
    materials[i].color.setHSL(h, color[1], color[2]);

  }
}

// 创建炫彩字体 并添加动画

function createFont() {
  if(!(level===1)) return
  var vertexShader = `uniform float amplitude;

  attribute vec3 displacement;
  attribute vec3 customColor;

  varying vec3 vColor;

  void main() {

    vec3 newPosition = position + amplitude * displacement;

    vColor = customColor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

  }`

  var fragmentShader = `uniform vec3 color;
  uniform float opacity;

  varying vec3 vColor;

  void main() {

    gl_FragColor = vec4( vColor * color, opacity );

  }`
  const loader = new FontLoader();
  loader.load('../static/font/FangSong_Regular.json', function (font) {
    uniforms = {

      amplitude: {
        value: 5
      },
      opacity: {
        value: 0
      },
      color: {
        value: new THREE.Color(0xffffff)
      }

    };

    const shaderMaterial = new THREE.ShaderMaterial({

      uniforms,
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true

    });


    const geometry = new TextGeometry('spring 镰湾河污水处理厂', {
      font: font,

      size: 10,
      height: 1,
      curveSegments: 1,

      // bevelThickness: 0.5,
      // bevelSize: 0.5,
      // bevelEnabled: true,
      // bevelSegments: 2,

    });

    geometry.center();

    const count = geometry.attributes.position.count;

    const displacement = new THREE.Float32BufferAttribute(count * 3, 3);
    geometry.setAttribute('displacement', displacement);

    const customColor = new THREE.Float32BufferAttribute(count * 3, 3);
    geometry.setAttribute('customColor', customColor);

    const color = new THREE.Color(0xffffff);

    for (let i = 0, l = customColor.count; i < l; i++) {

      //color.setHSL(i / l, 0.5, 0.5);
      color.setHSL(0.5, 0.5, 0.5);
      color.toArray(customColor.array, i * customColor.itemSize);

    }

    line = new THREE.Line(geometry, shaderMaterial);
    line.position.setY(50)
    main.add(line);
    fontAnimate()
  });
}

function fontAnimate() {
  new TWEEN.Tween(uniforms.opacity).to({
      value: 0.3
    }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(fontParameter)
    .onComplete(modelRising)
    .start()
}

function fontParameter() {
  // const time = Date.now() * 0.001;
  uniforms.amplitude.value *= uniforms.opacity.value
  //uniforms.color.value.offsetHSL( 0.0005, 0, 0 );

  const attributes = line.geometry.attributes;
  const array = attributes.displacement.array;

  for (let i = 0, l = array.length; i < l; i += 3) {

    array[i] += 0.3 * (0.5 - Math.random());
    array[i + 1] += 0.3 * (0.5 - Math.random());
    array[i + 2] += 0.3 * (0.5 - Math.random());

  }

  attributes.displacement.needsUpdate = true;
}

function addflash() {
  const geometry = new THREE.CircleGeometry(1, 128);
  const color = new THREE.Color('skyblue');
  const material = new THREE.MeshLambertMaterial({
    color,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
  });
  flash = new THREE.Mesh(geometry, material);
  flash.rotateX(-Math.PI / 2)
  flash.position.setY(-30)
  scene.add(flash)
  flashAnimate()
}

function flashAnimate() {
  if(!flash) return
  flash.material.opacity = 0.2
  flash.scale.x = 10
  flash.scale.y = 10
  flash.scale.z = 10
  new TWEEN.Tween(flash.scale).to({
      x: 1000,
      y: 1000,
      z: 1000
    }, 3000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      flash.material.opacity = 0.2 - flash.scale.x / 5000
    })
    .onComplete(flashAnimate)
    .start()

}
setTimeout(() => {
  init()
  
}, 0);
