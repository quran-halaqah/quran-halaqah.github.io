(function () {
  var grid = document.getElementById("surah-grid");
  var resultsBox = document.getElementById("word-results");
  var searchInput = document.getElementById("ghareeb-search");
  var data = null;

  // إزالة التشكيل لتسهيل البحث (مثل "الرحمن" يطابق "الرَّحْمٰن")
  function normalize(text) {
    return (text || "").replace(/[\u064b-\u065f\u0670\u06d6-\u06edـ]/g, "").replace(/[أإآٱ]/g, "ا");
  }

  function surahCardHtml(surah) {
    return (
      '<a class="surah-link" href="/ghareeb/' +
      surah.page +
      '">' +
      '<span class="surah-number">' + surah.number + '</span><span class="surah-name">' +
      surah.name_ar +
      '</span><span class="surah-word-count">' +
      surah.words.length +
      " كلمة</span>" +
      "</a>"
    );
  }

  function wordResultHtml(surah, word, index) {
    return (
      '<a class="word-result" href="/ghareeb/' +
      surah.page +
      "#word-" +
      (index + 1) +
      '">' +
      '<span class="word">' +
      word.word +
      '</span><span class="result-meaning">' +
      word.meaning +
      '</span><span class="result-reference">سورة ' +
      surah.name_ar +
      " &bull; الآية " +
      word.ayah +
      "</span>" +
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
            normalize(word.word.replace(/\u0670/g, "ا")).indexOf(q) !== -1 ||
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
        '<div class="word-results-list">' +
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
      grid.innerHTML = '<p class="empty-state">لا توجد نتائج. جرّب اسم سورة أو كلمة أخرى.</p>';
    }
    document.getElementById("index-count").textContent = q
      ? matchingSurahs.length + " سورة · " + wordMatches.length + " كلمة مطابقة"
      : data.surahs.length + " سورة";
  }

  fetch("/data/ghareeb.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Unable to load index");
      return res.json();
    })
    .then(function (json) {
      data = json;
      render(searchInput.value);
    })
    .catch(function () {
      grid.innerHTML = '<p class="empty-state">تعذّر تحميل السور. أعد تحميل الصفحة للمحاولة مجددًا.</p>';
      document.getElementById("index-count").textContent = "تعذّر التحميل";
    });

  searchInput.addEventListener("input", function (e) {
    if (data) render(e.target.value);
  });
})();
