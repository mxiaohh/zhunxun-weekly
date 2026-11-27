/*!
 * 准讯周报 / 准讯日报 · 全站刊期切换器  site-nav.js  v2.0
 * ------------------------------------------------------------------
 * 放置位置：仓库根目录（与 index.html 同级）
 * 引入方式：在每个页面的 </body> 前加一行
 *             周报页：<script src="../site-nav.js"></script>      （<日期>/）
 *             日报页：<script src="../../site-nav.js"></script>   （daily/<日期>/）
 *             首  页：<script src="./site-nav.js"></script>
 *
 * 维护方式：每新增一期周报，在 ISSUES 最前面加一行；每新增一期日报，在 DAILIES
 *           最前面加一行（build_issue.py / build_daily.py 会自动加）。
 *           所有页面（含老刊期）的切换入口会自动更新，无需再改 HTML。
 *
 * 周报 / 日报互切：悬浮面板顶部有「周报 | 日报」两个标签；页面里任何带
 *           data-zxsw-kind="weekly|daily" 的链接，会被自动指向该刊物的最新一期。
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
    { dir: "2026-11-25", title: "2026-11-16 – 11-25（11月25日刊）", sub: "第 47 期 · AI与科技深度周刊" },
    { dir: "2026-11-15", title: "2026-11-09 – 11-14（11月15日刊）", sub: "第 46 期 · AI与科技深度周刊" },
    { dir: '2026-11-12', title: '2026-11-04 – 11-10 (AIHOT 特刊)', sub: '第 203 期 · 极简报纸嵌套版' },
    { dir: '2026-11-10', title: '2026.11.03 — 11.10', sub: '总第 45 期 · 报纸版' },
    { dir: '2026-10-31', title: '2026 年 10 月 31 日刊', sub: '10 月下旬刊 · 科技蓝版' }
  ];

  // 日报：网站路径 daily/<日期>/，同样按时间倒序
  var DAILIES = [
    { dir: "2026-11-26", title: "11月26日 · 星期四", sub: "第 1 期 · 12 条要闻 · 4 条快讯" }
  ];

  /* ==================================================================
   * 2. 路径推导
   * ================================================================== */
  var scriptEl = document.currentScript;
  // 页面单独打开、找不到 ../site-nav.js 时，会以内嵌副本运行并通过 ZXSW_ROOT 指定线上站点根地址
  var FORCED_ROOT = window.ZXSW_ROOT || '';
  var SITE_ROOT = (function () {
    if (FORCED_ROOT) return FORCED_ROOT;
    try {
      if (scriptEl && scriptEl.src) return new URL('.', scriptEl.src).href;
    } catch (e) { /* 落到兜底 */ }
    var m = location.pathname.match(/^(.*\/)(?:daily\/)?(?:20\d{2}-\d{2}-\d{2}\/)?[^/]*$/);
    return location.origin + (m ? m[1] : '/');
  })();

  var isFile = location.protocol === 'file:' && !FORCED_ROOT;

  function homeUrl() {
    return SITE_ROOT + (isFile ? 'index.html' : '');
  }

  function issueUrl(dir) {
    return SITE_ROOT + dir + '/' + (isFile ? 'index.html' : '');
  }

  function dailyUrl(dir) {
    return SITE_ROOT + 'daily/' + dir + '/' + (isFile ? 'index.html' : '');
  }

  // 当前页面是哪种刊物的哪一期：daily/<日期>/ 为日报，<日期>/ 为周报
  var m0 = location.pathname.match(/(?:^|\/)(daily\/)?(20\d{2}-\d{2}-\d{2})(?:\/|$)/);
  var CURRENT = m0 ? m0[2] : null;
  var KIND = m0 && m0[1] ? 'daily' : 'weekly';

  var PUBS = {
    weekly: { name: '周报', list: ISSUES, url: issueUrl, unit: '期' },
    daily: { name: '日报', list: DAILIES, url: dailyUrl, unit: '期' }
  };

  function latestUrl(kind) {
    var p = PUBS[kind];
    return p.list.length ? p.url(p.list[0].dir) : homeUrl();
  }

  // 暴露给首页 / 其它脚本复用
  window.ZXSW = {
    issues: ISSUES,
    dailies: DAILIES,
    root: SITE_ROOT,
    current: CURRENT,
    kind: KIND,
    homeUrl: homeUrl,
    issueUrl: issueUrl,
    dailyUrl: dailyUrl,
    latestUrl: latestUrl
  };

  // 页面里的「周报 | 日报」切换链接：指向各自最新一期；没有日报时隐藏日报入口
  function wireKindLinks() {
    var links = document.querySelectorAll('[data-zxsw-kind]');
    Array.prototype.forEach.call(links, function (a) {
      var kind = a.getAttribute('data-zxsw-kind');
      if (!PUBS[kind]) return;
      if (!PUBS[kind].list.length) { a.style.display = 'none'; return; }
      if (kind !== KIND || !CURRENT) a.setAttribute('href', latestUrl(kind));
    });
  }

  // 首页本身就是刊期目录，不再叠加悬浮按钮
  if (document.body && document.body.getAttribute('data-zxsw-page') === 'index') return;

  // 清单没跟上新刊期时给出可见提醒（不影响使用）
  if (CURRENT && !PUBS[KIND].list.some(function (it) { return it.dir === CURRENT; })) {
    console.warn('[准讯] 当前' + PUBS[KIND].name + ' ' + CURRENT + ' 尚未登记在 site-nav.js 的 ' +
      (KIND === 'daily' ? 'DAILIES' : 'ISSUES') + ' 中，请补一行。');
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
    '#zxsw-tabs{display:flex;gap:6px;padding:10px 15px 0;}',
    '#zxsw-root .zxsw-tab{flex:1;border:1px solid rgba(125,211,252,.22);background:transparent;',
    '  color:#93B4D4;font-size:12px;font-weight:700;padding:6px 0;border-radius:8px;letter-spacing:.06em;}',
    '#zxsw-root .zxsw-tab:hover{border-color:rgba(125,211,252,.5);color:#F0F9FF;}',
    '#zxsw-root .zxsw-tab.is-on{background:rgba(56,189,248,.2);border-color:rgba(56,189,248,.6);color:#F0F9FF;}',
    '#zxsw-root .zxsw-tab small{font-weight:500;opacity:.75;margin-left:4px;}',
    '#zxsw-list .zxsw-empty{padding:18px 8px;text-align:center;color:#93B4D4;font-size:12px;}',
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
    PUBS[KIND].list.some(function (it) {
      if (it.dir === CURRENT) { curLabel = PUBS[KIND].name + ' · ' + it.title; return true; }
      return false;
    });
    if (!curLabel && CURRENT) curLabel = PUBS[KIND].name + ' · ' + CURRENT;

    function listHtml(kind) {
      var p = PUBS[kind];
      if (!p.list.length) return '<div class="zxsw-empty">' + p.name + '尚未发布</div>';
      return p.list.map(function (it, i) {
        var isCur = kind === KIND && it.dir === CURRENT;
        var isNew = i === 0;
        var badge = isCur
          ? '<span class="zxsw-badge is-cur">正在阅读</span>'
          : (isNew ? '<span class="zxsw-badge is-new">最新一期</span>' : '');
        return '<a class="zxsw-item' + (isCur ? ' is-current' : '') + '"' +
          ' href="' + esc(p.url(it.dir)) + '"' +
          ' data-zxsw-issue="' + esc(it.dir) + '"' +
          (isCur ? ' aria-current="page"' : '') + '>' +
          '<span class="zxsw-top"><span class="zxsw-title">' + esc(it.title) + '</span>' + badge + '</span>' +
          '<span class="zxsw-sub">' + esc(it.sub || '') + (i < 9 ? ' · Alt+' + (i + 1) : '') + '</span>' +
          '</a>';
      }).join('');
    }

    var tab = KIND;
    function tabHtml(kind) {
      return '<button type="button" class="zxsw-tab' + (kind === tab ? ' is-on' : '') + '" data-zxsw-tab="' + kind + '">' +
        PUBS[kind].name + '<small>' + PUBS[kind].list.length + ' 期</small></button>';
    }

    root.innerHTML =
      '<div id="zxsw-panel" hidden>' +
        '<div id="zxsw-head">' +
          '<div><strong>准讯 · 切换刊期</strong><small>WEEKLY · DAILY</small></div>' +
          '<button id="zxsw-close" type="button" aria-label="关闭">×</button>' +
        '</div>' +
        '<div id="zxsw-tabs" role="tablist">' + tabHtml('weekly') + tabHtml('daily') + '</div>' +
        '<div id="zxsw-list">' + listHtml(tab) + '</div>' +
        '<div id="zxsw-foot">' +
          '<a href="' + esc(homeUrl()) + '">全部刊期目录 →</a>' +
          '<span>Alt+数字直达</span>' +
        '</div>' +
      '</div>' +
      '<button id="zxsw-toggle" type="button" aria-expanded="false" aria-controls="zxsw-panel"' +
        ' title="切换周报 / 日报刊期（Alt+1~9）">' +
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

    // 周报 / 日报标签切换
    var tabs = document.getElementById('zxsw-tabs');
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-zxsw-tab]') : null;
      if (!b) return;
      tab = b.getAttribute('data-zxsw-tab');
      tabs.innerHTML = tabHtml('weekly') + tabHtml('daily');
      document.getElementById('zxsw-list').innerHTML = listHtml(tab);
    });
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
      // Alt + 1..9 直达当前标签（周报或日报）下对应刊期，Alt + 0 回目录
      if (e.altKey && !e.ctrlKey && !e.metaKey && /^[0-9]$/.test(e.key)) {
        var t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        var n = parseInt(e.key, 10);
        var L = PUBS[tab].list;
        var target = n === 0 ? homeUrl() : (L[n - 1] ? PUBS[tab].url(L[n - 1].dir) : null);
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
    try { wireKindLinks(); } catch (e) { console.error('[准讯] 周报/日报切换链接初始化失败', e); }
    try { buildUI(); } catch (e) { console.error('[准讯周报] 切换器初始化失败', e); }
    try { patchLegacySelector(); } catch (e) { console.error('[准讯周报] 刊期下拉修正失败', e); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });
  } else {
    setTimeout(init, 0);
  }
})();
