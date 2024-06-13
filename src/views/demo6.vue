<template>
  <div class="container" id="container"></div>
</template>
<script lang="ts" setup>
// 模型自带动画相关
let mixer = null as any,
  animation = null as any;
let clock = new THREE.Clock();

import { onMounted, reactive, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
let camera, scene, renderer;

init();

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.25,
    20
  );
  camera.position.set(-1.8, 0.6, 2.7);

  scene = new THREE.Scene();

  new RGBELoader()
    .setPath("./model/demo6/toukui/textures/")
    .load("royal_esplanade_1k.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;

      render();

      // model

      const loader = new GLTFLoader().setPath("./model/demo6/toukui/glft/");
      loader.load("DamagedHelmet.gltf", async function (gltf) {
        const model = gltf.scene;

        // wait until the model can be added to the scene without blocking due to shader compilation
        this.compileAsync = function (scene, camera, targetScene = null) {
          const materials = this.compile(scene, camera, targetScene);

          // Wait for all the materials in the new object to indicate that they're
          // ready to be used before resolving the promise.

          return new Promise((resolve) => {
            function checkMaterialsReady() {
              materials.forEach(function (material) {
                const materialProperties = properties.get(material);
                const program = materialProperties.currentProgram;

                if (program.isReady()) {
                  // remove any programs that report they're ready to use from the list
                  materials.delete(material);
                }
              });

              // once the list of compiling materials is empty, call the callback

              if (materials.size === 0) {
                resolve(scene);
                return;
              }

              // if some materials are still not ready, wait a bit and check again

              setTimeout(checkMaterialsReady, 10);
            }

            if (extensions.get("KHR_parallel_shader_compile") !== null) {
              // If we can check the compilation status of the materials without
              // blocking then do so right away.

              checkMaterialsReady();
            } else {
              // Otherwise start by waiting a bit to give the materials we just
              // initialized a chance to finish.

              setTimeout(checkMaterialsReady, 10);
            }
          });
        };
        await renderer.compileAsync(model, camera, scene);

        scene.add(model);

        render();
      });
    });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render); // use if there is no animation loop
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.target.set(0, 0, -0.2);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

//

function render() {
  renderer.render(scene, camera);
}
</script>
<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
