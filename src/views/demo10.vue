<template>
  <div
    style="
      font-size: 24px;
      color: #ffffff;
      text-align: center;
      position: absolute;
      top: 20%;
      left: 50%;
      transform: translate(-50%, -50%);
    "
  >
    {{ msg }}
  </div>
</template>
<script setup>
import * as THREE from "three";
import { onMounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 导入hdr加载器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
let model = null;
let animation = null;
const msg = ref("");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  105,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  alpha: true, //渲染器透明
  antialias: true, //抗锯齿
  precision: "highp", //着色器开启高精度
});
// 可以渲染阴影
renderer.shadowMap.enabled = true;
//开启HiDPI设置
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
//设置渲染器尺寸大小
renderer.setClearColor(0x228b22, 0.1);
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);

// 设置了hdr贴图需要加Tone mapping提升真实度
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

onMounted(() => {
  init();
});
function init() {
  //设置相机位置
  camera.position.set(0, 0, 4);
  renderer.setSize(window.innerWidth, window.innerHeight);
  //设置环境光，要不然模型没有颜色
  let ambientLight = new THREE.AmbientLight(); //设置环境光
  scene.add(ambientLight); //将环境光添加到场景中

  document.body.appendChild(renderer.domElement);
  // gltf模型
  const gltfLoader = new GLTFLoader();
  const dracoloader = new DRACOLoader();
  dracoloader.setDecoderPath("./node_modules/three/examples/jsm/libs/draco/");
  dracoloader.setDecoderConfig({ type: "js" });
  gltfLoader.setDRACOLoader(dracoloader);
  gltfLoader.load("./model/demo9/coconut3.glb", (glb) => {
    console.log("glb", glb);
    model = glb.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        // 双面渲染
        // child.material.side = THREE.DoubleSide;
        //模型阴影
        child.castShadow = true;
        child.receiveShadow = true;
        // 模型颜色
        // child.material.emissive = child.material.color;
        // child.material.emissiveMap = child.material.map;

        // 模型透明
        // child.material.transparent = true;
        // child.material.opacity = 0.5;
        // 模型材质
        // child.material = new THREE.MeshPhysicalMaterial({
        //   metalness: 0.0, //玻璃非金属  金属度设置0
        //   roughness: 0.0, //玻璃表面光滑
        //   envMapIntensity: 1.0,
        //   ior: 1.5, //折射率
        // });
      }
    });
    animation = glb.animations?.[0];
    // 模型缩放
    model.scale.set(0.2, 0.2, 0.2);
    // 将模型添加到场景中
    scene.add(model);
    // 模型自带动画
    if (animation) {
      mixer = new THREE.AnimationMixer(model);
      const clipAction = mixer.clipAction(animation);
      clipAction.play();
      clipAction.timeScale = 0.5;
    }
  });

  // 加载hdr环境图
  const rgbeLoader = new RGBELoader();
  console.log("rgbeLoader", rgbeLoader);
  rgbeLoader.loadAsync("./model/demo9/textures/13.hdr").then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping; // 设置映射类型
    scene.background = texture; // 设置背景
    scene.environment = texture; // 设置环境贴图
  });

  controls.update();
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // model.rotation.y += 0.01
    renderer.render(scene, camera);
  }
  animate();
}
// 创建射线投射器
const raycaster = new THREE.Raycaster();
// 鼠标位置
const mouse = new THREE.Vector2();
// 记录上一个被点击的对象
let lastSelectedObject = null;
// 鼠标点击事件监听
window.addEventListener("click", mouseClick, false);
function mouseClick(event) {
  console.log("点击事件");
  // 将鼠标坐标归一化
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // 设置射线起点为鼠标位置，射线的方向为相机视角方向
  raycaster.setFromCamera(mouse, camera);
  // 计算射线相交
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    // 如果之前有选中的物体，将其颜色恢复为初始状态
    if (lastSelectedObject) {
      lastSelectedObject.material.color.set(lastSelectedObject.initialColor);
    }
    // 选中物体
    const selectedObject = intersects[0].object;
    msg.value = `点击了${selectedObject.name}`;
    // 记录当前选中物体的状态
    selectedObject.initialColor = selectedObject.material.color.clone();
    lastSelectedObject = selectedObject;
    selectedObject.material.color.set(0xff62e258);
  } else {
    // 如果没有新的物体被选中，恢复上一个选中物体的颜色（如果存在的话）
    if (lastSelectedObject) {
      lastSelectedObject.material.color.set(lastSelectedObject.initialColor);
      msg.value = "";
    }
  }
}
</script>
