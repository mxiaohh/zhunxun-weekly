/*!
 * 准讯周报 · 全站刊期切换器  site-nav.js  v1.0
 * ------------------------------------------------------------------
 * 放置位置：仓库根目录（与 index.html 同级）
 * 引入方式：在每个页面的 </body> 前加一行
 *             期次页：<script src="../site-nav.js"></script>
 *             首  页：<script src="./site-nav.js"></script>
 *
 * 维护方式：以后每新增一期，只需在下方 ISSUES 数组最前面加一行，
 *           所有页面（含老刊期）的切换入口会自动更新，无需再改 HTML。
 *
 * 设计要点：
 *   - 站点根地址由「本脚本自身的 URL」推导，自动兼容 GitHub Pages 子路径、
 *     自定义域名、本地静态服务器与 file:// 打开。
 *   - 悬浮面板挂在 <body> 下、position:fixed，SPA 内部用 hash 切换文章时
 *     不会重载页面，因此任意文章页 / 栏目页都能随时切换刊期。
 *   - 只做整页跳转，不碰 location.hash，不干扰原有 SPA 路由。
 *   - 所有样式带 #zxsw- 前缀且显式声明，避免被 Tailwind preflight 或
 *     页面自带 CSS 覆盖。
 */
(function () {
  'use strict';

  /* ==================================================================
   * 1. 刊期清单 —— 唯一需要维护的地方（按时间倒序，最新一期放最前）
   * ================================================================== */
  var ISSUES = [
    { dir: '2026-11-10', title: '2026.11.03 — 11.10', sub: '总第 45 期 · 报纸版' },
    { dir: '2026-10-31', title: '2026 年 10 月 31 日刊', sub: '10 月下旬刊 · 科技蓝版' }
  ];

  /* ==================================================================
   * 2. 路径推导
   * ================================================================== */
  var scriptEl = document.currentScript;
  var SITE_ROOT = (function () {
    try {
      if (scriptEl && scriptEl.src) return new URL('.', scriptEl.src).href;
    } catch (e) { /* 落到兜底 */ }
    var m = location.pathname.match(/^(.*\/)(?:20\d{2}-\d{2}-\d{2}\/)?[^/]*$/);
    return location.origin + (m ? m[1] : '/');
  })();

  var isFile = location.protocol === 'file:';

  function homeUrl() {
    return SITE_ROOT + (isFile ? 'index.html' : '');
  }

  function issueUrl(dir) {
    return SITE_ROOT + dir + '/' + (isFile ? 'index.html' : '');
  }

  function currentIssue() {
    var m = location.pathname.match(/(?:^|\/)(20\d{2}-\d{2}-\d{2})(?:\/|$)/);
    return m ? m[1] : null;
  }

  var CURRENT = currentIssue();

  // 暴露给首页 / 其它脚本复用
  window.ZXSW = {
    issues: ISSUES,
    root: SITE_ROOT,
    current: CURRENT,
    homeUrl: homeUrl,
    issueUrl: issueUrl
  };

  // 首页本身就是刊期目录，不再叠加悬浮按钮
  if (document.body && document.body.getAttribute('data-zxsw-page') === 'index') return;

  // 清单没跟上新刊期时给出可见提醒（不影响使用）
  if (CURRENT && !ISSUES.some(function (it) { return it.dir === CURRENT; })) {
    console.warn('[准讯周报] 当前刊期 ' + CURRENT + ' 尚未登记在 site-nav.js 的 ISSUES 中，请补一行。');
  }

  /* ==================================================================
   * 3. 样式
   * ================================================================== */
  var CSS = [
    '#zxsw-root,#zxsw-root *{box-sizing:border-box;margin:0;padding:0;}',
    '#zxsw-root{position:fixed;right:18px;bottom:18px;z-index:2147483000;',
    '  font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;',
    '  font-size:13px;line-height:1.5;color:#F0F9FF;text-align:left;}',
    '#zxsw-root button{font-family:inherit;cursor:pointer;}',
    '#zxsw-root a{text-decoration:none;color:inherit;}',
    '#zxsw-toggle{display:flex;align-items:center;gap:9px;padding:10px 15px;',
    '  border:1px solid rgba(125,211,252,.45);border-radius:999px;',
    '  background:rgba(7,25,54,.94);color:#F0F9FF;font-size:13px;font-weight:700;',
    '  letter-spacing:.02em;box-shadow:0 8px 26px rgba(3,20,45,.34);',
    '  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
    '  transition:transform .16s ease,box-shadow .16s ease;}',
    '#zxsw-toggle:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(3,20,45,.45);}',
    '#zxsw-toggle .zxsw-dot{width:8px;height:8px;border-radius:50%;background:#38BDF8;',
    '  box-shadow:0 0 0 3px rgba(56,189,248,.18);flex:none;}',
    '#zxsw-toggle .zxsw-cur{font-size:11px;font-weight:500;color:#7DD3FC;',
    '  padding-left:8px;border-left:1px solid rgba(125,211,252,.3);white-space:nowrap;}',
    '#zxsw-panel{position:absolute;right:0;bottom:calc(100% + 10px);width:310px;',
    '  max-width:calc(100vw - 36px);background:rgba(7,25,54,.985);',
    '  border:1px solid rgba(125,211,252,.28);border-radius:14px;',
    '  box-shadow:0 18px 50px rgba(2,12,30,.55);overflow:hidden;',
    '  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);',
    '  transform-origin:bottom right;transition:opacity .15s ease,transform .15s ease;}',
    '#zxsw-panel[hidden]{display:none;}',
    '#zxsw-panel.zxsw-open{animation:zxswIn .15s ease-out;}',
    '@keyframes zxswIn{from{opacity:0;transform:translateY(8px) scale(.97);}to{opacity:1;transform:none;}}',
    '#zxsw-head{display:flex;align-items:center;justify-content:space-between;',
    '  padding:13px 15px 11px;border-bottom:1px solid rgba(125,211,252,.18);}',
    '#zxsw-head strong{font-size:13px;font-weight:800;letter-spacing:.04em;}',
    '#zxsw-head small{display:block;font-size:10.5px;font-weight:400;color:#7DD3FC;',
    '  letter-spacing:.08em;margin-top:2px;}',
    '#zxsw-close{border:0;background:transparent;color:#7DD3FC;font-size:18px;',
    '  line-height:1;padding:2px 5px;border-radius:6px;}',
    '#zxsw-close:hover{background:rgba(125,211,252,.14);}',
    '#zxsw-list{padding:8px;max-height:min(52vh,380px);overflow-y:auto;}',
    '#zxsw-list .zxsw-item{display:block;padding:10px 11px;margin-bottom:6px;',
    '  border:1px solid rgba(125,211,252,.14);border-radius:9px;',
    '  background:rgba(255,255,255,.035);transition:background .14s,border-color .14s;}',
    '#zxsw-list .zxsw-item:last-child{margin-bottom:0;}',
    '#zxsw-list .zxsw-item:hover{background:rgba(56,189,248,.13);border-color:rgba(125,211,252,.5);}',
    '#zxsw-list .zxsw-item.is-current{background:rgba(2,132,199,.2);',
    '  border-color:rgba(56,189,248,.55);cursor:default;}',
    '#zxsw-list .zxsw-top{display:flex;align-items:center;justify-content:space-between;gap:8px;}',
    '#zxsw-list .zxsw-title{font-size:13px;font-weight:700;color:#F0F9FF;}',
    '#zxsw-list .zxsw-badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;',
    '  background:rgba(56,189,248,.2);color:#7DD3FC;white-space:nowrap;flex:none;}',
    '#zxsw-list .zxsw-badge.is-new{background:#0284C7;color:#fff;}',
    '#zxsw-list .zxsw-badge.is-cur{background:rgba(56,189,248,.16);color:#BAE6FD;}',
    '#zxsw-list .zxsw-sub{display:block;font-size:11px;color:#93B4D4;margin-top:4px;}',
    '#zxsw-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;',
    '  padding:10px 15px;border-top:1px solid rgba(125,211,252,.18);',
    '  font-size:11px;color:#7DA8CC;}',
    '#zxsw-foot a{color:#7DD3FC;font-weight:600;}',
    '#zxsw-foot a:hover{text-decoration:underline;}',
    '@media (max-width:600px){',
    '  #zxsw-root{right:12px;bottom:12px;}',
    '  #zxsw-toggle{padding:9px 13px;font-size:12px;}',
    '  #zxsw-toggle .zxsw-cur{display:none;}',
    '  #zxsw-panel{width:min(310px,calc(100vw - 24px));}',
    '}'
  ].join('\n');

  /* ==================================================================
   * 4. 悬浮切换面板
   * ================================================================== */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildUI() {
    if (document.getElementById('zxsw-root')) return;

    var style = document.createElement('style');
    style.id = 'zxsw-style';
    style.textContent = CSS;
    document.head.appendChild(style);

    var root = document.createElement('div');
    root.id = 'zxsw-root';

    var curLabel = '';
    ISSUES.some(function (it) {
      if (it.dir === CURRENT) { curLabel = it.title; return true; }
      return false;
    });
    if (!curLabel && CURRENT) curLabel = CURRENT;

    var items = ISSUES.map(function (it, i) {
      var isCur = it.dir === CURRENT;
      var isNew = i === 0;
      var badge = isCur
        ? '<span class="zxsw-badge is-cur">正在阅读</span>'
        : (isNew ? '<span class="zxsw-badge is-new">最新一期</span>' : '');
      return '<a class="zxsw-item' + (isCur ? ' is-current' : '') + '"' +
        ' href="' + esc(issueUrl(it.dir)) + '"' +
        ' data-zxsw-issue="' + esc(it.dir) + '"' +
        (isCur ? ' aria-current="page"' : '') + '>' +
        '<span class="zxsw-top"><span class="zxsw-title">' + esc(it.title) + '</span>' + badge + '</span>' +
        '<span class="zxsw-sub">' + esc(it.sub || '') + ' · Alt+' + (i + 1) + '</span>' +
        '</a>';
    }).join('');

    root.innerHTML =
      '<div id="zxsw-panel" hidden>' +
        '<div id="zxsw-head">' +
          '<div><strong>准讯周报 · 切换刊期</strong><small>ALL ISSUES</small></div>' +
          '<button id="zxsw-close" type="button" aria-label="关闭">×</button>' +
        '</div>' +
        '<div id="zxsw-list">' + items + '</div>' +
        '<div id="zxsw-foot">' +
          '<a href="' + esc(homeUrl()) + '">全部刊期目录 →</a>' +
          '<span>共 ' + ISSUES.length + ' 期 · Alt+数字直达</span>' +
        '</div>' +
      '</div>' +
      '<button id="zxsw-toggle" type="button" aria-expanded="false" aria-controls="zxsw-panel"' +
        ' title="切换周报刊期（Alt+1~9）">' +
        '<span class="zxsw-dot"></span><span>切换刊期</span>' +
        (curLabel ? '<span class="zxsw-cur">' + esc(curLabel) + '</span>' : '') +
      '</button>';

    document.body.appendChild(root);

    var btn = document.getElementById('zxsw-toggle');
    var panel = document.getElementById('zxsw-panel');

    function setOpen(open) {
      panel.hidden = !open;
      panel.classList.toggle('zxsw-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(panel.hidden);
    });
    document.getElementById('zxsw-close').addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(false);
    });
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', function () {
      if (!panel.hidden) setOpen(false);
    });

    // 面板打开时吞掉 Esc，避免同时触发原页面的「返回头版」
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) {
        setOpen(false);
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      // Alt + 1..9 直达对应刊期，Alt + 0 回目录
      if (e.altKey && !e.ctrlKey && !e.metaKey && /^[0-9]$/.test(e.key)) {
        var t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        var n = parseInt(e.key, 10);
        var target = n === 0 ? homeUrl() : (ISSUES[n - 1] ? issueUrl(ISSUES[n - 1].dir) : null);
        if (target) {
          e.preventDefault();
          location.href = target;
        }
      }
    }, true);
  }

  /* ==================================================================
   * 5. 修正 2026-10-31 期那个「假」的刊期下拉框
   *    原下拉列出 3 个仓库里不存在的历史期，选择后只弹一段摘要横幅。
   *    这里用克隆节点替换掉旧元素（连同它身上旧的 change 监听器一起丢弃），
   *    再填入真实刊期并绑定真正的跳转。
   * ================================================================== */
  function patchLegacySelector() {
    var old = document.getElementById('issue-selector');
    if (!old || old.getAttribute('data-zxsw-patched') === '1') return;

    var fresh = document.createElement('select');
    fresh.id = old.id;
    fresh.className = old.className;
    fresh.setAttribute('aria-label', '切换周报刊期');
    fresh.setAttribute('data-zxsw-patched', '1');

    var list = ISSUES.slice();
    if (CURRENT && !list.some(function (it) { return it.dir === CURRENT; })) {
      list.unshift({ dir: CURRENT, title: CURRENT + '（当前刊）' });
    }
    list.forEach(function (it) {
      var opt = document.createElement('option');
      opt.value = it.dir;
      opt.textContent = it.title;
      if (it.dir === CURRENT) opt.selected = true;
      fresh.appendChild(opt);
    });

    old.parentNode.replaceChild(fresh, old);
    fresh.addEventListener('change', function (e) {
      var dir = e.target.value;
      if (dir && dir !== CURRENT) location.href = issueUrl(dir);
    });
  }

  /* ==================================================================
   * 6. 初始化：延后到本轮所有 DOMContentLoaded 回调之后，
   *    保证原页面脚本已把旧监听器绑完，再替换 select 才不会残留。
   * ================================================================== */
  function init() {
    try { buildUI(); } catch (e) { console.error('[准讯周报] 切换器初始化失败', e); }
    try { patchLegacySelector(); } catch (e) { console.error('[准讯周报] 刊期下拉修正失败', e); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });
  } else {
    setTimeout(init, 0);
  }
})();
