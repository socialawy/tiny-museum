const ADJECTIVES = [
    'Sparkly', 'Dancing', 'Dreamy', 'Bouncy', 'Shiny',
    'Fluffy', 'Wiggly', 'Silly', 'Happy', 'Cozy',
    'Fizzy', 'Swooshy', 'Twinkly', 'Squishy', 'Zippy',
    'Glowy', 'Snuggly', 'Bubbly', 'Peppy', 'Whimsy',
] as const;

const NOUNS = [
    'Tiger', 'Cloud', 'Star', 'Rocket', 'Rainbow',
    'Penguin', 'Cupcake', 'Dragon', 'Butterfly', 'Unicorn',
    'Jellyfish', 'Tornado', 'Moonbeam', 'Panda', 'Volcano',
    'Octopus', 'Sunflower', 'Dinosaur', 'Mermaid', 'Galaxy',
] as const;

function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function funArtworkName(): string {
    return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
}

export function funFlipbookName(): string {
    return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
}