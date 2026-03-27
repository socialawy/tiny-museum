import { db, type Artwork, type ArtworkBlob, type FlipbookFrame } from './db';
import { nanoid } from 'nanoid';

const SEEDED_KEY = 'tiny_museum_demo_seeded_v6';

/**
 * Marks the demo seeder as already run, preventing it from injecting demo
 * content on the next page load. Call this after a successful museum import
 * so the seeder doesn't add duplicate artworks on top of restored data.
 */
export function markDemoSeeded() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SEEDED_KEY, 'true');
  }
}

/**
 * Seeds the database with demo content on first launch.
 * Creates a "Welcome Gallery" room with 3 drawings + 1 flipbook.
 */
export async function seedDemoContent() {
  if (typeof window === 'undefined') return;

  const alreadySeeded = localStorage.getItem(SEEDED_KEY);
  if (alreadySeeded === 'true') return;

  try {
    // Create Welcome Gallery room
    try {
      await db.rooms.add({
        id: 'welcome',
        name: 'Welcome Gallery',
        icon: '👋',
        color: '#F39C12',
        order: 2,
        createdAt: Date.now(),
      });
    } catch {
      // Room may already exist from partial previous run
    }

    // 1. Starry Night — dark sky with moon, stars, and hills
    await createSceneArtwork({
      title: 'Starry Night',
      tags: ['favorite', 'demo'],
      draw: (ctx, w, h) => {
        // Dark sky gradient
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#0a1628');
        sky.addColorStop(0.6, '#1a3a5c');
        sky.addColorStop(1, '#2d5a7b');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        // Stars
        ctx.fillStyle = '#FECA57';
        const stars = [
          [80, 40, 3], [200, 60, 2], [350, 30, 4], [500, 80, 2], [620, 45, 3],
          [150, 120, 2], [450, 100, 3], [700, 70, 2], [50, 130, 2], [550, 140, 2],
          [300, 90, 2], [100, 180, 1.5], [400, 50, 1.5], [250, 150, 1.5], [600, 120, 1.5],
        ];
        for (const [x, y, r] of stars) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Big sparkle stars (4-point)
        const sparkles = [[120, 70, 8], [480, 55, 10], [680, 100, 7]];
        for (const [x, y, s] of sparkles) {
          drawSparkle(ctx, x, y, s, '#FECA57');
        }

        // Moon
        ctx.fillStyle = '#FECA57';
        ctx.beginPath();
        ctx.arc(620, 100, 40, 0, Math.PI * 2);
        ctx.fill();
        // Moon shadow (crescent effect)
        ctx.fillStyle = '#0a1628';
        ctx.beginPath();
        ctx.arc(640, 90, 35, 0, Math.PI * 2);
        ctx.fill();

        // Rolling hills
        ctx.fillStyle = '#1a3a2a';
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.quadraticCurveTo(200, h - 120, 400, h - 60);
        ctx.quadraticCurveTo(600, h - 100, w, h - 40);
        ctx.lineTo(w, h);
        ctx.fill();

        ctx.fillStyle = '#2d5a3a';
        ctx.beginPath();
        ctx.moveTo(0, h - 30);
        ctx.quadraticCurveTo(150, h - 80, 350, h - 40);
        ctx.quadraticCurveTo(550, h - 70, w, h - 20);
        ctx.lineTo(w, h);
        ctx.fill();
      },
      fabricObjects: [
        // Moon
        { type: 'Circle', originX: 'center', originY: 'center', left: 620, top: 100, radius: 40, fill: '#FECA57' },
        // Stars as small circles
        ...[
          [80, 40, 3], [200, 60, 2], [350, 30, 4], [500, 80, 2], [620, 45, 3],
          [150, 120, 2], [450, 100, 3], [700, 70, 2],
        ].map(([x, y, r]) => ({
          type: 'Circle', originX: 'center', originY: 'center', left: x, top: y, radius: r, fill: '#FECA57',
        })),
      ],
      background: '#0a1628',
    });

    // 2. Rainbow Flower Garden
    await createSceneArtwork({
      title: 'Flower Garden',
      tags: ['demo'],
      draw: (ctx, w, h) => {
        // Sky
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#87CEEB');
        sky.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        // Sun
        ctx.fillStyle = '#FECA57';
        ctx.beginPath();
        ctx.arc(650, 80, 50, 0, Math.PI * 2);
        ctx.fill();
        // Sun rays
        ctx.strokeStyle = '#FECA57';
        ctx.lineWidth = 3;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
          ctx.beginPath();
          ctx.moveTo(650 + Math.cos(a) * 55, 80 + Math.sin(a) * 55);
          ctx.lineTo(650 + Math.cos(a) * 75, 80 + Math.sin(a) * 75);
          ctx.stroke();
        }

        // Ground
        ctx.fillStyle = '#7CB342';
        ctx.fillRect(0, h * 0.65, w, h * 0.35);
        ctx.fillStyle = '#689F38';
        ctx.fillRect(0, h * 0.65, w, 8);

        // Flowers
        const flowers = [
          { x: 100, y: h * 0.6, color: '#FF6B6B', size: 18 },
          { x: 220, y: h * 0.55, color: '#FECA57', size: 22 },
          { x: 350, y: h * 0.62, color: '#A29BFE', size: 16 },
          { x: 480, y: h * 0.58, color: '#FD79A8', size: 20 },
          { x: 600, y: h * 0.6, color: '#48DBFB', size: 17 },
          { x: 160, y: h * 0.68, color: '#FF8E53', size: 14 },
          { x: 400, y: h * 0.7, color: '#6C5CE7', size: 15 },
          { x: 540, y: h * 0.66, color: '#00B894', size: 18 },
        ];

        for (const f of flowers) {
          // Stem
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x, f.y + 50);
          ctx.stroke();
          // Leaf
          ctx.fillStyle = '#66BB6A';
          ctx.beginPath();
          ctx.ellipse(f.x + 10, f.y + 30, 8, 4, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          // Petals
          drawFlower(ctx, f.x, f.y, f.size, f.color);
        }

        // Butterfly
        drawButterfly(ctx, 300, h * 0.4, '#FD79A8');
        drawButterfly(ctx, 500, h * 0.35, '#48DBFB');
      },
      fabricObjects: [
        { type: 'Circle', originX: 'center', originY: 'center', left: 650, top: 80, radius: 50, fill: '#FECA57' },
      ],
      background: '#87CEEB',
    });

    // 3. Underwater World
    await createSceneArtwork({
      title: 'Underwater World',
      tags: ['demo'],
      draw: (ctx, w, h) => {
        // Ocean gradient
        const ocean = ctx.createLinearGradient(0, 0, 0, h);
        ocean.addColorStop(0, '#0984E3');
        ocean.addColorStop(0.5, '#0652DD');
        ocean.addColorStop(1, '#1B1464');
        ctx.fillStyle = ocean;
        ctx.fillRect(0, 0, w, h);

        // Light rays from surface
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#74b9ff';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(120 + i * 150, 0);
          ctx.lineTo(80 + i * 150, h);
          ctx.lineTo(160 + i * 150, h);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Sandy floor
        ctx.fillStyle = '#F0D78C';
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.quadraticCurveTo(w * 0.25, h - 40, w * 0.5, h - 20);
        ctx.quadraticCurveTo(w * 0.75, h - 35, w, h - 15);
        ctx.lineTo(w, h);
        ctx.fill();

        // Seaweed
        const seaweeds = [60, 200, 450, 620, 720];
        for (const sx of seaweeds) {
          drawSeaweed(ctx, sx, h - 25, 80 + Math.random() * 40);
        }

        // Bubbles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        const bubbles = [
          [150, 100, 8], [300, 180, 5], [500, 120, 10], [650, 200, 6],
          [100, 250, 4], [400, 80, 7], [580, 280, 5], [250, 300, 3],
        ];
        for (const [bx, by, br] of bubbles) {
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Fish
        drawFish(ctx, 180, 160, 40, '#FF6B6B', false);
        drawFish(ctx, 500, 220, 35, '#FECA57', true);
        drawFish(ctx, 350, 120, 30, '#00B894', false);
        drawFish(ctx, 620, 150, 25, '#FD79A8', true);

        // Starfish on floor
        drawStarfish(ctx, 350, h - 35, 15, '#FF8E53');
        drawStarfish(ctx, 550, h - 28, 12, '#FECA57');
      },
      fabricObjects: [],
      background: '#0984E3',
    });

    // 4. Bouncing Star flipbook (6 frames)
    await createDemoFlipbook();

    localStorage.setItem(SEEDED_KEY, 'true');
  } catch (err) {
    console.error('Demo seed failed:', err);
    // Set flag anyway to prevent retry storm
    try { localStorage.setItem(SEEDED_KEY, 'true'); } catch { /* silent */ }
  }
}

