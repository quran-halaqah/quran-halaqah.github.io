(function () {
  var grid = document.getElementById("darss-table");

  function cardHtml(row) {
    var isDone = row.status === "done";
    var isTaken = isDone || !!row.presenter;
    var cardClass = isTaken ? "is-taken" : "is-available";
    var badge = isDone ? "✓ تم إنجازه" : isTaken ? "✓ تم اختياره" : "+ متاح";
    var presenterText = row.presenter || (isDone ? "انتهى الدرس" : "");
    var presenterHtml = presenterText
      ? '<p class="darss-card-presenter">' + presenterText + "</p>"
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
