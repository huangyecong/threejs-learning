<template>
  <!-- 水晶3D小熊 -->
  <div id="container"></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';// 导入轨道控制器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
/*****************************************基础代码**********************************/
onMounted(() => {
  // 1、创建场景
  const scene = new THREE.Scene()
  // 2、创建相机
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  camera.position.set(1.5,1,1.5)// 相机位置
  camera.aspect = window.innerWidth / window.innerHeight// 设置相机视锥体宽高比
  camera.updateProjectionMatrix()// 更新相机投影矩阵
  scene.add(camera)// 将相机添加到场景中

  // 3、创建初始化渲染器
  const renderer = new THREE.WebGL1Renderer({
    antialias: true// 抗锯齿
  })

  renderer.setSize(window.innerWidth, window.innerHeight)// 设置渲染器大小
  document.getElementById('container')?.appendChild(renderer.domElement)// 将渲染的内容输出到dom元素中
  renderer.render(scene, camera)// 使用渲染器，通过相机将场景渲染
  renderer.outputColorSpace = THREE.SRGBColorSpace;// 渲染输出编码

  // 4、添加轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true  // 设置控制器阻尼

  // 5、监听窗口变化
  window.addEventListener('reset', () => {
    camera.aspect = window.innerWidth / window.innerHeight// 更新相机视锥体宽高比
    camera.updateProjectionMatrix()// 更新相机投影矩阵
    renderer.setSize(window.innerWidth, window.innerHeight) // 更新渲染大小
  })

  // 6、渲染函数
  const render = () => {
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  render()

  /************************************bear展示的相关逻辑*****************************/
  // 7、加载背景纹理
  let textureLoader = new THREE.TextureLoader()// 创建纹理加载器
  const bgTexture = textureLoader.load('/public/textures/bear/bgtexture.jpg')// 加载纹理
  bgTexture.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = bgTexture
  scene.environment = bgTexture

  // 8、加载小熊模型；bear模型是gltf文件，直接使用gltfLoader加载；如果是glb流文件需要使用dracoLoader解压缩,再使用gltfLoader加载
  const gltfLoader = new GLTFLoader()
  gltfLoader.load('/public/model/bear.gltf', (gltf) => {
    console.log('小熊模型：', gltf)
    const model: any = gltf.scene.children[0]
    // 设置小熊的材质，用于具有镜面高光的光泽表面的材质
    model.material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      envMap: bgTexture,// 环境贴图
      refractionRatio: 0.7,// 折射率 
      reflectivity: 0.99// 反射率
    })
    scene.add(model)
  })

  // 9、添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)
})
</script>