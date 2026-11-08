/* RASALOKA — WEBSITE INTERACTIONS */

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

async function loadWebsiteContent() {
    if (!supabaseClient) {
        console.error("Supabase belum terhubung!");
        return;
    }

    try {
        console.log("Mengambil konten dari Supabase...");

        const { data, error } = await supabaseClient
            .from("content")
            .select("*")
            .eq("published", true)
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        items = (data || []).map(item => ({
            ...item,
            category: normalizeCategory(item.category)
        }));

        console.log("Jumlah konten:", items.length);
        console.table(items);

        if (typeof renderAll === "function") {
            renderAll();
        }

    } catch (error) {
        console.error(
            "Gagal mengambil konten dari Supabase:",
            error
        );
    }
}
let activeDetailId = null;
let toastTimeout = null;

const FAVORITES_KEY = "rasaloka_favorites_v1";

/* 2. NORMALIZE CATEGORY */
function normalizeCategory(category) {
  const value = String(category || "").trim().toLocaleLowerCase("id-ID");

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

// ===== RASALOKA CONTENT RENDERER =====

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function getFavorites() {
    try {
        const data = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
        return Array.isArray(data) ? data.map(String) : [];
    } catch {
        return [];
    }
}

function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(id) {
    return getFavorites().includes(String(id));
}

function toggleFavorite(id) {
    const favorites = getFavorites();
    const key = String(id);

    const updated = favorites.includes(key)
        ? favorites.filter(value => value !== key)
        : [...favorites, key];

    saveFavorites(updated);
    renderAll();
}

function createContentCard(item) {
    const title = escapeHTML(item.title);
    const region = escapeHTML(item.region || "Indonesia");
    const category = normalizeCategory(item.category);
    const description = escapeHTML(item.description || "");
    const image = item.image_url
        ? escapeHTML(item.image_url)
        : "";

    const favorite = isFavorite(item.id);

    return `
        <article class="content-card">
            <div class="card-image">
                ${image
                    ? `<img src="${image}" alt="${title}" loading="lazy">`
                    : `<div class="card-placeholder">RASALOKA</div>`
                }
            </div>

            <div class="card-body">
                <div class="card-meta">
                    <span>${escapeHTML(category)}</span>
                    <span>${region}</span>
                </div>

                <h3>${title}</h3>

                <p>${description.length > 140
                    ? description.slice(0, 140) + "..."
                    : description}</p>

                <div class="card-actions">
                    <button
                        type="button"
                        class="card-detail-btn"
                        data-detail-id="${escapeHTML(item.id)}">
                        ${escapeHTML(t("readMore"))}
                    </button>

                    <button
                        type="button"
                        class="favorite-btn"
                        data-favorite-id="${escapeHTML(item.id)}"
                        aria-label="Favorit"
                        aria-pressed="${favorite}">
                        ${favorite ? "♥" : "♡"}
                    </button>
                </div>
            </div>
        </article>
    `;
}

function renderGrid(selector, content) {
    const container = $(selector);
    if (!container) return;

    container.innerHTML = content.map(createContentCard).join("");
}

function matchesSearch(item, keyword) {
    const text = [
        item.title,
        item.region,
        item.category,
        item.description
    ].join(" ").toLocaleLowerCase("id-ID");

    return text.includes(keyword.toLocaleLowerCase("id-ID"));
}

function renderAll() {
    const search = $("#searchInput")?.value.trim() || "";
    const region = $("#regionFilter")?.value || "";

    const food = items.filter(item =>
        normalizeCategory(item.category) === "kuliner" &&
        (!region || item.region === region) &&
        matchesSearch(item, search)
    );

    const culture = items.filter(item =>
        normalizeCategory(item.category) === "budaya"
    );

    const allSearch = $("#allSearchInput")?.value.trim() || "";
    const category = $("#categoryFilter")?.value || "";

    const all = items.filter(item =>
        (!category || normalizeCategory(item.category) === category) &&
        matchesSearch(item, allSearch)
    );

    const favorites = items.filter(item => isFavorite(item.id));

    renderGrid("#foodGrid", food);
    renderGrid("#cultureGrid", culture);
    renderGrid("#allGrid", all);
    renderGrid("#favoritesGrid", favorites);

    const count = $("#favoriteCount");
    if (count) count.textContent = favorites.length;

    const emptyFavorites = $("#emptyFavorites");
    if (emptyFavorites) {
        emptyFavorites.hidden = favorites.length > 0;
    }

    const noResults = $("#noResults");
    if (noResults) {
        noResults.hidden = all.length > 0;
    }
}

function openContentDetail(id) {
    const item = items.find(content => String(content.id) === String(id));
    if (!item) return;

    const dialog = $("#detailDialog");
    const container = $("#detailContent");

    if (!dialog || !container) return;

    const title = escapeHTML(item.title);
    const description = escapeHTML(item.description || "");
    const region = escapeHTML(item.region || "Indonesia");
    const address = escapeHTML(item.address || "");
    const image = item.image_url ? escapeHTML(item.image_url) : "";

    let mapsUrl = "";

    if (
        item.latitude != null &&
        item.longitude != null &&
        Number.isFinite(Number(item.latitude)) &&
        Number.isFinite(Number(item.longitude))
    ) {
        mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(
            `${item.latitude},${item.longitude}`
        )}`;
    } else if (item.address) {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`;
    }

    container.innerHTML = `
        ${image ? `<img class="detail-image" src="${image}" alt="${title}">` : ""}

        <div class="detail-body">
            <span class="detail-region">${region}</span>
            <h2>${title}</h2>
            <p class="detail-description">${description}</p>

            ${address ? `<p><strong>Lokasi:</strong> ${address}</p>` : ""}

            ${mapsUrl
                ? `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer">
                    ${escapeHTML(t("openMaps"))}
                   </a>`
                : ""
            }
        </div>
    `;

    if (!dialog.open) dialog.showModal();
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
    close: "Tutup",
    heroEyebrow: "CERITA DARI INDONESIA",
    heroTitle: "Indonesia punya cerita untukmu.",
    heroDesc: "Temukan cita rasa, jejak budaya, dan tempat-tempat istimewa yang membuat Indonesia begitu kaya.",
    startExplore: "Mulai menjelajah",
    knowCulture: "Kenali budayanya",
    heroNote: "Kenali Indonesia",
    heroNoteStrong: "dari cerita lokalnya.",
    imageLabel: "Cerita Indonesia",
    scrollExplore: "GULIR UNTUK MENJELAJAH",
    introEyebrow: "TENTANG RASALOKA",
    introTitle: "Jelajah lebih dekat, kenal lebih dalam.",
    introDesc: "Rasaloka mengajakmu mengenal Indonesia lewat pengalaman lokal, rekomendasi tempat, serta cerita di balik setiap tradisi.",
    bannerEyebrow: "LEBIH DARI SEKADAR DESTINASI",
    bannerTitle: "Budaya bukan sekadar untuk dilihat, tapi dipahami.",
    bannerDesc: "Kenali tradisi, kunjungi museum, temukan koleksi perpustakaan, dan belajar langsung dari pusat kebudayaan.",
    foodEyebrow: "CITA RASA NUSANTARA",
    foodTitle: "Rasa yang dirindukan.",
    allFood: "Semua kuliner",
    foodDesc: "Temukan hidangan khas, asal-usulnya, dan lokasi tempat kamu bisa mencicipinya.",
    searchPlaceholder: "Cari makanan, budaya, atau daerah...",
    allRegions: "Semua daerah",
    cultureEyebrow: "WARISAN NUSANTARA",
    cultureTitle: "Warisan yang hidup.",
    allCulture: "Semua budaya",
    cultureDesc: "Setiap tradisi menyimpan pengetahuan. Mulai perjalananmu dengan membaca, berkunjung, dan belajar.",
    allEyebrow: "TEMUKAN CERITAMU",
    allTitle: "Jelajahi semuanya.",
    allCategories: "Semua kategori",
    favoritesEyebrow: "KOLEKSI PRIBADIMU",
    favoritesTitle: "Cerita favorit.",
    favoritesDesc: "Kumpulan cerita yang kamu simpan untuk dijelajahi lagi.",
    emptyFavorites: "Belum ada favorit. Tekan ikon hati pada kartu untuk menyimpan cerita.",
    aboutEyebrow: "MENGENAL RASALOKA",
    aboutTitle: "Cerita lokal, pengalaman yang bermakna.",
    footerText: "Merayakan cerita dan kekayaan Indonesia.",
    backToTop: "Kembali ke atas",
    cultureSectionDesc: "Setiap tradisi menyimpan pengetahuan. Mulai perjalananmu dengan membaca, berkunjung, dan belajar."
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
    close: "Close",
    heroEyebrow: "STORIES FROM INDONESIA",
    heroTitle: "Indonesia has stories for you.",
    heroDesc: "Discover the flavors, cultural heritage, and special places that make Indonesia so rich.",
    startExplore: "Start exploring",
    knowCulture: "Discover the culture",
    heroNote: "Discover Indonesia",
    heroNoteStrong: "through local stories.",
    imageLabel: "Stories of Indonesia",
    scrollExplore: "SCROLL TO EXPLORE",
    introEyebrow: "ABOUT RASALOKA",
    introTitle: "Explore closer, understand deeper.",
    introDesc: "Rasaloka invites you to discover Indonesia through local experiences, place recommendations, and stories behind every tradition.",
    bannerEyebrow: "MORE THAN A DESTINATION",
    bannerTitle: "Culture is not just to be seen, but understood.",
    bannerDesc: "Discover traditions, visit museums, explore library collections, and learn from cultural centers.",
    foodEyebrow: "THE FLAVORS OF INDONESIA",
    foodTitle: "Flavors to remember.",
    allFood: "All food",
    foodDesc: "Discover local dishes, their origins, and where to try them.",
    searchPlaceholder: "Search food, culture, or region...",
    cultureEyebrow: "INDONESIAN HERITAGE",
    cultureTitle: "Living heritage.",
    allCulture: "All culture",
    cultureDesc: "Every tradition holds knowledge. Begin your journey by reading, visiting, and learning.",
    allEyebrow: "FIND YOUR STORY",
    allTitle: "Explore everything.",
    allSearchPlaceholder: "Search stories or regions...",
    favoritesEyebrow: "YOUR PERSONAL COLLECTION",
    favoritesTitle: "Favorite stories.",
    favoritesDesc: "Stories you've saved to explore again.",
    aboutEyebrow: "GET TO KNOW RASALOKA",
    aboutTitle: "Local stories, meaningful experiences.",
    aboutDesc: "Explore Indonesia's richness through food, culture, and places filled with stories.",
    footerText: "Celebrating Indonesia's stories and richness.",
    backToTop: "Back to top",
    cultureSectionTitle: "Living heritage.",
    cultureSectionDesc: "Every tradition holds knowledge. Begin your journey by reading, visiting, and learning."
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
    close: "Cerrar",
    heroEyebrow: "HISTORIAS DE INDONESIA",
    heroTitle: "Indonesia tiene historias para ti.",
    heroDesc: "Descubre los sabores, el patrimonio cultural y los lugares especiales que hacen de Indonesia un país tan rico.",
    startExplore: "Empieza a explorar",
    knowCulture: "Descubre la cultura",
    heroNote: "Descubre Indonesia",
    heroNoteStrong: "a través de historias locales.",
    imageLabel: "Historias de Indonesia",
    scrollExplore: "DESPLÁZATE PARA EXPLORAR",
    introEyebrow: "SOBRE RASALOKA",
    introTitle: "Explora más de cerca, comprende más profundamente.",
    introDesc: "Rasaloka te invita a descubrir Indonesia a través de experiencias locales, recomendaciones de lugares e historias detrás de cada tradición.",
    bannerEyebrow: "MÁS QUE UN DESTINO",
    bannerTitle: "La cultura no solo se contempla, también se comprende.",
    bannerDesc: "Descubre tradiciones, visita museos, explora colecciones bibliotecarias y aprende en centros culturales.",
    foodEyebrow: "SABORES DE INDONESIA",
    foodTitle: "Sabores para recordar.",
    allFood: "Toda la comida",
    foodDesc: "Descubre platos típicos, sus orígenes y los lugares donde puedes probarlos.",
    searchPlaceholder: "Buscar comida, cultura o región...",
    cultureEyebrow: "PATRIMONIO INDONESIO",
    cultureTitle: "Patrimonio vivo.",
    allCulture: "Toda la cultura",
    cultureDesc: "Cada tradición guarda conocimientos. Comienza tu viaje leyendo, visitando y aprendiendo.",
    allEyebrow: "ENCUENTRA TU HISTORIA",
    allTitle: "Explóralo todo.",
    allSearchPlaceholder: "Buscar historias o regiones...",
    favoritesEyebrow: "TU COLECCIÓN PERSONAL",
    favoritesTitle: "Historias favoritas.",
    favoritesDesc: "Historias guardadas para volver a explorarlas.",
    aboutEyebrow: "CONOCE RASALOKA",
    aboutTitle: "Historias locales, experiencias significativas.",
    aboutDesc: "Explora la riqueza de Indonesia a través de la comida, la cultura y lugares llenos de historias.",
    footerText: "Celebrando las historias y la riqueza de Indonesia.",
    backToTop: "Volver arriba",
    cultureSectionTitle: "Patrimonio vivo.",
    cultureSectionDesc: "Cada tradición guarda conocimientos. Comienza tu viaje leyendo, visitando y aprendiendo."
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
    close: "关闭",
    heroEyebrow: "来自印度尼西亚的故事",
    heroTitle: "印度尼西亚，有故事等你发现。",
    heroDesc: "探索美食风味、文化遗产和特色景点，感受印度尼西亚的丰富魅力。",
    startExplore: "开始探索",
    knowCulture: "了解当地文化",
    heroNote: "探索印度尼西亚",
    heroNoteStrong: "从当地故事开始。",
    imageLabel: "印度尼西亚故事",
    scrollExplore: "向下滚动开始探索",
    introEyebrow: "关于 RASALOKA",
    introTitle: "深入探索，更深刻地了解。",
    introDesc: "Rasaloka 带你通过当地体验、地点推荐以及每项传统背后的故事，认识印度尼西亚。",
    bannerEyebrow: "不止是目的地",
    bannerTitle: "文化不仅值得观赏，更值得理解。",
    bannerDesc: "探索传统、参观博物馆、浏览图书馆馆藏，并在文化中心学习。",
    foodEyebrow: "印度尼西亚风味",
    foodTitle: "令人难忘的美味。",
    allFood: "全部美食",
    foodDesc: "探索当地特色菜肴、它们的起源，以及可以品尝这些美食的地方。",
    searchPlaceholder: "搜索美食、文化或地区...",
    cultureEyebrow: "印度尼西亚文化遗产",
    cultureTitle: "鲜活的文化遗产。",
    allCulture: "全部文化",
    cultureDesc: "每项传统都蕴含着知识。通过阅读、参观和学习，开启你的旅程。",
    allEyebrow: "寻找你的故事",
    allTitle: "探索全部内容。",
    allSearchPlaceholder: "搜索故事或地区...",
    favoritesEyebrow: "你的个人收藏",
    favoritesTitle: "收藏的故事。",
    favoritesDesc: "保存故事，方便再次探索。",
    aboutEyebrow: "认识 RASALOKA",
    aboutTitle: "本地故事，有意义的体验。",
    aboutDesc: "通过美食、文化和充满故事的地方，探索印度尼西亚的丰富魅力。",
    footerText: "分享印度尼西亚的故事与魅力。",
    backToTop: "返回顶部",
    cultureSectionTitle: "鲜活的文化遗产。",
    cultureSectionDesc: "每项传统都蕴含着知识。通过阅读、参观和学习，开启你的旅程。"
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
    close: "닫기",
    heroEyebrow: "인도네시아의 이야기",
    heroTitle: "인도네시아의 이야기를 만나보세요.",
    heroDesc: "인도네시아를 더욱 풍요롭게 만드는 음식, 문화유산, 특별한 장소를 발견해 보세요.",
    startExplore: "탐험 시작하기",
    knowCulture: "문화 알아보기",
    heroNote: "인도네시아 알아보기",
    heroNoteStrong: "현지 이야기로 시작하세요.",
    imageLabel: "인도네시아 이야기",
    scrollExplore: "스크롤하여 탐색하기",
    introEyebrow: "RASALOKA 소개",
    introTitle: "더 가까이 탐험하고, 더 깊이 이해하세요.",
    introDesc: "Rasaloka는 현지 체험, 장소 추천, 전통에 담긴 이야기를 통해 인도네시아를 소개합니다.",
    bannerEyebrow: "목적지 그 이상",
    bannerTitle: "문화는 보는 것에서 그치지 않고 이해하는 것입니다.",
    bannerDesc: "전통을 알아보고, 박물관을 방문하고, 도서관 자료를 살펴보며 문화센터에서 배워보세요.",
    foodEyebrow: "인도네시아의 맛",
    foodTitle: "기억에 남는 맛.",
    allFood: "모든 음식",
    foodDesc: "현지 음식과 그 기원, 맛볼 수 있는 장소를 찾아보세요.",
    searchPlaceholder: "음식, 문화 또는 지역 검색...",
    cultureEyebrow: "인도네시아 문화유산",
    cultureTitle: "살아 숨 쉬는 문화유산.",
    allCulture: "모든 문화",
    cultureDesc: "모든 전통에는 지식이 담겨 있습니다. 읽고 방문하고 배우며 여정을 시작하세요.",
    allEyebrow: "나만의 이야기 찾기",
    allTitle: "모든 콘텐츠 탐색하기.",
    allSearchPlaceholder: "이야기 또는 지역 검색...",
    favoritesEyebrow: "나만의 컬렉션",
    favoritesTitle: "즐겨찾는 이야기.",
    favoritesDesc: "다시 탐색하고 싶은 이야기를 저장하세요.",
    aboutEyebrow: "RASALOKA 소개",
    aboutTitle: "지역 이야기, 의미 있는 경험.",
    aboutDesc: "음식과 문화, 이야기가 담긴 장소를 통해 인도네시아의 풍요로움을 발견하세요.",
    footerText: "인도네시아의 이야기와 풍요로움을 기념합니다.",
    backToTop: "맨 위로",
    cultureSectionTitle: "살아 숨 쉬는 문화유산.",
    cultureSectionDesc: "모든 전통에는 지식이 담겨 있습니다. 읽고 방문하고 배우며 여정을 시작하세요."
  },

  ja: {
    home: "ホーム",
    explore: "探検",
    food: "グルメ",
    culture: "文化",
    search: "料理、文化、地域を検索...",
    allSearch: "物語や地域を検索...",
    allRegions: "すべての地域",
    allCategories: "すべてのカテゴリ",
    favorite: "お気に入り",
    readMore: "物語を読む ↗",
    openMaps: "Google マップを開く ↗",
    foodRating: "料理の評価",
    placeRating: "場所の評価",
    noRating: "情報なし",
    noResults: "一致する物語がありません。別のキーワードをお試しください。",
    emptyFavorites: "お気に入りはまだありません。ハートを押して保存できます。",
    saved: "お気に入りに追加しました",
    removed: "お気に入りから削除しました",
    venues: "訪問・学習できる場所",
    address: "場所",
    venueRestaurant: "レストラン",
    venueMuseum: "博物館",
    venueLibrary: "図書館",
    venueCulture: "文化センター",
    openWebsite: "公式サイト ↗",
    close: "閉じる",
    heroEyebrow: "インドネシアの物語",
    heroTitle: "インドネシアの物語に出会いましょう。",
    heroDesc: "インドネシアを豊かにする味、文化遺産、特別な場所を発見してください。",
    startExplore: "探検を始める",
    knowCulture: "文化を知る",
    heroNote: "インドネシアを知る",
    heroNoteStrong: "地域の物語から。",
    imageLabel: "インドネシアの物語",
    scrollExplore: "スクロールして探検",
    introEyebrow: "RASALOKAについて",
    introTitle: "もっと近くで探検し、もっと深く知る。",
    introDesc: "Rasalokaは、地域の体験、場所のおすすめ、伝統にまつわる物語を通じてインドネシアを紹介します。",
    bannerEyebrow: "目的地以上の体験",
    bannerTitle: "文化は見るだけでなく、理解するものです。",
    bannerDesc: "伝統を知り、博物館を訪れ、図書館の資料を探し、文化センターで学びましょう。",
    foodEyebrow: "インドネシアの味",
    foodTitle: "忘れられない味。",
    allFood: "すべての料理",
    foodDesc: "郷土料理やその由来、味わえる場所を見つけましょう。",
    searchPlaceholder: "料理、文化、地域を検索...",
    cultureEyebrow: "インドネシアの文化遺産",
    cultureTitle: "生き続ける遺産。",
    allCulture: "すべての文化",
    cultureDesc: "伝統には知恵が詰まっています。読み、訪れ、学ぶことから旅を始めましょう。",
    allEyebrow: "自分だけの物語を見つける",
    allTitle: "すべてを探検する。",
    allSearchPlaceholder: "物語や地域を検索...",
    favoritesEyebrow: "あなたのコレクション",
    favoritesTitle: "お気に入りの物語。",
    favoritesDesc: "また読みたい物語を保存できます。",
    aboutEyebrow: "RASALOKAについて",
    aboutTitle: "地域の物語、意味のある体験。",
    aboutDesc: "料理、文化、物語のある場所を通じてインドネシアの豊かさを発見してください。",
    footerText: "インドネシアの物語と豊かさを伝えます。",
    backToTop: "トップへ戻る",
    cultureSectionTitle: "生き続ける遺産。",
    cultureSectionDesc: "伝統には知恵が詰まっています。読み、訪れ、学ぶことから旅を始めましょう。"
  }
};

