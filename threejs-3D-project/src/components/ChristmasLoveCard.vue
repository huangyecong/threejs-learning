<template>
  <!-- ChristmasLoveCard.vue 圣诞节爱心3D贺卡 -->
  <div class="scenes" :style="{
    transform: `translate3d(0, ${-scenesIndex * 100}vh, 0)`,
  }">
    <div v-for="(item, index) in scenes" :key="index" class="scenes-container">
      <h1 class="title">{{ item.text }}</h1>
    </div>
  </div>
</template>


<script setup lang="ts">
/** 
 * 1、初始化场景、相机、渲染器
 * 2、初始化loader及加载模型 
 * 3、初始化光源
 * 4、渲染
*/
import * as THREE from "three"// 引入three.js
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";// 导入轨道控制器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";// 导入gltf 模型加载器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";// 导入draco  模型解码器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";// 环境纹理加载器
import { Water } from "three/examples/jsm/objects/Water2";// 水波纹加载器
import gsap from "gsap"; // 补间动画
import { ref } from "vue";

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
  // 隐藏水面、traverse是threejs中用来递归遍历的方法
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

/******************************************创建3个点光源 ********************/
// 创建点光源组
const pointLightGroup = new THREE.Group()
pointLightGroup.position.set(-8, 2.5, -1.5)// 点光源组的位置
let radius = 3
let pointLightArr: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[] = []
//  创建3个点光源
for (let i = 0; i < 3; i++) {
  // 创建球体当灯泡
  const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32)
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 10// 强度
  })// 使用可以反光的材质
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  pointLightArr.push(sphere)
  sphere.position.set(
    radius * Math.cos((i * 2 * Math.PI) / 3),// x轴 位于半径为3的圆，的每三分之一处
    Math.cos((i * 2 * Math.PI) / 3),// y轴
    radius * Math.sin((i * 2 * Math.PI) / 3)// z轴
  );

  let pointLight = new THREE.PointLight(0xffffff, 50)// 点光源亮度为50
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
  duration: 10,// 运动周期，10s转一圈
  repeat: -1,//重复次数， -1表示无限循环
  ease: "linear",// 运动类型，linear线性运动
  onUpdate: () => {
    // 上下浮动
    pointLightGroup.rotation.y = options.angle;//根据角度进行旋转
    pointLightArr.forEach((item, index) => {
      item.position.set(
        radius * Math.cos((index * 2 * Math.PI) / 3),
        Math.cos((index * 2 * Math.PI) / 3 + options.angle * 5),
        radius * Math.sin((index * 2 * Math.PI) / 3)
      );
    });
  },
});
/******************************************创建文字场景 ********************/
// 使用补间动画移动相机
let timeLine1 = gsap.timeline();
let timeLine2 = gsap.timeline();
// 定义相机移动函数
const translateCamera = (position: { x: number; y: number; z: number; }, target: { x: number; y: number; z: number; }) => {
  // position 原来的位置，target 目标位置
  timeLine1.to(camera.position, {
    x: position.x,
    y: position.y,
    z: position.z,
    duration: 1,
    ease: "power2.inOut"
  });

  timeLine2.to(controls.target, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration: 1,
    ease: "power2.inOut"
  })
}
// 创建5个文字场景
let scenes = [
  {
    text: "test-1",
    callback: () => {
      // 执行函数切换位置
      // 这些坐标都是建模的时候算好的
      translateCamera(
        new THREE.Vector3(-3.23, 3, 4.06),
        new THREE.Vector3(-8, 2, 0)
      );
    }
  },
  {
    text: "test-2",
    callback: () => {
      translateCamera(new THREE.Vector3(7, 0, 23), new THREE.Vector3(0, 0, 0));
    }
  },
  {
    text: "test-3",
    callback: () => {
      translateCamera(new THREE.Vector3(10, 3, 0), new THREE.Vector3(5, 2, 0));
    }
  },
  {
    text: "test-4",
    callback: () => {
      translateCamera(new THREE.Vector3(7, 0, 23), new THREE.Vector3(0, 0, 0));
    }
  },
  {
    text: "test-5",
    callback: () => {
      translateCamera(
        new THREE.Vector3(-20, 1.3, 6.6),
        new THREE.Vector3(5, 2, 0)
      );
    }
  }
]

let scenesIndex = ref<number>(0)// 记录当前的场景索引值
let isAnimate = false
// 监听鼠标滚轮事件
window.addEventListener(
  "wheel",
  (e) => {
    if (isAnimate) return;
    isAnimate = true;
    if (e.deltaY > 0) {
      scenesIndex.value++;
      if (scenesIndex.value > scenes.length - 1) {
        scenesIndex.value = 0
      }
    }
    scenes[scenesIndex.value].callback();
    setTimeout(() => {
      isAnimate = false
    }, 1000);
  }, false
)

// 实例化创建漫天星星
/*InstancedMesh一种具有实例化渲染支持的特殊版本的Mesh。你可以使用 InstancedMesh 来渲染大量具有相同几何体与材质、但具有不同世界变换的物体。 使用 InstancedMesh 将帮助你减少 draw call 的数量，从而提升你应用程序的整体渲染性能。
* InstancedMesh( geometry : BufferGeometry, material : Material, count : Integer )
* geometry - 一个 BufferGeometry 的实例
* material - 一个 Material 的实例。默认为一个新的 MeshBasicMaterial 
* count - 实例的数量
*/
let starsInstance = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.1, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,// 材质的颜色(Color)，默认值为白色 (0xffffff)。
    emissive: 0xffffff,// 材质的放射（光）颜色，基本上是不受其他光照影响的固有颜色。默认为黑色。
    emissiveIntensity: 10,//放射光强度。调节发光颜色。默认为1。
  }),
  100
)
// 随机分布到天上
// 创建爱心路径
// 根据爱心路径，获取点
// 创建爱心动画


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

.scenes {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  pointer-events: none;
  transition: all 1s;
}

.scenes-container {
  width: 100vw;
  height: 100vh
}

.title {
  padding: 100px 50px;
  font-size: 50px;
  color: #fff
}
</style>
