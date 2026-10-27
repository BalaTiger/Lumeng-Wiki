# UI显示范围

资料固定成功发布客户端版本，精确证据在私有忽略目录。16名角色正式服可获取范围由玩家确认。角色概览、技能描述/参数、校准、密录、服饰采用正常详情UI绑定；基础数值带等级和加成条件。诗凛缺少一个实际面板绑定的技能组暂不收录。

装备范围由正常背包套装筛选及套装详情预览确定，共31套124部件；预览不代表制造配方解锁。效果名严格沿用UI的技能消息优先规则，不用配置备注。仅显示固定主属性与UI可查看效果等级，不导出随机权重。道具为已核实资源货币和校准材料，共29条，非全道具表。

原生图片通过固定版本图片映射逐项核对；A级主视觉背景为用户提供的干净裁切实机场景，S级背景为依据固定版本灯光与发光差异AI编辑的Wiki素材，并非实机截图。原图和账号标识不会公开。普通UI显示的概率文案正常保留，隐藏概率不公开。


## 刻录、注射器、地图与装扮

仍使用同一固定发布提交与数据库版本，新增显示投影位于content/extra.json，构建以审核后摘要锁定；原始配置、ID、GUID和截图保存在忽略目录。

- 刻录：正常详情入口PopupCardDrawRecordView读取gachaDisplays.CheckDes；InventoryItem读取gachaPoolNotices的基础/综合概率。只收御能者招募、新手刻录、千幻万变，按UI显示百分比原样保留三位小数；不把客户端起止时间视为线上开放证据。
- 注射器：BloodBottleModel正常场景条目、BloodBottleDetail名称/使用次数/等级/图标；BloodBottleBuffHandler按强化等级渲染恢复效果，BloodIBottleLevelUp显示消耗。排除场景专用且无正常道具的记录，不输出恢复公式或技能内部参数。
- 地图：LargeMapView实际五个地区入口及AreaCell/WorldAreaSideInfo绑定地区名和原生预览图；仅列子区域名称与正常探索条件，不输出坐标、点位、迷雾或开发地区。
- 装扮：SubSkinView正常名字、说明和预览切换；原生CharacterSkin二维图由SkinItem/PopupCharacterSkinAcquireView同一皮肤标识绑定。默认装扮复用该角色已审核立绘，三套替换装扮使用对应原生图，不以其他角色代替。

角色结果背景集中在src/hero-backgrounds.js按S/A映射。A级使用已裁去标识的用户空场景；S级使用依据固定release的LightRoot_SSR与SR灯光/发光差异进行AI编辑的Wiki背景，并非S级实机截图；未把生成图当作游戏原生资源。
