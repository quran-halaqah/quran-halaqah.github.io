(function () {
  var params = new URLSearchParams(window.location.search);
  var bookId = params.get("book");
  var reader = document.getElementById("pdf-frame");
  var errorBox = document.getElementById("reader-error");

  function showError() {
    document.getElementById("reader-content").hidden = true;
    errorBox.hidden = false;
  }

  if (!bookId) {
    showError();
    return;
  }

  fetch("/data/library.json")
    .then(function (response) {
      if (!response.ok) throw new Error("تعذّر تحميل المكتبة");
      return response.json();
    })
    .then(function (data) {
      var book = data.books.find(function (item) {
        return item.id === bookId;
      });
      if (!book) throw new Error("الكتاب غير موجود");

      document.title = book.title + " | المكتبة";
      document.getElementById("reader-book-title").textContent = book.title;
      document.getElementById("reader-book-subtitle").textContent = book.subtitle;
      document.getElementById("reader-direct-link").href = book.file;
      document.getElementById("reader-download-link").href = book.file;
      document.getElementById("reader-fallback-link").href = book.file;
      reader.title = "قراءة كتاب " + book.title;
      reader.src = book.file + "#page=1&view=FitH";
    })
    .catch(showError);
})();
