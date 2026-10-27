# 审核与 GitHub Pages 发布

## 当前内容范围

客户端基线已与成功生产出包记录核对，固定到 2026-10-13 的客户端及其对应数据库版本。后续生产资源补丁不混入。私有精确证据保存在忽略目录 .audit；公开资料只说明收录范围与玩家查看路径。

本次允许字段为资源物品的名称、类型、说明，仅限信用点、涌钻、涌晶原髓。其他角色、装备、技能或道具不因出现在表中就自动收录。

## 更新与放行

1. 核对实际成功客户端包、精确提交、对应资源和数据库版本。不能把开发包或仅有标签的提交当作发布证明。
2. 逐字段记录固定提交中的 UI 绑定、release 隐藏开关、入口和玩家可达性；证据保留在 .audit。
3. 仅将允许字段映射为新的公开记录，不复制原始表。公开 schema、人工审核条目清单和内容摘要同时锁定本次记录，新增条目须重新审核，不可仅修改摘要放行。
4. 审计全部将进入 Git 历史的源文件及静态产物。隐藏数据、完整配置和开发资源不能存在于公开仓库，即便不被前端引用。
5. npm test；npm run build。独立核对 dist 文件清单、图片摘要、data.js 搜索数据、公开文本及资源路径。
6. 检查桌面/移动布局、键盘导航、搜索/筛选、空结果、详情、历史回退与 404。

## GitHub Pages

仓库 Settings → Pages → Build and deployment 选择 GitHub Actions。工作流仅上传 dist，通过 Pages artifact 发布，不使用其他托管。deploy job 使用短期 GITHUB_TOKEN/OIDC，权限为 pages:write 与 id-token:write，不新增长期凭据。

预期默认地址：https://balatiger.github.io/Lumeng-Wiki/ 。应以实际 Pages 设置和部署输出为准。发布后须核对远端 main 精确提交、Actions 成功状态和 HTTPS 页面/资源可达性，再记录真实发布结果。

GitHub 官方文档说明 github.io 自动提供 HTTPS；正确配置自定义域名时，Pages 会自动向 Let's Encrypt 申请并安装证书。开启 Enforce HTTPS，资源均使用 HTTPS，无需 Certbot、续期 cron 或复制其他项目私钥。

来源：https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https （2026-10-27 核对）。域名由用户另行确认，当前不设置 CNAME 或未购买域名。
