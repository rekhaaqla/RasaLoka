
/* =========================================
   1. KONFIGURASI SUPABASE
========================================= */

const SUPABASE_URL = "https://vzrmpnvygqpiivlogsie.supabase.co";
const SUPABASE_KEY = "sb_publishable_0SL-z7GDZdmn10raKjK_0A_pMmoEs99";
const STORAGE_BUCKET = "content-images";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* =========================================
   2. ELEMEN HTML
========================================= */

const $ = (id) => document.getElementById(id);

const contentForm = $("contentForm");
const contentList = $("contentList");
const searchInput = $("searchInput");
const cancelBtn = $("cancelBtn");
const refreshBtn = $("refreshBtn");
const imageFileInput = $("imageFile");
const imagePreview = $("imagePreview");
const saveBtn = $("saveBtn");

let allContent = [];
let editingImageUrl = null;

/* =========================================
   3. PESAN STATUS
========================================= */

function showMessage(elementId, message, type = "") {
    const element = $(elementId);

    if (!element) {
        console.log(`[${elementId}] ${message}`);
        return;
    }

    element.textContent = message;
    element.className = `message ${type}`;
}

/* =========================================
   4. DASHBOARD TANPA LOGIN
========================================= */

function initializeDashboard() {
    $("loginSection")?.classList.add("hidden");
    $("dashboardSection")?.classList.remove("hidden");

    loadContent();
}

/* =========================================
   5. PREVIEW FOTO
========================================= */

function clearImagePreview() {
    if (!imagePreview) return;

    imagePreview.removeAttribute("src");
    imagePreview.style.display = "none";
}

