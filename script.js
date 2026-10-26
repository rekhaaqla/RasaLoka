
/* =========================================
   RASALOKA — WEBSITE INTERACTIONS
   ========================================= */

/* 1. SUPABASE CONFIGURATION */

const SUPABASE_URL = "https://vzrmpnvygqpiivlogsie.supabase.co";
const SUPABASE_KEY = "sb_publishable_0SL-z7GDZdmn10raKjK_0A_pMmoEs99";

const supabaseReady =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_KEY.length > 20 &&
  typeof window.supabase !== "undefined";

const supabaseClient = supabaseReady
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const $ = selector => document.querySelector(selector);

let items = [];
let activeDetailId = null;
let toastTimeout = null;

const FAVORITES_KEY = "rasaloka_favorites_v1";

/* 2. NORMALIZE CATEGORY */

function normalizeCategory(category) {
  const value = String(category || "")
    .trim()
    .toLocaleLowerCase("id-ID");

  const categoryMap = {
    kuliner: "kuliner",
    food: "kuliner",
    makanan: "kuliner",

    budaya: "budaya",
    culture: "budaya",

    destinasi: "destinasi",
    destination: "destinasi"
  };

  return categoryMap[value] || value;
}

/* 3. DEMO DATA */

const demoItems = [];

/* 4. LANGUAGE */

