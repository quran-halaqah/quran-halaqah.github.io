(function () {
  var grid = document.getElementById("darss-table");

  function cardHtml(row) {
    var isTaken = !!row.presenter;
    var cardClass = isTaken ? "is-taken" : "is-available";
    var badge = isTaken ? "✓ تم اختياره" : "+ متاح";
    var presenterHtml = row.presenter
      ? '<p class="darss-card-presenter">' + row.presenter + "</p>"
      : "";

    return (
      '<div class="darss-card ' +
      cardClass +
      '">' +
      '<span class="darss-card-badge">' +
      badge +
      "</span>" +
      '<p class="darss-card-name">' +
      row.sahabi +
      "</p>" +
      presenterHtml +
      "</div>"
    );
  }

  fetch("/data/darss.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      var rows = data.rows.slice().sort(function (a, b) {
        return !!a.presenter - !!b.presenter;
      });
      grid.innerHTML = rows.map(cardHtml).join("");
    });
})();
