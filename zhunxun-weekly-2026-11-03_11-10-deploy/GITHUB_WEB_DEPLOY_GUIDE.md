# GitHub 网页端无损部署操作指南（mxiaohh/zhunxun-weekly）

本压缩包内含已改造完成的极简专业报纸风格双层嵌套周报文件，专门针对 **GitHub 网页端上传（不删除仓库内任何历史文件）** 进行了打包：

## 文件清单
1. `2026-11-03_11-10.html`：精简命名版周报单页文件（推荐上传使用此文件名，URL 简洁美观）。
2. `zhunxun_weekly_2026_11_03_11_10.html`：完整命名版周报单页文件（内容与上面完全一致，备用）。
3. `INDEX_APPEND_SNIPPET.md`：供复制粘贴到仓库 `index.html` 或 `README.md` 的本期新增入口代码片段。

---

## 三步完成 GitHub 网页端无损部署

### 第一步：解压文件包
将下载的 `zhunxun-weekly-2026-11-03_11-10-deploy.zip` 在本地电脑解压，取出里面的 `2026-11-03_11-10.html`。

### 第二步：在 GitHub 网页端上传新周报文件（保留原有文件）
1. 在浏览器打开你的仓库主页：`https://github.com/mxiaohh/zhunxun-weekly`
   *（注：如果之前的历史周报存放在某个子文件夹，比如 `issues/`、`weekly/` 或 `docs/`，请先点击进入该子文件夹；如果都在根目录，则直接停留在根目录）。*
2. 点击文件列表右上角的 **`Add file`** 按钮，在下拉菜单中选择 **`Upload files`**。
3. 将解压出来的 **`2026-11-03_11-10.html`** 拖拽到网页上传区域（由于它是全新的日期文件名，**绝对不会覆盖或删除仓库里之前的任何文件**）。
4. 在页面底部的 **Commit changes** 区域：
   - 第一行输入提交说明：`feat: add 2026.11.03-11.10 minimalist newspaper weekly issue`
   - 保持选中 **`Commit directly to the main branch`**（或 `master` 分支）。
   - 点击绿色的 **`Commit changes`** 按钮。

### 第三步：在仓库主页索引中追加本期链接（不删旧内容）
1. 回到 `mxiaohh/zhunxun-weekly` 仓库根目录，点击打开原有的导航入口文件（通常是 `index.html` 或 `README.md`）。
2. 点击右上角的 **铅笔图标（Edit this file）** 进入网页编辑器。
3. **不要删除原有的任何代码**，打开本包内的 `INDEX_APPEND_SNIPPET.md`，复制对应的链接或卡片代码，粘贴到历史期数列表的最上方。
4. 点击右上角绿色的 **`Commit changes...`** 保存提交。
5. 等待约 1～2 分钟 GitHub Pages 自动构建完成后，即可通过 `https://mxiaohh.github.io/zhunxun-weekly/2026-11-03_11-10.html` 直接访问本期双层报纸周报！