if (imageFileInput) {
    imageFileInput.addEventListener("change", () => {
        const file = imageFileInput.files?.[0];

        if (!file) {
            clearImagePreview();
            return;
        }

        const validTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (!validTypes.includes(file.type)) {
            imageFileInput.value = "";
            clearImagePreview();

            showMessage(
                "imageMessage",
                "Pilih gambar JPG, PNG, WEBP, atau GIF.",
                "error"
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            imageFileInput.value = "";
            clearImagePreview();

            showMessage(
                "imageMessage",
                "Ukuran gambar maksimal 5 MB.",
                "error"
            );
            return;
        }

        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = "block";

        showMessage("imageMessage", "");
    });
}

/* =========================================
   6. UPLOAD FOTO KE SUPABASE STORAGE
========================================= */

async function uploadContentImage(file) {
    if (!file) return editingImageUrl;

    const extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif"
    };

    const extension = extensions[file.type];

    if (!extension) {
        throw new Error(
            "Format gambar harus JPG, PNG, WEBP, atau GIF."
        );
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error("Ukuran gambar maksimal 5 MB.");
    }

    const uniqueName =
        `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    console.log("Mulai upload gambar:", file.name);

    const { data: uploadedFile, error: uploadError } =
        await supabaseClient.storage
            .from(STORAGE_BUCKET)
            .upload(uniqueName, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            });

    if (uploadError) {
        console.error("Upload Storage gagal:", uploadError);
        throw new Error(
            "Upload foto gagal: " + uploadError.message
        );
    }

    const { data: publicData } = supabaseClient.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(uploadedFile.path);

    if (!publicData?.publicUrl) {
        throw new Error("URL foto gagal dibuat.");
    }

    console.log("Upload Storage berhasil:", uploadedFile.path);

    return publicData.publicUrl;
}

/* =========================================
   7. MEMUAT KONTEN
========================================= */

async function loadContent() {
    if (!contentList) {
        console.error("Elemen contentList tidak ditemukan.");
        return;
    }

    contentList.textContent = "Memuat konten...";

    try {
        const { data, error } = await supabaseClient
            .from("content")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        allContent = data || [];

        if ($("totalContent")) {
            $("totalContent").textContent = allContent.length;
        }

        renderContent();
        showMessage("listMessage", "");

    } catch (error) {
        console.error("Gagal memuat konten:", error);

        contentList.textContent = "";

        showMessage(
            "listMessage",
            "Gagal memuat konten: " + error.message,
            "error"
        );
    }
}

/* =========================================
   8. AMANKAN TEKS HTML
========================================= */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

/* =========================================
   9. TAMPILKAN DAFTAR KONTEN
========================================= */

function renderContent() {
    if (!contentList) return;

    const keyword = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const filtered = allContent.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const region = (item.region || "").toLowerCase();

        return title.includes(keyword) || region.includes(keyword);
    });

    contentList.innerHTML = "";

    if (filtered.length === 0) {
        contentList.innerHTML =
            '<p class="muted">Belum ada konten yang cocok.</p>';
        return;
    }

    filtered.forEach((item) => {
        const card = document.createElement("article");
        card.className = "content-item";

        const imageHTML = item.image_url
            ? `<img
                    class="content-thumb"
                    src="${escapeHTML(item.image_url)}"
                    alt="${escapeHTML(item.title)}"
                    loading="lazy"
                >`
            : '<div class="content-thumb"></div>';

        const statusHTML = item.published
            ? '<span class="status">Diterbitkan</span>'
            : '<span class="status draft">Disembunyikan</span>';

        card.innerHTML = `
            ${imageHTML}

            <div class="content-info">
                <h3>${escapeHTML(item.title)}</h3>

                <p>
                    ${escapeHTML(item.category)} ·
                    ${escapeHTML(item.region)}
                </p>

                ${statusHTML}

                <div class="item-actions">
                    <button type="button" class="btn btn-light edit-btn">
                        Edit
                    </button>

                    <button type="button" class="btn btn-light toggle-btn">
                        ${item.published ? "Sembunyikan" : "Terbitkan"}
                    </button>

                    <button type="button" class="btn btn-danger delete-btn">
                        Hapus
                    </button>
                </div>
            </div>
        `;

        card.querySelector(".edit-btn").addEventListener("click", () => {
            editContent(item);
        });

        card.querySelector(".toggle-btn").addEventListener("click", () => {
            togglePublished(item);
        });

        card.querySelector(".delete-btn").addEventListener("click", () => {
            deleteContent(item);
        });

        contentList.appendChild(card);
    });
}

/* =========================================
   10. TAMBAH / SIMPAN KONTEN
========================================= */

if (contentForm) {
    contentForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        console.log("Form konten disubmit.");

        const id = $("contentId")?.value || "";
        const file = imageFileInput?.files?.[0] || null;

        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = "Menyimpan...";
        }

        showMessage("formMessage", "Sedang menyimpan konten...");

        try {
            const imageUrl = file
                ? await uploadContentImage(file)
                : editingImageUrl;

            const latitudeValue = $("latitude").value.trim();
            const longitudeValue = $("longitude").value.trim();

            const payload = {
                title: $("title").value.trim(),
                category: $("category").value,
                region: $("region").value.trim(),
                description: $("description").value.trim(),
                image_url: imageUrl || null,
                address: $("address").value.trim() || null,
                latitude: latitudeValue === ""
                    ? null
                    : Number(latitudeValue),
                longitude: longitudeValue === ""
                    ? null
                    : Number(longitudeValue),
                published: $("published").checked
            };

            if (!payload.title) {
                throw new Error("Judul konten wajib diisi.");
            }

            if (
                (payload.latitude !== null &&
                    !Number.isFinite(payload.latitude)) ||
                (payload.longitude !== null &&
                    !Number.isFinite(payload.longitude))
            ) {
                throw new Error("Koordinat harus berupa angka.");
            }

            let result;

            if (id) {
                result = await supabaseClient
                    .from("content")
                    .update(payload)
                    .eq("id", id)
                    .select();
            } else {
                result = await supabaseClient
                    .from("content")
                    .insert(payload)
                    .select();
            }

            if (result.error) throw result.error;

            if (!result.data || result.data.length === 0) {
                throw new Error(
                    "Data tidak tersimpan. Periksa izin tabel content."
                );
            }

            resetForm();

            showMessage(
                "formMessage",
                "Konten berhasil disimpan!",
                "success"
            );

            await loadContent();

        } catch (error) {
            console.error("Gagal menyimpan konten:", error);

            showMessage(
                "formMessage",
                "Gagal menyimpan: " + error.message,
                "error"
            );

        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;

                saveBtn.textContent = $("contentId")?.value
                    ? "Simpan Perubahan"
                    : "Simpan Konten";
            }
        }
    });
} else {
    console.error("Form dengan id contentForm tidak ditemukan.");
}

/* =========================================
   11. EDIT KONTEN
========================================= */

function editContent(item) {
    $("contentId").value = item.id;
    $("title").value = item.title || "";
    $("category").value = item.category || "";
    $("region").value = item.region || "";
    $("description").value = item.description || "";
    $("address").value = item.address || "";
    $("latitude").value = item.latitude ?? "";
    $("longitude").value = item.longitude ?? "";
    $("published").checked = !!item.published;

    editingImageUrl = item.image_url || null;

    if (imageFileInput) {
        imageFileInput.value = "";
    }

    if (editingImageUrl && imagePreview) {
        imagePreview.src = editingImageUrl;
        imagePreview.style.display = "block";
    } else {
        clearImagePreview();
    }

    showMessage("imageMessage", "");
    showMessage("formMessage", "");

    if ($("formTitle")) {
        $("formTitle").textContent = "Edit Konten";
    }

    if (saveBtn) {
        saveBtn.textContent = "Simpan Perubahan";
    }

    cancelBtn?.classList.remove("hidden");

    contentForm?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* =========================================
   12. TERBITKAN / SEMBUNYIKAN
========================================= */

async function togglePublished(item) {
    try {
        const { error } = await supabaseClient
            .from("content")
            .update({ published: !item.published })
            .eq("id", item.id);

        if (error) throw error;

        showMessage(
            "listMessage",
            "Status konten berhasil diubah.",
            "success"
        );

        await loadContent();

    } catch (error) {
        console.error("Gagal mengubah status:", error);

        showMessage(
            "listMessage",
            "Gagal mengubah status: " + error.message,
            "error"
        );
    }
}

/* =========================================
   13. HAPUS KONTEN
========================================= */

async function deleteContent(item) {
    if (!confirm(`Yakin ingin menghapus "${item.title}"?`)) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from("content")
            .delete()
            .eq("id", item.id);

        if (error) throw error;

        showMessage(
            "listMessage",
            "Konten berhasil dihapus.",
            "success"
        );

        await loadContent();

    } catch (error) {
        console.error("Gagal menghapus konten:", error);

        showMessage(
            "listMessage",
            "Gagal menghapus: " + error.message,
            "error"
        );
    }
}

/* =========================================
   14. RESET FORM
========================================= */

function resetForm() {
    contentForm?.reset();

    if ($("contentId")) {
        $("contentId").value = "";
    }

    if ($("formTitle")) {
        $("formTitle").textContent = "Tambah Konten";
    }

    if (saveBtn) {
        saveBtn.textContent = "Simpan Konten";
        saveBtn.disabled = false;
    }

    if ($("published")) {
        $("published").checked = true;
    }

    editingImageUrl = null;

    if (imageFileInput) {
        imageFileInput.value = "";
    }

    clearImagePreview();
    showMessage("imageMessage", "");

    cancelBtn?.classList.add("hidden");
}

/* =========================================
   15. TOMBOL DAN PENCARIAN
========================================= */

if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
        resetForm();
        showMessage("formMessage", "");
    });
}

if (refreshBtn) {
    refreshBtn.addEventListener("click", loadContent);
}

if (searchInput) {
    searchInput.addEventListener("input", renderContent);
}

/* =========================================
   16. MULAI APLIKASI
========================================= */

initializeDashboard();