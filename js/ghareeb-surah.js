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

  function tafsirUrl(surahNumber, ayahNumber) {
    return (
      "https://tafsir.app/ibn-aashoor/" + surahNumber + "/" + ayahNumber
    );
  }

  function openTafsirPopup(url) {
    var width = Math.min(880, window.screen.availWidth - 32);
    var height = Math.min(760, window.screen.availHeight - 48);
    var left = Math.max(0, Math.round((window.screen.availWidth - width) / 2));
    var top = Math.max(0, Math.round((window.screen.availHeight - height) / 2));
    var features =
      "popup=yes,resizable=yes,scrollbars=yes,width=" +
      width +
      ",height=" +
      height +
      ",left=" +
      left +
      ",top=" +
      top;
    var popup = window.open(url, "ibn-aashoor-tafsir", features);

    if (popup) {
      popup.opener = null;
      popup.focus();
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
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
      '<button class="tafsir-link" type="button" data-tafsir-url="' +
      tafsirUrl(surah.number, word.ayah) +
      '" title="فتح تفسير ابن عاشور للآية ' +
      word.ayah +
      '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 20.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v17a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5z"/></svg>' +
      '<span>تفسير ابن عاشور</span>' +
      "</button>" +
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

      listEl.addEventListener("click", function (event) {
        var button = event.target.closest(".tafsir-link");
        if (!button) return;
        openTafsirPopup(button.getAttribute("data-tafsir-url"));
      });

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
