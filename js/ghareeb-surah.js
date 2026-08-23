(function () {
  var surahId = document.body.getAttribute("data-surah");
  var listEl = document.getElementById("word-list");
  var flashcardContainer = document.getElementById("flashcard-container");

  function normalize(text) {
    return (text || "").replace(/[ً-ٰٟ]/g, "");
  }

  function correctionReportUrl(surah, word, index) {
    var entryUrl =
      window.location.origin +
      "/ghareeb/" +
      surah.page +
      "#word-" +
      (index + 1);
    var title =
      "[تصحيح غريب القرآن] سورة " +
      surah.name_ar +
      "، الآية " +
      word.ayah +
      " — " +
      word.word;
    var body =
      "السلام عليكم، أود الإبلاغ عن تصحيح محتمل في غريب القرآن.\n\n" +
      "- السورة: " +
      surah.name_ar +
      " (" +
      surah.number +
      ")\n" +
      "- الآية: " +
      word.ayah +
      "\n" +
      "- الكلمة الحالية: " +
      word.word +
      "\n" +
      "- المعنى الحالي: " +
      word.meaning +
      "\n" +
      "- الرابط: " +
      entryUrl +
      "\n\n" +
      "## التصحيح المقترح\n\n" +
      "اكتب التصحيح هنا.\n\n" +
      "## الملاحظات أو المصدر\n\n" +
      "أضف ما يساعد على التحقق من التصحيح.";

    return (
      "https://github.com/quran-halaqah/quran-halaqah.github.io/issues/new?title=" +
      encodeURIComponent(title) +
      "&body=" +
      encodeURIComponent(body)
    );
  }

  function wordItemHtml(word, index, surah) {
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
      '<div class="word-meta">' +
      '<span class="ayah-ref">الآية ' +
      word.ayah +
      "</span>" +
      '<a class="correction-report" href="' +
      correctionReportUrl(surah, word, index) +
      '" target="_blank" rel="noopener noreferrer" title="الإبلاغ عن خطأ" aria-label="الإبلاغ عن خطأ في ' +
      word.word +
      '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 21V4m0 1h11l-2 3 2 3H5"/></svg>' +
      "</a>" +
      "</div>" +
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
      listEl.innerHTML = words
        .map(function (word, index) {
          return wordItemHtml(word, index, surah);
        })
        .join("");

      document.getElementById("surah-search").addEventListener("input", function (e) {
        var q = normalize(e.target.value.trim());
        if (!q) {
          listEl.innerHTML = words
            .map(function (word, index) {
              return wordItemHtml(word, index, surah);
            })
            .join("");
          return;
        }
        var filtered = words
          .map(function (word, index) {
            return { word: word, index: index };
          })
          .filter(function (item) {
            return (
              normalize(item.word.word).indexOf(q) !== -1 ||
              normalize(item.word.meaning).indexOf(q) !== -1
            );
          });
        listEl.innerHTML = filtered.length
          ? filtered
              .map(function (item) {
                return wordItemHtml(item.word, item.index, surah);
              })
              .join("")
          : '<li class="word-item"><p class="empty-state">لا توجد نتائج.</p></li>';
      });

      initFlashcards(flashcardContainer, words, surah.id);
    });
})();
