
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Rasaloka — jelajahi kuliner dan budaya Indonesia.">
  <title>Rasaloka — Discover Indonesia</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?php echo e(asset('css/style.css')); ?>">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="#home" aria-label="Rasaloka Home">
      <span class="brand-mark">R</span>
      <span>rasa<span class="brand-accent">loka</span><small>DISCOVER INDONESIA</small></span>
    </a>

    <button
      type="button"
      class="menu-toggle"
      id="menuToggle"
      aria-label="Buka menu"
      aria-expanded="false"
      onclick="
        const nav = document.getElementById('navMenu');
        const opened = nav.classList.toggle('open');
        this.textContent = opened ? '✕' : '☰';
        this.setAttribute('aria-expanded', String(opened));
      "
    >☰</button>

    <nav id="navMenu">
      <a href="#home" data-i18n="home">Beranda</a>
      <a href="#explore" data-i18n="explore">Jelajahi</a>
      <a href="#food" data-i18n="food">Kuliner</a>
      <a href="#culture" data-i18n="culture">Budaya</a>
      <a href="#favorites" class="nav-favorite"><span data-i18n="favorites">♡ Favorit</span> <span id="favoriteCount">0</span></a>
      <select id="languageSelect" aria-label="Pilih bahasa">
        <option value="id">ID</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
        <option value="zh">中文</option>
        <option value="ko">한국어</option>
        <option value="ja">日本語</option>
      </select>
    </nav>
  </header>

  <main>
    <section class="hero" id="home">
      <div class="hero-blob hero-blob-one" aria-hidden="true"></div>
      <div class="hero-blob hero-blob-two" aria-hidden="true"></div>
      <div class="hero-blob hero-blob-three" aria-hidden="true"></div>
      <div class="hero-content">
        <span class="eyebrow" data-i18n="heroEyebrow"><span class="eyebrow-dot"></span> CERITA DARI NUSANTARA</span>
        <h1 class="playful-title">
          <span>Indonesia punya</span>
          <span>sejuta <em>cerita.</em></span>
          <span class="title-sparkle" aria-hidden="true">✳</span>
        </h1>
        <p data-i18n="heroDesc">Temukan cita rasa, jejak budaya, dan tempat-tempat istimewa yang membuat Indonesia begitu kaya.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#explore"><span data-i18n="startExplore">Mulai menjelajah</span> <span>↗</span></a>
          <a class="button button-ghost" href="#culture" data-i18n="knowCulture">Kenali budayanya</a>
        </div>
        <div class="hero-note">
          <span class="note-icon">✦</span>
          <span><span data-i18n="heroNote">Dari makanan lokal hingga warisan budaya.</span><br><strong data-i18n="heroNoteStrong">Jelajahi Indonesia dengan cara berbeda.</strong></span>
        </div>
      </div>
      <div class="hero-visual">
        <img src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1100&q=85" alt="Pemandangan tropis Indonesia">
        <div class="image-label">
          <span>01 / NUSANTARA</span>
          <strong data-i18n="imageLabel">Keindahan yang tak ada habisnya.</strong>
        </div>
        <div class="floating-stamp">LOCAL<br>STORIES<br><span>✳</span></div>
      </div>
      <div class="hero-bottom"><span>01 — 06</span><span>RASA · BUDAYA</span><span data-i18n="scrollExplore">SCROLL TO EXPLORE ↓</span></div>
    </section>

    <section class="intro section" id="explore">
      <div class="section-heading">
        <span class="eyebrow" data-i18n="introEyebrow">YOUR LOCAL GUIDE</span>
        <h2><span data-i18n="introTitle">Jelajah lebih dekat,<br><em>kenal lebih dalam.</em></span></h2>
      </div>
      <p class="intro-copy" data-i18n="introDesc">Rasaloka mengajakmu mengenal Indonesia lewat pengalaman lokal, rekomendasi tempat, serta cerita di balik setiap tradisi.</p>
    </section>

    <section class="culture-banner">
      <div>
        <span class="eyebrow" data-i18n="bannerEyebrow">BEYOND THE SURFACE</span>
        <h2><span data-i18n="bannerTitle">Budaya bukan sekadar<br>untuk dilihat, <em>tapi dipahami.</em></span></h2>
      </div>
      <p data-i18n="bannerDesc">Kenali tradisi, kunjungi museum, temukan koleksi perpustakaan, dan belajar langsung dari pusat kebudayaan.</p>
    </section>

    <section class="content-section section" id="food">
      <div class="section-top">
        <div>
          <span class="eyebrow" data-i18n="foodEyebrow">01 — FOOD & FLAVOUR</span>
          <h2><span data-i18n="foodTitle">Rasa yang <em>dirindukan.</em></span></h2>
        </div>
        <a class="text-link" href="#allContent" data-filter-link="kuliner" data-i18n="allFood">Lihat semua kuliner ↗</a>
      </div>
      <p class="section-description" data-i18n="foodDesc">Temukan hidangan khas, asal-usulnya, dan lokasi tempat kamu bisa mencicipinya.</p>
      <div class="filter-row">
        <label class="search-box"><span>⌕</span><input id="searchInput" type="search" data-i18n-placeholder="searchPlaceholder" placeholder="Cari makanan, budaya, atau daerah..."></label>
        <select id="regionFilter" aria-label="Filter daerah">
          <option value="" data-i18n="allRegions">Semua daerah</option>
          <option>Aceh</option><option>Sumatera Barat</option><option>Sumatera Selatan</option>
          <option>DKI Jakarta</option><option>Jawa Barat</option><option>Jawa Tengah</option>
          <option>Bali</option><option>Papua</option><option>Sulawesi Selatan</option>
        </select>
      </div>
      <div class="content-grid" id="foodGrid"></div>
    </section>

    <section class="content-section section" id="culture">
      <div class="section-top">
        <div>
          <span class="eyebrow" data-i18n="cultureEyebrow">02 — CULTURE & HERITAGE</span>
          <h2><span data-i18n="cultureTitle">Warisan yang <em>hidup.</em></span></h2>
        </div>
        <a class="text-link" href="#allContent" data-filter-link="budaya" data-i18n="allCulture">Lihat semua budaya ↗</a>
      </div>
      <p class="section-description" data-i18n="cultureDesc">Setiap tradisi menyimpan pengetahuan. Mulai perjalananmu dengan membaca, berkunjung, dan belajar.</p>
      <div class="content-grid" id="cultureGrid"></div>
    </section>

    <section class="all-section section" id="allContent">
      <div class="section-top">
        <div>
          <span class="eyebrow" data-i18n="allEyebrow">THE WHOLE ARCHIVE</span>
          <h2 data-i18n="allTitle">Jelajahi semuanya.</h2>
        </div>
        <span class="section-index">ALL STORIES</span>
      </div>
      <div class="filter-row">
        <label class="search-box"><span>⌕</span><input id="allSearchInput" type="search" data-i18n-placeholder="allSearchPlaceholder" placeholder="Cari cerita atau daerah..."></label>
        <select id="categoryFilter" aria-label="Filter kategori">
          <option value="" data-i18n="allCategories">Semua kategori</option>
          <option value="kuliner" data-i18n="food">Kuliner</option>
          <option value="budaya" data-i18n="culture">Budaya</option>
        </select>
      </div>
      <div class="content-grid" id="allGrid"></div>
      <p class="empty-state" id="noResults" hidden data-i18n="noResults">Belum ada cerita yang cocok. Coba kata kunci lain.</p>
    </section>

    <section class="favorites-section section" id="favorites">
      <div class="section-top">
        <div>
          <span class="eyebrow" data-i18n="favoritesEyebrow">YOUR PERSONAL COLLECTION</span>
          <h2><span data-i18n="favoritesTitle">Yang kamu <em>simpan.</em></span></h2>
        </div>
        <span class="section-index">♡ FAVORITES</span>
      </div>
      <p class="section-description" data-i18n="favoritesDesc">Kumpulan kuliner dan budaya yang ingin kamu kunjungi atau pelajari lagi.</p>
      <div class="content-grid" id="favoritesGrid"></div>
      <p class="empty-state" id="emptyFavorites" data-i18n="emptyFavorites">Belum ada favorit. Tekan ikon hati pada kartu untuk menyimpan cerita.</p>
    </section>

    <section class="about-section">
      <div class="about-mark">R.</div>
      <div>
        <span class="eyebrow" data-i18n="aboutEyebrow">ABOUT RASALOKA</span>
        <h2><span data-i18n="aboutTitle">Merayakan Indonesia,<br><em>satu cerita dalam satu waktu.</em></span></h2>
      </div>
      <p data-i18n="aboutDesc">Rasaloka adalah panduan digital untuk menjelajahi kuliner dan budaya Indonesia. Kami ingin membantu pengunjung menemukan tempat yang tepat, sekaligus memahami cerita di baliknya.</p>
    </section>
  </main>

  <footer class="site-footer">
    <a class="brand footer-brand" href="#home"><span class="brand-mark">R</span><span>rasa<span class="brand-accent">loka</span><small>DISCOVER INDONESIA</small></span></a>
    <p><span data-i18n="footerText">Made to celebrate local stories.</span> © <span id="year"></span> Rasaloka.</p>
    <a href="#home" data-i18n="backToTop">Kembali ke atas ↑</a>
  </footer>

  <dialog id="detailDialog" class="detail-dialog">
    <button class="dialog-close" id="closeDialog" aria-label="Tutup">×</button>
    <div id="detailContent"></div>
  </dialog>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="<?php echo e(asset('js/script.js')); ?>"></script>
</body>
</html><?php /**PATH D:\RasaLoka_Laravel\resources\views/home.blade.php ENDPATH**/ ?>