(function () {
  var grid = document.getElementById("surah-grid");
  var resultsBox = document.getElementById("word-results");
  var searchInput = document.getElementById("ghareeb-search");
  var data = null;

  // إزالة التشكيل لتسهيل البحث (مثل "الرحمن" يطابق "الرَّحْمٰن")
  function normalize(text) {
    return (text || "").replace(/[ً-ٰٟ]/g, "");
  }

  function surahCardHtml(surah) {
    return (
      '<a class="card" href="/ghareeb/' +
      surah.page +
      '">' +
      "<h3>" +
      surah.name_ar +
      "</h3>" +
      "<p>السورة رقم " +
      surah.number +
      " &bull; " +
      surah.words.length +
      " كلمة</p>" +
      "</a>"
    );
  }

  function wordResultHtml(surah, word, index) {
    return (
      '<a class="card" href="/ghareeb/' +
      surah.page +
      "#word-" +
      (index + 1) +
      '">' +
      '<h3 class="word">' +
      word.word +
      "</h3>" +
      "<p>" +
      word.meaning +
      "</p>" +
      "<p>سورة " +
      surah.name_ar +
      " &bull; الآية " +
      word.ayah +
      "</p>" +
      "</a>"
    );
  }

  function render(query) {
    var q = normalize((query || "").trim());

    var matchingSurahs = data.surahs.filter(function (surah) {
      return !q || normalize(surah.name_ar).indexOf(q) !== -1;
    });

    grid.innerHTML = matchingSurahs.length
      ? matchingSurahs.map(surahCardHtml).join("")
      : "";

    var wordMatches = [];
    if (q) {
      data.surahs.forEach(function (surah) {
        surah.words.forEach(function (word, index) {
          if (
            normalize(word.word).indexOf(q) !== -1 ||
            normalize(word.meaning).indexOf(q) !== -1
          ) {
            wordMatches.push({ surah: surah, word: word, index: index });
          }
        });
      });
    }

    if (wordMatches.length) {
      resultsBox.innerHTML =
        "<h2>كلمات مطابقة</h2>" +
        '<div class="card-grid">' +
        wordMatches
          .map(function (m) {
            return wordResultHtml(m.surah, m.word, m.index);
          })
          .join("") +
        "</div>";
    } else {
      resultsBox.innerHTML = "";
    }

    if (!matchingSurahs.length && !wordMatches.length && q) {
      grid.innerHTML = '<p class="empty-state">لا توجد نتائج لـ "' + q + '"</p>';
    }
  }

  fetch("/data/ghareeb.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      data = json;
      render("");
    });

  searchInput.addEventListener("input", function (e) {
    if (data) render(e.target.value);
  });
})();
