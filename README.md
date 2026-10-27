# 绿梦：时空之声 Wiki

原生静态HTML/CSS/JavaScript项目，使用Node.js22+自有构建脚本，不是Vite+React，无需安装依赖。

```sh
npm test
npm run preview:build
npm run preview
```

本地预览：http://127.0.0.1:4173/Lumeng-Wiki/。生产构建使用https://lvmengwiki.top/根路径。发布目标仅该仓库GitHub Pages。

当前收录16名正式服确认角色、31套124件可通过正常UI预览的装备、29种资源/校准材料、7种注射器、5个地图地区与3类刻录档案。角色装扮提供19个对应预览，支持查询参数保存切换状态。卡池开放情况以游戏内公告为准。

## 素材目录

src/assets下按characters/illustrations、characters/portraits、badges、skills、backgrounds、brand、collections、banners、injectors、maps、outfits分类；每个发布文件有明确允许清单和哈希。public没有自动发布约定。用户原始截图请放.audit/references，该目录忽略、不提交、不发布，含标识的原图须先裁切为干净派生资源。不要把配置表或开发资源目录放入资产目录。

所有游戏数据固定已核实成功发布版本；字段通过正常UI绑定证明，只保留显示投影。参见docs/UI-SOURCES.md、docs/PUBLISHING.md。

## 地图、获取途径与详情状态

- 地图以原生沙盘为入口，五个地区热点沿用发布版 UI 空间布局。细节地图提供平移、缩放、子区域名称和四类原生点位筛选。只复制六张合成底图，不复制原始切片或游戏配置。基础显示不代表账号探索完成状态；交互房间可能随游戏进度揭示。
- content/acquisition.json 保存玩家界面显示的获取途径投影，覆盖16角色、124装备部件、29道具、7注射器和19装扮。未能证明可正常获得的自选箱来源不公开。
- content/character-publication.json 区分限定/非限定及已证实装日期。未知日期为 null，不用资源提交时间替代；首页最多3个合格S，最多1个有证更新的A替换位，始终保留最新S。目前只确认莉特莉丝为限定S，不存在日期排序歧义。
- 角色等级默认各项实际最大值、选项倒序。attribute、skill-N、skill、anchor、outfit 查询参数保存显式选择，页签、刷新与返回保留状态。技能环与18个校准节点位置来自固定版本正常 UI。
