# 首页索引追加片段（保留原有历史期数，仅追加本期入口）

## 方案 A：如果 `mxiaohh/zhunxun-weekly` 使用 `README.md` 作为目录索引
请将以下内容复制并粘贴到仓库 `README.md` 的周报列表最上方（不要删除下方原有的历史链接）：

```markdown
- **[2026.11.03 — 2026.11.10（总第45期 · 极简报纸版）](./2026-11-03_11-10.html)**：Anthropic 发布 Claude Fable 5.2 / Mythos 5.2 并降价 20% 冲刺万亿 IPO、OpenAI 发布 GPT-6 Cyber 登陆 AWS Marketplace、Anthropic 斥资 34 亿美元直采 1.7GW 燃气机组、NVIDIA 携韩国扩建主权 AI、Google TPU 8tx/8i Max、双11 囤词元与 Kimi 港交所递表、特斯拉停产 Cybertruck 让位 Cybercab 与宇树科技重返 3224 亿市值等 12 篇深度调查。
```

## 方案 B：如果 `mxiaohh/zhunxun-weekly` 使用 `index.html` 作为导航主页
请打开仓库中的 `index.html`，在期数列表容器（如 `<ul>` 或 `<div class="grid">`）的最上方插入以下卡片代码（保留下方原有卡片）：

```html
<!-- 2026.11.03 - 11.10 第45期入口卡片 -->
<a href="./2026-11-03_11-10.html" style="display:block; padding:16px 20px; margin-bottom:12px; border:1px solid #d6d1c7; border-radius:6px; background:#fbf9f5; color:#141413; text-decoration:none; font-family:'Noto Serif SC', Georgia, serif;">
  <div style="font-size:12px; color:#991b1b; font-weight:600; margin-bottom:4px;">
    EDITION 2026 · W45 · 2026年11月3日 — 11月10日
  </div>
  <div style="font-size:18px; font-weight:700; margin-bottom:6px;">
    准讯周报 · AI 与全球科技双层精读报刊（第45期）
  </div>
  <div style="font-size:13px; color:#57534e; line-height:1.5; font-family:Inter, -apple-system, sans-serif;">
    头版聚焦：Anthropic Fable 5.2 降价 20% 冲刺万亿 IPO · OpenAI GPT-6 Cyber 上架 AWS · 1.7GW 燃气发电直采 · 特斯拉停产 Cybertruck 让位 Cybercab · 宇树重返 3224 亿市值
  </div>
</a>
```
