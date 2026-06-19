(function () {
  var tbody = document.getElementById("darss-rows");

  var statusInfo = {
    done: { icon: "✓", label: "تم" },
    next: { icon: "●", label: "القادم" },
    pending: { icon: "—", label: "لم يحدَّد" },
  };

  function rowHtml(row) {
    var info = statusInfo[row.status] || statusInfo.pending;
    var rowClass = row.status === "next" ? ' class="is-next"' : "";

    return (
      "<tr" +
      rowClass +
      ">" +
      "<td>" +
      row.sahabi +
      "</td>" +
      "<td>" +
      '<span class="status-tick ' +
      row.status +
      '">' +
      info.icon +
      "</span> " +
      info.label +
      "</td>" +
      "<td>" +
      (row.presenter || "—") +
      "</td>" +
      "</tr>"
    );
  }

  fetch("/data/darss.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      tbody.innerHTML = data.rows.map(rowHtml).join("");
    });
})();
