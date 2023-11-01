<template>
  <!-- car产品展示项目与原理 -->

  <div id="container">
    <!-- 
  物理网格材质、动画库gasp
  1、创建场景、相机、渲染器
  2、设置网格地面GridHelper、透明度opcity
  3、导入添加控制器OrbitContrils, 360°旋转
  
  4、导入gltf模型  gltf loader模型解压缩
  5、添加多个灯光（物理材质需要光，车灯设置自发光）DirectionalLight

  6、
  7、
  8、
学习参考：https://blog.csdn.net/weixin_41897680/article/details/127834786
 -->
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' // 导入轨道控制器

onMounted(() => {
  // 创建场景
  const scene = new THREE.Scene()
  // 创建相机
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  // 设置相机位置
  camera.position.set(2, 2, 3)
  // 将相机添加到场景中
  scene.add(camera)

  // 创建渲染器
  const renderer = new THREE.WebGL1Renderer({
    antialias: true, //设置抗锯齿
  })
  //设置渲染器大小
  renderer.setSize(window.innerWidth, window.innerHeight)
  // 设置渲染背景
  renderer.setClearColor('#000') // 清除原来的黑色
  scene.background = new THREE.Color('#ccc')

  // 将渲染内容添加到dom中
  document.getElementById('container')?.appendChild(renderer.domElement)

  // 使用渲染器，通过相机将场景渲染
  renderer.render(scene, camera)

  // 添加轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement)
  // 设置控制器阻尼
  controls.enableDamping = true

  // 监听窗口变化
  window.addEventListener('reset', () => {
    // 更新相机锥体宽高比
    camera.aspect = window.innerWidth / window.innerWidth
    // 更新相机矩阵
    camera.updateProjectionMatrix()
    // 更新渲染大小
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  // 渲染函数
  const render = () => {
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  render()

  /************************************car展示的相关逻辑*****************************/
  
})
</script>
