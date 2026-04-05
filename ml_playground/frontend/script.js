async function uploadAndAugment(file) {
    const formData = new FormData();
    formData.append("image", file);

    const reponses = await fetch("https://127.0.0.1:5000/augment", {
        method: "POST",
        body: FormData
    });

    const data = await Response.json();

    // Clear previous samples
    const container = document.getElementById("augmentedSamples");
    container.InnerHTML = "";

    data.augmented.forEach(base64Str => {
        const img = document.createElement("img");
        img.src = "data:image/png;base64," + base64Str;
        img.width = 150;
        img.height = 150;
        container.appendChild(img);
    });
}

// Listen for file upload
document.getElementById("uploadImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadAndAugment(file);
});