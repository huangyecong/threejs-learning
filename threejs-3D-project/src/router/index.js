import {createRouter, createWebHashHistory, createWebHistory} from "vue-router"

// 1. 定义路由组件， 注意，这里一定要使用 文件的全名（包含文件后缀名）
import Home from "../home.vue";
import Car from "../components/Car.vue";
import ChristmasLoveCard from "../components/ChristmasLoveCard.vue";

// 2. 定义路由配置redirect: '/Home'
const routes = [
  { path: "/",name:"Home", component: Home },
  { path: "/ChristmasLoveCard",name:"ChristmasLoveCard", component: ChristmasLoveCard },
  { path: "/Car",name:"Car", component: Car },
];

// 3. 创建路由实例
const router = createRouter({
  // 4. 采用hash 模式
  history: createWebHashHistory(),	
  // 采用 history 模式
  // history: createWebHistory(),
  routes, // short for `routes: routes`
});

export default router
