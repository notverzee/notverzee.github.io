/* ══════════════════════════════════════════════════════════════════
   TWECHON.COM — NEWS SYSTEM
   Shared by every page's header bell, the homepage banner, the /News/
   archive page, and /Dev/'s news creator. Loaded via:
     <script src="/news-common.js"></script>
   There's no backend here (this is a static GitHub Pages site), so
   "publishing" news means: fill in the form on /Dev/, download the
   zip it generates, and upload those files over your site. See
   /assets/news/README.txt for the exact file layout.
══════════════════════════════════════════════════════════════════ */

/* ── Config ──
   Passcode for /Dev/. Anyone can read this straight out of this file's
   source, so it only keeps casual visitors out — not a real login. */
var DEV_PASSCODE = 'twechon-dev';
var NEWS_ARCHIVE_URL = '/assets/news/news-archive.json';

/* ── Dev Mode unlock (sessionStorage — clears when the tab closes) ── */
var DEV_SESSION_KEY = 'twechon_news_dev_unlocked';
function isDevUnlocked() { return sessionStorage.getItem(DEV_SESSION_KEY) === '1'; }
function unlockDev(passcode) {
  if (passcode !== DEV_PASSCODE) return false;
  sessionStorage.setItem(DEV_SESSION_KEY, '1');
  return true;
}
function lockDev() { sessionStorage.removeItem(DEV_SESSION_KEY); }

/* ── Load the news archive ──
   Returns every published article, newest first. This file grows by
   one entry every time something is published — that full history is
   what powers the /News/ "previously published" tab, while the bell
   and homepage banner just show the first 3 of this same list. */
function loadNewsArchive(callback) {
  fetch(NEWS_ARCHIVE_URL, { cache: 'no-store' })
    .then(function(r) { if (!r.ok) throw new Error('missing'); return r.json(); })
    .then(function(data) {
      var items = Array.isArray(data) ? data.slice() : [];
      items.sort(function(a, b) { return (b.id || 0) - (a.id || 0); });
      callback(items);
    })
    .catch(function() { callback([]); });
}

function formatNewsDate(iso) {
  if (!iso) return '';
  try {
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return ''; }
}

/* ══════════════════════════════════════════════════════════
   HEADER NOTIFICATION BELL — call once per page, after the bell
   button/dropdown markup exists in the DOM (#header-bell-btn,
   #header-bell-dot, #notification-dropdown).
══════════════════════════════════════════════════════════ */
function initNewsBell() {
  var bellBtn = document.getElementById('header-bell-btn');
  var bellDot = document.getElementById('header-bell-dot');
  var dropdown = document.getElementById('notification-dropdown');
  if (!bellBtn || !dropdown) return;

  bellBtn.addEventListener('click', function(e) { e.stopPropagation(); dropdown.classList.toggle('open'); });
  dropdown.addEventListener('click', function(e) { e.stopPropagation(); });
  document.addEventListener('click', function() { dropdown.classList.remove('open'); });

  loadNewsArchive(function(items) {
    var latest = items.slice(0, 3);
    if (!latest.length) {
      dropdown.innerHTML = '<div class="notification-empty">No news posted yet.</div>';
      return;
    }
    if (bellDot) bellDot.classList.add('show');
    dropdown.innerHTML = '';
    latest.forEach(function(item) {
      var a = document.createElement('a');
      a.className = 'notification-item';
      a.href = item.permalink;
      var safeTitle = (item.title || '').replace(/"/g, '&quot;');
      a.innerHTML =
        '<div class="notification-thumb"><img src="' + item.image + '" alt="' + safeTitle + '"></div>' +
        '<div class="notification-text"><div class="notification-title"></div><div class="notification-desc"></div></div>';
      a.querySelector('.notification-title').textContent = item.title;
      a.querySelector('.notification-desc').textContent = item.shortDescription;
      dropdown.appendChild(a);
    });
  });
}

/* ══════════════════════════════════════════════════════════
   HOMEPAGE NEWS BANNER — call once on Home/index.html, after
   #news-hero exists in the DOM.
══════════════════════════════════════════════════════════ */
function initNewsBanner() {
  var heroEl = document.getElementById('news-hero');
  if (!heroEl) return;

  loadNewsArchive(function(items) {
    var slides = items.slice(0, 3);
    if (!slides.length) {
      heroEl.innerHTML = '<div class="news-hero-empty">No news posted yet — publish one from <a href="/Dev/">Developer Mode</a> to fill this banner.</div>';
      return;
    }

    heroEl.innerHTML = '';
    var slideIndex = 0;
    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'news-hero-dots';

    var slideEls = slides.map(function(item, i) {
      var slide = document.createElement('div');
      slide.className = 'news-hero-slide' + (i === 0 ? ' active' : '');
      var safeTitle = (item.title || '').replace(/"/g, '&quot;');
      slide.innerHTML =
        '<img src="' + item.image + '" alt="' + safeTitle + '">' +
        '<div class="news-hero-fade"></div>' +
        '<div class="news-hero-content">' +
          (i === 0 ? '<div class="news-hero-eyebrow">Latest Update</div>' : '<div class="news-hero-eyebrow">News</div>') +
          '<div class="news-hero-title"></div>' +
          '<div class="news-hero-desc"></div>' +
          '<a class="news-hero-btn" href="' + item.permalink + '">Read More <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 18l6-6-6-6"/></svg></a>' +
        '</div>';
      slide.querySelector('.news-hero-title').textContent = item.title;
      slide.querySelector('.news-hero-desc').textContent = item.shortDescription;
      heroEl.appendChild(slide);
      return slide;
    });

    if (slides.length > 1) {
      slides.forEach(function(item, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'news-hero-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Show news item ' + (i + 1));
        dot.addEventListener('click', function() { showSlide(i); resetTimer(); });
        dotsWrap.appendChild(dot);
      });
      heroEl.appendChild(dotsWrap);
    }

    var timer = null;
    function showSlide(i) {
      slideEls[slideIndex].classList.remove('active');
      dotsWrap.children[slideIndex] && dotsWrap.children[slideIndex].classList.remove('active');
      slideIndex = i;
      slideEls[slideIndex].classList.add('active');
      dotsWrap.children[slideIndex] && dotsWrap.children[slideIndex].classList.add('active');
    }
    function resetTimer() {
      if (timer) clearInterval(timer);
      if (slides.length > 1) timer = setInterval(function() { showSlide((slideIndex + 1) % slides.length); }, 7000);
    }
    resetTimer();
  });
}