const translations = {
  id: {
    home: "Beranda",
    explore: "Jelajahi",
    food: "Kuliner",
    culture: "Budaya",
    search: "Cari makanan, budaya, atau daerah...",
    allSearch: "Cari cerita atau daerah...",
    allRegions: "Semua daerah",
    allCategories: "Semua kategori",
    favorite: "Favorit",
    readMore: "Lihat cerita ↗",
    openMaps: "Buka Google Maps ↗",
    foodRating: "Rating makanan",
    placeRating: "Rating tempat",
    noRating: "Belum tersedia",
    noResults: "Belum ada cerita yang cocok. Coba kata kunci lain.",
    emptyFavorites: "Belum ada favorit. Tekan ikon hati pada kartu untuk menyimpan cerita.",
    saved: "Ditambahkan ke favorit",
    removed: "Dihapus dari favorit",
    venues: "Tempat untuk dikunjungi dan belajar",
    address: "Lokasi",
    venueRestaurant: "Kedai / restoran",
    venueMuseum: "Museum",
    venueLibrary: "Perpustakaan",
    venueCulture: "Pusat kebudayaan",
    openWebsite: "Situs resmi ↗",
    close: "Tutup"
  },
  en: {
    home: "Home",
    explore: "Explore",
    food: "Food",
    culture: "Culture",
    search: "Search food, culture, or region...",
    allSearch: "Search stories or regions...",
    allRegions: "All regions",
    allCategories: "All categories",
    favorite: "Favorites",
    readMore: "Read story ↗",
    openMaps: "Open Google Maps ↗",
    foodRating: "Food rating",
    placeRating: "Place rating",
    noRating: "Not available",
    noResults: "No matching stories. Try another keyword.",
    emptyFavorites: "No favorites yet. Tap a heart to save a story.",
    saved: "Added to favorites",
    removed: "Removed from favorites",
    venues: "Places to visit and learn",
    address: "Location",
    venueRestaurant: "Restaurant",
    venueMuseum: "Museum",
    venueLibrary: "Library",
    venueCulture: "Cultural center",
    openWebsite: "Official website ↗",
    close: "Close"
  },
  es: {
    home: "Inicio",
    explore: "Explorar",
    food: "Comida",
    culture: "Cultura",
    search: "Buscar comida, cultura o región...",
    allSearch: "Buscar historias o regiones...",
    allRegions: "Todas las regiones",
    allCategories: "Todas las categorías",
    favorite: "Favoritos",
    readMore: "Ver historia ↗",
    openMaps: "Abrir Google Maps ↗",
    foodRating: "Valoración de comida",
    placeRating: "Valoración del lugar",
    noRating: "No disponible",
    noResults: "No hay resultados. Prueba otra palabra.",
    emptyFavorites: "Aún no hay favoritos. Pulsa el corazón para guardar.",
    saved: "Añadido a favoritos",
    removed: "Eliminado de favoritos",
    venues: "Lugares para visitar y aprender",
    address: "Ubicación",
    venueRestaurant: "Restaurante",
    venueMuseum: "Museo",
    venueLibrary: "Biblioteca",
    venueCulture: "Centro cultural",
    openWebsite: "Sitio oficial ↗",
    close: "Cerrar"
  },
  zh: {
    home: "首页",
    explore: "探索",
    food: "美食",
    culture: "文化",
    search: "搜索美食、文化或地区...",
    allSearch: "搜索故事或地区...",
    allRegions: "所有地区",
    allCategories: "所有类别",
    favorite: "收藏",
    readMore: "查看故事 ↗",
    openMaps: "打开谷歌地图 ↗",
    foodRating: "美食评分",
    placeRating: "地点评分",
    noRating: "暂无评分",
    noResults: "没有找到相关内容，请尝试其他关键词。",
    emptyFavorites: "还没有收藏内容。点击爱心即可收藏。",
    saved: "已添加到收藏",
    removed: "已从收藏中移除",
    venues: "参观与学习地点",
    address: "地点",
    venueRestaurant: "餐厅",
    venueMuseum: "博物馆",
    venueLibrary: "图书馆",
    venueCulture: "文化中心",
    openWebsite: "官方网站 ↗",
    close: "关闭"
  },
  ko: {
    home: "홈",
    explore: "탐색",
    food: "음식",
    culture: "문화",
    search: "음식, 문화 또는 지역 검색...",
    allSearch: "이야기 또는 지역 검색...",
    allRegions: "모든 지역",
    allCategories: "모든 카테고리",
    favorite: "즐겨찾기",
    readMore: "이야기 보기 ↗",
    openMaps: "Google 지도 열기 ↗",
    foodRating: "음식 평점",
    placeRating: "장소 평점",
    noRating: "정보 없음",
    noResults: "검색 결과가 없습니다.",
    emptyFavorites: "아직 즐겨찾기가 없습니다.",
    saved: "즐겨찾기에 추가됨",
    removed: "즐겨찾기에서 삭제됨",
    venues: "방문 및 학습 장소",
    address: "위치",
    venueRestaurant: "식당",
    venueMuseum: "박물관",
    venueLibrary: "도서관",
    venueCulture: "문화 센터",
    openWebsite: "공식 웹사이트 ↗",
    close: "닫기"
  },
  ja: {
    home: "ホーム",
    explore: "探す",
    food: "料理",
    culture: "文化",
    search: "料理・文化・地域を検索...",
    allSearch: "物語や地域を検索...",
    allRegions: "すべての地域",
    allCategories: "すべてのカテゴリー",
    favorite: "お気に入り",
    readMore: "ストーリーを見る ↗",
    openMaps: "Google マップを開く ↗",
    foodRating: "料理の評価",
    placeRating: "場所の評価",
    noRating: "評価なし",
    noResults: "一致する内容がありません。",
    emptyFavorites: "お気に入りはまだありません。",
    saved: "お気に入りに追加しました",
    removed: "お気に入りから削除しました",
    venues: "訪問・学習できる場所",
    address: "場所",
    venueRestaurant: "レストラン",
    venueMuseum: "博物館",
    venueLibrary: "図書館",
    venueCulture: "文化センター",
    openWebsite: "公式サイト ↗",
    close: "閉じる"
  }
};

let currentLanguage = localStorage.getItem("rasaloka_language") || "id";

function t(key) {
  return translations[currentLanguage]?.[key] ||
    translations.id[key] ||
    key;
}

/* 5. HELPERS */

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getFavorites() {
  try {
    const value = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]"
    );

    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(favorites)
  );

  renderAll();
}

function toggleFavorite(id) {
  const key = String(id);
  const favorites = getFavorites();
  const exists = favorites.includes(key);

  const updated = exists
    ? favorites.filter(item => item !== key)
    : [...favorites, key];

  saveFavorites(updated);
  showToast(exists ? t("removed") : t("saved"));
}

