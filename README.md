# 绿梦：时空之声 Wiki

无依赖的静态资料站，部署目标为本仓库 GitHub Pages。

首页与主导航以角色、图鉴查询和版本资料为中心。实际收录三名正式剧情试用角色的姓名、三种资源货币的名称/类型/说明，以及三篇官网辅助资料。装备、技能、普通道具和卡池尚无条目，入口明确显示收录状态，不提供虚构参数或当前卡池推断。

## 本地运行

Node.js22+，无需 npm install。

```sh
npm test
npm run preview:build
npm run preview
```

打开 http://127.0.0.1:4173/Lumeng-Wiki/ 。服务只监听127.0.0.1。构建生成18个包含正文的真实路径页面，支持直接打开、刷新和浏览器历史；JavaScript增强关键词搜索与站内导航，正文阅读不依赖它。

## 内容与隐私边界

- content/public.json：公开官网资料与来源。
- content/game.json：三条货币记录和三条仅姓名角色记录，无内部编号。
- content/release.json：公开版本范围、字段/条目允许清单及审核内容摘要。
- [公开素材来源](docs/SOURCES.md)、[UI字段来源](docs/UI-SOURCES.md)、[信息架构](docs/INFORMATION-ARCHITECTURE.md)、[发布流程](docs/PUBLISHING.md)。

精确私有提交、构建日志、任务链及内部字段映射只保留在被忽略的.audit中。网页、搜索数据与sitemap使用同一审核投影，不读取原始游戏表。静态产物只复制显式允许的文件；dist和.audit不提交。

生产构建要求verified状态、封闭schema、明确条目允许清单及内容摘要一致。预览产物增加noindex。真实页面具有独立title、description、canonical，sitemap只包含已生成页面；项目目录的robots.txt不能控制github.io根域抓取规则。

## 发布状态

线上第一阶段提交为7f7b1d9。本地信息架构及静态页面修订增加三名角色的姓名，需要单独审核公开范围后再推送。不得将原提交的精确发布批准自动扩展到新数据。
