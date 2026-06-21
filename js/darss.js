(function () {
  var grid = document.getElementById("darss-table");

  function cardHtml(row) {
    var isTaken = !!row.presenter;
    var cardClass = isTaken ? "is-taken" : "is-available";
    var badge = isTaken ? "✓ تم اختياره" : "+ متاح";
    var presenterText = row.presenter || "بانتظار من يختاره";

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
      '<p class="darss-card-presenter">' +
      presenterText +
      "</p>" +
      "</div>"
    );
  }

  fetch("/data/darss.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      grid.innerHTML = data.rows.map(cardHtml).join("");
    });
})();