function googleMapsURL(address, title = "") {
  const query = [title, address].filter(Boolean).join(", ");

  return "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(query || "Indonesia");
}

function getMapsURL(place) {
  if (place.maps_url && /^https?:\/\//i.test(place.maps_url)) {
    return place.maps_url;
  }

  if (place.latitude != null && place.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  }

  return googleMapsURL(
    place.address || place.region,
    place.name || place.title
  );
}

function formatRating(value) {
  const number = Number(value);

  return value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(number)
    ? number.toFixed(1)
    : null;
}

function ratingChip(label, value) {
  const rating = formatRating(value);

  return `
    <span class="rating-chip">
      <span class="star">★</span>
      <span>${escapeHTML(label)}</span>
      <b>${rating || escapeHTML(t("noRating"))}</b>
    </span>
  `;
}

function categoryLabel(category) {
  const normalized = normalizeCategory(category);

  const labels = {
    kuliner: "KULINER",
    budaya: "BUDAYA",
    destinasi: "DESTINASI"
  };

  return labels[normalized] ||
    String(category || "CERITA").toUpperCase();
}

function getSearchText(item) {
  return [
    item.title,
    item.category,
    item.region,
    item.address,
    item.description
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("id-ID");
}

function matchesSearch(item, query) {
  return getSearchText(item).includes(
    query.trim().toLocaleLowerCase("id-ID")
  );
}

function renderGrid(selector, data) {
  const element = $(selector);
  if (!element) return;

  element.innerHTML = data.length
    ? data.map(cardHTML).join("")
    : "";
}

/* 6. CONTENT CARD */

function cardHTML(item) {
  const id = String(item.id);
  const favorite = getFavorites().includes(id);
  const category = normalizeCategory(item.category);

  const location = item.region || item.address || "Indonesia";
  const imageURL = item.image_url || item.image || "";

  return `
    <article class="content-card">
      <div class="card-image">
        <img
          src="${escapeHTML(imageURL)}"
          alt="${escapeHTML(item.title)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=80'">

        <span class="card-category">
          ${escapeHTML(categoryLabel(category))}
        </span>

        <button
          class="favorite-button ${favorite ? "is-favorite" : ""}"
          data-favorite="${escapeHTML(id)}"
          aria-label="${favorite ? "Hapus dari" : "Tambahkan ke"} favorit"
          aria-pressed="${favorite}"
          title="${favorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}">
          ${favorite ? "♥" : "♡"}
        </button>
      </div>

      <div class="card-body">
        <span class="card-location">
          ${escapeHTML(location)}
        </span>

        <h3>${escapeHTML(item.title)}</h3>

        <p>
          ${escapeHTML(
            item.description ||
            "Temukan cerita dan informasi lebih lanjut."
          )}
        </p>

        <div class="rating-row">
          ${category === "kuliner"
            ? ratingChip(t("foodRating"), item.food_rating)
            : ""}
          ${category === "kuliner"
            ? ratingChip(t("placeRating"), item.place_rating)
            : ""}
        </div>

        <div class="card-footer">
          <button data-detail="${escapeHTML(id)}">
            ${escapeHTML(t("readMore"))}
          </button>

          <a
            href="${escapeHTML(getMapsURL(item))}"
            target="_blank"
            rel="noopener noreferrer">
            ${escapeHTML(t("openMaps"))}
          </a>
        </div>
      </div>
    </article>
  `;
}

/* 7. RENDER WEBSITE */

function renderAll() {
  // Normalisasi kategori untuk seluruh data
  const normalizedItems = items.map(item => ({
    ...item,
    category: normalizeCategory(item.category)
  }));

  // Halaman Kuliner
  const foodItems = normalizedItems.filter(
    item => item.category === "kuliner"
  );

  // Halaman Budaya
  const cultureItems = normalizedItems.filter(
    item => item.category === "budaya"
  );

  // Halaman Destinasi jika elemennya tersedia di HTML
  const destinationItems = normalizedItems.filter(
    item => item.category === "destinasi"
  );

  renderGrid("#foodGrid", foodItems.slice(0, 3));
  renderGrid("#cultureGrid", cultureItems.slice(0, 3));
  renderGrid("#destinationGrid", destinationItems.slice(0, 3));

  // Favorit
  const favorites = getFavorites();

  const favoriteItems = normalizedItems.filter(
    item => favorites.includes(String(item.id))
  );

  renderGrid("#favoritesGrid", favoriteItems);

  const favoriteCount = $("#favoriteCount");
  if (favoriteCount) {
    favoriteCount.textContent = favorites.length;
  }

  const emptyFavorites = $("#emptyFavorites");
  if (emptyFavorites) {
    emptyFavorites.hidden = favoriteItems.length > 0;
  }

  // Semua konten
  renderSearchResults(normalizedItems);
}

function renderSearchResults(sourceItems = items) {
  const allSearchInput = $("#allSearchInput");
  const searchInput = $("#searchInput");

  const query = (
    allSearchInput?.value ||
    searchInput?.value ||
    ""
  )
    .trim()
    .toLocaleLowerCase("id-ID");

  const selectedCategory = normalizeCategory(
    $("#categoryFilter")?.value || ""
  );

  const selectedRegion = (
    $("#regionFilter")?.value || ""
  )
    .trim()
    .toLocaleLowerCase("id-ID");

  const filtered = sourceItems.filter(item => {
    const itemCategory = normalizeCategory(item.category);

    const matchesQuery =
      !query || matchesSearch(item, query);

    const matchesCategory =
      !selectedCategory ||
      itemCategory === selectedCategory;

    const itemRegion = String(item.region || "")
      .trim()
      .toLocaleLowerCase("id-ID");

    const matchesRegion =
      !selectedRegion ||
      itemRegion === selectedRegion;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesRegion
    );
  });

  renderGrid("#allGrid", filtered);

  const noResults = $("#noResults");
  if (noResults) {
    noResults.hidden = filtered.length > 0;
  }
}

