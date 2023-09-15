<template>
  <!-- ChristmasLoveCard.vue 圣诞节3D贺卡 -->
</template>

<script setup lang="ts">
import * as THREE from "three"// 引入three.js
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"// 导入轨道控制器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"// 导入gltf 模型加载器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"// 导入draco  模型解码器

/************************************************************ s:初始化场景、相机、渲染器 **********************************************/ 
// 初始化场景
const scene = new THREE.Scene()

// 初始化相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(-3.23, 2.98, 4.06)
camera.updateProjectionMatrix()

// 初始化渲染器
const renderer = new THREE.WebGL1Renderer({
  // 设置抗锯齿
  antialias: true
})
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

/********************************************************************** s:加载模型 **********************************************/ 
// 初始化loader(需要先导入gltf 模型加载器、draco模型解码器)、注意填写path的正确路径
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/public/draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// 加载模型
gltfLoader.load("/public/model/scene.glb",(gltf) =>{
  const model = gltf.scene
  model.scale.set(0.1,0.1,0.1)
  scene.add(model)
})

/********************************************************************** s:初始化光源 **********************************************/ 
// 添加平行光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 50, 0);//光照从上往下
scene.add(light);

/********************************************************************** s:渲染 **********************************************/ 
// 渲染
function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
  controls.update()
}
render()

</script>

<style scoped>
*{
  margin: 0;
  padding: 0;
}
canvas {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}
</style>
