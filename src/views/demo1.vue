<template>
  <div id="threeId" ref="elementRef"></div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ref, onMounted } from "vue";
let width, height;
let scene, camera, renderer, controls;
let mixer, animation;
let clock = new THREE.Clock();
const elementRef = ref(null);
onMounted(() => {
  const element = elementRef.value;
  width = element.offsetWidth;
  height = element.offsetHeight;
  initScene();
  initModel();
  initEnv();
});
function initScene() {
  // 初始化场景: 创建场景，相机，物体，渲染器
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfe3dd);
  camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
  camera.position.set(20, 20, 20);
  scene.add(camera);
  // 三维坐标
  //onst axesHelper = new THREE.AxesHelper(40)
  //scene.add(axesHelper)
  // antialias：是否执行抗锯齿
  renderer = new THREE.WebGLRenderer({ antialias: true });
  // 设备像素比
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  elementRef.value.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
}
function initEnv() {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    1
  ).texture;
}
function initModel() {
  const loader = new GLTFLoader();
  const dracoloader = new DRACOLoader();
  dracoloader.setDecoderPath("./node_modules/three/examples/jsm/libs/draco/");
  dracoloader.setDecoderConfig({ type: "js" });
  loader.setDRACOLoader(dracoloader);
  loader.load("./model/LittlestTokyo.glb", (glb) => {
    let model = glb.scene;
    animation = glb.animations[0];
    model.scale.set(0.05, 0.05, 0.05);
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(animation).play();
    render();
  });
}
function render() {
  requestAnimationFrame(render);
  const delta = clock.getDelta();
  controls.update();
  renderer.render(scene, camera);
  mixer.update(delta);
}
</script>

<style>
body,
html {
  padding: 0;
  margin: 0;
}
</style>

<style scoped>
#container {
  width: 100%;
  height: calc(100vh);
}
</style>
