export async function convertToWebP(file: File, quality = 0.88): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("WebP conversion failed"));
          const webpName = file.name.replace(/\.[^.]+$/, "") + ".webp";
          resolve(new File([blob], webpName, { type: "image/webp" }));
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

export async function convertToWebPObjectUrl(
  file: File,
  quality = 0.88
): Promise<{ file: File; previewUrl: string }> {
  const webpFile = await convertToWebP(file, quality);
  const previewUrl = URL.createObjectURL(webpFile);
  return { file: webpFile, previewUrl };
}
