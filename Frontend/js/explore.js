/* =========================================================
   PHOTOJUDGE — EXPLORE COMMUNITY GALLERY LOGIC
   Pinterest-Style Photo Gallery, Likes, Downloads, & Uploads
========================================================= */

// ==========================================
// 1. DEFAULT SEED DATA (High Quality Unsplash Photos)
// ==========================================
const DEFAULT_EXPLORE_PHOTOS = [
    {
        id: "exp-1",
        title: "Misty Alpine Sunrise",
        author: "Elena Rostova",
        category: "Nature",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=85",
        likes: 142,
        tags: ["mountains", "fog", "sunrise", "alps"],
        description: "Captured at dawn in the Swiss Alps after a quiet autumn rainfall. The morning mist creates an ethereal layering between peaks.",
        createdAt: "2026-08-20T08:30:00Z"
    },
    {
        id: "exp-2",
        title: "Neon Rain in Shinjuku",
        author: "Kenji Sato",
        category: "Street",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=85",
        likes: 215,
        tags: ["tokyo", "cyberpunk", "reflections", "street"],
        description: "Rain reflections illuminating the narrow alleys of Shinjuku with neon hues. Shot on 35mm f/1.4.",
        createdAt: "2026-08-21T19:45:00Z"
    },
    {
        id: "exp-3",
        title: "Majestic Monarch Lion",
        author: "Marcus Vance",
        category: "Wildlife",
        imageUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1000&q=85",
        likes: 389,
        tags: ["lion", "safari", "serengeti", "predator"],
        description: "A male lion surveying the Serengeti plains in late afternoon golden light.",
        createdAt: "2026-08-22T14:15:00Z"
    },
    {
        id: "exp-4",
        title: "Curvilinear Concrete Facade",
        author: "Sophie Dubois",
        category: "Architecture",
        imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=85",
        likes: 98,
        tags: ["modernist", "curves", "minimal", "geometry"],
        description: "Geometric curves of contemporary architectural marvels creating mesmerizing shadow patterns.",
        createdAt: "2026-08-23T11:00:00Z"
    },
    {
        id: "exp-5",
        title: "Golden Hour in Cappadocia",
        author: "Dara Al-Mansoor",
        category: "Travel",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85",
        likes: 276,
        tags: ["travel", "goldenhour", "coastal", "wanderlust"],
        description: "Endless horizons and warm coastal breeze during sunset along the Mediterranean coastline.",
        createdAt: "2026-08-24T17:20:00Z"
    },
    {
        id: "exp-6",
        title: "Silent Gaze",
        author: "Liam O'Connor",
        category: "Portraits",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85",
        likes: 184,
        tags: ["portrait", "expression", "editorial", "lighting"],
        description: "Studio portrait study focusing on natural skin tones and gentle catchlights.",
        createdAt: "2026-08-24T18:00:00Z"
    },
    {
        id: "exp-7",
        title: "Cosmic Arch over Desert",
        author: "Astrid Lindgren",
        category: "Night",
        imageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=85",
        likes: 312,
        tags: ["astrophotography", "milkyway", "stars", "nightsky"],
        description: "A 20-second exposure of the Milky Way core stretching across the desert sky.",
        createdAt: "2026-08-25T01:30:00Z"
    },
    {
        id: "exp-8",
        title: "Minimalist Dune Ridge",
        author: "Carlos Mendez",
        category: "Minimalist",
        imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=85",
        likes: 167,
        tags: ["minimal", "desert", "dunes", "monochrome"],
        description: "Wind-swept sand dunes creating clean gradients and razor-sharp shadow lines.",
        createdAt: "2026-08-25T15:10:00Z"
    },
    {
        id: "exp-9",
        title: "Emerald Canopy Walk",
        author: "Mei Lin",
        category: "Nature",
        imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85",
        likes: 220,
        tags: ["forest", "trees", "greenery", "wild"],
        description: "Deep within the temperate rainforest as light filters through the ancient canopy.",
        createdAt: "2026-08-25T16:45:00Z"
    }
];