/* 8. TOAST */

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

/* 9. DETAIL DIALOG AND VENUES */

function venueCategoryLabel(category) {
  const labels = {
    kedai: t("venueRestaurant"),
    museum: t("venueMuseum"),
    perpustakaan: t("venueLibrary"),
    pusat_budaya: t("venueCulture")
  };

  return labels[category] || "Tempat belajar";
}

function venueHTML(venue) {
  const mapsURL = getMapsURL(venue);

  const website =
    venue.website_url &&
    /^https?:\/\//i.test(venue.website_url)
      ? `<a href="${escapeHTML(venue.website_url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("openWebsite"))}</a>`
      : "";

  return `
    <article class="venue-item">
      <h4>${escapeHTML(venue.name || "Tempat belajar")}</h4>

      <p>
        <strong>${escapeHTML(venueCategoryLabel(venue.category))}</strong>
        ${venue.address
          ? ` · ${escapeHTML(venue.address)}`
          : ""}
      </p>

      ${venue.description
        ? `<p>${escapeHTML(venue.description)}</p>`
        : ""}

      <div class="venue-links">
        <a
          href="${escapeHTML(mapsURL)}"
          target="_blank"
          rel="noopener noreferrer">
          ${escapeHTML(t("openMaps"))}
        </a>
        ${website}
      </div>
    </article>
  `;
}

