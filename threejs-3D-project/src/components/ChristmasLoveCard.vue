<template>
  <!-- ChristmasLoveCard.vue 圣诞节爱心3D贺卡 -->
</template>


<script setup lang="ts">
/** 
 * 1、初始化场景、相机、渲染器
 * 2、初始化loader及加载模型 
 * 3、初始化光源
 * 4、渲染
*/
import * as THREE from "three"// 引入three.js
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"// 导入轨道控制器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"// 导入gltf 模型加载器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"// 导入draco  模型解码器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"// 环境纹理加载器
import { Water } from "three/examples/jsm/objects/Water2"// 水波纹加载器
import gsap from "gsap"; // 补间动画

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
  // 很明显能看到边是由像素所构成的，这种现象叫做走样(Aliasing)。
  // 有很多技术能够减少走样，产生更平滑的边缘，这些技术叫做抗锯齿技术(Anti-aliasing，也被称为反走样技术)。
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// 设置色调射影
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.outputColorSpace = THREE.SRGBColorSpace;// 渲染输出编码
renderer.toneMapping = THREE.ACESFilmicToneMapping;// 调整渲染结果的色调映射（tonemapping）。你可以用它来控制图像中的亮度、对比度和色彩。
renderer.toneMappingExposure = 0.5// 整体亮度暗一点
renderer.shadowMap.enabled = true// 允许阴影

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true// 设置带阻尼的惯性

/********************************************************************** s:加载模型 **********************************************/
// 初始化loader(需要先导入gltf 模型加载器、draco模型解码器)、注意填写path的正确路径
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/public/draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// 加载环境纹理
let rgbeLoader = new RGBELoader();
rgbeLoader.load("/public/textures/sky.hdr", (textures: any) => {
  textures.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = textures
  scene.environment = textures
})

// 加载模型
gltfLoader.load("/public/model/scene.glb", (gltf) => {
  const model = gltf.scene
  // 隐藏水面
  model.traverse((child: any) => {
    if (child.name === "Plane") {
      child.visible = false
    }
    // 遍历场景里面的所有元素都允许接受和投射阴影
    if (child.isMesh) {
      console.log('遍历场景里面的所有元素都接受和投射阴影', child.isMesh)
      child.castShadow = true;
      child.receiveShadow = true;
    }
  })
  scene.add(model)
})
// 自定义 创建水面
const waterGeometry = new THREE.CircleGeometry(300, 32)
const water = new Water(waterGeometry, {
  textureWidth: 1024,
  textureHeight: 1024,
  color: 0xeeeeff,
  flowDirection: new THREE.Vector2(1, 1),
  scale: 100
})
water.rotation.x = -Math.PI / 2// 平面默认是垂直的，现在要放水平旋转90°
water.position.y = -0.4// 水面离y轴原点的距离
scene.add(water)

/********************************************************************** s:初始化光源 **********************************************/
// 添加平行光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 50, 0);//光照从上往下
scene.add(light);

// 添加点光源(在室内添加)
const pointLight = new THREE.PointLight(0xffffff, 50);
pointLight.position.set(0.1, 2.4, 0);
pointLight.castShadow = true;// 投射阴影
scene.add(pointLight);

// 创建点光源组
const pointLightGroup = new THREE.Group()
pointLightGroup.position.set(-8, 2.5, -1.5)
let radius = 3
let pointLightArr: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[] = []
for (let i = 0; i < 3; i++) {
  // 创建球体当灯泡
  const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32)
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 10
  })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  pointLightArr.push(sphere)
  sphere.position.set(
    radius * Math.cos((i * 2 * Math.PI) / 3),
    Math.cos((i * 2 * Math.PI) / 3),
    radius * Math.sin((i * 2 * Math.PI) / 3)
  );

  let pointLight = new THREE.PointLight(0xffffff, 50)
  sphere.add(pointLight)

  pointLightGroup.add(sphere)
}
scene.add(pointLightGroup)

// 使用补间动画函数，从0-2π，使灯泡旋转
let options = {
  angle: 0,
};
gsap.to(options, {
  angle: Math.PI * 2,
  duration: 10,
  repeat: -1,
  ease: "linear",
  onUpdate: () => {
    pointLightGroup.rotation.y = options.angle;
    pointLightArr.forEach((item, index) => {
      item.position.set(
        radius * Math.cos((index * 2 * Math.PI) / 3),
        Math.cos((index * 2 * Math.PI) / 3 + options.angle * 5),
        radius * Math.sin((index * 2 * Math.PI) / 3)
      );
    });
  },
});

/********************************************************************** s:渲染 ****************************************************/
// 渲染
function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
  controls.update()
}
render()

</script>

<style scoped>
* {
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
