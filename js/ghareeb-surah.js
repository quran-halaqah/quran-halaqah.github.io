(function () {
  var surahId = document.body.getAttribute("data-surah");
  var listEl = document.getElementById("word-list");
  var flashcardContainer = document.getElementById("flashcard-container");

  function normalize(text) {
    return (text || "").replace(/[ً-ٰٟ]/g, "");
  }

  function wordItemHtml(word, index) {
    return (
      '<li class="word-item" id="word-' +
      (index + 1) +
      '">' +
      '<div class="word">' +
      word.word +
      "</div>" +
      '<div class="meaning">' +
      word.meaning +
      "</div>" +
      '<span class="ayah-ref">الآية ' +
      word.ayah +
      "</span>" +
      "</li>"
    );
  }

  fetch("/data/ghareeb.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      var surah = data.surahs.find(function (s) {
        return s.id === surahId;
      });
      if (!surah) return;

      // Inject search box before flashcards section
      var searchBox = document.createElement("div");
      searchBox.className = "search-box";
      searchBox.innerHTML =
        '<input type="search" id="surah-search" placeholder="ابحث في كلمات السورة..." autocomplete="off" />';
      listEl.parentNode.insertBefore(searchBox, listEl);

      var words = surah.words;
      listEl.innerHTML = words.map(wordItemHtml).join("");

      document.getElementById("surah-search").addEventListener("input", function (e) {
        var q = normalize(e.target.value.trim());
        if (!q) {
          listEl.innerHTML = words.map(wordItemHtml).join("");
          return;
        }
        var filtered = words.filter(function (w, i) {
          return (
            normalize(w.word).indexOf(q) !== -1 ||
            normalize(w.meaning).indexOf(q) !== -1
          );
        });
        listEl.innerHTML = filtered.length
          ? filtered.map(wordItemHtml).join("")
          : '<li class="word-item"><p class="empty-state">لا توجد نتائج.</p></li>';
      });

      initFlashcards(flashcardContainer, words, surah.id);
    });
})();