// ── Drawing helpers ──

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.3, y - size * 0.3);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size * 0.3, y + size * 0.3);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.3, y + size * 0.3);
  ctx.lineTo(x - size, y);
  ctx.lineTo(x - size * 0.3, y - size * 0.3);
  ctx.closePath();
  ctx.fill();
}

function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(a) * size * 0.6,
      y + Math.sin(a) * size * 0.6,
      size * 0.5, size * 0.35, a, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  // Center
  ctx.fillStyle = '#FECA57';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawButterfly(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  // Left wing
  ctx.beginPath();
  ctx.ellipse(x - 10, y, 12, 8, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  // Right wing
  ctx.beginPath();
  ctx.ellipse(x + 10, y, 12, 8, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  // Body
  ctx.fillStyle = '#2D3436';
  ctx.fillRect(x - 1.5, y - 8, 3, 16);
}

function drawSeaweed(ctx: CanvasRenderingContext2D, x: number, baseY: number, height: number) {
  ctx.strokeStyle = '#00B894';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  const segments = 4;
  for (let i = 1; i <= segments; i++) {
    const cy = baseY - (height / segments) * i;
    const cx = x + (i % 2 === 0 ? -12 : 12);
    ctx.quadraticCurveTo(cx, cy + height / segments / 2, x, cy);
  }
  ctx.stroke();
}

function drawFish(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, flipX: boolean) {
  ctx.save();
  ctx.translate(x, y);
  if (flipX) ctx.scale(-1, 1);

  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(-size * 0.8, 0);
  ctx.lineTo(-size * 1.3, -size * 0.4);
  ctx.lineTo(-size * 1.3, size * 0.4);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(size * 0.4, -size * 0.1, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2D3436';
  ctx.beginPath();
  ctx.arc(size * 0.45, -size * 0.1, size * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawStarfish(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = x + Math.cos(angle) * size;
    const py = y + Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, outerR: number, innerR: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// ── Scene artwork creator ──

interface SceneParams {
  title: string;
  tags: string[];
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  fabricObjects: Record<string, unknown>[];
  background: string;
}

async function createSceneArtwork(params: SceneParams) {
  const id = nanoid();
  const now = Date.now();
  const W = 800;
  const H = 500;

  // Render thumbnail
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  params.draw(ctx, W, H);

  const sceneDataUrl = canvas.toDataURL('image/png');

  const thumbnail = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/webp', 0.85);
  });

  const artwork: Artwork = {
    id,
    title: params.title,
    roomId: 'welcome',
    type: 'drawing',
    thumbnail,
    canvasJSON: JSON.stringify({
      version: '5.3.0',
      _w: W,
      _h: H,
      objects: params.fabricObjects,
      background: params.background,
      backgroundImage: {
        type: 'image',
        version: '5.3.0',
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        width: W,
        height: H,
        src: sceneDataUrl,
      },
    }),
    createdAt: now,
    updatedAt: now,
    tags: params.tags,
  };

  const blob: ArtworkBlob = {
    id,
    fullRes: thumbnail,
    format: 'png',
  };

  await db.artworks.add(artwork);
  await db.blobs.add(blob);
  return id;
}

// ── Flipbook: Dancing Star (6 frames) ──

async function createDemoFlipbook() {
  const artworkId = nanoid();
  const now = Date.now();
  const W = 800;
  const H = 500;
  const bgColor = '#1a1a2e';

  const frameData = [
    { scale: 0.4, rot: 0, sparkles: false, glow: false },
    { scale: 0.6, rot: 15, sparkles: false, glow: false },
    { scale: 0.85, rot: 30, sparkles: false, glow: true },
    { scale: 1.0, rot: 45, sparkles: true, glow: true },
    { scale: 0.85, rot: 60, sparkles: true, glow: true },
    { scale: 0.6, rot: 75, sparkles: false, glow: false },
  ];

  const frames: FlipbookFrame[] = [];

  for (let i = 0; i < frameData.length; i++) {
    const fd = frameData[i];
    const frameId = `${artworkId}_frame_${i}`;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // Glow behind star
    if (fd.glow) {
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 100 * fd.scale);
      grad.addColorStop(0, 'rgba(254, 202, 87, 0.3)');
      grad.addColorStop(1, 'rgba(254, 202, 87, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Star
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate((fd.rot * Math.PI) / 180);
    drawStar(ctx, 0, 0, 60 * fd.scale, 25 * fd.scale, '#FECA57');
    ctx.restore();

    // Sparkles
    if (fd.sparkles) {
      const sparklePositions = [
        [W / 2 - 100, H / 2 - 80], [W / 2 + 90, H / 2 - 70],
        [W / 2 - 80, H / 2 + 90], [W / 2 + 100, H / 2 + 60],
        [W / 2 + 10, H / 2 - 110], [W / 2 - 110, H / 2 + 20],
      ];
      for (const [sx, sy] of sparklePositions) {
        drawSparkle(ctx, sx, sy, 6 + Math.random() * 4, 'rgba(255, 255, 255, 0.7)');
      }
    }

    // Small background stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    const bgStars = [[100, 60], [300, 40], [600, 80], [700, 200], [120, 350], [650, 400], [400, 430]];
    for (const [sx, sy] of bgStars) {
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const frameDataUrl = canvas.toDataURL('image/png');

    const thumb = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/webp', 0.85);
    });

    const frame: FlipbookFrame = {
      id: frameId,
      artworkId,
      index: i,
      canvasJSON: JSON.stringify({
        version: '5.3.0',
        _w: W,
        _h: H,
        objects: [
          {
            type: 'Circle',
            originX: 'center',
            originY: 'center',
            left: W / 2,
            top: H / 2,
            radius: 60 * fd.scale,
            fill: '#FECA57',
            angle: fd.rot,
          },
        ],
        background: bgColor,
        backgroundImage: {
          type: 'image',
          version: '5.3.0',
          originX: 'left',
          originY: 'top',
          left: 0,
          top: 0,
          width: W,
          height: H,
          src: frameDataUrl,
        },
      }),
      thumbnail: thumb,
    };

    await db.frames.add(frame);
    frames.push(frame);
  }

  const artwork: Artwork = {
    id: artworkId,
    title: 'Dancing Star',
    roomId: 'welcome',
    type: 'flipbook',
    thumbnail: frames[0].thumbnail,
    canvasJSON: JSON.stringify({ fps: 4, frameCount: frameData.length }),
    createdAt: now,
    updatedAt: now,
    tags: ['demo'],
  };

  const blob: ArtworkBlob = {
    id: artworkId,
    fullRes: frames[0].thumbnail,
    format: 'png',
  };

  await db.artworks.add(artwork);
  await db.blobs.add(blob);
}