/* Terjemahan berdasarkan bahasa aktif */
function getCurrentLanguage() {
  const savedLanguage = localStorage.getItem("rasaloka_language");
  return translations[savedLanguage] ? savedLanguage : "id";
}

function t(key) {
  const language = getCurrentLanguage();
  const dictionary = translations[language] || translations.id;
  return dictionary[key] || translations.id[key] || key;
}

/* Alias untuk menyesuaikan nama key di HTML */
function getTranslationKey(key) {
  const aliases = {
    favorites: "favorite"
  };

  return aliases[key] || key;
}

function applyLanguage(language) {
  const selectedLanguage = translations[language]
    ? language
    : "id";

  localStorage.setItem(
    "rasaloka_language",
    selectedLanguage
  );

  document.documentElement.lang = selectedLanguage;

  // Mengubah teks sesuai bahasa
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = getTranslationKey(element.dataset.i18n);

    const translatedText =
      translations[selectedLanguage][key] ||
      translations.id[key];

    if (translatedText) {
      element.textContent = translatedText;
    }
  });

  // Mengubah placeholder pencarian
  document.querySelectorAll("[data-i18n-placeholder]")
    .forEach(element => {
      const key = getTranslationKey(
        element.dataset.i18nPlaceholder
      );

      const translatedText =
        translations[selectedLanguage][key] ||
        translations.id[key];

      if (translatedText) {
        element.setAttribute("placeholder", translatedText);
      }
    });

  // Memperbarui pilihan bahasa
  const languageSelector = $("#languageSelect");

  if (languageSelector) {
    languageSelector.value = selectedLanguage;
  }

  // Memperbarui konten dinamis jika fungsi tersedia
  if (typeof renderAll === "function") {
    renderAll();
  }
}

