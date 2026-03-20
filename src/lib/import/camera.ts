export async function openCamera(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment', // back camera for scanning drawings
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  });
}

export function captureFrame(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0);
  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'webp' = 'png',
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Blob conversion failed'));
      },
      `image/${format}`,
      quality,
    );
  });
}

export function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