function openDetail(id) {
  const item = items.find(
    entry => String(entry.id) === String(id)
  );

  if (!item) return;

  activeDetailId = String(item.id);

  const category = normalizeCategory(item.category);
  const venues = Array.isArray(item.venues)
    ? item.venues
    : [];

  const isFood = category === "kuliner";
  const mapURL = getMapsURL(item);

  $("#detailContent").innerHTML = `
    <img
      class="detail-hero"
      src="${escapeHTML(item.image_url || item.image || "")}"
      alt="${escapeHTML(item.title)}"
      onerror="this.onerror=null;this.style.display='none'">

    <div class="detail-inner">
      <span class="eyebrow">
        ${escapeHTML(categoryLabel(category))}
        ·
        ${escapeHTML(item.region || "INDONESIA")}
      </span>

      <h2>${escapeHTML(item.title)}</h2>

      <p>
        ${escapeHTML(
          item.description ||
          "Belum ada deskripsi untuk cerita ini."
        )}
      </p>

      ${isFood ? `
        <div class="rating-row">
          ${ratingChip(t("foodRating"), item.food_rating)}
          ${ratingChip(t("placeRating"), item.place_rating)}
        </div>

        ${item.rating_source
          ? `<p>Sumber rating: ${escapeHTML(item.rating_source)}${item.rating_updated_at ? ` · diperbarui ${escapeHTML(item.rating_updated_at)}` : ""}</p>`
          : ""}
      ` : ""}

      <h3 class="detail-subheading">
        ${escapeHTML(t("venues"))}
      </h3>

      ${venues.length
        ? `<div class="venue-list">${venues.map(venueHTML).join("")}</div>`
        : `<p>Belum ada tempat belajar atau lokasi terkait yang ditambahkan.</p>`
      }

      <div class="detail-actions">
        <a
          href="${escapeHTML(mapURL)}"
          target="_blank"
          rel="noopener noreferrer">
          ${escapeHTML(t("openMaps"))}
        </a>

        <button
          type="button"
          data-detail-favorite="${escapeHTML(String(item.id))}">
          ${getFavorites().includes(String(item.id))
            ? "♥ Tersimpan"
            : "♡ Simpan favorit"}
        </button>
      </div>
    </div>
  `;

  const dialog = $("#detailDialog");

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeDetail() {
  const dialog = $("#detailDialog");
  if (!dialog) return;

  if (
    typeof dialog.close === "function" &&
    dialog.open
  ) {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }

  activeDetailId = null;
}

/* 10. LOAD SUPABASE DATA */

async function loadSupabaseData() {
  if (!supabaseClient) {
    console.warn("Supabase belum tersedia. Menggunakan data contoh.");
    items = [...demoItems];
    renderAll();
    return;
  }

  try {
    const [contentResult, venueResult] = await Promise.all([
      supabaseClient
        .from("content")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false }),

      supabaseClient
        .from("venues")
        .select("*")
        .eq("published", true)
    ]);

    if (contentResult.error) {
      throw contentResult.error;
    }

    const contentRows = contentResult.data || [];
    const venueRows = venueResult.error
      ? []
      : venueResult.data || [];

    if (contentRows.length > 0) {
      items = contentRows.map(row => ({
        ...row,

        // Samakan kategori dari database
        category: normalizeCategory(row.category),

        // Kaitkan venue dengan konten yang sesuai
        venues: venueRows.filter(
          venue =>
            String(venue.content_id) === String(row.id)
        )
      }));
    } else {
      // Data contoh hanya dipakai jika tabel kosong
      items = [...demoItems];
    }

    console.log("Konten berhasil dimuat:", items);
    renderAll();

  } catch (error) {
    console.error("Supabase gagal dimuat:", error);

    items = [...demoItems];
    renderAll();

    showToast(
      "Database gagal dimuat. Konten contoh ditampilkan."
    );
  }
}

/* 11. LANGUAGE SWITCHING */

