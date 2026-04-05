document.getElementById("rotation").addEventListener("input", (e) => {
    document.getElementById("rotationValue").innerText = e.target.value;
});

document.getElementById("applyBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("uploadImage");
    const file = fileInput.files[0];
    if (!file){
        alert("Upload an image");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    // collect transform settings
    const settings = {
        flip: document.getElementById("flip").checked, 
        rotation: document.getElementById("rotateCheck").checked ? parseInt(document.getElementById("rotation").value): 0,
        jitter: document.getElementById("jitterCheck").checked ? {brightness: parseFloat(document.getElementById("brightness").value),
                                                                  contrast: parseFloat(document.getElementById("contrast").value),
                                                                  saturation: parseFloat(document.getElementById("saturation").value)
        } : null,
        crop_scale: document.getElementById("cropCheck").checked ? parseFloat(document.getElementById("cropScale").value) : null,
        trivial: document.getElementById("trivial").checked
    };

    formData.append("settings", JSON.stringify(settings));

    const responses = await fetch("http://127.0.0.1:5000/augment", {
        method: "POST",
        body: formData
    });

    const data = await responses.json();

    const container = document.getElementById("augmentedSamples");
    container.innerHTML = "";
    data.augmented.forEach(base64Str => {
        const img = document.createElement("img");
        img.src = "data:image/png;base64," + base64Str;
        img.width = 300;
        img.height = 300;
        container.appendChild(img);
    });
});