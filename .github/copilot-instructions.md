# Copilot Instructions for Roguelike Dota2 Custom Game Project

## 项目架构与主要目录
- **后端 TypeScript 游戏逻辑**：`game/scripts/src/`，编译为 Lua 运行于 Dota2。
- **前端 React UI**：`content/panorama/src/`，使用 webpack 打包。
- **配置与数据**：`excels/`（Excel 转 KV/JSON）、`game/scripts/npc/`（KV 文件）、`shared/`（类型声明与共享数据结构）。
- **脚本工具**：`scripts/`，包含构建、加密、发布等自动化脚本。

## 关键开发流程
- **依赖安装**：使用 `yarn install`（推荐，已替代 npm）。
- **开发模式**：`yarn dev` 持续编译后端 TS、前端 UI、同步 KV/本地化/Excel。
- **启动游戏**：`yarn launch [map_name]` 启动 Dota2 并载入地图。
- **发布/加密**：`yarn prod` 或 `yarn test`，自动生成加密发布包，配置见 `scripts/addon.config.js`。

## 项目约定与模式
- **玩家数据结构**：后端 `GameMode.players` 以 PlayerID 为 key，管理背包、技能、状态等。
- **事件通信**：前后端通过 `CustomGameEventManager` 发送/监听事件（如 `test`, `master`, `Button`）。
- **技能与物品**：英雄初始化时动态添加技能，背包系统通过 `Bag` 类实现。
- **Excel 数据流**：Excel 转 KV/JSON，前后端均可直接读取。
- **类型声明**：`shared/` 目录下维护自定义类型，便于 TS/Lua 混合开发。

## 重要文件/目录说明
- `game/scripts/src/modules/GameConfig.ts`：游戏初始化、事件注册、玩家数据结构核心实现。
- `scripts/addon.config.js`：构建/加密/发布配置。
- `excels/`：策划用 Excel，自动转 KV/JSON。
- `shared/`：前后端共享类型声明。

## 其他注意事项
- **Lua/TS 混合**：如需混用，Lua 代码放入 `src/` 并补充 d.ts 类型声明。
- **前端 XML/React 混合**：如需传统 XML，需调整 webpack 配置，详见 README。
- **发布加密**：不要加密客户端需用到的技能/Modifier 脚本。
- **.gitignore**：默认不追踪部分自动生成目录（如 `content/panorama/layout/`、`game/scripts/vscripts/`）。

## 参考
- 详细开发说明见 `README.md`。
- 视频教程：https://www.bilibili.com/video/BV1de4y1s7kw/

---
如需补充项目约定或遇到不明确的开发流程，请在此文件补充说明。