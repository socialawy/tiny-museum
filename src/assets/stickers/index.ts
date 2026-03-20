export interface StickerPack {
  id: string;
  name: string;
  icon: string;
  stickers: Sticker[];
}

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
}

const animals: StickerPack = {
  id: 'animals',
  name: 'Animals',
  icon: '🐾',
  stickers: [
    { id: 'cat', name: 'Cat', emoji: '🐱' },
    { id: 'dog', name: 'Dog', emoji: '🐶' },
    { id: 'bunny', name: 'Bunny', emoji: '🐰' },
    { id: 'butterfly', name: 'Butterfly', emoji: '🦋' },
    { id: 'unicorn', name: 'Unicorn', emoji: '🦄' },
    { id: 'dolphin', name: 'Dolphin', emoji: '🐬' },
    { id: 'bird', name: 'Bird', emoji: '🐦' },
    { id: 'ladybug', name: 'Ladybug', emoji: '🐞' },
  ],
};

const nature: StickerPack = {
  id: 'nature',
  name: 'Nature',
  icon: '🌿',
  stickers: [
    { id: 'flower', name: 'Flower', emoji: '🌸' },
    { id: 'tree', name: 'Tree', emoji: '🌳' },
    { id: 'sun', name: 'Sun', emoji: '☀️' },
    { id: 'rainbow', name: 'Rainbow', emoji: '🌈' },
    { id: 'star', name: 'Star', emoji: '⭐' },
    { id: 'moon', name: 'Moon', emoji: '🌙' },
    { id: 'cloud', name: 'Cloud', emoji: '☁️' },
    { id: 'tulip', name: 'Tulip', emoji: '🌷' },
  ],
};

const fun: StickerPack = {
  id: 'fun',
  name: 'Fun',
  icon: '🎉',
  stickers: [
    { id: 'crown', name: 'Crown', emoji: '👑' },
    { id: 'heart', name: 'Heart', emoji: '❤️' },
    { id: 'sparkle', name: 'Sparkle', emoji: '✨' },
    { id: 'balloon', name: 'Balloon', emoji: '🎈' },
    { id: 'cake', name: 'Cake', emoji: '🎂' },
    { id: 'gift', name: 'Gift', emoji: '🎁' },
    { id: 'music', name: 'Music', emoji: '🎵' },
    { id: 'rocket', name: 'Rocket', emoji: '🚀' },
  ],
};

export const STICKER_PACKS: StickerPack[] = [animals, nature, fun];