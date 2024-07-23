<template>
  <div class="container">
    <img
      id="sun"
      src="../../public/model/demo9/textures/sun6.jpg"
      style="z-index: -1; height: 200vh; transform-origin: 36% 36%;"
      alt=""
    />
    <img
      id="logo"
      src="../../public/model/demo9/textures/logo.png"
      style="z-index: -0.5; height: 46vh; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
      alt=""
    />
    <!--弹窗-->
    <section class="threeModel" v-if="showModal">
      <header class="threeModelTitle">
        <div class="threeTitleLeft">三麟椰子水简介</div>
        <div class="threeTitleRight" @click.stop="showModal = false">×</div>
      </header>
      <div class="threeModelContent">
        <div class="contentText">100%纯椰子水, 好喝上头。</div>
        <img
          class="contentImg"
          src="https://cdnfile.sanlinst.com/sysimg/b870029d115044bfbaac9100ad9b9dea.png"
        />
      </div>
    </section>
    <!-- {{ msg }} -->
  </div>
</template>
<script lang="ts" setup>
let scene = null as any, //场景
  camera = null as any, //相机
  renderer = null as any, //渲染器
  controls = null as any, //轨道控制器
  model = null as any;

// 模型自带动画相关
let mixer = null as any,
  animation = null as any;
let clock = new THREE.Clock();

const showModal = ref(false);
const msg = ref("");

import { onMounted, reactive, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
// 导入hdr加载器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
import { gsap } from "gsap";

//设置three的方法
const render = async () => {
  //1.创建场景
  scene = new THREE.Scene();
  console.log("scene", scene);

  //2.创建相机
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(0, 10, 50)
  camera.lookAt(scene.position)
  // const width = window.innerWidth; //canvas画布宽度
  // const height = window.innerHeight; //canvas画布高度
  // const k = width / height; //canvas画布宽高比
  // const s = 30; //控制left, right, top, bottom范围大小
  // const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 8000);
  // camera.position.set(-1.66, 2.21, 18.1);
  // camera.lookAt(scene.position);


  scene.add(camera);

  //设置环境光，要不然模型没有颜色
  // let ambientLight = new THREE.AmbientLight(); //设置环境光
  // scene.add(ambientLight); //将环境光添加到场景中
  // let pointLight = new THREE.PointLight(0xffffff, 1);
  // pointLight.position.set(100, 200, 200); //设置点光源位置
  // scene.add(pointLight); //将点光源添加至场景

  const parallelLight = new THREE.DirectionalLight(0xffffff, 1.5);
  const parallelLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  parallelLight.position.set(100, 200, 200);
  parallelLight2.position.set(100, -200, 200);
  // parallelLight.castShadow = true;
  // parallelLight.shadow.bias = -0.5;
  scene.add(parallelLight);
  scene.add(parallelLight2);

  // parallelLight.position.copy(camera.position); // 将位置设置为与相机一致
  // parallelLight.quaternion.copy(camera.quaternion); // 将朝向设置为与相机一致

  // gltf模型
  const gltfLoader = new GLTFLoader();
  const dracoloader = new DRACOLoader();
  dracoloader.setDecoderPath("./node_modules/three/examples/jsm/libs/draco/");
  dracoloader.setDecoderConfig({ type: "js" });
  gltfLoader.setDRACOLoader(dracoloader);
  gltfLoader.load("./model/demo9/coconut6.glb", (glb) => {
    console.log("glb", glb);
    model = glb.scene;
    // 设置模型初始位置
    model.position.set(0, -20, 0);
    model.traverse((child) => {
      if (child.isMesh) {
        // 双面渲染
        child.material.side = THREE.DoubleSide;
        //模型阴影
        child.castShadow = true;
        // child.receiveShadow = true;
        // 模型颜色
        child.material.emissive = child.material.color;
        child.material.emissiveMap = child.material.map;

        // 动画：从下往上移动
        const toPosition = { y: 0 };
        const duration = 2000; // 动画持续时间（毫秒）
        new TWEEN.Tween(model.position)
          .to(toPosition, duration)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onComplete(() => console.log('动画完成'))
          .start();
      }
    });
    animation = glb.animations?.[0];
    // 模型缩放
    // model.scale.set(0.3, 0.3, 0.3);
    model.scale.set(2, 2, 2);
    // 模型位置
    // model.position.z += 2;
    // 将模型添加到场景中
    scene.add(model);
    model.rotation.y = -Math.PI / 18;
    let tween = new TWEEN.Tween(model.rotation)
      .to({ y: model.rotation.y + Math.PI / 9 }, 5000) // 旋转10度
      .repeat(Infinity)
      .yoyo(true) // 是否反向播放
      // .onUpdate(() => {
      //   // 每次更新动画时，重绘场景
      //   renderer.render(scene, camera);
      // })
      .start(); // 开始动画

    // 模型自带动画
    if (animation) {
      mixer = new THREE.AnimationMixer(model);
      const clipAction = mixer.clipAction(animation);
      clipAction.play();
      clipAction.timeScale = 0.5;
    }
  });

  // 使用TWEEN创建旋转动画
  let t1 = gsap.timeline({ repeat: -1 });
  t1.to("#sun", { rotation: 5, duration: 5 }).to("#sun", {
    rotation: 0,
    duration: 5,
  });

  // 加载hdr环境图
  // const rgbeLoader = new RGBELoader();
  // console.log("rgbeLoader", rgbeLoader);
  // rgbeLoader
  //   .loadAsync("./model/demo6/toukui/textures/royal_esplanade_1k.hdr")
  //   .then((texture) => {
  //     texture.mapping = THREE.EquirectangularReflectionMapping; // 设置映射类型
  //     scene.background = texture; // 设置背景
  //     scene.environment = texture; // 设置环境贴图
  //   });
  // 加载纹理
  // const textureLoader = new THREE.TextureLoader();
  // const texture = textureLoader.load("./model/demo9/textures/sun2.jpg");
  // let planeGeometry = new THREE.PlaneGeometry(10, 10);
  // let planeMaterial = new THREE.MeshBasicMaterial({
  //   color: 0xffffff,
  //   // 添加颜色贴图
  //   map: texture,
  //   // 允许透明（纹理贴图的透明部分不会被渲染出来）
  //   transparent: true,
  // });
  // let plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // plane.position.z = 1;
  // scene.add(plane);

  // 使用TWEEN创建旋转动画
  // const tween = new TWEEN.Tween(plane.rotation)
  //   .to({ z: plane.rotation.z + (Math.PI / 18) }, 3000) // 旋转10度
  //   .repeat(Infinity)
  //   .yoyo(true) // 是否反向播放
  //   .onUpdate(() => {
  //     // 每次更新动画时，重绘场景
  //     renderer.render(scene, camera);
  //   })
  //   .start(); // 开始动画

  // 添加地面
  // const meshfloor = new THREE.Mesh(
  //   new THREE.PlaneGeometry(100, 100), // 创建平面
  //   new THREE.MeshPhongMaterial({
  //     color: 0x2032a3,
  //     side: THREE.DoubleSide,
  //   })
  // );
  // meshfloor.receiveShadow = true;
  // scene.add(meshfloor);

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
  //设置渲染器尺寸大小
  renderer.setClearColor("#fff", 0.1);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.domElement.style.zIndex = "1";
  renderer.domElement.style.position = "relative";
  
  document.getElementById("app").appendChild(renderer.domElement);

  //使用渲染器 通过相机将场景渲染出来
  renderer.render(scene, camera);
  controls = new OrbitControls(camera, renderer.domElement);

  // 设置了hdr贴图需要加Tone mapping提升真实度
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  controls.update();
  function animate() {
    requestAnimationFrame(animate);

    TWEEN.update(); // 更新TWEEN动画

    controls.update();
    // model.rotation.y += 0.002;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    // 更新相机视锥体以匹配新的窗口大小 ( 正交相机 )
    // const width = window.innerWidth; //canvas画布宽度
    // const height = window.innerHeight; //canvas画布高度
    // const k = width / height; //canvas画布宽高比
    // const s = 30; //控制left, right, top, bottom范围大小
    // // const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 8000);
    // camera.left = -s * k;
    // camera.right = s * k;
    // camera.top = s;
    // camera.bottom = -s;

    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth /  window.innerHeight,
      0.01,
      1000
    );
    camera.position.set(0, 15, 50)
    camera.lookAt(scene.position)

    // 更新渲染器的大小
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 更新相机的投影矩阵
    camera.updateProjectionMatrix();
  });
};
const createControls = () => {
  controls.enablePan = false; // 是否开启右键拖拽
  controls.maxPolarAngle = 2; // 上下翻转的最大角度
  controls.minPolarAngle = 0.0; // 上下翻转的最小角度
  controls.autoRotate = false; // 是否自动旋转
  controls.enableRotate = false; // 是否开启选择
  controls.enableZoom = false; // 是否可以缩放 默认是true
  controls.dampingFactor = 0.1; // 动态阻尼系数 就是鼠标拖拽旋转灵敏度，阻尼越小越灵敏
};

