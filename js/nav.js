// يحقن الترويسة والتذييل المشتركين في كل الصفحات
// يحدَّد القسم الحالي عبر data-page على عنصر body

(function () {
  var page = document.body.getAttribute("data-page") || "";

  var links = [
    { id: "home", href: "/index.html", label: "الرئيسية" },
    { id: "ghareeb", href: "/ghareeb/index.html", label: "غريب القرآن" },
    { id: "darss", href: "/darss/index.html", label: "الدرس" },
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
    '<nav class="site-nav">' +
    navHtml +
    "</nav>" +
    "</div></header>";

  var footerHtml =
    '<footer class="site-footer"><div class="container">' +
    "<p>حلقة القرآن الكريم &mdash; غريب القرآن والدرس</p>" +
    "</div></footer>";

  var headerMount = document.getElementById("site-header");
  var footerMount = document.getElementById("site-footer");

  if (headerMount) headerMount.outerHTML = headerHtml;
  if (footerMount) footerMount.outerHTML = footerHtml;
})();
