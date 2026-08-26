/* =========================================================
   EXPLORE PAGE — SIMPLE COMMUNITY GALLERY
   Functions: View Photos, Post Photos, Like, Download & Search
========================================================= */

// 1. Initial Sample Photos
const INITIAL_PHOTOS = [
    {
        id: "1",
        title: "Misty Sunrise",
        author: "Elena",
        category: "Nature",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        likes: 24,
        description: "Morning mist over the mountains."
    },
    {
        id: "2",
        title: "Tokyo Street Rain",
        author: "Kenji",
        category: "Street",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        likes: 45,
        description: "Neon reflections on a rainy night."
    },
    {
        id: "3",
        title: "Wild Lion",
        author: "Marcus",
        category: "Wildlife",
        imageUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80",
        likes: 80,
        description: "Lion in the African savanna."
    },
    {
        id: "4",
        title: "Modern Architecture",
        author: "Sophie",
        category: "Architecture",
        imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        likes: 19,
        description: "Clean geometric curves and lines."
    },
    {
        id: "5",
        title: "Coastal Sunset",
        author: "Dara",
        category: "Travel",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        likes: 62,
        description: "Warm golden hour by the sea."
    },
    {
        id: "6",
        title: "Studio Portrait",
        author: "Liam",
        category: "Portraits",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        likes: 31,
        description: "Natural light portrait."
    }
];

// 2. Load and Save helper functions (localStorage)
function getPhotos() {
    const data = localStorage.getItem("explorePhotos");
    if (!data) {
        localStorage.setItem("explorePhotos", JSON.stringify(INITIAL_PHOTOS));
        return INITIAL_PHOTOS;
    }
    return JSON.parse(data);
}

function savePhotos(photos) {
    localStorage.setItem("explorePhotos", JSON.stringify(photos));
}

// Current filter variables
let currentCategory = "all";
let currentSearch = "";
let uploadedImageData = "";

// 3. Render Gallery Cards
function renderGallery() {
    const gallery = document.querySelector("#exploreGallery");
    const emptyState = document.querySelector("#galleryEmptyState");
    if (!gallery) return;

    let photos = getPhotos();

    // Filter by Category
    if (currentCategory !== "all") {
        photos = photos.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
    }

    // Filter by Search Query
    if (currentSearch.trim() !== "") {
        const query = currentSearch.toLowerCase();
        photos = photos.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.author.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
    }

    // Show empty message if no photos match
    if (photos.length === 0) {
        gallery.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
        return;
    }
    if (emptyState) emptyState.style.display = "none";

    // Generate HTML for each card
    gallery.innerHTML = photos.map(photo => `
        <div class="pin-card" onclick="openLightbox('${photo.id}')">
            <div class="pin-image-wrapper">
                <img src="${photo.imageUrl}" alt="${photo.title}">
                
                <div class="pin-overlay">
                    <div class="pin-top-actions">
                        <span class="pin-category-tag">${photo.category}</span>
                        <div class="pin-btn-group">
                            <button type="button" class="pin-btn btn-like" onclick="likePhoto(event, '${photo.id}')" title="Like">
                                ❤️
                            </button>
                            <button type="button" class="pin-btn btn-download" onclick="downloadPhoto(event, '${photo.imageUrl}', '${photo.title}')" title="Download">
                                ⬇️
                            </button>
                        </div>
                    </div>
                    <div class="pin-bottom-info">
                        <h3 class="pin-title">${photo.title}</h3>
                        <div class="pin-author">By ${photo.author}</div>
                    </div>
                </div>
            </div>
            
            <div class="pin-card-meta">
                <div>
                    <div class="pin-meta-title">${photo.title}</div>
                    <div class="pin-meta-author">By ${photo.author}</div>
                </div>
                <div class="pin-meta-stats">❤️ ${photo.likes || 0}</div>
            </div>
        </div>
    `).join("");
}

// 4. Like a Photo
function likePhoto(event, id) {
    event.stopPropagation(); // Stop card click from opening modal
    const photos = getPhotos();
    const photo = photos.find(p => p.id === id);
    if (photo) {
        photo.likes = (photo.likes || 0) + 1;
        savePhotos(photos);
        renderGallery();
    }
}

// 5. Download a Photo
function downloadPhoto(event, imageUrl, title) {
    if (event) event.stopPropagation();
    
    // Fetch image as blob and download it
    fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = (title || "photo") + ".jpg";
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => {
            // Simple fallback if cross-origin restricts direct blob
            window.open(imageUrl, "_blank");
        });
}

