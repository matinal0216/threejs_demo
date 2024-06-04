import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

// 通过Vite的import.meta.glob()方法实现自动化导入路由
const viewRouterModules = import.meta.glob("../views/**/*.vue");

// 路由
const rootRoutes = Object.keys(viewRouterModules).map((filePath) => {
  const path = filePath.match(/\.\.\/views\/(.*)\.vue$/)[1];
  // 匹配外层文件夹的名称
  const folderName = path.match(/^([^\/]+)(?:\/|$)/)[1];
  // 名称映射表
  const titles = {
    ows: "三麟中泰（厦门）实业有限公司",
  };
  const fileNameList = path.split("/").map((i, index) => {
    if (index === 0) return i;
    else return i.charAt(0).toUpperCase() + i.slice(1);
  });
  const name = fileNameList.join(""); // 路由name为文件路径去掉‘/’后以小驼峰的方式命名
  if (path === "index") {
    return {
      path: `/`,
      name,
      component: viewRouterModules[filePath],
      meta: { title: titles[folderName] },
    };
  }
  return {
    path: `/${path}`,
    name,
    component: viewRouterModules[filePath],
    meta: { title: titles[folderName] },
  };
});
console.log(rootRoutes);

const routes: Array<RouteRecordRaw> = rootRoutes;
const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  // 修改浏览器标题
  const _title = to.meta?.title ? to.meta.title : "sanlin";
  if (_title) {
    document.title = _title as string;
  }
  next();
});
export default router;
