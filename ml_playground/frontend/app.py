from flask import Flask, request, jsonify, send_from_directory
from PIL import Image
import io
import torchvision.transforms as transforms
import base64
import json
import os

app = Flask(__name__)

@app.route("/")
def serve_html():
    return send_from_directory(".", "augmentation.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(".", path)

@app.route("/augment", methods=["POST"])
def augment_image():
    # 1. Get uploaded file
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files["image"]
    image = Image.open(file).convert("RGB")

    settings = json.loads(request.form.get("settings"))

    transform_list = []

    if settings["flip"]:
        transform_list.append(transforms.RandomHorizontalFlip(p=1.0))
    if settings["rotation"] > 0:
        transform_list.append(transforms.RandomRotation(settings["rotation"]))
    if settings["jitter"] is not None:
        transform_list.append(transforms.ColorJitter(
            brightness=settings["jitter"]["brightness"],
            contrast = settings["jitter"]["contrast"],
            saturation = settings["jitter"]["saturation"]
        ))
    if settings["crop_scale"] is not None:
        transform_list.append(transforms.RandomResizedCrop(size=(128,128),
                                                           scale=(settings["crop_scale"], 1.0)
                                                           ))
    if settings["trivial"]:
        transform_list.append(transforms.TrivialAugmentWide())
    if not transform_list:
        transform_list.append(transforms.Resize((128,128)))

    # 2. Define PyTorch augmentations
    transform = transforms.Compose(transform_list)
    # 3. Generate multiple augmented samples
    augmented_images = []
    for _ in range(5):
        augmented=transform(image)
        buf=io.BytesIO()
        augmented.save(buf, format="PNG")
        buf.seek(0)
        # conver to base64 to send frontend
        img_str = base64.b64encode(buf.read()).decode("utf-8")
        augmented_images.append(img_str)
    
    # 4. Return json with all augmented images
    return jsonify({"augmented": augmented_images})

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)

