// يحقن الترويسة والتذييل المشتركين في كل الصفحات
// يحدَّد القسم الحالي عبر data-page على عنصر body

(function () {
  var THEME_KEY = "quran-halaqah-theme";
  var page = document.body.getAttribute("data-page") || "";

  function preferredTheme() {
    try {
      var savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    } catch (e) {
      // يبقى اختيار النظام هو الافتراضي عندما يتعذر الوصول إلى التخزين المحلي.
    }

    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function themeIcon(theme) {
    if (theme === "dark") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"></path></svg>';
    }

    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path></svg>';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;

    var button = document.getElementById("theme-toggle");
    if (!button) return;

    var nextTheme = theme === "dark" ? "light" : "dark";
    var label = nextTheme === "dark" ? "تفعيل الوضع الداكن" : "تفعيل الوضع الفاتح";
    button.innerHTML = themeIcon(theme) + '<span class="sr-only">' + label + "</span>";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  applyTheme(preferredTheme());

  var links = [
    { id: "home", href: "/index.html", label: "الرئيسية" },
    { id: "ghareeb", href: "/ghareeb/index.html", label: "غريب القرآن" },
    { id: "darss", href: "/darss/index.html", label: "الدروس" },
    { id: "library", href: "/library/index.html", label: "المكتبة" },
  ];

  var navHtml = links
    .map(function (link) {
      var activeClass = link.id === page ? " active" : "";
      return (
        '<a href="' +
        link.href +
        '" class="' +
        link.id +
        activeClass +
        '">' +
        link.label +
        "</a>"
      );
    })
    .join("");

  var headerHtml =
    '<header class="site-header"><div class="container">' +
    '<div class="site-title"><a href="/index.html">حلقة القرآن الكريم</a></div>' +
    '<div class="header-controls"><nav class="site-nav">' +
    navHtml +
    '</nav><button class="theme-toggle" id="theme-toggle" type="button"></button></div>' +
    "</div></header>";

  var footerHtml =
    '<footer class="site-footer"><div class="container">' +
    "<p>حلقة القرآن الكريم &mdash; غريب القرآن والدروس والمكتبة</p>" +
    "</div></footer>";

  var headerMount = document.getElementById("site-header");
  var footerMount = document.getElementById("site-footer");

  if (headerMount) headerMount.outerHTML = headerHtml;
  if (footerMount) footerMount.outerHTML = footerHtml;

  applyTheme(document.documentElement.getAttribute("data-theme") || preferredTheme());

  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var theme = document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
      applyTheme(theme);
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {
        // يظل الاختيار فعالًا خلال الصفحة الحالية حتى دون تخزين محلي.
      }
    });
  }
})();
