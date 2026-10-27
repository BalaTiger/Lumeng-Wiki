# UI显示范围

资料固定成功发布客户端版本，精确证据在私有忽略目录。16名角色正式服可获取范围由玩家确认。角色概览、技能描述/参数、校准、密录、服饰采用正常详情UI绑定；基础数值带等级和加成条件。诗凛缺少一个实际面板绑定的技能组暂不收录。

装备范围由正常背包套装筛选及套装详情预览确定，共31套124部件；预览不代表制造配方解锁。效果名严格沿用UI的技能消息优先规则，不用配置备注。仅显示固定主属性与UI可查看效果等级，不导出随机权重。道具为已核实资源货币和校准材料，共29条，非全道具表。

原生图片通过固定版本图片映射逐项核对；A级主视觉背景为用户提供的干净裁切实机场景，S级背景为依据固定版本灯光与发光差异AI编辑的Wiki素材，并非实机截图。原图和账号标识不会公开。普通UI显示的概率文案正常保留，隐藏概率不公开。


## 刻录、注射器、地图与装扮

仍使用同一固定发布提交与数据库版本，新增显示投影位于content/extra.json，构建以审核后摘要锁定；原始配置、ID、GUID和截图保存在忽略目录。

- 刻录：正常详情入口PopupCardDrawRecordView读取gachaDisplays.CheckDes；InventoryItem读取gachaPoolNotices的基础/综合概率。只收御能者招募、新手刻录、千幻万变，按UI显示百分比原样保留三位小数；不把客户端起止时间视为线上开放证据。
- 注射器：BloodBottleModel正常场景条目、BloodBottleDetail名称/使用次数/等级/图标；BloodBottleBuffHandler按强化等级渲染恢复效果，BloodIBottleLevelUp显示消耗。排除场景专用且无正常道具的记录，不输出恢复公式或技能内部参数。
- 地图：LargeMapView 的 WorldMapRoot/五个 AreaCell 作为地区入口；30张原生沙盘切片合成一张背景，热点按 EnterAreaMapBtn 根变换定位。AreaGrid 的 Bg/Room/Detail 合成五张地区底图，基础显示烘焙24个状态控制房间遮罩；正常探索可能解除这些遮罩，不将其认定为永久隐藏内容。公开20个子区域名称及UI位置，不导出原始切片、世界对象坐标或账号探索数据。
- 装扮：SubSkinView正常名字、说明和预览切换；原生CharacterSkin二维图由SkinItem/PopupCharacterSkinAcquireView同一皮肤标识绑定。默认装扮复用该角色已审核立绘，三套替换装扮使用对应原生图，不以其他角色代替。

角色结果背景集中在src/hero-backgrounds.js按S/A映射。A级使用已裁去标识的用户空场景；S级使用依据固定release的LightRoot_SSR与SR灯光/发光差异进行AI编辑的Wiki背景，并非S级实机截图；未把生成图当作游戏原生资源。

## 限定、获取途径与紧凑角色布局

- PopupCardDrawRecordView.CheckDes 正常规则文案明确永久池非限定、限定S不进入常驻；InventoryItem 绑定 gachaPoolNotices 的可见名单。UP 标记独立，不等同限定。正式实装日期缺证时不填造日期。
- CommonItemDetail.SetupObtainWaySources 的 JumpType/ItemJumpHelper 过滤决定来源显示；正常制造、活动、兑换、服饰商店与注射器解锁说明另按各自 UI 绑定。仅输出名称、条件、显示消耗和有效站内链接。尚未闭合的四类自选箱获取链不加入公开来源。
- SkilliconGroup 原生节点位置用于技能环；ElitistV3 的 ElitePointGroupV2.pointsList 与 EliteModel.GetPointData 对应3/6/9阶段、18个显示节点，保留同锚点分段关系。网页不模拟账号培养状态或提交操作。
- 默认等级取每组已审定等级的最大值，13级等额外上限仍显示对应密录条件，固定1级节点不扩展。装扮选择仅替换详情hero，预览失败回退默认立绘。
