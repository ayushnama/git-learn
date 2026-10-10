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
    jar: `<rect x="175" y="235" width="160" height="145" rx="18"/><rect x="165" y="220" width="180" height="25" rx="10"/>`,
    holder: `<rect x="185" y="205" width="140" height="195" rx="20"/><ellipse cx="255" cy="205" rx="70" ry="18"/>`,
    arch: `<path d="M145 400V260a110 110 0 0 1 220 0v140h-50V260a60 60 0 0 0-120 0v140z"/>`,
    dispenser: `<rect x="195" y="245" width="120" height="160" rx="20"/><path d="M255 245v-55h65v15h-50v40" stroke="${vein}" stroke-width="14" fill="none"/>`,
    dish: `<ellipse cx="255" cy="330" rx="130" ry="50"/><path d="M185 305v40m40-48v55m40-55v55m40-48v40" fill="none"/>`,
    'bath-set': `<rect x="100" y="340" width="310" height="50" rx="16"/><rect x="155" y="205" width="100" height="150" rx="12"/><ellipse cx="205" cy="205" rx="50" ry="12"/>`,
    diya: `<path d="M150 320h210a105 80 0 0 1-210 0z"/><path d="M250 300q-30-45 0-75q30 40 0 75" fill="#C4A77D" stroke="none"/>`,
    'pooja-tray': `<ellipse cx="255" cy="335" rx="160" ry="65"/><ellipse cx="185" cy="315" rx="35" ry="20"/><ellipse cx="280" cy="300" rx="35" ry="20"/><ellipse cx="305" cy="355" rx="35" ry="20"/>`,
    incense: `<rect x="115" y="345" width="280" height="35" rx="15"/><path d="M160 345l80-160" stroke="${vein}" stroke-width="4"/>`,
    plate: `<ellipse cx="255" cy="330" rx="150" ry="65"/><ellipse cx="255" cy="325" rx="120" ry="48" fill="none"/>`,
    coasters: `<ellipse cx="210" cy="290" rx="75" ry="30"/><ellipse cx="300" cy="345" rx="75" ry="30"/><ellipse cx="210" cy="365" rx="75" ry="30"/>`,
    'cake-stand': `<path d="M220 270h70v130h-70z"/><ellipse cx="255" cy="400" rx="65" ry="20"/><ellipse cx="255" cy="270" rx="150" ry="50"/>`,
    table: `<rect x="210" y="280" width="90" height="150" rx="12"/><ellipse cx="255" cy="280" rx="145" ry="50"/>`,
    'coffee-table': `<rect x="155" y="290" width="60" height="130" rx="12"/><rect x="305" y="290" width="60" height="130" rx="12"/><ellipse cx="255" cy="285" rx="190" ry="65"/>`,
    stool: `<path d="M200 245h110l15 185H185z"/><ellipse cx="255" cy="245" rx="85" ry="35"/>`,
  }[type] || ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 510 600"><rect width="510" height="600" fill="${bg}"/>${veins}<g fill="${soft}" stroke="${vein}" stroke-opacity=".5" stroke-width="1.5" style="filter:drop-shadow(0 18px 14px rgba(0,0,0,.18))">${obj}</g></svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}