function applyLanguage(language) {
  currentLanguage = translations[language]
    ? language
    : "id";

  localStorage.setItem(
    "rasaloka_language",
    currentLanguage
  );

  document.documentElement.lang = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;

    if (t(key)) {
      element.textContent = t(key);
    }
  });

  if ($("#searchInput")) {
    $("#searchInput").placeholder = t("search");
  }

  if ($("#allSearchInput")) {
    $("#allSearchInput").placeholder = t("allSearch");
  }

  if ($("#regionFilter")?.options[0]) {
    $("#regionFilter").options[0].textContent = t("allRegions");
  }

  if ($("#categoryFilter")?.options[0]) {
    $("#categoryFilter").options[0].textContent = t("allCategories");
  }

  if ($("#noResults")) {
    $("#noResults").textContent = t("noResults");
  }

  if ($("#emptyFavorites")) {
    $("#emptyFavorites").textContent = t("emptyFavorites");
  }

  document.querySelectorAll("[data-filter-link]").forEach(link => {
    const category = normalizeCategory(link.dataset.filterLink);

    const labels = {
      id: {
        kuliner: "Lihat semua kuliner ↗",
        budaya: "Lihat semua budaya ↗",
        destinasi: "Lihat semua destinasi ↗"
      },
      en: {
        kuliner: "Explore all food ↗",
        budaya: "Explore all culture ↗",
        destinasi: "Explore all destinations ↗"
      },
      es: {
        kuliner: "Ver toda la comida ↗",
        budaya: "Ver toda la cultura ↗",
        destinasi: "Ver todos los destinos ↗"
      },
      zh: {
        kuliner: "查看全部美食 ↗",
        budaya: "查看全部文化 ↗",
        destinasi: "查看全部景点 ↗"
      },
      ko: {
        kuliner: "모든 음식 보기 ↗",
        budaya: "모든 문화 보기 ↗",
        destinasi: "모든 여행지 보기 ↗"
      },
      ja: {
        kuliner: "すべての料理を見る ↗",
        budaya: "すべての文化を見る ↗",
        destinasi: "すべての目的地を見る ↗"
      }
    };

    link.textContent =
      labels[currentLanguage]?.[category] ||
      labels.id[category] ||
      "Lihat semua ↗";
  });

  renderAll();
}

/* 12. EVENT LISTENERS */

document.addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-favorite]");

  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.favorite);
    return;
  }

  const detailButton = event.target.closest("[data-detail]");

  if (detailButton) {
    openDetail(detailButton.dataset.detail);
    return;
  }

  const detailFavorite = event.target.closest(
    "[data-detail-favorite]"
  );

  if (detailFavorite) {
    const id = detailFavorite.dataset.detailFavorite;

    toggleFavorite(id);
    openDetail(id);
  }
});

$("#closeDialog")?.addEventListener("click", closeDetail);

$("#detailDialog")?.addEventListener("click", event => {
  if (event.target === $("#detailDialog")) {
    closeDetail();
  }
});

$("#searchInput")?.addEventListener("input", () => {
  if ($("#allSearchInput")) {
    $("#allSearchInput").value = $("#searchInput").value;
  }

  renderSearchResults();
});

$("#allSearchInput")?.addEventListener("input", () => {
  if ($("#searchInput")) {
    $("#searchInput").value = $("#allSearchInput").value;
  }

  renderSearchResults();
});

$("#categoryFilter")?.addEventListener(
  "change",
  renderSearchResults
);

$("#regionFilter")?.addEventListener(
  "change",
  renderSearchResults
);

if ($("#languageSelect")) {
  $("#languageSelect").value = currentLanguage;

  $("#languageSelect").addEventListener("change", event => {
    applyLanguage(event.target.value);
  });
}

$("#menuToggle")?.addEventListener("click", () => {
  const nav = $("#navMenu");
  if (!nav) return;

  const isOpen = nav.classList.toggle("open");

  $("#menuToggle").setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  $("#menuToggle").textContent = isOpen ? "×" : "☰";
});

$("#navMenu")?.addEventListener("click", event => {
  if (event.target.closest("a")) {
    $("#navMenu").classList.remove("open");

    $("#menuToggle")?.setAttribute(
      "aria-expanded",
      "false"
    );

    if ($("#menuToggle")) {
      $("#menuToggle").textContent = "☰";
    }
  }
});

document.querySelectorAll("[data-filter-link]").forEach(link => {
  link.addEventListener("click", () => {
    const category = normalizeCategory(link.dataset.filterLink);

    if ($("#categoryFilter")) {
      $("#categoryFilter").value = category;
    }

    renderSearchResults();

    // Tunggu sampai browser memproses navigasi anchor
    requestAnimationFrame(() => {
      renderSearchResults();
    });
  });
});

if ($("#year")) {
  $("#year").textContent = new Date().getFullYear();
}

/* 13. START WEBSITE */

applyLanguage(currentLanguage);
loadSupabaseData();