onMounted(() => {
  render();
  createControls();
});

// 创建射线投射器
const raycaster = new THREE.Raycaster();
// 鼠标位置
const mouse = new THREE.Vector2();
// 记录上一个被点击的对象
let lastSelectedObject = null;
// 鼠标点击事件监听
window.addEventListener("click", mouseClick, false);
function mouseClick(event) {
  return;
  console.log("点击事件");
  // 将鼠标坐标归一化
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // 设置射线起点为鼠标位置，射线的方向为相机视角方向
  raycaster.setFromCamera(mouse, camera);
  // 计算射线相交
  console.log("scene.children", scene.children);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    // 如果之前有选中的物体，将其颜色恢复为初始状态
    if (lastSelectedObject) {
      lastSelectedObject.material.color.set(lastSelectedObject.initialColor);
    }
    // 选中物体
    const selectedObject = intersects[0].object;
    // msg.value = `点击了${selectedObject.name}`;
    // 显示弹窗
    showModal.value = true;
    // 记录当前选中物体的状态
    selectedObject.initialColor = selectedObject.material.color.clone();
    lastSelectedObject = selectedObject;
    selectedObject.material.color.set(0xff62e258);
  } else {
    // 如果没有新的物体被选中
    if (lastSelectedObject) {
      lastSelectedObject.material.color.set(lastSelectedObject.initialColor);
      // msg.value = "";
      // 关闭弹窗
      showModal.value = false;
    }
  }
}
</script>
<style>
body {
  background: #3483e8 !important;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
body ::-webkit-scrollbar {
  display: none; /* Chrome, Safari, and Opera */
}
</style>
<style scoped>
.container {
  font-size: 24px;
  color: #ffffff;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: 0 0;
  position: fixed;

  /* 隐藏默认的滚动条样式 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.threeModel {
  width: 400px;
  padding: 10px;
  border-radius: 5px;
  color: #fff;
  background-color: rgba(6, 7, 80, 0.8);
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translate(-50%, -50%);
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
  font-size: 16px !important;
  overflow: auto;
  .contentText {
    margin-bottom: 10px;
  }
  .contentImg {
    width: 100%;
  }
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
</style>
