// عجلة الأسماء: يدخل المستخدم أسماء (اسم في كل سطر)، وتختار العجلة واحدًا عشوائيًا
(function () {
  var textarea = document.getElementById("wheel-names");
  var canvas = document.getElementById("wheel-canvas");
  var spinBtn = document.getElementById("wheel-spin");
  var resultEl = document.getElementById("wheel-result");
  if (!textarea || !canvas || !spinBtn) return;

  var ctx = canvas.getContext("2d");
  var size = canvas.width;
  var center = size / 2;
  var radius = center - 6;

  var defaultNames = [
    "أحمد", "محمد", "عبدالله", "عمر", "علي", "يوسف", "إبراهيم", "خالد",
    "سعد", "فهد", "عبدالرحمن", "طارق", "حمزة", "أنس", "بلال", "سالم",
    "ياسر", "نواف", "فيصل", "تركي", "ماجد", "وليد", "زياد", "عمار",
    "حسام", "كريم", "رامي", "أيمن", "مالك", "سامي",
  ];

  if (!textarea.value.trim()) {
    textarea.value = defaultNames.join("\n");
  }

  var colors = ["#2f6f4f", "#c8a24a", "#234f39", "#a9762f", "#3f8a63", "#dcb96b"];
  var rotation = 0;
  var spinning = false;
  var currentNames = [];

  function getNames() {
    return textarea.value
      .split("\n")
      .map(function (n) { return n.trim(); })
      .filter(Boolean);
  }

  function drawWheel(names) {
    var n = names.length;
    ctx.clearRect(0, 0, size, size);
    if (!n) return;
    var slice = (Math.PI * 2) / n;

    for (var i = 0; i < n; i++) {
      var start = -Math.PI / 2 + i * slice;
      var end = start + slice;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "600 13px Tajawal, sans-serif";
      ctx.fillText(names[i], radius - 12, 5);
      ctx.restore();
    }
  }

  function spin() {
    if (spinning) return;
    currentNames = getNames();
    if (currentNames.length < 2) {
      resultEl.textContent = "أدخل اسمين على الأقل.";
      return;
    }
    drawWheel(currentNames);

    spinning = true;
    spinBtn.disabled = true;
    resultEl.textContent = "";

    var extraTurns = 4 + Math.floor(Math.random() * 3);
    var offset = Math.random() * 360;
    rotation += extraTurns * 360 + offset;

    canvas.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
    canvas.style.transform = "rotate(" + rotation + "deg)";
  }

  canvas.addEventListener("transitionend", function () {
    spinning = false;
    spinBtn.disabled = false;

    var slice = 360 / currentNames.length;
    var landed = ((360 - (rotation % 360)) % 360 + 360) % 360;
    var index = Math.floor(landed / slice) % currentNames.length;
    resultEl.textContent = "🎉 الاسم المختار: " + currentNames[index];
  });

  spinBtn.addEventListener("click", spin);

  drawWheel(getNames());
})();
