<template>
  <div class="container" id="container"></div>
</template>
<script lang="ts" setup>
let scene = null as any, //场景
  camera = null as any, //相机
  renderer = null as any, //渲染器
  controls = null as any; //轨道控制器

// 模型自带动画相关
let mixer = null as any,
  animation = null as any;
let clock = new THREE.Clock();

import { onMounted, reactive, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

//设置three的方法
const render = async () => {
  //1.创建场景
  scene = new THREE.Scene();
  //2.创建相机
  camera = new THREE.PerspectiveCamera(
    105,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  //3.设置相机位置
  camera.position.set(0, 0, 4);
  scene.add(camera);

  //设置环境光，要不然模型没有颜色
  let ambientLight = new THREE.AmbientLight(); //设置环境光
  scene.add(ambientLight); //将环境光添加到场景中
  // let pointLight = new THREE.PointLight();
  // pointLight.position.set(200, 200, 200); //设置点光源位置
  // scene.add(pointLight); //将点光源添加至场景
  
  // const parallelLight = new THREE.DirectionalLight(0xffffff, 1);
  // parallelLight.position.set(10, 10, 0).normalize();
  // parallelLight.castShadow = true;
  // scene.add(parallelLight);

  // parallelLight.position.copy(camera.position); // 将位置设置为与相机一致
  // parallelLight.quaternion.copy(camera.quaternion); // 将朝向设置为与相机一致

  // gltf模型
  const gltfLoader = new GLTFLoader();
  // 当前模型采用了Draco 压缩格式压缩模型了，所以需要使用DRACOLoader进行解码
  const dracoloader = new DRACOLoader();
  dracoloader.setDecoderPath("./node_modules/three/examples/jsm/libs/draco/");
  dracoloader.setDecoderConfig({ type: "js" });
  gltfLoader.setDRACOLoader(dracoloader);
  gltfLoader.load("./model/carman.glb", (glb) => {
    console.log('glb', glb);
    let model = glb.scene;
    model.traverse(( child ) =>  {
      if ( child.isMesh ) {
        // 双面渲染
        child.material.side = THREE.DoubleSide;
        //模型阴影
        child.castShadow = true;
        child.receiveShadow = true;
        // 模型颜色
        child.material.emissive =  child.material.color;
        child.material.emissiveMap = child.material.map ;
      }
    });
    animation = glb.animations?.[0];
    // 模型缩放
    model.scale.set(0.5, 0.5, 0.5);
    // 将模型添加到场景中
    scene.add(model);
    // 模型自带动画
    if (animation) {
      mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(animation).play();
    }
  });

  //初始化渲染器
  //渲染器透明
  renderer = new THREE.WebGLRenderer({
    alpha: true, //渲染器透明
    antialias: true, //抗锯齿
    precision: "highp", //着色器开启高精度
  });
  // 可以渲染阴影
  renderer.shadowMap.enabled = true
  //开启HiDPI设置
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  //设置渲染器尺寸大小
  renderer.setClearColor(0x228b22, 0.1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  //将webgl渲染的canvas内容添加到div
  let container = document.getElementById("container") as any;
  container.appendChild(renderer.domElement);
  //使用渲染器 通过相机将场景渲染出来
  renderer.render(scene, camera);
  controls = new OrbitControls(camera, renderer.domElement);

};
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  //  当前模型的自带动画
  //  const delta = clock.getDelta()
  //  mixer.update(delta)
};
const createControls = () => {
  controls.enablePan = true; // 是否开启右键拖拽
  controls.maxPolarAngle = 2; // 上下翻转的最大角度
  controls.minPolarAngle = 0.0; // 上下翻转的最小角度
  controls.autoRotate = true; // 是否自动旋转
  // controls.enableZoom = false // 是否可以缩放 默认是true
  controls.dampingFactor = 0.5; // 动态阻尼系数 就是鼠标拖拽旋转灵敏度，阻尼越小越灵敏
};
onMounted(() => {
  render();
  animate();
  createControls();
});
</script>
<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
