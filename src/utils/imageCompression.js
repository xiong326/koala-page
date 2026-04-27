function loadImageFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function resizeToBlob(img, size, quality) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);
    canvas.toBlob(resolve, 'image/webp', quality);
  });
}

export async function compressFromCrop(croppedBlob) {
  const img = await loadImageFromBlob(croppedBlob);

  const [thumb, medium] = await Promise.all([
    resizeToBlob(img, 128, 0.75),
    resizeToBlob(img, 256, 0.80),
  ]);

  return { thumb, medium };
}
