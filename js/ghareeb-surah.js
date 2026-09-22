(function () {
  var surahId = document.body.getAttribute("data-surah");
  var listEl = document.getElementById("word-list");
  var flashcardContainer = document.getElementById("flashcard-container");

  function normalize(text) {
    return (text || "").replace(/[\u064b-\u065f\u0670\u06d6-\u06edـ]/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/[٠-٩]/g, function (digit) { return digit.charCodeAt(0) - 1632; })
      .replace(/[۰-۹]/g, function (digit) { return digit.charCodeAt(0) - 1776; });
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

  function tafsirUrl(tafsir, surahNumber, ayahNumber) {
    return (
      "https://tafsir.app/" + tafsir + "/" + surahNumber + "/" + ayahNumber
    );
  }

  function tafsirButtonHtml(tafsir, label, surahNumber, ayahNumber) {
    return (
      '<button class="tafsir-link" type="button" data-tafsir-url="' +
      tafsirUrl(tafsir, surahNumber, ayahNumber) +
      '" title="فتح تفسير ' +
      label +
      " للآية " +
      ayahNumber +
      '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 20.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v17a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5z"/></svg>' +
      "<span>تفسير " +
      label +
      "</span>" +
      "</button>"
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
    var popup = window.open(url, "ghareeb-tafsir", features);

    if (popup) {
      popup.opener = null;
      popup.focus();
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function wordItemHtml(word, index, surah) {
    return (
      '<tr class="word-entry" id="word-' +
      (index + 1) +
      '">' +
      '<td class="verse-cell"><span class="sr-only">الآية </span>' + word.ayah + '</td>' +
      '<th scope="row" class="word">' +
      word.word +
      "</th>" +
      '<td class="meaning">' +
      word.meaning +
      '</td></tr><tr class="word-actions-row"><td colspan="3">' +
      '<div class="word-meta word-actions"><div class="word-tafsirs">' +
      tafsirButtonHtml("saadi", "السعدي", surah.number, word.ayah) +
      tafsirButtonHtml("ibn-aashoor", "ابن عاشور", surah.number, word.ayah) +
      '</div>' +
      '<a class="correction-report" href="' +
      correctionReportUrl(surah, word, index) +
      '" target="_blank" rel="noopener noreferrer" title="الإبلاغ عن خطأ" aria-label="الإبلاغ عن خطأ في ' +
      word.word +
      '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 21V4m0 1h11l-2 3 2 3H5"/></svg>' +
      "</a>" +
      "</div></td>" +
      "</tr>"
    );
  }

  fetch("/data/ghareeb.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Unable to load words");
      return res.json();
    })
    .then(function (data) {
      var surah = data.surahs.find(function (s) {
        return s.id === surahId;
      });
      if (!surah) throw new Error("Surah not found");

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

      var search = document.getElementById("surah-search");
      var count = document.getElementById("word-count");
      var empty = document.getElementById("word-empty");
      var rows = Array.from(listEl.querySelectorAll(".word-entry"));
      var searchable = words.map(function (word) {
        // Match both Uthmani spelling and a typed full alif, e.g. الْعَٰلَمِينَ / العالمين.
        return normalize(word.word + " " + word.word.replace(/\u0670/g, "ا") + " " + word.meaning);
      });
      search.disabled = false;

      function filterWords() {
        var q = normalize(search.value.trim());
        var matches = 0;
        rows.forEach(function (row, i) {
          var match = !q || searchable[i].indexOf(q) !== -1 || String(words[i].ayah) === q;
          row.hidden = !match;
          row.nextElementSibling.hidden = !match;
          if (match) matches++;
        });
        count.textContent = q ? matches + " من " + words.length + " كلمة" : words.length + " كلمة";
        empty.hidden = matches > 0;
      }

      search.addEventListener("input", filterWords);
      document.getElementById("clear-search").addEventListener("click", function () {
        search.value = "";
        filterWords();
        search.focus();
      });
      filterWords();

      var tabs = Array.from(document.querySelectorAll(".study-tab"));
      var reviewStarted = false;
      function selectTab(tab) {
        tabs.forEach(function (item) {
          var selected = item === tab;
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
          document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
        });
        if (tab.id === "review-tab" && !reviewStarted) {
          initFlashcards(flashcardContainer, words, surah.id);
          reviewStarted = true;
        }
      }
      tabs.forEach(function (tab, index) {
        tab.disabled = false;
        tab.addEventListener("click", function () { selectTab(tab); });
        tab.addEventListener("keydown", function (event) {
          var next;
          if (event.key === "ArrowLeft") next = (index + 1) % tabs.length;
          if (event.key === "ArrowRight") next = (index + tabs.length - 1) % tabs.length;
          if (event.key === "Home") next = 0;
          if (event.key === "End") next = tabs.length - 1;
          if (next === undefined) return;
          event.preventDefault();
          tabs[next].focus();
          selectTab(tabs[next]);
        });
      });

      // Search results and correction reports keep their original entry links.
      function revealLinkedWord() {
        if (!/^#word-\d+$/.test(window.location.hash)) return;
        var row = document.getElementById(window.location.hash.slice(1));
        if (!row) return;
        selectTab(tabs[0]);
        search.value = "";
        filterWords();
        row.scrollIntoView({ block: "center" });
      }
      window.addEventListener("hashchange", revealLinkedWord);
      revealLinkedWord();
    })
    .catch(function () {
      listEl.innerHTML = '<tr><td colspan="3" class="empty-state">تعذّر تحميل الكلمات. <button class="btn" type="button" id="retry-words">إعادة المحاولة</button></td></tr>';
      document.getElementById("word-count").textContent = "تعذّر التحميل";
      document.getElementById("retry-words").addEventListener("click", function () { window.location.reload(); });
    });
})();
