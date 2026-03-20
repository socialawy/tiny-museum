const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export interface ImportedFile {
  blob: Blob;
  name: string;
  width: number;
  height: number;
  objectUrl: string;
}

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'This file type is not supported. Try PNG, JPEG, or WebP!';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'This file is too big! Try a smaller image.';
  }
  return null;
}

export async function processImportedFile(file: File): Promise<ImportedFile> {
  const objectUrl = URL.createObjectURL(file);

  const dimensions = await new Promise<{ width: number; height: number }>(
    (resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Could not read this image'));
      img.src = objectUrl;
    },
  );

  return {
    blob: file,
    name: file.name,
    width: dimensions.width,
    height: dimensions.height,
    objectUrl,
  };
}

export function pickFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ALLOWED_TYPES.join(',');
    input.onchange = () => {
      const file = input.files?.[0] ?? null;
      resolve(file);
    };
    // Handle cancel
    input.oncancel = () => resolve(null);
    input.click();
  });
}
