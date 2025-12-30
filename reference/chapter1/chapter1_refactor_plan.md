# 第一章重构计划

## 当前状态分析
- 第一章（TutorialVillage）是新手村，主要是探索式的教学
- 第二章（BattlePlain）是"战斗本体平原/时光档案馆"，有时间线、小游戏、碎片收集
- 用户说的"黑话起源之森"应该是指第二章BattlePlain

## 路由对应
- /tutorial → TutorialVillage (新手村)
- /chapter/2 → BattlePlain (战斗本体平原 - 时光档案馆)
- /chapter/3 → PlayerTown (玩家生态城镇)
- /chapter/4 → DataMetropolis (数据洪流之都)
- /chapter/5 → TranslationTower (译语通天塔)
- /chapter/final → FinalChapter (终章)

## 第二章（BattlePlain）的互动形式
1. IntroSection - 入场介绍，NPC对话
2. TimelineMap - 时间线地图，展示四个时代
3. EraExplorer - 时代探索弹窗，包含小游戏
4. SkillUnlock - 技能解锁界面
5. OutroSection - 结尾章节

## 小游戏类型
1. QTE搓招挑战（街机时代）
2. 卡牌放置（PC网游时代）
3. 抽卡体验（手游时代）
4. 弹幕捕捉（泛娱乐时代）

## 需要确认
用户说的"黑话起源之森"是否就是第二章BattlePlain？还是需要新建一个章节？

根据用户截图，第二章已经有了时间碎片收集系统，应该是指这个章节需要美化。
