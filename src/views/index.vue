<template>
  <div class="container" id="container" @click.stop="showModal = true">
    <!--弹窗-->
    <section class="threeModel" v-if="showModal">
      <header class="threeModelTitle">
        <div class="threeTitleLeft">东方明珠简介</div>
        <div class="threeTitleRight" @click.stop="showModal = false">×</div>
      </header>
      <div class="threeModelContent">
        东方明珠广播电视塔，简称“东方明珠”，上海市标志性建筑之一。
        <section class="contentImg">
          <img src="../public/img/dongfang.png" />
        </section>
      </div>
    </section>
  </div>

</template>
<script lang="ts" setup>
let scene = null as any, //场景
  camera = null as any, //相机
  renderer = null as any, //渲染器
  controls = null as any, //轨道控制器
  model = null as any; //模型

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
  gltfLoader.load("./model/LittlestTokyo.glb", (glb) => {
    model = glb.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        //模型阴影
        child.castShadow = true;
        child.receiveShadow = true;
        // 模型颜色
        child.material.emissive = child.material.color;
        child.material.emissiveMap = child.material.map;
      }
    });
    animation = glb.animations[0];
    // 模型缩放
    model.scale.set(0.005, 0.005, 0.005);
    // 将模型添加到场景中
    scene.add(model);
    // 模型自带动画
    mixer = new THREE.AnimationMixer(model);
    const clipAction = mixer.clipAction(animation);
    clipAction.play();
    clipAction.timeScale = 1; // 模型动画播放速度
  });

  //初始化渲染器
  //渲染器透明
  renderer = new THREE.WebGLRenderer({
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
  const delta = clock.getDelta();
  // mixer.update(delta);
  // console.log("delta", Math.PI / 4);
  // model.rotation.z += delta * 0.2;
  // model.rotation.y += delta * 0.2;
  // model.rotation.x += delta * 0.5;
  // model.rotation.y += 0.01; // 设置模型自转
  // model.rotation.z = Math.PI/4
};
const createControls = () => {
  controls.enablePan = true; // 是否开启右键拖拽
  // controls.maxPolarAngle = 2; // 上下翻转的最大角度
  controls.maxPolarAngle = 0.2; // 上下翻转的最大角度

  controls.minPolarAngle = 0.0; // 上下翻转的最小角度
  controls.autoRotate = false; // 是否自动旋转
  // controls.enableZoom = false // 是否可以缩放 默认是true
  controls.dampingFactor = 0.5; // 动态阻尼系数 就是鼠标拖拽旋转灵敏度，阻尼越小越灵敏
};
onMounted(() => {
  render();
  animate();
  createControls();
});

const showModal = ref(false)
</script>
<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.threeModel {
  width: 400px;
  height: 220px;
  border-radius: 5px;
  color: #fff;
  background-color: rgba(6, 7, 80, 0.8);
  position: fixed;
  left: 50vw;
  top: 20vh;
  font-size: 18px;
}
.threeModelTitle {
  width: 100%;

  padding-top: 5px;
  padding-left: 5px;
  height: 40px;
  display: flex;
  align-content: center;
  justify-content: center;
}
.threeTitleLeft {
  flex: 5;
  height: 100%;
  text-align: left;
  padding-left: 5px;
}
.threeTitleRight {
  flex: 1;
  height: 100%;
  cursor: pointer;
  margin-top: -8px;
  font-size: 30px;
}
.threeModelContent {
  width: 98%;
  margin: 0 auto;
  height: 180px;
  font-size: 16px !important;
  overflow: auto;
}
.threeModelContent::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 6px;
  background: #041c34;
}
.threeModelContent::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 3px;
  height: 50px;
  background-color: #007acc;
}
.contentImg {
  width: 96%;
  height: 200px;
  margin: 0 auto;
}
.contentImg img {
  width: 100%;
  height: 100%;
}
</style>