console.table(
  [...document.querySelectorAll("[data-i18n]")].map(el => ({
    teks: el.textContent.trim().slice(0, 50),
    key: el.dataset.i18n
  }))
);

if (supabaseClient) {
  console.log("Supabase berhasil diinisialisasi!");
} else {
  console.error("Supabase belum terhubung!");
}

document.addEventListener("DOMContentLoaded", async () => {
    const languageSelector = $("#languageSelect");

    applyLanguage(getCurrentLanguage());

    if (languageSelector) {
        languageSelector.addEventListener("change", event => {
            applyLanguage(event.target.value);
        });
    }

    // Filter pencarian
    [
        "#searchInput",
        "#allSearchInput",
        "#regionFilter",
        "#categoryFilter"
    ].forEach(selector => {
        const element = $(selector);

        if (element) {
            element.addEventListener(
                element.tagName === "SELECT" ? "change" : "input",
                renderAll
            );
        }
    });

    // Tombol pada kartu
    document.addEventListener("click", event => {
        const favoriteButton = event.target.closest("[data-favorite-id]");
        const detailButton = event.target.closest("[data-detail-id]");

        if (favoriteButton) {
            toggleFavorite(favoriteButton.dataset.favoriteId);
        }

        if (detailButton) {
            openContentDetail(detailButton.dataset.detailId);
        }
    });

    // Tutup detail
    $("#closeDialog")?.addEventListener("click", () => {
        $("#detailDialog")?.close();
    });

    // Filter dari tombol "Lihat semua"
    document.querySelectorAll("[data-filter-link]").forEach(link => {
        link.addEventListener("click", () => {
            const categoryFilter = $("#categoryFilter");

            if (categoryFilter) {
                categoryFilter.value = link.dataset.filterLink;
                renderAll();
            }
        });
    });

    // Tahun footer
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    // Menu navigasi mobile
    const menuToggle = $("#menuToggle");
    const navMenu = $("#navMenu");

    menuToggle?.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");

        menuToggle.textContent = isOpen ? "✕" : "☰";
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Tutup menu" : "Buka menu"
        );
    });

    // Tutup menu setelah memilih navigasi
    navMenu?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("open");
            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Buka menu");
        });
    });

    // Ambil konten dari Supabase
    await loadWebsiteContent();
});

/* ==================================
   RASALOKA — SCROLL ANIMATIONS
================================== */

document.addEventListener("DOMContentLoaded", () => {

    const elements = document.querySelectorAll(
        ".section-heading, .section-top, .intro-copy, " +
        ".section-description, .culture-banner, " +
        ".about-section, .hero-note"
    );

    // Hormati pengaturan pengurangan animasi
    if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !("IntersectionObserver" in window)
    ) {
        return;
    }

    elements.forEach(element => {
        element.classList.add("reveal");
    });

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: "0px 0px 40px 0px"
        }
    );

    elements.forEach(element => {
        observer.observe(element);
    });

});