// Generates veined marble product art as an SVG data-URI (swap for real photos later).
const TONES = {
  white: ['#F6F3EE', '#8A8780', '#E4DFD6'],
  black: ['#26252A', '#C9B88A', '#3A383E'],
  beige: ['#E6DCCB', '#9A8467', '#D3C6AF'],
  green: ['#DCE3DA', '#52695A', '#C2CEC1'],
}
function rng(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280) }

export function marbleArt(seed, tone = 'white', type = 'decor') {
  const [bg, vein, soft] = TONES[tone] || TONES.white
  const r = rng(seed + 7)
  let veins = ''
  for (let i = 0; i < 7; i++) {
    const y = r() * 600, w = i % 3 === 0 ? 2.2 : 0.8
    veins += `<path d="M-20 ${y} C 150 ${y + (r() - .5) * 300}, 300 ${y + (r() - .5) * 300}, 520 ${y + (r() - .5) * 400}" stroke="${vein}" stroke-width="${w}" fill="none" opacity="${0.25 + r() * 0.4}"/>`
  }
  const obj = {
    cup: `<rect x="190" y="220" width="130" height="150" rx="14"/><path d="M320 250h28a28 28 0 0 1 0 70h-28" fill="none" stroke="${vein}" stroke-width="12"/>`,
    bowl: `<path d="M120 270h270a135 135 0 0 1-270 0z"/>`,
    tray: `<rect x="90" y="270" width="330" height="90" rx="24"/>`,
    clock: `<circle cx="255" cy="300" r="125"/><path d="M255 300V220M255 300l50 28" stroke="${vein}" stroke-width="7" stroke-linecap="round"/>`,
    decor: `<ellipse cx="255" cy="300" rx="90" ry="150"/>`,
  }[type] || ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 510 600"><rect width="510" height="600" fill="${bg}"/>${veins}<g fill="${soft}" stroke="${vein}" stroke-opacity=".5" stroke-width="1.5" style="filter:drop-shadow(0 18px 14px rgba(0,0,0,.18))">${obj}</g></svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}
