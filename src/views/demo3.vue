<template>
  <div class="container" id="container"></div>
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
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

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
  camera.position.set(0, 2, 4);
  scene.add(camera);

  //设置环境光，要不然模型没有颜色
  let ambientLight = new THREE.AmbientLight(); //设置环境光
  scene.add(ambientLight); //将环境光添加到场景中

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
  directionalLight.position.set(5,5,4)
  directionalLight.castShadow=true
  scene.add( directionalLight );
  const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  scene.add( helper );

  const textureLoader = new THREE.TextureLoader();
  const objLoader = new OBJLoader();
  // 瓶盖, 不加材质文件
  objLoader.load("./model/coconut/bottleCap.obj", (obj) => {
    obj.scale.multiplyScalar(0.2);
    obj.position.set(-0.1, 0.5, 0.67);
    obj.rotation.set(0, Math.PI, 0);
    scene.add(obj);
  });
  // 瓶身, 套材质
  textureLoader.load(
    "./model/coconut/COCOUNT_WATER_Package_Tex_v01/coconut_water_Body_BaseColor.png",
    (texture) => {
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.1,//金属度属
        roughness: 0.5,//表面粗糙度
      });
      objLoader.load(
        "./model/coconut/COCONUT_WATER_Package.obj",
        (loadedMesh) => {
          loadedMesh.traverse((child) => {
            if (child.isMesh) {
              child.material = material;
              //模型阴影
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          // options.meshScale = loadedMesh.scale.x
          // loadedMesh.position.set(options.meshPosX, options.meshPosY, options.meshPosZ)
          // loadedMesh.scale.set(options.meshScale, options.meshScale, options.meshScale)
          // loadedMesh.rotation.set(options.meshRateX, options.meshRateY, options.meshRateZ)
          loadedMesh.scale.multiplyScalar(0.2);
          scene.add(loadedMesh);
        }
      );
    }
  );
  // 添加地面
  const meshfloor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10), // 创建平面
    new THREE.MeshPhongMaterial({
      color: 0x40403c,
      side: THREE.DoubleSide,
    })
  );
  // 旋转地面
  meshfloor.rotation.x = Math.PI / 2;
  // 地面接收阴影
  meshfloor.receiveShadow = true;
  scene.add(meshfloor);

  //   const objLoader = new OBJLoader();
  //   objLoader.load("./model/coconut/COCONUT_WATER_Package.obj", (object) => {
  //     object.traverse(function (child) {
  //       console.log("child", child);
  //       if (child.isMesh) {
  //         //模型阴影
  //         child.castShadow = true;
  //         child.receiveShadow = true;
  //         // 模型颜色
  //         child.material.emissive = child.material.color;
  //         child.material.emissiveMap = child.material.map;
  //       }
  //     });
  //     // 模型缩放
  //     object.scale.multiplyScalar(0.1);
  //     scene.add(object);
  //   });

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

  renderer.outputEncoding = THREE.sRGBEncoding;
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
  //   controls.autoRotate = true; // 是否自动旋转
  // controls.enableZoom = false // 是否可以缩放 默认是true
  controls.dampingFactor = 0.1; // 动态阻尼系数 就是鼠标拖拽旋转灵敏度，阻尼越小越灵敏
};

// 添加滚轮事件
window.addEventListener("wheel", onScrollingEvents);

// 事件
function onScrollingEvents(event) {
  // 设置相机缩放比数值越大缩放越明显
  let factor = 0.5;
  // 从鼠标位置转化为webgl屏幕坐标位置
  let mouseX = (event.clientX / renderer.domElement.width) * 2 - 1;
  let mouseY = -(event.clientY / renderer.domElement.height) * 2 + 1;
  let vector = new THREE.Vector3(mouseX, mouseY, 0);
  // 从屏幕向量转为3d空间向量
  vector.unproject(camera);
  // 相机偏移量
  vector.sub(camera.position).setLength(factor);
  // 判断缩放
  if (event.deltaY < 0) {
    // camera + vector
    camera.position.add(vector);
    controls.target.add(vector);
  } else {
    // camera - vector
    camera.position.sub(vector);
    controls.target.sub(vector);
  }
}
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