// 6. Post / Share New Photo
function setupUploadForm() {
    const form = document.querySelector("#postPhotoForm");
    const fileInput = document.querySelector("#fileUploadInput");
    const dropzone = document.querySelector("#uploadDropzone");
    const previewWrapper = document.querySelector("#imagePreviewWrapper");
    const previewImg = document.querySelector("#imagePreview");
    const btnRemove = document.querySelector("#btnRemovePreview");

    if (dropzone && fileInput) {
        dropzone.onclick = () => fileInput.click();
        fileInput.onchange = function () {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    uploadedImageData = e.target.result;
                    previewImg.src = uploadedImageData;
                    previewWrapper.style.display = "block";
                    dropzone.style.display = "none";
                };
                reader.readAsDataURL(file);
            }
        };
    }

    if (btnRemove) {
        btnRemove.onclick = function () {
            uploadedImageData = "";
            previewWrapper.style.display = "none";
            dropzone.style.display = "block";
            if (fileInput) fileInput.value = "";
        };
    }

    if (form) {
        form.onsubmit = function (e) {
            e.preventDefault();
            const title = document.querySelector("#postTitle").value.trim();
            const author = document.querySelector("#postAuthor").value.trim();
            const category = document.querySelector("#postCategory").value;
            const desc = document.querySelector("#postDescription").value.trim();
            const urlInput = document.querySelector("#postImageUrl").value.trim();

            const finalImage = uploadedImageData || urlInput;
            if (!finalImage) {
                alert("Please upload a file or paste an image URL.");
                return;
            }

            const newPhoto = {
                id: Date.now().toString(),
                title: title,
                author: author,
                category: category,
                imageUrl: finalImage,
                likes: 0,
                description: desc || "Shared with the community."
            };

            const photos = getPhotos();
            photos.unshift(newPhoto); // Add to beginning
            savePhotos(photos);

            form.reset();
            uploadedImageData = "";
            if (previewWrapper) previewWrapper.style.display = "none";
            if (dropzone) dropzone.style.display = "block";

            closeModal("#postPhotoModal");
            renderGallery();
        };
    }
}

// 7. Lightbox / Photo Detail Modal
let currentLightboxPhoto = null;

function openLightbox(id) {
    const photos = getPhotos();
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    currentLightboxPhoto = photo;
    document.querySelector("#lightboxImg").src = photo.imageUrl;
    document.querySelector("#lightboxTitle").textContent = photo.title;
    document.querySelector("#lightboxAuthor").textContent = "By " + photo.author;
    document.querySelector("#lightboxDescription").textContent = photo.description || "";
    document.querySelector("#lightboxLikeCount").textContent = photo.likes || 0;

    const modal = document.querySelector("#lightboxModal");
    if (modal) modal.classList.add("active");
}

// 8. Modal Open & Close Helpers
function openModal(modalId) {
    const modal = document.querySelector(modalId);
    if (modal) modal.classList.add("active");
}

function closeModal(modalId) {
    const modal = document.querySelector(modalId);
    if (modal) modal.classList.remove("active");
}

// 9. Initialize Event Listeners
document.addEventListener("DOMContentLoaded", function () {
    renderGallery();
    setupUploadForm();

    // Search Input Listener
    const searchInput = document.querySelector("#exploreSearchInput");
    if (searchInput) {
        searchInput.oninput = function () {
            currentSearch = this.value;
            renderGallery();
        };
    }

    // Category Buttons Listener
    const categoryButtons = document.querySelectorAll(".category-pill");
    categoryButtons.forEach(btn => {
        btn.onclick = function () {
            categoryButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            currentCategory = this.dataset.category || "all";
            renderGallery();
        };
    });

    // Modal Open & Close buttons
    const btnOpenPost = document.querySelector("#btnOpenPostModal");
    const btnClosePost = document.querySelector("#btnClosePostModal");
    const btnCloseLightbox = document.querySelector("#btnCloseLightbox");
    const lightboxLikeBtn = document.querySelector("#lightboxLikeBtn");
    const lightboxDownloadBtn = document.querySelector("#lightboxDownloadBtn");

    if (btnOpenPost) btnOpenPost.onclick = () => openModal("#postPhotoModal");
    if (btnClosePost) btnClosePost.onclick = () => closeModal("#postPhotoModal");
    if (btnCloseLightbox) btnCloseLightbox.onclick = () => closeModal("#lightboxModal");

    if (lightboxLikeBtn) {
        lightboxLikeBtn.onclick = function () {
            if (currentLightboxPhoto) {
                likePhoto(new Event("click"), currentLightboxPhoto.id);
                document.querySelector("#lightboxLikeCount").textContent = currentLightboxPhoto.likes + 1;
            }
        };
    }

    if (lightboxDownloadBtn) {
        lightboxDownloadBtn.onclick = function () {
            if (currentLightboxPhoto) {
                downloadPhoto(null, currentLightboxPhoto.imageUrl, currentLightboxPhoto.title);
            }
        };
    }
});