// ==========================================
// 2. STATE MANAGEMENT & LOCALSTORAGE
// ==========================================

function getExplorePhotos() {
    const stored = localStorage.getItem("explorePhotos");
    if (!stored) {
        localStorage.setItem("explorePhotos", JSON.stringify(DEFAULT_EXPLORE_PHOTOS));
        return DEFAULT_EXPLORE_PHOTOS;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        return DEFAULT_EXPLORE_PHOTOS;
    }
}

function saveExplorePhotos(photos) {
    localStorage.setItem("explorePhotos", JSON.stringify(photos));
}

function getUserLikedIds() {
    const stored = localStorage.getItem("likedExplorePhotos");
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (e) {
        return [];
    }
}

function saveUserLikedIds(ids) {
    localStorage.setItem("likedExplorePhotos", JSON.stringify(ids));
}

let activeCategory = "all";
let searchQuery = "";
let sortBy = "newest";
let currentUploadedDataUrl = "";
let currentLightboxPhotoId = null;

// ==========================================
// 3. INITIALIZATION & DOM BINDINGS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    initExplorePage();
});

function initExplorePage() {
    renderGallery();
    setupSearchAndFilters();
    setupPostModal();
    setupLightboxModal();
    prefillAuthorIfLoggedIn();
}

function prefillAuthorIfLoggedIn() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    const authorInput = document.querySelector("#postAuthor");
    if (currentUser && currentUser.name && authorInput) {
        authorInput.value = currentUser.name;
    }
}

// ==========================================
// 4. GALLERY RENDERING & FILTERING
// ==========================================

