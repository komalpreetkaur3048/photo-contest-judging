const photoInput = document.querySelector("#photo");

const previewContainer =
    document.querySelector("#previewContainer");


photoInput.addEventListener("change", function () {

    const file = photoInput.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        previewContainer.innerHTML = `
            <img 
                src="${event.target.result}"
                class="image-preview"
                alt="Selected photograph"
            >
        `;

    };

    reader.readAsDataURL(file);

});