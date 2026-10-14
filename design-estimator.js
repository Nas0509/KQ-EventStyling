document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("designImageInput");
    const preview = document.getElementById("designImagePreview");
    const previewImage = document.getElementById("designPreviewImage");
    const imageName = document.getElementById("designImageName");
    const imageSize = document.getElementById("designImageSize");
    const removeButton = document.getElementById("removeDesignImage");
    const estimateButton = document.getElementById("analyzeDesignButton");
    const status = document.getElementById("designEstimateStatus");
    const result = document.getElementById("designEstimateResult");
    const packageName = document.getElementById("designSuggestedPackage");
    const price = document.getElementById("designEstimatedPrice");
    const features = document.getElementById("designDetectedFeatures");
    if (!input || !estimateButton) return;

    const maxBytes = 10 * 1024 * 1024;
    let selectedFile = null;
    let estimate = null;
    let previewUrl = "";
    const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

    function setStatus(message, isError = false) {
        status.textContent = message;
        status.classList.toggle("error", isError);
    }

    function clearEstimate() {
        estimate = null;
        result.hidden = true;
        packageName.textContent = "";
        price.textContent = "";
        features.replaceChildren();
    }

    function clearImage() {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = "";
        selectedFile = null;
        input.value = "";
        preview.hidden = true;
        previewImage.removeAttribute("src");
        estimateButton.disabled = true;
        clearEstimate();
        setStatus("OpenAI will analyze this image to prepare an estimate. If you submit a booking, KQ admins can review the image.");
        window.kqDesignEstimate = null;
        window.kqDesignImageFile = null;
    }

    function compressForAnalysis(file) {
        return createImageBitmap(file).then(bitmap => {
            const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(bitmap.width * scale));
            canvas.height = Math.max(1, Math.round(bitmap.height * scale));
            const context = canvas.getContext("2d", { alpha: false });
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            bitmap.close();
            return new Promise((resolve, reject) => canvas.toBlob(blob => {
                if (!blob) return reject(new Error("The selected image could not be prepared."));
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => reject(new Error("The selected image could not be read."));
                reader.readAsDataURL(blob);
            }, "image/jpeg", 0.82));
        }).catch(() => {
            throw new Error("This image could not be opened. Please choose a JPG, PNG, or WebP image.");
        });
    }

    input.addEventListener("change", () => {
        clearEstimate();
        const file = input.files?.[0];
        if (!file) {
            selectedFile = null;
            estimateButton.disabled = true;
            return;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            clearImage();
            setStatus("Please choose a JPG, PNG, or WebP image.", true);
            return;
        }
        if (file.size > maxBytes) {
            clearImage();
            setStatus("This image is larger than 10 MB. Choose a smaller image.", true);
            return;
        }
        selectedFile = file;
        previewUrl = URL.createObjectURL(file);
        previewImage.src = previewUrl;
        imageName.textContent = file.name;
        imageSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
        preview.hidden = false;
        estimateButton.disabled = false;
        setStatus("Image ready. Select Estimate from this image when you’re ready.");
        window.kqDesignImageFile = file;
    });

    removeButton?.addEventListener("click", clearImage);

    estimateButton.addEventListener("click", async () => {
        if (!selectedFile || !window.supabaseClient) {
            setStatus("The estimate service is unavailable right now. Please refresh and try again.", true);
            return;
        }
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session) {
            setStatus("Please log in before requesting an AI estimate.", true);
            return;
        }
        estimateButton.disabled = true;
        estimateButton.textContent = "Analyzing design…";
        setStatus("Looking at the design and matching it to KQ’s packages…");
        clearEstimate();
        try {
            const imageDataUrl = await compressForAnalysis(selectedFile);
            const { data, error } = await window.supabaseClient.functions.invoke("estimate-event-design", {
                body: { imageDataUrl }
            });
            if (error) throw new Error(error.message || "The estimate could not be prepared.");
            if (!data || !["Basic", "Elegant", "Grand"].includes(data.package)) {
                throw new Error("The estimate returned an unexpected result. Please try again.");
            }
            estimate = data;
            window.kqDesignEstimate = data;
            packageName.textContent = `${data.package} Celebration`;
            price.textContent = peso.format(Number(data.price));
            (Array.isArray(data.features) ? data.features : []).slice(0, 7).forEach(item => {
                const li = document.createElement("li");
                li.textContent = String(item);
                features.appendChild(li);
            });
            result.hidden = false;
            setStatus("Estimate ready. You can still select any package from the package cards above.");
        } catch (error) {
            console.error("Design estimate error:", error);
            setStatus(error.message || "The estimate could not be prepared. Please try again later.", true);
        } finally {
            estimateButton.disabled = !selectedFile;
            estimateButton.textContent = "Estimate from this image";
        }
    });

    window.kqDesignEstimate = null;
    window.kqDesignImageFile = null;
});
