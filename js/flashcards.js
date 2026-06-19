// مكوّن بطاقات مراجعة على غرار Anki (خوارزمية SM-2) لقائمة كلمات {word, meaning, ayah}
// تُحفظ بيانات المراجعة محليًا في متصفح المستخدم (localStorage)
function initFlashcards(container, words, deckId) {
  if (!words || !words.length) return;

  var ayahs = words.map(function (w) { return w.ayah; });
  var minAyah = Math.min.apply(null, ayahs);
  var maxAyah = Math.max.apply(null, ayahs);

  var range = { from: minAyah, to: maxAyah };

  function filteredWords() {
    return words.filter(function (w) { return w.ayah >= range.from && w.ayah <= range.to; });
  }

  function launch(subset) {
    initSession(container, subset, deckId, range, minAyah, maxAyah, function (f, t) {
      range.from = f;
      range.to = t;
      launch(filteredWords());
    });
  }

  launch(filteredWords());
}

function initSession(container, words, deckId, range, minAyah, maxAyah, onApply) {
  var STORAGE_KEY = "gharib-srs";

  var allSRS = {};
  try {
    allSRS = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    allSRS = {};
  }
  var deckSRS = allSRS[deckId] || {};

  function saveDeck() {
    allSRS[deckId] = deckSRS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSRS));
  }

  var currentSession = (deckSRS.session || 0) + 1;
  deckSRS.session = currentSession;
  saveDeck();

  function getCard(i) {
    return deckSRS[i] || { ease: 2.5, interval: 0, reps: 0, due: 0 };
  }

  function rateCard(i, grade) {
    var c = getCard(i);
    if (grade === 0) {
      c.reps = 0;
      c.interval = 1;
      c.ease = Math.max(1.3, c.ease - 0.2);
    } else {
      if (grade === 1) {
        c.ease = Math.max(1.3, c.ease - 0.15);
        c.interval = Math.max(1, Math.round((c.interval || 1) * 1.2));
      } else if (grade === 2) {
        c.interval =
          c.reps === 0 ? 1 : c.reps === 1 ? 6 : Math.round(c.interval * c.ease);
      } else {
        c.ease = c.ease + 0.15;
        var base = c.reps === 0 ? 1 : c.reps === 1 ? 6 : c.interval * c.ease;
        c.interval = Math.round(base * 1.3);
      }
      c.reps += 1;
    }
    c.due = currentSession + c.interval;
    deckSRS[i] = c;
    saveDeck();
  }

  function buildQueue(includeAll) {
    var indices = (words || []).map(function (_, i) { return i; });
    if (includeAll) return indices;
    return indices
      .filter(function (i) { return getCard(i).due <= currentSession; })
      .sort(function (a, b) { return getCard(a).due - getCard(b).due; });
  }

  var queue = words && words.length ? buildQueue(false) : [];
  var pos = 0;
  var showingBack = false;
  var sessionGrades = [];

  function rangeToolbarHtml() {
    return (
      '<div class="fc-range-filter">' +
      '<span>من الآية</span>' +
      '<input type="number" id="fc-from" value="' + range.from + '" min="' + minAyah + '" max="' + maxAyah + '">' +
      '<span>إلى</span>' +
      '<input type="number" id="fc-to" value="' + range.to + '" min="' + minAyah + '" max="' + maxAyah + '">' +
      '<button class="btn btn-sm" id="fc-apply">تطبيق</button>' +
      '</div>'
    );
  }

  function bindRangeApply() {
    var btn = container.querySelector('#fc-apply');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = parseInt(container.querySelector('#fc-from').value, 10) || minAyah;
      var t = parseInt(container.querySelector('#fc-to').value, 10) || maxAyah;
      if (onApply) onApply(Math.min(f, t), Math.max(f, t));
    });
  }

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function toggleFullscreen() {
    if (isFullscreen()) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      var req = container.requestFullscreen || container.webkitRequestFullscreen;
      if (req) req.call(container);
    }
  }

  function renderShell() {
    container.innerHTML =
      '<div class="flashcard-stage">' +
      '<div class="flashcard-toolbar">' +
      rangeToolbarHtml() +
      '<button class="btn" id="fc-fullscreen">ملء الشاشة</button>' +
      '</div>' +
      '<div class="flashcard is-front" id="fc-card">' +
      '<div class="fc-card-body">' +
      '<div class="face-content" id="fc-content"></div>' +
      '<div class="card-hint">اضغط على البطاقة لكشف الجواب</div>' +
      '</div>' +
      '<div class="flashcard-rating" id="fc-rating" hidden>' +
      '<button class="btn btn-again" data-grade="0">لم أتذكر</button>' +
      '<button class="btn btn-hard" data-grade="1">صعب</button>' +
      '<button class="btn btn-good" data-grade="2">جيد</button>' +
      '<button class="btn btn-easy" data-grade="3">سهل</button>' +
      '</div>' +
      '</div>' +
      '<div class="flashcard-progress" id="fc-progress" dir="ltr"></div>' +
      '</div>';

    container.querySelector('#fc-fullscreen').addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', updateFullscreenLabel);
    document.addEventListener('webkitfullscreenchange', updateFullscreenLabel);
    updateFullscreenLabel();
    bindRangeApply();
  }

  function updateFullscreenLabel() {
    var btn = container.querySelector('#fc-fullscreen');
    if (!btn) return;
    btn.textContent = isFullscreen() ? 'تصغير الشاشة' : 'ملء الشاشة';
  }

  function renderMessage(text, buttonText, onClick) {
    container.innerHTML =
      '<div class="flashcard-stage">' +
      '<div class="flashcard-toolbar">' + rangeToolbarHtml() + '</div>' +
      '<p class="empty-state">' + text + '</p>' +
      '<button class="btn btn-primary" id="fc-action">' + buttonText + '</button>' +
      '</div>';
    container.querySelector('#fc-action').addEventListener('click', onClick);
    bindRangeApply();
  }

  function renderCard() {
    var cardEl = container.querySelector('#fc-card');
    var contentEl = container.querySelector('#fc-content');
    var ratingEl = container.querySelector('#fc-rating');
    var progressEl = container.querySelector('#fc-progress');

    var item = words[queue[pos]];
    showingBack = false;

    cardEl.classList.add('is-front');
    cardEl.classList.remove('is-back');
    contentEl.textContent = item.word;
    ratingEl.hidden = true;
    progressEl.textContent = (pos + 1) + ' / ' + queue.length;
  }

  function showBack() {
    var cardEl = container.querySelector('#fc-card');
    var contentEl = container.querySelector('#fc-content');
    var ratingEl = container.querySelector('#fc-rating');

    var item = words[queue[pos]];
    showingBack = true;

    cardEl.classList.remove('is-front');
    cardEl.classList.add('is-back');
    contentEl.textContent = item.meaning;
    ratingEl.hidden = false;
  }

  function computeScore(grades) {
    if (!grades.length) return 100;
    var weights = [0, 0.5, 0.75, 1.0];
    var total = grades.reduce(function (sum, g) { return sum + weights[g]; }, 0);
    return Math.round((total / grades.length) * 100);
  }

  function scoreMessage(score) {
    if (score === 100) return 'ممتاز! أتقنت جميع الكلمات.';
    if (score >= 80) return 'أحسنت! أداء رائع، استمر في المراجعة.';
    if (score >= 60) return 'جيد! كرر المراجعة لترسيخ الكلمات الصعبة.';
    return 'لا تستسلم! التكرار هو مفتاح الحفظ.';
  }

  function renderEndScreen() {
    var score = computeScore(sessionGrades);
    var msg = scoreMessage(score);
    var scoreColor = score >= 80 ? '#27ae60' : score >= 60 ? '#e67e22' : '#e74c3c';
    container.innerHTML =
      '<div class="flashcard-stage fc-end-screen">' +
      '<div class="flashcard-toolbar">' + rangeToolbarHtml() + '</div>' +
      '<div class="fc-score" style="color:' + scoreColor + '">' + score + '%</div>' +
      '<p class="fc-score-label">نتيجة الجلسة</p>' +
      '<p class="fc-score-msg">' + msg + '</p>' +
      '<button class="btn btn-primary" id="fc-restart">مراجعة الكل من جديد</button>' +
      '</div>';
    container.querySelector('#fc-restart').addEventListener('click', function () {
      sessionGrades = [];
      queue = buildQueue(true);
      pos = 0;
      renderShell();
      renderCard();
      bindCardEvents();
    });
    bindRangeApply();
  }

  function advance(grade) {
    sessionGrades.push(grade);
    rateCard(queue[pos], grade);
    if (grade === 0 || grade === 1) {
      queue.push(queue[pos]);
    }
    pos += 1;
    if (pos >= queue.length) {
      renderEndScreen();
      return;
    }
    renderCard();
  }

  function bindCardEvents() {
    container.querySelector('#fc-card').addEventListener('click', function () {
      if (!showingBack) {
        showBack();
      } else {
        advance(2);
      }
    });

    container.querySelectorAll('#fc-rating button').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        advance(parseInt(btn.getAttribute('data-grade'), 10));
      });
    });
  }

  if (!words || !words.length) {
    renderMessage(
      'لا توجد كلمات في هذا النطاق.',
      'إعادة ضبط النطاق',
      function () { if (onApply) onApply(minAyah, maxAyah); }
    );
    return;
  }

  if (!queue.length) {
    renderMessage(
      'لا توجد كلمات بحاجة للمراجعة الآن.',
      'مراجعة الكل الآن',
      function () {
        queue = buildQueue(true);
        pos = 0;
        renderShell();
        renderCard();
        bindCardEvents();
      }
    );
    return;
  }

  renderShell();
  renderCard();
  bindCardEvents();
}
