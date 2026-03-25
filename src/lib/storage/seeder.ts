import { db, type Artwork, type ArtworkBlob, type FlipbookFrame } from './db';
import { nanoid } from 'nanoid';

const SEEDED_KEY = 'tiny_museum_demo_seeded';

/**
 * Seeds the database with demo content if it hasn't been done yet.
 */
export async function seedDemoContent() {
  if (typeof window === 'undefined') return;
  
  const alreadySeeded = localStorage.getItem(SEEDED_KEY);
  if (alreadySeeded === 'true') return;

  try {
    console.log('🏛️ Seeding demo museum...');
    
    // 1. Create a "Starry Night" demo drawing
    await createDemoArtwork({
      title: 'Starry Night',
      roomId: 'my-art',
      type: 'drawing',
      canvasJSON: '{"version":"5.3.0","objects":[{"type":"circle","originX":"center","originY":"center","left":150,"top":150,"width":100,"height":100,"fill":"#feca57","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"radius":50,"startAngle":0,"endAngle":6.283185307179586}]}',
      tags: ['favorite', 'demo']
    });

    // 2. Create a "Rainbow Flower" demo drawing
    await createDemoArtwork({
      title: 'Rainbow Flower',
      roomId: 'my-art',
      type: 'drawing',
      canvasJSON: '{"version":"5.3.0","objects":[{"type":"rect","originX":"left","originY":"top","left":100,"top":100,"width":100,"height":100,"fill":"#ff9f43","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":45,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"rx":0,"ry":0}]}',
      tags: ['demo']
    });

    // 3. Create a Bouncing Ball Flipbook demo
    await createDemoFlipbook();

    localStorage.setItem(SEEDED_KEY, 'true');
    console.log('✅ Demo museum ready!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

async function createDemoArtwork(params: {
  title: string;
  roomId: string;
  type: 'drawing' | 'flipbook';
  canvasJSON: string;
  tags: string[];
}) {
  const id = nanoid();
  const now = Date.now();
  
  // Create a minimal colored dot for thumbnail
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#6c5ce7';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = 'white';
    ctx.font = '20px sans-serif';
    ctx.fillText('DEMO', 20, 60);
  }
  
  const thumbnail = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/webp', 0.5);
  });

  const artwork: Artwork = {
    id,
    title: params.title,
    roomId: params.roomId,
    type: params.type,
    thumbnail,
    canvasJSON: params.canvasJSON,
    createdAt: now,
    updatedAt: now,
    tags: params.tags
  };

  const blob: ArtworkBlob = {
    id,
    fullRes: thumbnail, // reuse for demo
    format: 'png'
  };

  await db.artworks.add(artwork);
  await db.blobs.add(blob);
  return id;
}

async function createDemoFlipbook() {
  const artworkId = nanoid();
  const now = Date.now();
  
  // Create frames
  const frameCount = 3;
  for (let i = 0; i < frameCount; i++) {
    const frameId = `${artworkId}_frame_${i}`;
    
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(20 + i * 30, 50, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const thumb = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/webp', 0.5);
    });

    const frame: FlipbookFrame = {
      id: frameId,
      artworkId,
      index: i,
      canvasJSON: '{"version":"5.3.0","objects":[]}',
      thumbnail: thumb
    };
    
    await db.frames.add(frame);
  }

  // Parent artwork record
  const thumb = await db.frames.where({ artworkId, index: 0 }).first().then(f => f?.thumbnail || new Blob());

  const artwork: Artwork = {
    id: artworkId,
    title: 'Bouncing Ball',
    roomId: 'my-art',
    type: 'flipbook',
    thumbnail: thumb,
    canvasJSON: '',
    createdAt: now,
    updatedAt: now,
    tags: ['demo']
  };

  const blob: ArtworkBlob = {
    id: artworkId,
    fullRes: thumb,
    format: 'png'
  };

  await db.artworks.add(artwork);
  await db.blobs.add(blob);
}
