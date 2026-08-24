(function () {
  var shelf = document.getElementById("library-shelf");

  function bookCard(book) {
    var link = document.createElement("a");
    link.className = "book-card";
    link.href = "/library/read.html?book=" + encodeURIComponent(book.id);
    link.setAttribute("aria-label", "قراءة " + book.title);

    var coverWrap = document.createElement("div");
    coverWrap.className = "book-cover-wrap";

    var cover = document.createElement("img");
    cover.className = "book-cover";
    cover.src = book.cover;
    cover.alt = "غلاف كتاب " + book.title;
    cover.loading = "lazy";
    cover.width = 320;
    cover.height = 460;
    coverWrap.appendChild(cover);

    var details = document.createElement("div");
    details.className = "book-details";

    var title = document.createElement("h2");
    title.textContent = book.title;

    var subtitle = document.createElement("p");
    subtitle.className = "book-subtitle";
    subtitle.textContent = book.subtitle;

    var meta = document.createElement("p");
    meta.className = "book-meta";
    meta.textContent = (book.author || book.publisher) + " • " + book.pages + " صفحة";

    details.appendChild(title);
    details.appendChild(subtitle);
    details.appendChild(meta);
    link.appendChild(coverWrap);
    link.appendChild(details);
    return link;
  }

  fetch("/data/library.json")
    .then(function (response) {
      if (!response.ok) throw new Error("تعذّر تحميل المكتبة");
      return response.json();
    })
    .then(function (data) {
      data.books.forEach(function (book) {
        shelf.appendChild(bookCard(book));
      });
    })
    .catch(function () {
      shelf.innerHTML = '<p class="empty-state">تعذّر تحميل الكتب حاليًا.</p>';
    });
})();
