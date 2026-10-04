/* ============================================================
   钢结构技术管理系统 · 官网公共脚本
   职责：注入顶部导航/页脚、标记当前页、渲染版本与动态列表、
        滚动进场动画。数据由 data/*.json 驱动，发布新版本只需改 JSON。
   ============================================================ */
(function () {
  "use strict";

  /* 百度统计（全站访问统计）：统计访问量、访客、来源、地域等 */
  (function () {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?2cad1c11782f3c71ec9723071d0dc23c";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
  })();

  /* 不蒜子移除（2026-10-04）：其数据请求在部分网络下挂起导致标签页一直加载、页脚转圈。
     访问统计改用百度统计（后台查看），页脚不再公开显示访问量。 */

  var NAV = [
    { href: "index.html",    label: "首页",     key: "home" },
    { href: "download.html", label: "软件下载", key: "download" },
    { href: "demo.html",     label: "软件演示", key: "demo" },
    { href: "news.html",     label: "软件动态", key: "news" },
    { href: "help.html",     label: "安装说明", key: "help" },
    { href: "contact.html",  label: "联系我们", key: "contact" },
    { href: "purchase.html", label: "软件购买", key: "purchase" }
  ];

  /* 兜底种子数据：联网 / 文件协议（file://）拉不到 JSON 时也能展示，
     托管到 GitHub Pages 后由 data/*.json 覆盖。 */
  var SEED_DOWNLOADS = [
    { version: "1.0.0", date: "2026-10-01", status: "ready", dl_count: 0,
      title: "正式版发布", size: "约 180 MB",
      changelog: ["首版正式发布", "材料分析 / 构件清单管理", "板材预提料与采购计划", "排料（套料）引擎", "人工核算 / 油漆核算", "Tekla 报表导入与导出"] },
    { version: "0.9.0", date: "2026-08-20", status: "wait",
      title: "公测版", size: "—", changelog: ["内部测试版本，仅对授权用户开放"] }
  ];
  var SEED_NEWS = [
    { date: "2026-10-01", tag: "release", title: "钢结构技术管理系统 1.0.0 正式发布",
      text: "首个正式版本上线，包含材料分析、预提料、排料、人工核算、油漆核算与 Tekla 报表导入导出全流程功能。" },
    { date: "2026-09-15", tag: "feature", title: "油漆核算支持色卡库与涂层方案",
      text: "内置劳尔色卡 RAL 与国标色卡 GSB05 全系列色卡，支持自定义涂层方案与损耗系数。" },
    { date: "2026-08-30", tag: "feature", title: "新增板材预提料与采购计划模块",
      text: "支持定尺 / 非定尺提料、现货产品库匹配、规格网格搜索与利用率计算。" },
    { date: "2026-08-10", tag: "fix", title: "修复 Tekla 报表导入列错位问题",
      text: "修复部分 03 净毛重格式报表表头定位失败导致的列错位。" }
  ];

  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }

  function currentKey() {
    var p = document.body.getAttribute("data-page") || "";
    return p;
  }

  function renderHeader() {
    var el = $("#site-header");
    if (!el) return;
    var page = currentKey();
    var links = NAV.map(function (n) {
      var cls = n.key === page ? ' class="active"' : "";
      return '<a href="' + n.href + '"' + cls + ">" + n.label + "</a>";
    }).join("");
    el.innerHTML =
      '<div class="container nav">' +
        '<a class="brand" href="index.html">' +
          '<span class="brand-mark">钢</span>' +
          '<span>钢结构技术管理系统<small>STEEL STRUCTURE MIS</small></span>' +
        "</a>" +
        '<nav class="nav-links">' + links + "</nav>" +
        '<a class="btn btn-primary btn-sm nav-cta" href="download.html">下载软件</a>' +
        '<button class="nav-toggle" aria-label="菜单">☰</button>' +
      "</div>";
    $(".nav-toggle").addEventListener("click", function () {
      $(".nav-links").classList.toggle("open");
    });
  }

  function renderFooter() {
    var el = $("#site-footer");
    if (!el) return;
    var links = NAV.map(function (n) {
      return '<a href="' + n.href + '">' + n.label + "</a>";
    }).join("");
    el.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div>' +
            '<div class="footer-brand"><span class="brand-mark">钢</span>钢结构技术管理系统</div>' +
            "<p>面向钢结构加工企业的技术管理软件：材料分析、预提料、排料、人工核算、油漆核算与 Tekla 报表全流程。</p>" +
          "</div>" +
          "<div><h4>网站导航</h4>" + links + "</div>" +
          "<div><h4>软件功能</h4>" +
            "<p>材料分析 / 构件清单</p><p>板材预提料与采购计划</p><p>排料（套料）引擎</p>" +
            "<p>人工核算 / 油漆核算</p>" +
          "</div>" +
          "<div><h4>联系我们</h4>" +
            "<p>微信：shiqianjushoupro</p>" +
            "<p>电话：15034167945</p>" +
            "<p>工作时间：周一至周五 9:00 - 18:00</p>" +
          "</div>" +
        "</div>" +
        '<div class="footer-bottom">' +
          "<span>© 2026 钢结构技术管理系统 · 保留所有权利</span>" +
          "<span>按电脑授权 · 一个授权码绑定一台电脑</span>" +
        "</div>" +
      "</div>";
  }

  /* ---------------- 数据加载（带 file:// 兜底） ---------------- */
  function loadJSON(url, seed, cb) {
    fetch(url, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { cb(data && data.length ? data : seed); })
      .catch(function () { cb(seed); });
  }

  function fmtDate(d) {
    var s = String(d);
    return s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6, 8);
  }

  var TAG_TEXT = { release: "发布", feature: "新增", fix: "修复" };
  function tagCls(t) { return "ntag ntag-" + (t === "release" ? "release" : t === "fix" ? "fix" : "feature"); }

  /* ---------------- 首页：最新版本 + 动态摘要 ---------------- */
  function renderHome() {
    var latest = $("#latest-version");
    if (latest) {
      loadJSON("data/downloads.json", SEED_DOWNLOADS, function (list) {
        var first = list[0];
        if (!first) return;
        var notes = (first.changelog || []).slice(0, 5).map(function (t) {
          return "<li>" + t + "</li>";
        }).join("");
        var state = first.status === "ready"
          ? '<a class="btn btn-white btn-lg" href="' + (first.url || "download.html") + '">立即下载</a>'
          : '<a class="btn btn-white btn-lg" href="contact.html">获取试用授权</a>';
        latest.innerHTML =
          '<div>' +
            '<div class="v-ver">v' + first.version + "</div>" +
            '<div class="v-date">' + first.date + (first.size ? " · " + first.size : "") + "</div>" +
            '<ul class="v-notes">' + notes + "</ul>" +
          "</div>" +
          "<div>" + state + "</div>";
      });
    }
    var sum = $("#news-summary");
    if (sum) {
      loadJSON("data/news.json", SEED_NEWS, function (list) {
        var html = list.slice(0, 4).map(function (n) {
          return '<a class="news-item" href="news.html">' +
            '<span class="date">' + n.date + "</span>" +
            '<span class="' + tagCls(n.tag) + '">' + (TAG_TEXT[n.tag] || n.tag) + "</span>" +
            "<span><h4>" + n.title + "</h4><p>" + n.text + "</p></span>" +
          "</a>";
        }).join("");
        sum.innerHTML = html;
      });
    }
  }

  /* ---------------- 下载页 ---------------- */
  function renderDownloads() {
    var box = $("#dl-list");
    if (!box) return;
    loadJSON("data/downloads.json", SEED_DOWNLOADS, function (list) {
      box.innerHTML = list.map(function (v) {
        var ready = v.status === "ready";
        var isZip = /\.zip$/i.test(v.url || "");
        var btnText = isZip ? "下载绿色版" : "下载安装包";
        var dlBtn = ready
          ? (v.url
              ? '<a class="btn btn-primary" href="' + v.url + '">' + btnText + "</a>"
              : '<a class="btn btn-primary" href="contact.html">联系获取安装包</a>')
          : '<span class="btn btn-line" disabled>敬请期待</span>';
        var notes = (v.changelog || []).map(function (t) { return "<li>" + t + "</li>"; }).join("");
        return '<div class="dl-card">' +
          '<div class="dl-type">' + (v.title || "") + "</div>" +
          '<div class="dl-top">' +
            '<span class="dl-ver">v' + v.version + "</span>" +
            '<span class="dl-date">' + v.date + "</span>" +
            '<span class="dl-tag' + (ready ? "" : " wait") + '">' + (ready ? "可下载" : "未发布") + "</span>" +
            '<span class="dl-date">' + (v.size || "") + "</span>" +
            '<span class="dl-actions">' + dlBtn + "</span>" +
          "</div>" +
          (notes ? '<details class="dl-notes"><summary>更新日志</summary><ul>' + notes + "</ul></details>" : "") +
        "</div>";
      }).join("");
    });
  }

  /* ---------------- 动态页 ---------------- */
  function renderNews() {
    var box = $("#news-timeline");
    if (!box) return;
    loadJSON("data/news.json", SEED_NEWS, function (list) {
      box.innerHTML = list.map(function (n) {
        return '<div class="tl-item">' +
          '<div class="ncol"><span class="' + tagCls(n.tag) + '">' + (TAG_TEXT[n.tag] || n.tag) + "</span>" +
          '<span class="date">' + n.date + "</span></div>" +
          "<h3>" + n.title + "</h3><p>" + n.text + "</p>" +
        "</div>";
      }).join("");
    });
  }

  /* ---------------- 滚动进场 ---------------- */
  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* 下载次数：读本地 downloads.json 的 dl_count 快照（发布时自动刷新；不依赖 GitHub API，国内可正常显示） */
  function renderDlStats() {
    var el = $("#dl-stats");
    if (!el) return;
    loadJSON("data/downloads.json", SEED_DOWNLOADS, function (list) {
      var total = 0;
      for (var i = 0; i < list.length; i++) {
        total += list[i].dl_count || 0;
      }
      el.innerHTML =
        '本站安装包累计下载 <b style="font-size:18px;color:var(--brand)">' +
        total.toLocaleString("zh-CN") + "</b> 次";
      el.style.display = "block";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    renderHome();
    renderDownloads();
    renderDlStats();
    renderNews();
    initReveal();
  });
})();
