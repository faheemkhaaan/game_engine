

export function randomColor() {
    const hue = Math.floor(Math.random() * 360);

    return `hsl(${hue},50%,20%)`
}