function getFilteredAndSortedPhotos() {
    let photos = getExplorePhotos();

    // Category filter
    if (activeCategory !== "all") {
        photos = photos.filter(p => p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Search filter (title, author, tags, description)
    if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        photos = photos.filter(p => {
            const titleMatch = p.title && p.title.toLowerCase().includes(q);
            const authorMatch = p.author && p.author.toLowerCase().includes(q);
            const descMatch = p.description && p.description.toLowerCase().includes(q);
            const tagsMatch = p.tags && p.tags.some(t => t.toLowerCase().includes(q));
            return titleMatch || authorMatch || descMatch || tagsMatch;
        });
    }

    // Sorting
    photos.sort((a, b) => {
        if (sortBy === "popular") {
            return (b.likes || 0) - (a.likes || 0);
        } else if (sortBy === "oldest") {
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        } else {
            // Newest default
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
    });

    return photos;
}

function renderGallery() {
    const galleryContainer = document.querySelector("#exploreGallery");
    const emptyState = document.querySelector("#galleryEmptyState");
    if (!galleryContainer) return;

    const photos = getFilteredAndSortedPhotos();
    const likedIds = getUserLikedIds();

    if (photos.length === 0) {
        galleryContainer.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";

    galleryContainer.innerHTML = photos.map(photo => {
        const isLiked = likedIds.includes(photo.id);
        const authorInitial = photo.author ? photo.author.charAt(0).toUpperCase() : "P";
        const tagsHtml = (photo.tags || []).slice(0, 2).map(t => `#${t}`).join(" ");

        return `
            <div class="pin-card" data-id="${photo.id}">
                <div class="pin-image-wrapper">
                    <img src="${photo.imageUrl}" alt="${photo.title}" loading="lazy">
                    
                    <!-- Hover overlay with quick actions -->
                    <div class="pin-overlay">
                        <div class="pin-top-actions">
                            <span class="pin-category-tag">${photo.category || "Community"}</span>
                            <div class="pin-btn-group">
                                <button type="button" class="pin-btn btn-like ${isLiked ? "liked" : ""}" data-id="${photo.id}" title="${isLiked ? "Unlike" : "Like"} photo" aria-label="Like">
                                    ${isLiked ? "❤️" : "🤍"}
                                </button>
                                <button type="button" class="pin-btn btn-download" data-id="${photo.id}" title="Download Photo" aria-label="Download">
                                    ⬇️
                                </button>
                            </div>
                        </div>

                        <div class="pin-bottom-info">
                            <h3 class="pin-title">${photo.title}</h3>
                            <div class="pin-author">
                                <div class="author-avatar">${authorInitial}</div>
                                <span>${photo.author}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bottom meta strip -->
                <div class="pin-card-meta">
                    <div class="pin-meta-left">
                        <div class="author-avatar" style="width: 22px; height: 22px; font-size: 0.7rem;">${authorInitial}</div>
                        <div>
                            <div class="pin-meta-title" title="${photo.title}">${photo.title}</div>
                            <div class="pin-meta-author">${photo.author}</div>
                        </div>
                    </div>
                    <div class="pin-meta-stats">
                        <span class="${isLiked ? "liked" : ""}">${isLiked ? "❤️" : "🤍"}</span>
                        <span>${photo.likes || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    attachCardEventListeners();
}

function attachCardEventListeners() {
    // Card Click -> Lightbox
    document.querySelectorAll(".pin-card").forEach(card => {
        card.addEventListener("click", function (e) {
            // If click was on like or download button, don't open modal
            if (e.target.closest(".btn-like") || e.target.closest(".btn-download")) {
                return;
            }
            const photoId = this.dataset.id;
            openLightbox(photoId);
        });
    });

    // Quick Like Button
    document.querySelectorAll(".pin-btn.btn-like").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            const photoId = this.dataset.id;
            toggleLikePhoto(photoId);
        });
    });

    // Quick Download Button
    document.querySelectorAll(".pin-btn.btn-download").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            const photoId = this.dataset.id;
            downloadPhoto(photoId);
        });
    });
}

// ==========================================
// 5. SEARCH & FILTER HANDLERS
// ==========================================

function setupSearchAndFilters() {
    const searchInput = document.querySelector("#exploreSearchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            searchQuery = this.value;
            renderGallery();
        });
    }

    const sortSelect = document.querySelector("#exploreSortSelect");
    if (sortSelect) {
        sortSelect.addEventListener("change", function () {
            sortBy = this.value;
            renderGallery();
        });
    }

    const categoryButtons = document.querySelectorAll(".category-pill");
    categoryButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            categoryButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            activeCategory = this.dataset.category || "all";
            renderGallery();
        });
    });

    const btnEmptyPost = document.querySelector("#btnEmptyPost");
    if (btnEmptyPost) {
        btnEmptyPost.addEventListener("click", openPostModal);
    }
}

// ==========================================
// 6. LIKES & DOWNLOADS SYSTEM
// ==========================================

function toggleLikePhoto(photoId) {
    let photos = getExplorePhotos();
    let likedIds = getUserLikedIds();
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    const isLiked = likedIds.includes(photoId);

    if (isLiked) {
        // Unlike
        likedIds = likedIds.filter(id => id !== photoId);
        photo.likes = Math.max(0, (photo.likes || 1) - 1);
        showToast("Removed from liked photos");
    } else {
        // Like
        likedIds.push(photoId);
        photo.likes = (photo.likes || 0) + 1;
        showToast("❤️ Added to your likes!");
    }

    saveUserLikedIds(likedIds);
    saveExplorePhotos(photos);
    renderGallery();

    // If Lightbox is open for this photo, update its state too
    if (currentLightboxPhotoId === photoId) {
        updateLightboxLikeState(photo, !isLiked);
    }
}

function downloadPhoto(photoId) {
    const photos = getExplorePhotos();
    const photo = photos.find(p => p.id === photoId);
    if (!photo || !photo.imageUrl) return;

    showToast("Starting download...");

    const safeTitle = (photo.title || "photo")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");
    const fileName = `photojudge-${safeTitle}.jpg`;

    // Attempt blob fetch to force download directly on client side
    fetch(photo.imageUrl, { mode: "cors" })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.blob();
        })
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
            showToast("✅ Download complete!");
        })
        .catch(err => {
            // Fallback for CORS restricted images: open direct or fallback anchor
            const a = document.createElement("a");
            a.href = photo.imageUrl;
            a.target = "_blank";
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast("📥 Photo opened for saving!");
        });
}

// ==========================================
// 7. POST / SHARE PHOTO MODAL & UPLOAD
// ==========================================

function setupPostModal() {
    const modal = document.querySelector("#postPhotoModal");
    const btnOpen = document.querySelector("#btnOpenPostModal");
    const btnClose = document.querySelector("#btnClosePostModal");
    const form = document.querySelector("#postPhotoForm");

    const dropzone = document.querySelector("#uploadDropzone");
    const fileInput = document.querySelector("#fileUploadInput");
    const previewWrapper = document.querySelector("#imagePreviewWrapper");
    const previewImg = document.querySelector("#imagePreview");
    const btnRemovePreview = document.querySelector("#btnRemovePreview");
    const urlInput = document.querySelector("#postImageUrl");

    if (!modal) return;

    if (btnOpen) btnOpen.addEventListener("click", openPostModal);
    if (btnClose) btnClose.addEventListener("click", closePostModal);

    modal.addEventListener("click", function (e) {
        if (e.target === modal) closePostModal();
    });

    // Dropzone interaction
    if (dropzone && fileInput) {
        dropzone.addEventListener("click", () => fileInput.click());

        dropzone.addEventListener("dragover", function (e) {
            e.preventDefault();
            dropzone.classList.add("dragover");
        });

        dropzone.addEventListener("dragleave", function () {
            dropzone.classList.remove("dragover");
        });

        dropzone.addEventListener("drop", function (e) {
            e.preventDefault();
            dropzone.classList.remove("dragover");
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener("change", function () {
            if (fileInput.files && fileInput.files[0]) {
                handleFileSelect(fileInput.files[0]);
            }
        });
    }

    function handleFileSelect(file) {
        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file (JPG, PNG, WEBP).");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            currentUploadedDataUrl = e.target.result;
            if (previewImg && previewWrapper && dropzone) {
                previewImg.src = currentUploadedDataUrl;
                previewWrapper.style.display = "block";
                dropzone.style.display = "none";
                if (urlInput) urlInput.value = "";
            }
        };
        reader.readAsDataURL(file);
    }

    if (btnRemovePreview) {
        btnRemovePreview.addEventListener("click", function () {
            currentUploadedDataUrl = "";
            if (previewWrapper && dropzone && fileInput) {
                previewWrapper.style.display = "none";
                dropzone.style.display = "block";
                fileInput.value = "";
            }
        });
    }

    // Direct Image URL Preview handler
    if (urlInput) {
        urlInput.addEventListener("input", function () {
            if (this.value.trim() && !currentUploadedDataUrl) {
                if (previewImg && previewWrapper && dropzone) {
                    previewImg.src = this.value.trim();
                    previewWrapper.style.display = "block";
                    dropzone.style.display = "none";
                }
            }
        });
    }

    // Form Submit
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const title = document.querySelector("#postTitle").value.trim();
            const author = document.querySelector("#postAuthor").value.trim();
            const category = document.querySelector("#postCategory").value;
            const tagsRaw = document.querySelector("#postTags").value;
            const description = document.querySelector("#postDescription").value.trim();
            const imageUrl = currentUploadedDataUrl || (urlInput ? urlInput.value.trim() : "");

            if (!imageUrl) {
                alert("Please upload an image file or provide a valid image URL.");
                return;
            }

            if (!title || !author) {
                alert("Please fill in both the title and photographer name.");
                return;
            }

            const tags = tagsRaw
                .split(",")
                .map(t => t.trim().replace(/^#/, ""))
                .filter(t => t.length > 0);

            const newPhoto = {
                id: "exp-" + Date.now(),
                title: title,
                author: author,
                category: category || "Nature",
                imageUrl: imageUrl,
                likes: 0,
                tags: tags.length > 0 ? tags : [category.toLowerCase()],
                description: description || "Shared with the PhotoJudge community.",
                createdAt: new Date().toISOString()
            };

            const photos = getExplorePhotos();
            photos.unshift(newPhoto);
            saveExplorePhotos(photos);

            // Reset form
            form.reset();
            currentUploadedDataUrl = "";
            if (previewWrapper) previewWrapper.style.display = "none";
            if (dropzone) dropzone.style.display = "block";

            closePostModal();
            renderGallery();
            showToast("🎉 Photo posted to Explore successfully!");
        });
    }
}

function openPostModal() {
    const modal = document.querySelector("#postPhotoModal");
    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
        prefillAuthorIfLoggedIn();
    }
}

function closePostModal() {
    const modal = document.querySelector("#postPhotoModal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}

// ==========================================
// 8. LIGHTBOX / PHOTO DETAIL MODAL
// ==========================================

function setupLightboxModal() {
    const modal = document.querySelector("#lightboxModal");
    const btnClose = document.querySelector("#btnCloseLightbox");
    const likeBtn = document.querySelector("#lightboxLikeBtn");
    const downloadBtn = document.querySelector("#lightboxDownloadBtn");

    if (!modal) return;

    if (btnClose) btnClose.addEventListener("click", closeLightbox);

    modal.addEventListener("click", function (e) {
        if (e.target === modal) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeLightbox();
            closePostModal();
        }
    });

    if (likeBtn) {
        likeBtn.addEventListener("click", function () {
            if (currentLightboxPhotoId) {
                toggleLikePhoto(currentLightboxPhotoId);
            }
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener("click", function () {
            if (currentLightboxPhotoId) {
                downloadPhoto(currentLightboxPhotoId);
            }
        });
    }
}

function openLightbox(photoId) {
    const photos = getExplorePhotos();
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    currentLightboxPhotoId = photoId;
    const likedIds = getUserLikedIds();
    const isLiked = likedIds.includes(photoId);

    const modal = document.querySelector("#lightboxModal");
    const img = document.querySelector("#lightboxImg");
    const avatar = document.querySelector("#lightboxAvatar");
    const author = document.querySelector("#lightboxAuthor");
    const date = document.querySelector("#lightboxDate");
    const title = document.querySelector("#lightboxTitle");
    const desc = document.querySelector("#lightboxDescription");
    const tagsContainer = document.querySelector("#lightboxTags");

    if (img) img.src = photo.imageUrl;
    if (avatar) avatar.textContent = photo.author ? photo.author.charAt(0).toUpperCase() : "P";
    if (author) author.textContent = photo.author || "Anonymous";

    if (date) {
        const formattedDate = photo.createdAt
            ? new Date(photo.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "Recently shared";
        date.textContent = `Posted on ${formattedDate} • ${photo.category || "General"}`;
    }

    if (title) title.textContent = photo.title;
    if (desc) desc.textContent = photo.description || "No description provided.";

    if (tagsContainer) {
        tagsContainer.innerHTML = (photo.tags || []).map(t => `<span class="lightbox-tag">#${t}</span>`).join("");
    }

    updateLightboxLikeState(photo, isLiked);

    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

function updateLightboxLikeState(photo, isLiked) {
    const likeBtn = document.querySelector("#lightboxLikeBtn");
    const likeCountSpan = document.querySelector("#lightboxLikeCount");

    if (likeCountSpan) likeCountSpan.textContent = photo.likes || 0;

    if (likeBtn) {
        if (isLiked) {
            likeBtn.classList.add("liked");
            likeBtn.innerHTML = `<span>❤️</span> <span>${photo.likes || 0}</span> Likes`;
        } else {
            likeBtn.classList.remove("liked");
            likeBtn.innerHTML = `<span>🤍</span> <span>${photo.likes || 0}</span> Likes`;
        }
    }
}

function closeLightbox() {
    const modal = document.querySelector("#lightboxModal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
        currentLightboxPhotoId = null;
    }
}

// ==========================================
// 9. TOAST NOTIFICATION UTILITY
// ==========================================

function showToast(message) {
    const existing = document.querySelector(".toast-notice");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast-notice";
    toast.innerHTML = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
