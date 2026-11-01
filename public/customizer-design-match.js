document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("customizerDesignInput");
    const preview = document.getElementById("customizerDesignPreview");
    const previewImage = document.getElementById("customizerDesignPreviewImage");
    const imageName = document.getElementById("customizerDesignName");
    const imageSize = document.getElementById("customizerDesignSize");
    const removeButton = document.getElementById("removeCustomizerDesign");
    const status = document.getElementById("customizerEstimateStatus");
    const result = document.getElementById("customizerEstimateResult");
    const suggestedPackage = document.getElementById("customizerSuggestedPackage");
    const suggestedPrice = document.getElementById("customizerSuggestedPrice");
    const notes = document.getElementById("customizerEstimateNotes");
    if (!input || !status || !result) return;

    const allPackages = Object.entries(packages).flatMap(([category, items]) =>
        items.map(item => ({ ...item, category }))
    );
    const maxBytes = 10 * 1024 * 1024;
    let selectedFile = null;
    let previewUrl = "";
    let scanNumber = 0;
    const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

    function setStatus(text, error = false) {
        status.textContent = text;
        status.classList.toggle("error", error);
    }

    function analyzeImage(file) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const objectUrl = URL.createObjectURL(file);
            image.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    const limit = 96;
                    const scale = Math.min(1, limit / Math.max(image.naturalWidth, image.naturalHeight));
                    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
                    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
                    const context = canvas.getContext("2d", { willReadFrequently: true });
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
                    const colors = new Set();
                    const luminance = new Float32Array(canvas.width * canvas.height);
                    let saturationTotal = 0;
                    let luminanceTotal = 0;
                    let edgeTotal = 0;
                    let edgeCount = 0;

                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const offset = (y * canvas.width + x) * 4;
                            const r = pixels[offset] / 255;
                            const g = pixels[offset + 1] / 255;
                            const b = pixels[offset + 2] / 255;
                            const high = Math.max(r, g, b);
                            const low = Math.min(r, g, b);
                            const light = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
                            saturationTotal += high === 0 ? 0 : (high - low) / high;
                            luminanceTotal += light;
                            luminance[y * canvas.width + x] = light;
                            colors.add(`${Math.round(r * 5)}-${Math.round(g * 5)}-${Math.round(b * 5)}`);
                            if (x > 0) {
                                edgeTotal += Math.abs(light - luminance[y * canvas.width + x - 1]);
                                edgeCount++;
                            }
                            if (y > 0) {
                                edgeTotal += Math.abs(light - luminance[(y - 1) * canvas.width + x]);
                                edgeCount++;
                            }
                        }
                    }

                    const count = canvas.width * canvas.height;
                    const palette = Math.min(1, colors.size / 90);
                    const saturation = saturationTotal / count;
                    const texture = edgeCount ? Math.min(1, (edgeTotal / edgeCount) / 0.22) : 0;
                    const score = (palette * 0.4) + (saturation * 0.25) + (texture * 0.35);
                    const thresholds = [0.22, 0.30, 0.38, 0.48, 0.59, 0.70];
                    const packageIndex = thresholds.findIndex(threshold => score < threshold);
                    const match = allPackages[packageIndex < 0 ? allPackages.length - 1 : packageIndex];
                    const averageLight = luminanceTotal / count;
                    const paletteDescription = saturation < 0.2 ? "soft, muted tones" : saturation < 0.48 ? "balanced colors" : "rich, vivid colors";
                    const textureDescription = texture < 0.28 ? "a simple visual layout" : texture < 0.58 ? "a moderately detailed visual layout" : "a visually detailed layout";

                    resolve({
                        package: match.name,
                        packageId: match.id,
                        category: match.category,
                        price: match.price,
                        features: [
                            `Palette scan: ${paletteDescription}`,
                            `Texture scan: ${textureDescription}`,
                            averageLight > 0.7 ? "Overall image tone: bright" : averageLight < 0.3 ? "Overall image tone: dark" : "Overall image tone: balanced"
                        ],
                        explanation: "Free browser-based visual estimate from image colors and texture. It does not identify decorations or measure the venue; KQ will confirm the final package and price."
                    });
                } catch {
                    reject(new Error("This image could not be analyzed. Please choose another JPG, PNG, or WebP image."));
                } finally {
                    URL.revokeObjectURL(objectUrl);
                }
            };
            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error("This image could not be opened. Please choose another JPG, PNG, or WebP image."));
            };
            image.src = objectUrl;
        });
    }

    function clearImage(message = "Upload a reference image to get an automatic preliminary package suggestion. No API or credits needed.") {
        scanNumber++;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = "";
        selectedFile = null;
        input.value = "";
        preview.hidden = true;
        previewImage?.removeAttribute("src");
        result.hidden = true;
        notes.replaceChildren();
        window.kqCustomizerDesignFile = null;
        window.kqCustomizerDesignEstimate = null;
        setStatus(message);
    }

    input.addEventListener("change", async () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = "";
        const file = input.files?.[0];
        if (!file) {
            clearImage();
            return;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            clearImage("Please choose a JPG, PNG, or WebP image.");
            setStatus("Please choose a JPG, PNG, or WebP image.", true);
            return;
        }
        if (file.size > maxBytes) {
            clearImage("This image is larger than 10 MB. Choose a smaller image.");
            setStatus("This image is larger than 10 MB. Choose a smaller image.", true);
            return;
        }

        selectedFile = file;
        window.kqCustomizerDesignFile = file;
        window.kqCustomizerDesignEstimate = null;
        previewUrl = URL.createObjectURL(file);
        previewImage.src = previewUrl;
        imageName.textContent = file.name;
        imageSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
        preview.hidden = false;
        result.hidden = true;
        notes.replaceChildren();
        const thisScan = ++scanNumber;
        setStatus("Scanning your image in this browser…");

        try {
            const estimate = await analyzeImage(file);
            if (thisScan !== scanNumber || selectedFile !== file) return;
            window.kqCustomizerDesignEstimate = estimate;
            suggestedPackage.textContent = estimate.package;
            suggestedPrice.textContent = peso.format(estimate.price);
            estimate.features.forEach(note => {
                const item = document.createElement("li");
                item.textContent = note;
                notes.appendChild(item);
            });
            result.hidden = false;

            // Apply the suggestion to the live package summary; the customer can still choose another package.
            selectedCategory = estimate.category;
            selectedPackage = allPackages.find(item => item.id === estimate.packageId);
            categoryButtons.forEach(button => button.classList.toggle("selected", button.dataset.category === selectedCategory));
            loadPackages();
            updateSummary();
            setStatus("Package suggestion ready and selected. You can choose another package below if you prefer.");
        } catch (error) {
            if (thisScan === scanNumber) setStatus(error.message || "The image could not be scanned. Please try another image.", true);
        }
    });

    removeButton?.addEventListener("click", () => clearImage());
    document.getElementById("resetCustomizer")?.addEventListener("click", () => clearImage());
    window.kqCustomizerDesignFile = null;
    window.kqCustomizerDesignEstimate = null;
});
