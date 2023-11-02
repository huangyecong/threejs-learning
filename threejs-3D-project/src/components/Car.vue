<template>
  <!-- 宝马4s汽车展示与选配应用 -->
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
  <div class="choose">
    <div>车身颜色选择：</div>
    <div class="choose-list">
      <div
        class="item"
        v-for="item in colorList"
        :key="item"
        :style="{ background: item }"
        @click="setCarColor(item)"
      ></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' // 导入轨道控制器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader' // 导入模型加载器
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' // 导入模型解压缩
// 车身
const carBody = ref()
// 车玻璃
const carGlass = ref()

// 颜色列表
const colorList = ['red', 'orange', 'blue']
// 车身的材质
// bodyMaterial 对象并不是响应式对象，但是设置之后会直接生效，应该与浏览器调用帧动画刷新的原因有关
const carBodyMaterial = new THREE.MeshPhysicalMaterial({
  color: 'red', // 颜色
  metalness: 1, // 金属色
  roughness: 0.3, // 粗糙度
  clearcoat: 1, // 薄膜（用于模拟油漆）
  clearcoatRoughness: 0, //薄膜粗糙度
})
// 玻璃材质（该段代码会导致控制台报错，未知原因）
const carGlassMaterial = new THREE.MeshPhysicalMaterial({
  color: '0xffffff',
  metalness: 0.25,
  roughness: 0,
  transmission: 1.0, // 透光率
})

const detailsMaterial = new THREE.MeshPhysicalMaterial({
  color: '0xffffff',
  metalness: 1.0,
  roughness: 0.4,
})

// 设置车身颜色
const setCarColor = (color: string) => {
  carBodyMaterial.color.set(color)
}

onMounted(() => {
  /************************************基础代码*****************************/
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

  // 创建并添加网格地面
  const gridHelper = new THREE.GridHelper(10, 10)
  scene.add(gridHelper)

  /************************************car展示的相关逻辑*****************************/
  /**
   * 1、导入模型解压缩、模型加载器
   * 2、加载添加汽车模型
   * 3、添加平行光
   * 4、设置汽车材质
   * gltf与glb的区别： gltf文件类似与json格式而glb是以二进制流进行存储
   */

  // 初始化loader(需要先导入gltf 模型加载器、draco模型解码器)、注意填写path的正确路径
  const dracoLoader = new DRACOLoader() // 模型解压器
  dracoLoader.setDecoderPath('/public/draco/') // 设置路径，最后面的斜杠一定要加上，不让无法正常加载
  const loaders = new GLTFLoader() // 模型加载器
  loaders.setDRACOLoader(dracoLoader)

  // 加载汽车模型
  loaders.load('/public/model/car.glb', (gltf) => {
    const car = gltf.scene
    car.traverse((child: any) => {
      if (child.isMesh) {
        // 遍历场景里面的所有元素都允许接受和投射阴影
        child.castShadow = true
        child.receiveShadow = true
        // 模型里对物体已经设置好了相应的名字
        console.log(child.name) // 获取模型相应的对象
        // 这里就只演示车身、烟囱，其他略
        if (child.name.includes('body') || child.name.includes('brake')) {
          carBody.value = child
          carBody.value.material = carBodyMaterial
        }
        // 设置玻璃材质(添加该代码，控制会报错)
        // if (child.name.includes('glass')) {
        //   carGlass.value = child
        //   carGlass.value.material = carGlassMaterial
        // }

        //轮缘 、座位材质设置(添加该代码，控制会报错)
        // if (
        //   child.name.includes('rim_fl') ||
        //   child.name.includes('rim_fr') ||
        //   child.name.includes('rim_rr') ||
        //   child.name.includes('rim_rl') ||
        //   child.name.includes('trim')
        // ) {
        //   child.material = detailsMaterial
        // }
      }
    })
    scene.add(car)
  })

  // 添加平行光
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1) // 前
  directionalLight1.position.set(0, 0, 10)

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1) // 后
  directionalLight2.position.set(0, 0, -10)

  const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1) //左
  directionalLight3.position.set(-10, 0, 0)

  const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1) //右
  directionalLight4.position.set(10, 0, 0)

  const directionalLight5 = new THREE.DirectionalLight(0xffffff, 1) // 顶部
  directionalLight5.position.set(0, 10, 0)

  scene.add(
    directionalLight1,
    directionalLight2,
    directionalLight3,
    directionalLight4,
    directionalLight5
  )
})
</script>
<style scoped>
.choose {
  color: black;
  position: absolute;
  top: 20px;
  width: 200px;
  left: calc(100% - 400px);
}

.choose-list {
  margin-top: 10px;
  display: flex;
  justify-content: space-evenly;
}

.item {
  width: 30px;
  height: 30px;
  border-radius: 5px;
}
</style>
