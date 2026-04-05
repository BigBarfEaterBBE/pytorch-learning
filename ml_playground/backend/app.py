from flask import Flask, request, jsonify, send_file
from PIL import Image
import io
import random
import torchvision.transforms as transforms

app = Flask(__name__)

@app.route("/")
def hello():
    return "Backend is running"

if __name__ == "__main__":
    app.run(debug=True)

@app.route("/augment", methods=["POST"])
def augment_image():
    # 1. Get uploaded file
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files["image"]
    image = Image.open(file).convert("RGB")

    # 2. Define PyTorch augmentations
    transform = transforms.Compose([
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=30),
        transforms.ColorJitter(brightness=0.5,contrast=0.5,saturation=0.5),
        transforms.RandomResizedCrop(size=(128,128), scale=(0.8,1.0))
    ])
    # 3. Generate multiple augmented samples
    augmented_images = []
    for _ in range(5):
        augmented=transform(image)
        buf=io.BytesIO()
        augmented.save(buf, formate="PNG")
        buf.seek(0)
        # conver to base64 to send frontend
        import base64
        img_str = base64.b64encode(buf.read()).decode("utf-8")
        augmented_images.append(img_str)
    
    # 4. Return json with all augmented images
    return jsonify({"augmented": augmented_images})