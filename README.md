# 绿梦：时空之声 Wiki

无第三方运行依赖的静态资料站，部署目标为本仓库 GitHub Pages。

首版收录三篇官网公开资料，以及已核验客户端中信用点、涌钻、涌晶原髓的界面可见名称、类型与说明。角色、装备、技能和其他物品尚未完成逐条可达性审核，不作整表收录。

## 本地运行

Node.js 22+，无需 npm install：

```sh
npm test
npm run preview:build
npm run preview
```

打开 http://127.0.0.1:4173/Lumeng-Wiki/ 。服务只监听本机。相对资源路径和 hash 路由兼容 GitHub Pages 项目子目录。

## 内容与边界

- `content/public.json`：官网公开资料与来源。
- `content/game.json`：仅包含已审核且去除内部编号的三个物品记录。
- `content/release.json`：公开收录说明、字段与条目允许清单、已审核内容摘要。
- [公开素材来源](docs/SOURCES.md)、[UI 字段来源](docs/UI-SOURCES.md)、[发布流程](docs/PUBLISHING.md)。

精确私有提交、构建日志与内部字段映射保留在忽略的 .audit 中，不进入公开 Git 历史。构建不读取游戏工作区；页面与站内搜索共用同一份审核后的数据，不发布完整表、开发资源、source map 或账号信息。

`npm run build` 仅接受 verified 状态和已审核数据摘要。pending 状态禁止生产发布。`--preview` 输出含 noindex 与禁止索引的 robots，仅供本地审阅。`dist` 与 `.audit` 均不提交。
