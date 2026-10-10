import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { inflateSync } from 'node:zlib'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'

const root = path.resolve(import.meta.dirname, '..')
const temporaryRoot = path.resolve(os.tmpdir())
const temp = await mkdtemp(path.join(temporaryRoot, 'marbelo-p1-browser-'))
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const servers = []
const errors = []
const results = []
const catalogMode = process.argv.includes('--catalog')
let chrome, socket, preserveArtifacts = false
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function pngPixels(encoded) {
  const png = Buffer.from(encoded, 'base64')
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20)
  assert.equal(png[24], 8, 'screenshots use 8-bit PNG channels')
  assert.ok([2, 6].includes(png[25]), 'screenshots use RGB or RGBA')
  const channels = png[25] === 2 ? 3 : 4
  const chunks = []
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset)
    if (png.toString('ascii', offset + 4, offset + 8) === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + length))
    offset += length + 12
  }
  const rows = inflateSync(Buffer.concat(chunks)), pixels = Buffer.alloc(width * height * channels)
  const stride = width * channels
  let offset = 0
  for (let y = 0; y < height; y++) {
    const filter = rows[offset++]
    assert.ok(filter >= 0 && filter <= 4)
    for (let x = 0; x < stride; x++) {
      const index = y * stride + x
      const left = x >= channels ? pixels[index - channels] : 0
      const up = y ? pixels[index - stride] : 0
      const upperLeft = y && x >= channels ? pixels[index - stride - channels] : 0
      let predictor = 0
      if (filter === 1) predictor = left
      if (filter === 2) predictor = up
      if (filter === 3) predictor = (left + up) >> 1
      if (filter === 4) {
        const p = left + up - upperLeft
        const a = Math.abs(p - left), b = Math.abs(p - up), c = Math.abs(p - upperLeft)
        predictor = a <= b && a <= c ? left : b <= c ? up : upperLeft
      }
      pixels[index] = (rows[offset++] + predictor) & 255
    }
  }
  return { width, height, channels, pixels }
}

function compareScreenshots(current, original) {
  const a = pngPixels(current), b = pngPixels(original)
  assert.deepEqual([a.width, a.height, a.channels], [b.width, b.height, b.channels])
  let changed = 0, maxDelta = 0
  for (let i = 0; i < a.pixels.length; i += a.channels) {
    let different = false
    for (let channel = 0; channel < a.channels; channel++) {
      const delta = Math.abs(a.pixels[i + channel] - b.pixels[i + channel])
      if (delta) { different = true; maxDelta = Math.max(maxDelta, delta) }
    }
    if (different) changed++
  }
  // Backdrop blur may dither by one RGB level across a few pixels between identical renders.
  return { passed: maxDelta <= 1 && changed / (a.width * a.height) <= 0.0005, changedPixels: changed, maxChannelDelta: maxDelta }
}

async function until(check, label, timeout = 30000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    try { const value = await check(); if (value) return value } catch {}
    await sleep(100)
  }
  throw new Error(`Timed out: ${label}`)
}

async function startServer(baseline = false) {
  const original = new Map()
  if (baseline) {
    for (const file of ['src/components/Navbar.jsx', 'src/components/ProductCard.jsx', 'src/components/ProductFilter.jsx', 'src/components/ProductGallery.jsx', 'src/components/CartItem.jsx', 'src/components/Newsletter.jsx', 'src/pages/ProductDetails.jsx', 'src/pages/Info.jsx', 'src/pages/Shop.jsx']) {
      original.set(path.join(root, file).replaceAll('\\', '/'), execFileSync('git', [
        '-c', `safe.directory=${root.replaceAll('\\', '/')}`, 'show', `HEAD:${file}`,
      ], { cwd: root, encoding: 'utf8', windowsHide: true }))
    }
  }
  const server = await createServer({
    root, configFile: false, cacheDir: path.join(temp, baseline ? 'baseline-cache' : 'cache'),
    plugins: [{ name: 'original-ui-reference', enforce: 'pre', load(id) { return original.get(id) } }, {
      name: 'catalog-ui-test-fixture',
      resolveId(id) { if (id === '/__catalog-fixture.js') return '\0catalog-fixture.js' },
      load(id) {
        if (id !== '\0catalog-fixture.js') return
        return `import React from 'react';import {createRoot} from 'react-dom/client';import {MemoryRouter,Routes,Route,Link} from 'react-router-dom';import {CatalogProvider} from '/src/context/CatalogContext.jsx';import {StoreProvider,useStore} from '/src/context/StoreContext.jsx';import {useCatalog} from '/src/context/CatalogContext.jsx';import ProductCard from '/src/components/ProductCard.jsx';import {CustomerProvider} from '/src/context/CustomerContext.jsx';import {Profile,Addresses,Orders,OrderDetails} from '/src/pages/Customer.jsx';import Checkout from '/src/pages/Checkout.jsx';import Auth from '/src/pages/Auth.jsx';import ProductImage from '/src/components/ProductImage.jsx';import ErrorBoundary from '/src/components/ErrorBoundary.jsx';
          export function mountSafetyFixture(crash=false){const node=document.createElement('div');node.id='safety-test-fixture';document.body.appendChild(node);const root=createRoot(node);function Broken(){throw new Error('test-boundary-render')}root.render(crash?React.createElement(ErrorBoundary,null,React.createElement(Broken)):React.createElement(ProductImage,{src:'/missing-product-image.png',alt:'Test product',className:'h-20 w-20'}));return {root,node}}
          function Probe(){const {products}=useCatalog();const {count}=useStore();return React.createElement('div',null,React.createElement('p',{'data-testid':'catalog-probe'},products[0].name+'|'+count),React.createElement(ProductCard,{product:products[0]}))}
          export function mountFixture(service){const node=document.createElement('div');node.id='catalog-test-fixture';document.body.appendChild(node);const root=createRoot(node);root.render(React.createElement(MemoryRouter,null,React.createElement(CatalogProvider,{service},React.createElement(StoreProvider,null,React.createElement(Probe)))));return {root,node}}
          export function mountCustomerFixture(service){const node=document.createElement('div');node.id='customer-test-fixture';document.body.appendChild(node);const root=createRoot(node);root.render(React.createElement(MemoryRouter,{initialEntries:['/account/addresses']},React.createElement(CatalogProvider,null,React.createElement(StoreProvider,null,React.createElement(CustomerProvider,{service},React.createElement(React.Fragment,null,React.createElement(Link,{to:'/checkout','data-testid':'fixture-checkout'},'Checkout'),React.createElement(Link,{to:'/account/orders/missing','data-testid':'fixture-missing'},'Missing order'),React.createElement(Routes,null,React.createElement(Route,{path:'/account/profile',element:React.createElement(Profile)}),React.createElement(Route,{path:'/account/addresses',element:React.createElement(Addresses)}),React.createElement(Route,{path:'/account/orders',element:React.createElement(Orders)}),React.createElement(Route,{path:'/account/orders/:id',element:React.createElement(OrderDetails)}),React.createElement(Route,{path:'/checkout',element:React.createElement(Checkout)}),React.createElement(Route,{path:'/login',element:React.createElement(Auth)}),React.createElement(Route,{path:'/signup',element:React.createElement(Auth,{signup:true})}))))))));return {root,node}}`
      },
    }, react()],
    logLevel: 'error', server: { host: '127.0.0.1', port: 0, open: false },
  })
  await server.listen()
  servers.push(server)
  return `http://127.0.0.1:${server.httpServer.address().port}`
}

try {
  const origin = await startServer()
  chrome = spawn(chromePath, [
    '--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-gpu',
    '--remote-debugging-port=0', `--user-data-dir=${path.join(temp, 'profile')}`, 'about:blank',
  ], { stdio: 'ignore', windowsHide: true })
  let launchError
  chrome.on('error', (error) => { launchError = error })
  const port = await until(async () => {
    if (launchError) throw launchError
    return (await readFile(path.join(temp, 'profile', 'DevToolsActivePort'), 'utf8')).split('\n')[0]
  }, 'Chrome debugger startup')
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  socket = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  let nextId = 0
  const pending = new Map()
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (message.id) {
      const item = pending.get(message.id)
      if (!item) return
      clearTimeout(item.timer)
      pending.delete(message.id)
      if (message.error) item.reject(new Error(message.error.message))
      else item.resolve(message.result)
    } else if (message.method === 'Runtime.exceptionThrown') {
      errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
    }
  })
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 30000)
    pending.set(id, { resolve, reject, timer })
    socket.send(JSON.stringify({ id, method, params }))
  })
  const evaluate = async (expression) => {
    const response = await cdp('Runtime.evaluate', { expression: `{${expression}\n}`, returnByValue: true, awaitPromise: true })
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text)
    return response.result.value
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__p1DocumentId = Math.random().toString(36)' })
  await cdp('Network.enable')
  // Use the same existing fallback fonts for both visual references, independently of network availability.
  await cdp('Network.setBlockedURLs', { urls: ['https://fonts.googleapis.com/*', 'https://fonts.gstatic.com/*'] })
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  const viewport = (width, height) => cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
  const go = async (route, base = origin) => {
    const previous = await evaluate('window.__p1DocumentId')
    await cdp('Page.navigate', { url: base + route })
    await until(() => evaluate(`window.__p1DocumentId !== ${JSON.stringify(previous) || 'undefined'} && location.href === ${JSON.stringify(base + route)} && document.readyState === 'complete' && !!document.querySelector('main h1') && !!document.querySelector('header')`), `render ${route}`)
    await sleep(250)
  }
  const reload = async () => {
    const previous = await evaluate('window.__p1DocumentId')
    await cdp('Page.reload')
    await until(() => evaluate(`window.__p1DocumentId !== ${JSON.stringify(previous)} && document.readyState === 'complete' && !!document.querySelector('main h1') && !!document.querySelector('header')`), 'page reloaded')
  }
  const click = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)

  await viewport(375, 812)
  await go('/')
  if (catalogMode) {
    await until(() => evaluate(`[...document.querySelectorAll('header img[alt="Marbello"], footer img[alt="Marbello"]')].length === 2 && [...document.querySelectorAll('header img[alt="Marbello"], footer img[alt="Marbello"]')].every(img => img.complete && img.naturalWidth > 0)`), 'supplied header and footer logos loaded')
    results.push('supplied original logo loads in header and footer')
  }
  for (const width of [320, 375, 768]) {
    await viewport(width, 812)
    await click('button[aria-label="Open menu"]')
    await until(() => evaluate('!!document.querySelector("nav[aria-label=Mobile]")'), 'menu opened')
    if (catalogMode) {
      await until(() => evaluate(`(() => { const img = document.querySelector('[role="dialog"] img[alt="Marbello"]'); return img?.complete && img.naturalWidth > 0 })()`), 'mobile menu supplied logo loaded')
    }
    const bounds = await evaluate(`(() => { const nav = document.querySelector('nav[aria-label="Mobile"]'); const overlay = nav.parentElement; const rect = overlay.getBoundingClientRect(); return {x:rect.x,y:rect.y,width:rect.width,height:rect.height,viewportWidth:document.documentElement.clientWidth,parent:overlay.parentElement.tagName,links:[...nav.querySelectorAll('a')].map(a=>a.getAttribute('href'))} })()`)
    assert.deepEqual([bounds.x, bounds.y, bounds.height, bounds.parent], [0, 0, 812, 'BODY'])
    assert.ok(Math.abs(bounds.width - bounds.viewportWidth) < 1, 'overlay fills the viewport excluding its scrollbar gutter')
    assert.ok(bounds.links.includes(catalogMode ? '/category/furniture' : '/category/clocks-watches'))
    await click('button[aria-label="Close menu"]')
    await until(() => evaluate('!document.querySelector("nav[aria-label=Mobile]") && document.body.style.overflow !== "hidden"'), 'menu closed and scrolling restored')
    results.push(`mobile menu viewport coverage and close: ${width}px`)
  }
  await click('button[aria-label="Open menu"]')
  await click('nav[aria-label="Mobile"] a[href="/shop"]')
  await until(() => evaluate('location.pathname === "/shop" && !document.querySelector("nav[aria-label=Mobile]") && document.body.style.overflow !== "hidden"'), 'menu route navigation')
  results.push('mobile menu links navigate and close')


  if (process.argv.includes('--theme')) {
    for (const width of [320, 390, 768, 1440]) {
      await viewport(width, 900); await go('/shop');
      const colors = await evaluate(`(()=>{const style=s=>getComputedStyle(document.querySelector(s));return {body:style('body').backgroundColor,text:style('body').color,footer:style('footer').backgroundColor,add:style('article button[aria-label$="to cart"]').backgroundColor,buy:style('article button[aria-label^="Buy "]').borderTopColor,heart:style('article button[aria-pressed]').color,wish:style('article button[aria-pressed]').backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
      assert.deepEqual(colors, {body:'rgb(250, 247, 242)',text:'rgb(36, 36, 36)',footer:'rgb(36, 63, 59)',add:'rgb(36, 63, 59)',buy:'rgb(36, 63, 59)',heart:'rgb(36, 63, 59)',wish:'rgb(250, 247, 242)',overflow:false});
      results.push('premium theme: palette, outlined Buy Now, wishlist and overflow at '+width+'px');
    }
  }

  if (process.argv.includes('--stabilization')) {
    await viewport(1366,900); await go('/shop');
    await evaluate(`[...document.querySelectorAll('aside label')].find(n=>n.textContent.trim()==='Kitchen').querySelector('input').click()`);
    await until(()=>evaluate(`document.querySelector('main').textContent.includes('6 pieces')`),'Kitchen filter selected');
    await click('nav[aria-label="Collections"] a[href="/category/furniture"]');
    await click('nav[aria-label="Collections"] a[href="/shop"]');
    await until(()=>evaluate(`document.querySelector('main').textContent.includes('34 pieces')`),'navigation resets filters');
    await evaluate(`(()=>{const select=document.querySelector('main select');select.value='low';select.dispatchEvent(new Event('change',{bubbles:true}))})()`);
    await evaluate(`[...document.querySelectorAll('aside button')].find(n=>n.textContent==='Reset filters').click()`);
    assert.equal(await evaluate(`document.querySelector('main select').value`),'featured','clear restores default sort');
    const hovered=await evaluate(`(()=>{const r=document.querySelector('nav[aria-label="Collections"] a').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...hovered}); await sleep(400);
    assert.ok(await evaluate(`(()=>{const c=getComputedStyle(document.querySelector('nav[aria-label="Collections"] a')).color;return !c.includes('140, 133, 122')})()`),'hover uses accessible ink instead of taupe');
    results.push('stabilization: filter navigation/reset and accessible navbar hover');
    await go('/checkout');
    assert.equal(await evaluate(`document.querySelector('main a[href^="/signup"]').getAttribute('href')`),'/signup?returnTo=%2Fcheckout');
    await evaluate(`(async()=>{const {mountCustomerFixture}=await import('/__catalog-fixture.js');window.__customerFixture=mountCustomerFixture({getSession:async()=>null,signup:async()=>({id:'u1',name:'Ayush',email:'ayush@example.com',phone:'9876543210'}),getAddresses:async()=>[]})})()`);
    await until(()=>evaluate(`!!document.querySelector('#customer-test-fixture a[href^="/signup"]')`),'signup gate mounted');
    await click('#customer-test-fixture [data-testid="fixture-checkout"]');
    await until(()=>evaluate(`!!document.querySelector('#customer-test-fixture a[href="/signup?returnTo=%2Fcheckout"]')`),'checkout signup return path');
    await click('#customer-test-fixture a[href^="/signup"]');
    await until(()=>evaluate(`!!document.querySelector('#customer-test-fixture #customer-confirmPassword')`),'signup form');
    for(const [name,value] of Object.entries({name:'Ayush',phone:'9876543210',email:'ayush@example.com',password:'eightchars',confirmPassword:'eightchars'})) await evaluate(`(()=>{const n=document.querySelector('#customer-test-fixture #customer-'+${JSON.stringify(name)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,${JSON.stringify(value)});n.dispatchEvent(new Event('input',{bubbles:true}))})()`);
    await click('#customer-test-fixture button[type="submit"]');
    await until(()=>evaluate(`document.querySelector('#customer-test-fixture').textContent.includes('Add products before continuing to checkout')`),'confirmed test-adapter signup returns to checkout');
    await evaluate(`window.__customerFixture.root.unmount();window.__customerFixture.node.remove()`);
    results.push('stabilization: direct signup preserves checkout destination through confirmed test adapter');
    await evaluate(`(async()=>{const {mountCustomerFixture}=await import('/__catalog-fixture.js');window.__badOrder=true;window.__customerFixture=mountCustomerFixture({getSession:async()=>({id:'u1',email:'ayush@example.com'}),getAddresses:async()=>[],getOrders:async()=>[{id:'O1',total:window.__badOrder?undefined:1500}],getOrder:async()=>({id:'O1',total:1500,items:[{name:'Cup',price:1500,qty:1}]})})})()`);
    await until(()=>evaluate(`!!document.querySelector('#customer-test-fixture a[href="/account/orders"]')`),'orders gate');
    await click('#customer-test-fixture a[href="/account/orders"]');
    await until(()=>evaluate(`document.querySelector('#customer-test-fixture [role="alert"]')?.textContent.includes('invalid account information')`),'invalid total caught before render');
    await evaluate(`window.__badOrder=false;[...document.querySelectorAll('#customer-test-fixture button')].find(n=>n.textContent==='Retry').click()`);
    await until(()=>evaluate(`document.querySelector('#customer-test-fixture').textContent.includes('Order O1')`),'validated orders retry');
    await evaluate(`window.__customerFixture.root.unmount();window.__customerFixture.node.remove()`);
    results.push('stabilization: malformed order data shows recoverable error and valid retry renders');
    await evaluate(`(async()=>{const {mountSafetyFixture}=await import('/__catalog-fixture.js');window.__safetyFixture=mountSafetyFixture()})()`);
    await until(()=>evaluate(`document.querySelector('#safety-test-fixture img')?.alt.includes('image unavailable') && document.querySelector('#safety-test-fixture img')?.naturalWidth>0`),'broken image fallback decoded');
    await evaluate(`window.__safetyFixture.root.unmount();window.__safetyFixture.node.remove()`);
    results.push('stabilization: missing product image uses decoded neutral fallback');
    const expectedStart=errors.length;
    const stored=await evaluate(`localStorage.getItem('veina-cart')`);
    await evaluate(`(async()=>{const {mountSafetyFixture}=await import('/__catalog-fixture.js');window.__safetyFixture=mountSafetyFixture(true)})()`);
    await until(()=>evaluate(`document.querySelector('#safety-test-fixture [role="alert"]')?.textContent.includes('Something went wrong')`),'render error boundary fallback');
    assert.equal(await evaluate(`localStorage.getItem('veina-cart')`),stored,'boundary preserves stored cart');
    await evaluate(`window.__safetyFixture.root.unmount();window.__safetyFixture.node.remove()`);
    const intentional=errors.splice(expectedStart);
    assert.ok(intentional.every(error=>error.includes('test-boundary-render')),'only intentional boundary test errors are excluded');
    results.push('stabilization: intentional render failure caught by boundary without clearing storage');
    await go('/');
  }

  if (process.argv.includes('--ui-search') || process.argv.includes('--ui-after')) {
    const key = async (key, code = key) => { await cdp('Input.dispatchKeyEvent', {type:'keyDown',key,code}); await cdp('Input.dispatchKeyEvent', {type:'keyUp',key,code}) }
    for (const width of [320,375,390,430,768,1024,1440]) {
      await viewport(width,812)
      await go('/')
      const before = await evaluate(`document.querySelector('header').getBoundingClientRect().height`)
      if (width >= 1024) assert.ok(await evaluate(`(()=>{const links=[...document.querySelectorAll('nav[aria-label="Collections"] a')];const y=links[0].getBoundingClientRect().y;return links.length===7 && links.every(link=>Math.abs(link.getBoundingClientRect().y-y)<1)})()`),'Shop and categories share one row')
      assert.equal(await evaluate(`!!document.querySelector('input[aria-label="Search products"]')`),false,'search is collapsed initially')
      if(width<1024) assert.ok(await evaluate(`(()=>{const r=document.querySelector('a[aria-label="Marbello home"]').getBoundingClientRect();return Math.abs(r.left+r.width/2-document.documentElement.clientWidth/2)<1})()`),'mobile logo centered relative to viewport')
      assert.ok(await evaluate(`(()=>{const logo=document.querySelector('a[aria-label="Marbello home"]').getBoundingClientRect();return [...document.querySelectorAll('header .icon-button')].filter(n=>n.getClientRects().length).every(n=>{const r=n.getBoundingClientRect();return r.width>=${width<640?40:44}&&r.height>=44&&r.left>=0&&r.right<=document.documentElement.clientWidth&&(r.right<=logo.left||r.left>=logo.right||r.top>=logo.bottom||r.bottom<=logo.top)})})()`),'all visible actions accessible without overlapping logo')
      if(width<640) assert.ok(await evaluate(`(()=>{const h=document.querySelector('header').getBoundingClientRect();const logo=document.querySelector('a[aria-label="Marbello home"]').getBoundingClientRect();return h.height>=64&&h.height<=66&&Math.abs(logo.width-56)<1&&![...document.querySelectorAll('header .icon-button')].filter(n=>n.getClientRects().length).some(n=>Math.abs(n.getBoundingClientRect().top+n.getBoundingClientRect().height/2-logo.top-logo.height/2)>1)&&!document.querySelector('header [aria-label="My account"]').getClientRects().length})()`),'single-row mobile header with account only in menu')
      if(width>=1024) assert.ok(await evaluate(`(()=>{const brand=document.querySelector('a[aria-label="Marbello home"]');const row=brand.parentElement.getBoundingClientRect();const image=brand.querySelector('img').getBoundingClientRect();const categories=document.querySelector('nav[aria-label="Collections"]').getBoundingClientRect();return row.height===80&&categories.height<=80&&image.width===76&&image.height===76&&[brand.querySelector('img'),...document.querySelectorAll('header .icon-button')].filter(n=>n.getClientRects().length).every(n=>{const r=n.getBoundingClientRect();return Math.abs(r.top+r.height/2-row.top-row.height/2)<1})})()`),'desktop single row and vertical centering')
      if (!process.argv.includes('--no-screenshots')) { const navDir=path.join(root,'artifacts','navbar-final');await (await import('node:fs/promises')).mkdir(navDir,{recursive:true});const navShot=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(path.join(navDir,`navbar-${width}.png`),Buffer.from(navShot.data,'base64')) }
      assert.ok(await evaluate(`${JSON.stringify(width<1024?['Search','Wishlist']:['Search','My account','Wishlist'])}.every(label=>{const node=document.querySelector('header [aria-label="'+label+'"]');const r=node.getBoundingClientRect();return r.width>=${width<640?40:44} && r.height>=44 && r.right<=document.documentElement.clientWidth && r.left>=0})`), 'accessible header actions')
      await click('button[aria-label="Search"]')
      await until(()=>evaluate(`document.activeElement?.getAttribute('role')==='combobox'`),'animated search focused')
      await until(() => evaluate(`document.activeElement?.getAttribute('role')==='combobox'`), 'search input focused')
      assert.equal(await evaluate(`document.querySelector('header').getBoundingClientRect().height`), before, 'search does not increase header height')
      assert.ok(await evaluate(`(()=>{const r=document.querySelector('#navbar-search').getBoundingClientRect();return r.left>=0 && r.right<=document.documentElement.clientWidth})()`), 'search dropdown fits viewport')
      if(width>=1024) assert.ok(await evaluate(`(()=>{const r=document.querySelector('#navbar-search').getBoundingClientRect();return r.width>=380&&r.width<=440})()`),'compact desktop search width')
      assert.ok(await evaluate(`document.querySelectorAll('#search-suggestions [role="option"]').length<=5`),'limited compact suggestions')
      await evaluate(`(()=>{const input=document.querySelector('[role="combobox"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'espresso');input.dispatchEvent(new Event('input',{bubbles:true}))})()`)
      await until(() => evaluate(`document.querySelector('#search-suggestions').textContent.includes('Carrara Espresso Cup')`), 'matching suggestions')
      await key('ArrowDown'); await key('Enter')
      await until(() => evaluate(`location.pathname==='/product/carrara-espresso-cup' && !document.querySelector('#navbar-search')`), 'keyboard suggestion navigation')
      await click('button[aria-label="Search"]')
      await until(()=>evaluate(`document.activeElement?.getAttribute('role')==='combobox'`),'animated search focused')
      await key('Escape')
      await until(() => evaluate(`!document.querySelector('#navbar-search') && document.activeElement?.getAttribute('aria-label')==='Search'`), 'Escape restores trigger focus')
      await click('button[aria-label="Search"]')
      await until(()=>evaluate(`document.activeElement?.getAttribute('role')==='combobox'`),'animated search focused')
      await evaluate(`(()=>{const input=document.querySelector('[role="combobox"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'zzznomatch');input.dispatchEvent(new Event('input',{bubbles:true}))})()`)
      await until(() => evaluate(`document.querySelector('#navbar-search').textContent.includes('No suggestions found')`), 'empty search suggestions')
      await key('Enter')
      await until(() => evaluate(`location.pathname==='/search' && new URLSearchParams(location.search).get('q')==='zzznomatch'`), 'original search submission')
      await click('button[aria-label="Search"]')
      await until(()=>evaluate(`document.activeElement?.getAttribute('role')==='combobox'`),'animated search focused')
      await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:1,y:750,button:'left',clickCount:1})
      await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:1,y:750,button:'left',clickCount:1})
      await until(() => evaluate(`!document.querySelector('#navbar-search')`), 'outside click closes search')
      await evaluate(`window.scrollTo(0,400)`)
      await until(()=>evaluate(`Math.abs(document.querySelector('header').getBoundingClientRect().top)<1 && document.querySelector('[data-announcement]').getBoundingClientRect().bottom<=0`),'sticky header and scrolling announcement')
      assert.ok(await evaluate(`document.documentElement.scrollWidth<=document.documentElement.clientWidth`),'no horizontal overflow')
      results.push(`navbar touch targets/sticky layout and search suggestions, keyboard/empty query/Escape/outside dismissal: ${width}px`)
    }
  }
  if (process.argv.includes('--ui-smoke')) {
    const stage = process.argv.find((arg) => arg.startsWith('--ui-stage='))?.split('=')[1] || 'home'
    const routes = stage === 'detail' ? ['/product/carrara-espresso-cup'] : stage === 'customer' ? ['/login','/signup','/cart','/checkout','/account/profile','/contact'] : ['/','/shop']
    for (const width of [320,375,390,768,1366]) {
      await viewport(width,812)
      for (const route of routes) {
        await go(route)
        assert.ok(await evaluate(`document.documentElement.scrollWidth<=document.documentElement.clientWidth`), `${route} has no overflow at ${width}`)
        if (route === '/') assert.ok(await evaluate(`document.querySelector('main > section').getBoundingClientRect().height < ${width >= 1024 ? 500 : 720}`), 'compact hero')
        if (route === '/shop') {
          assert.equal(await evaluate(`document.querySelectorAll('main article').length`),34)
          assert.ok(await evaluate(`(()=>{const r=document.querySelector('main article > div').getBoundingClientRect();return Math.abs(r.height-r.width)<2})()`), 'square product image')
        }
        if (stage === 'detail') {
          assert.ok(await evaluate(`document.querySelector('[data-testid="product-main-image"]').getBoundingClientRect().height<=360`), 'gallery height cap')
          assert.ok(await evaluate(`(()=>{const b=[...document.querySelectorAll('main button')].find(n=>n.textContent.trim()==='Buy now');return b.getBoundingClientRect().bottom<=812})()`), 'Buy Now visible in initial viewport')
        }
        const dir = path.join(root,'artifacts',`ui-stage-${stage}`)
        await (await import('node:fs/promises')).mkdir(dir,{recursive:true})
        const shot = await cdp('Page.captureScreenshot',{format:'png'})
        await writeFile(path.join(dir,`${route.replaceAll('/','-')}-${width}.png`),Buffer.from(shot.data,'base64'))
      }
      results.push(`${stage} stage responsive layout and screenshots: ${width}px`)
    }
    if (stage === 'home') {
      await evaluate(`localStorage.clear()`); await go('/shop'); await reload()
      await click('main article button[aria-label="Add to wishlist"]')
      assert.equal(await evaluate(`JSON.parse(localStorage.getItem('veina-wishlist')).length`),1)
      await click('button[aria-label="Buy Carrara Espresso Cup now"]')
      await until(() => evaluate(`location.pathname==='/cart' && JSON.parse(localStorage.getItem('veina-cart'))[0].qty===1`),'card Buy Now cart navigation')
      results.push('compact product cards preserve wishlist and Buy Now to cart')
    }
    if (stage === 'detail') {
      await evaluate(`localStorage.clear()`); await go('/product/carrara-espresso-cup'); await reload()
      await click('button[aria-label="View image 2"]')
      assert.equal(await evaluate(`document.querySelector('button[aria-label="View image 2"]').getAttribute('aria-pressed')`),'true')
      await click('button[aria-label="Increase quantity"]')
      await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent.trim()==='Buy now').click()`)
      await until(() => evaluate(`location.pathname==='/cart' && JSON.parse(localStorage.getItem('veina-cart'))[0].qty===2`),'detail Buy Now preserves selected quantity')
      results.push('compact gallery thumbnails and quantity-aware Buy Now to cart')
    }
  }
  if (process.argv.includes('--ui-motion')) {
    await viewport(1366,900)
    await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]})
    await go('/')
    await evaluate(`document.querySelector('main > section:nth-of-type(2)').scrollIntoView()`)
    await until(() => evaluate(`!!document.querySelector('main > section:nth-of-type(2) .animate-rise')`),'lightweight scroll reveal activated')
    await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
    assert.ok(await evaluate(`[...document.querySelectorAll('.animate-rise')].every(node=>getComputedStyle(node).animationName==='none' && getComputedStyle(node).opacity==='1')`),'reduced motion leaves content visible without animation')
    await go('/shop')
    await evaluate(`document.querySelector('main article').scrollIntoView()`)
    const rect = await evaluate(`(()=>{const r=document.querySelector('main article').getBoundingClientRect();return {x:r.x+20,y:r.y+20}})()`)
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...rect})
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('main article img')).transform`),'none','hover zoom disabled for reduced motion')
    results.push('scroll reveal activates without hidden content; reduced motion disables animations and hover zoom')
  }
  if (!process.argv.includes('--menu-only') && !process.argv.includes('--ui-search') && !process.argv.includes('--ui-smoke') && !process.argv.includes('--ui-motion')) {
    for (const width of [768, 1366]) {
      await viewport(width, 900)
      await go('/shop')
      await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
      const selector = 'button[aria-label="Add Carrara Espresso Cup to cart"]'
      await evaluate('document.activeElement?.blur()')
      const hidden = await evaluate(`(() => {const b=document.querySelector(${JSON.stringify(selector)});return b.getBoundingClientRect().top >= b.parentElement.getBoundingClientRect().bottom})()`)
      assert.equal(hidden, true, 'default desktop appearance keeps the original hover behavior')
      await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
      await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
      for (let tabs = 0; tabs < 80; tabs++) {
        if (await evaluate(`document.activeElement === document.querySelector(${JSON.stringify(selector)})`)) break
        await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
        await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
      }
      const visible = await evaluate(`(() => {const b=document.querySelector(${JSON.stringify(selector)}),r=b.getBoundingClientRect(),p=b.parentElement.getBoundingClientRect();return b.matches(':focus-visible') && r.top>=p.top && r.bottom<=p.bottom})()`)
      assert.equal(visible, true, 'keyboard focused quick-add must be fully visible')
      const before = await evaluate('JSON.parse(localStorage.getItem("veina-cart") || "[]").find(x=>x.id===1)?.qty || 0')
      await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' })
      await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
      try {
        await until(() => evaluate(`JSON.parse(localStorage.getItem('veina-cart') || '[]').find(x=>x.id===1)?.qty === ${before + 1}`), 'keyboard add-to-cart')
      } catch (error) {
        console.log(await evaluate(`({focused:document.activeElement?.getAttribute('aria-label'),cart:localStorage.getItem('veina-cart'),expected:${before + 1}})`))
        throw error
      }
      results.push(`keyboard quick-add visibility and activation: ${width}px`)
      console.log(`Passed keyboard quick-add at ${width}px`)
    }

    await go('/cart')
    await click('button[aria-label="Increase quantity"]')
    await until(() => evaluate(`!!document.querySelector('a[aria-label="Cart, 3 items"]')`), 'normal quantity increase')
    await click('button[aria-label="Decrease quantity"]')
    await until(() => evaluate(`!!document.querySelector('a[aria-label="Cart, 2 items"]')`), 'normal quantity decrease')
    await reload()
    assert.equal(await evaluate(`!!document.querySelector('a[aria-label="Cart, 2 items"]')`), true)
    await click('button[aria-label="Remove Carrara Espresso Cup"]')
    await until(() => evaluate('document.querySelector("main h1").textContent === "Your cart is empty"'), 'cart removal')
    await go('/product/carrara-espresso-cup')
    await click('button[aria-label="Toggle wishlist"]')
    await until(() => evaluate('JSON.parse(localStorage.getItem("veina-wishlist")).includes(1)'), 'wishlist addition')
    await go('/wishlist')
    assert.equal(await evaluate(`!!document.querySelector('main a[href="/product/carrara-espresso-cup"]')`), true)
    await click('button[aria-label="Remove from wishlist"]')
    await until(() => evaluate('JSON.parse(localStorage.getItem("veina-wishlist")).length === 0'), 'wishlist removal')
    results.push('normal quantity, cart removal, wishlist toggle and reload persistence')

    const cases = [
      ['{}', '{}', 0], ['[null]', '[null,{},1,1,99]', 0], ['[{"id":1,"qty":-3}]', '[]', 0],
      ['[{"id":1,"qty":"2"}]', '[1]', 2], ['[{"id":1,"qty":1000}]', '[]', 10], ['{bad', '{bad', 0],
    ]
    for (const [cart, wishlist, expected] of cases) {
      await evaluate(`localStorage.setItem('veina-cart',${JSON.stringify(cart)});localStorage.setItem('veina-wishlist',${JSON.stringify(wishlist)})`)
      await go('/cart')
      await reload()
      await until(() => evaluate(`!!document.querySelector('main h1') && !!document.querySelector('a[aria-label="Cart, ${expected} items"]')`), 'invalid saved data recovery')
      assert.equal(await evaluate('document.querySelector("main").textContent.includes("NaN")'), false)
    }
    results.push('six malformed/invalid storage cases recover in the browser')
    if (process.argv.includes('--p2')) {
      const key = async (key, code, modifiers = 0) => {
        await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code, modifiers })
        await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code, modifiers })
      }
      await viewport(375, 812)
      await go('/shop')
      await evaluate(`document.querySelector('button[aria-label="Open menu"]').focus()`)
      await click('button[aria-label="Open menu"]')
      await until(() => evaluate(`document.activeElement?.getAttribute('aria-label') === 'Close menu'`), 'menu initial focus')
      assert.equal(await evaluate(`document.getElementById('root').inert && document.documentElement.style.overflow === 'hidden'`), true)
      await key('Tab', 'Tab', 8)
      assert.equal(await evaluate(`document.activeElement === document.querySelector('nav[aria-label="Mobile"] a:last-child')`), true)
      await key('Tab', 'Tab')
      assert.equal(await evaluate(`document.activeElement?.getAttribute('aria-label') === 'Close menu'`), true)
      await key('Escape', 'Escape')
      await until(() => evaluate(`!document.querySelector('[role="dialog"]') && !document.getElementById('root').inert && document.activeElement?.getAttribute('aria-label') === 'Open menu'`), 'menu Escape and focus restoration')
      await click('button[aria-label="Open menu"]')
      await viewport(1366, 900)
      await until(() => evaluate(`!document.querySelector('[role="dialog"]') && document.body.style.overflow !== 'hidden'`), 'menu resize cleanup')
      results.push('menu focus trap, Escape, inert background, scroll lock, focus restoration and resize cleanup')
      await viewport(375, 812)
      await go('/shop')
      await evaluate(`const trigger=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Filters');trigger.focus();trigger.click()`)
      await until(() => evaluate(`!!document.querySelector('[role="dialog"][aria-label="Filters"]')`), 'filter dialog')
      assert.equal(await evaluate(`(()=>{const ids=[...document.querySelectorAll('[id]')].map(n=>n.id);return ids.length===new Set(ids).size && [...document.querySelectorAll('label[for]')].every(n=>!!n.control)})()`), true)
      assert.equal(await evaluate(`new Set([...document.querySelectorAll('input[type="radio"]')].map(n=>n.name)).size`), 2)
      await evaluate(`[...document.querySelectorAll('[role="dialog"] label')].find(n=>n.textContent.trim()===${JSON.stringify(catalogMode ? 'Tableware' : 'Cups & Mugs')}).click()`)
      await until(() => evaluate(`document.querySelectorAll('main article').length===${catalogMode ? 9 : 3}`), 'filter category selection')
      await evaluate(`[...document.querySelectorAll('[role="dialog"] button')].find(n=>n.textContent==='Show results').click()`)
      await until(() => evaluate(`!document.querySelector('[role="dialog"]') && document.activeElement?.textContent.trim()==='Filters' && !document.getElementById('root').inert`), 'filter close restores focus')
      results.push('filter category selection, unique IDs/radio groups and dialog cleanup')
      const openFilters = () => evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Filters').click()`)
      await openFilters()
      await until(() => evaluate(`document.activeElement?.getAttribute('aria-label')==='Close filters'`), 'filter initial focus')
      await key('Tab', 'Tab', 8)
      assert.equal(await evaluate(`document.activeElement?.textContent==='Show results'`), true)
      await key('Tab', 'Tab')
      assert.equal(await evaluate(`document.activeElement?.getAttribute('aria-label')==='Close filters'`), true)
      await key('Escape', 'Escape')
      await until(() => evaluate(`!document.querySelector('[role="dialog"]') && !document.getElementById('root').inert && document.documentElement.style.overflow!=='hidden'`), 'filter Escape cleanup')
      await openFilters()
      await viewport(1366, 900)
      await until(() => evaluate(`!document.querySelector('[role="dialog"]') && !document.getElementById('root').inert && document.body.style.overflow!=='hidden'`), 'filter resize cleanup')
      results.push('filter focus wrapping, Escape and desktop resize restore background/scrolling')
      for (const [query, count] of [['Cups & Mugs', 3], ['Bowls & Trays', 3], ['Clocks & Watches', 4]]) {
        await go('/search?q=' + encodeURIComponent(query))
        assert.equal(await evaluate(`document.querySelectorAll('main article').length`), count)
      }
      results.push('category display-name search in all three affected categories')
      await evaluate(`localStorage.clear()`)
      await go('/product/carrara-espresso-cup')
      await click('button[aria-label="Increase quantity"]')
      await click('button[aria-label="Increase quantity"]')
      await click('button[aria-label="View image 3"]')
      await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent==='Add to cart').click()`)
      await click('main a[href="/product/nero-marquina-mug"]')
      await until(() => evaluate(`document.querySelector('main h1').textContent==='Nero Marquina Mug'`), 'related product SPA navigation')
      await sleep(100)
      assert.equal(await evaluate(`document.querySelector('button[aria-label="Increase quantity"]').parentElement.querySelector('span').textContent`), '1')
      assert.equal(await evaluate(`document.querySelector('button[aria-label="View image 1"]').getAttribute('aria-pressed')`), 'true')
      assert.equal(await evaluate(`[...document.querySelectorAll('main button')].some(b=>b.textContent==='Add to cart')`), true)
      results.push('SPA product navigation resets quantity, gallery and feedback')
      await evaluate(`localStorage.clear()`)
      await go('/shop')
      await evaluate(`for(let i=0;i<15;i++)document.querySelector('button[aria-label="Add Carrara Espresso Cup to cart"]').click()`)
      await until(() => evaluate(`JSON.parse(localStorage.getItem('veina-cart')).find(x=>x.id===1)?.qty===10`), 'rapid batched adds capped')
      assert.equal(await evaluate(`document.querySelector('button[aria-label="Add Carrara Espresso Cup to cart"]').title`), 'Quantity limit reached')
      await go('/cart')
      assert.equal(await evaluate(`document.querySelector('button[aria-label="Increase quantity"]').disabled`), true)
      await go('/product/carrara-espresso-cup')
      await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent==='Add to cart').click()`)
      assert.equal(await evaluate(`[...document.querySelectorAll('main button')].some(b=>b.textContent==='Quantity limit reached')`), true)
      results.push('rapid additions, cart cap button and accurate limit feedback')
      await evaluate(`localStorage.setItem('veina-cart','[{"id":1,"qty":8}]')`)
      await go('/product/carrara-espresso-cup')
      for (let i=0; i<4; i++) await click('button[aria-label="Increase quantity"]')
      await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent==='Add to cart').click()`)
      assert.equal(await evaluate(`[...document.querySelectorAll('main button')].some(b=>b.textContent==='Added 2 to cart (limit reached)')`), true)
      await until(() => evaluate(`JSON.parse(localStorage.getItem('veina-cart'))[0].qty===10`), 'partial addition persisted')
      await reload()
      assert.equal(await evaluate(`document.querySelector('a[aria-label="Cart, 10 items"]')!==null`), true)
      results.push('partial quantity addition reports actual amount and survives reload')
      await evaluate(`localStorage.clear()`)
      await go('/product/carrara-espresso-cup')
      await evaluate(`document.querySelector('main button[aria-live="polite"]').click()`)
      await sleep(1000)
      await evaluate(`document.querySelector('main button[aria-live="polite"]').click()`)
      await sleep(1000)
      assert.equal(await evaluate(`document.querySelector('main button[aria-live="polite"]').textContent`), 'Added to cart')
      await until(() => evaluate(`document.querySelector('main button[aria-live="polite"]').textContent==='Add to cart'`), 'latest feedback timer clears')
      assert.equal(await evaluate(`JSON.parse(localStorage.getItem('veina-cart'))[0].qty`), 2)
      results.push('repeated additions restart feedback timer without losing cart updates')
      await go('/contact')
      await evaluate(`const f=document.querySelector('main form');f.elements.name.value=' ';f.elements.email.value='test@example.com';f.elements.message.value='Message';f.requestSubmit()`)
      assert.equal(await evaluate(`document.querySelector('main input[name="name"]').validity.customError`), true)
      await evaluate(`const f=document.querySelector('main form');f.elements.name.value='Test';f.elements.name.dispatchEvent(new Event('input',{bubbles:true}));f.requestSubmit()`)
      await until(() => evaluate(`document.querySelector('main [role="status"]')?.textContent.includes('has not been sent')`), 'honest contact feedback')
      assert.equal(await evaluate(`document.querySelector('main textarea').value`), 'Message')
      await evaluate(`const f=document.querySelector('main form');f.elements.message.value='  ';f.elements.message.dispatchEvent(new Event('input',{bubbles:true}));f.requestSubmit()`)
      assert.equal(await evaluate(`document.querySelector('main textarea').validity.customError`), true)
      await evaluate(`const f=document.querySelector('main form');f.elements.message.value='Corrected message';f.elements.message.dispatchEvent(new Event('input',{bubbles:true}));f.elements.email.value='invalid';f.requestSubmit()`)
      assert.equal(await evaluate(`document.querySelector('main input[type="email"]').validity.typeMismatch`), true)
      assert.equal(await evaluate(`!!document.querySelector('main [role="status"]')`), false)
      await go('/')
      await evaluate(`const f=document.querySelector('input[aria-label="Email address"]').form;f.elements.email.value='invalid';f.requestSubmit()`)
      assert.equal(await evaluate(`document.querySelector('input[aria-label="Email address"]').validity.typeMismatch`), true)
      await evaluate(`const f=document.querySelector('input[aria-label="Email address"]').form;f.elements.email.value='test@example.com';f.requestSubmit()`)
      await until(() => evaluate(`[...document.querySelectorAll('[role="status"]')].some(n=>n.textContent.includes('No email or discount code has been sent'))`), 'honest newsletter feedback')
      results.push('contact whitespace validation, retained message, newsletter email validation and truthful unavailable notices')
      await key('Tab', 'Tab')
      await evaluate(`document.querySelector('footer a').focus()`)
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('footer a')).outlineColor`), 'rgb(250, 247, 242)')
      results.push('visible footer keyboard focus outline')
    }
    if (process.argv.includes('--p3')) {
      const metadata = () => evaluate(`({title:document.title,description:document.querySelector('meta[name="description"]')?.content,ogTitle:document.querySelector('meta[property="og:title"]')?.content,ogType:document.querySelector('meta[property="og:type"]')?.content,ogUrl:document.querySelector('meta[property="og:url"]')?.content,robots:document.querySelector('meta[name="robots"]')?.content,canonical:document.querySelector('link[rel="canonical"]')?.href,twitterTitle:document.querySelector('meta[name="twitter:title"]')?.content,ld:document.getElementById('ld-json')?.textContent})`)
      const spa = async (route) => {
        await evaluate(`history.pushState({},'',${JSON.stringify(route)});window.dispatchEvent(new PopStateEvent('popstate'))`)
        await until(() => evaluate(`location.pathname===${JSON.stringify(route.split('?')[0])} && document.querySelector('link[rel="canonical"]')?.href===location.origin+location.pathname`), 'SPA metadata update')
      }
      await go('/product/carrara-espresso-cup?utm_source=test')
      const productMeta = await metadata()
      assert.equal(productMeta.ogType, 'product')
      assert.equal(productMeta.canonical, origin + '/product/carrara-espresso-cup')
      assert.equal(productMeta.ogUrl, productMeta.canonical)
      assert.equal(productMeta.twitterTitle, productMeta.title)
      assert.equal(productMeta.robots, 'index, follow')
      assert.equal(JSON.parse(productMeta.ld)['@type'], 'Product')
      await evaluate(`(async()=>{const {applyMetadata,pageMetadata}=await import('/src/utils/seo.js');applyMetadata(document,pageMetadata({title:'Image fixture',image:'/test-share.jpg'},location.pathname,location.origin))})()`)
      assert.equal(await evaluate(`document.querySelector('meta[name="twitter:card"]').content`), 'summary_large_image')
      await click('main a[href="/shop"]')
      await until(() => evaluate(`document.title===${JSON.stringify(catalogMode ? 'All products | Marbello' : 'All products | Veina Marble')}`), 'shop metadata after product navigation')
      assert.equal(await evaluate(`!document.querySelector('meta[property="og:image"]') && !document.querySelector('meta[name="twitter:image"]') && !document.getElementById('ld-json') && document.querySelector('meta[name="twitter:card"]').content==='summary'`), true)
      results.push('product/Shop SPA metadata, canonical tracking-query removal, social image and JSON-LD cleanup')
      for (const route of ['/cart', '/wishlist', '/search?q=cups', '/product/missing-product', '/category/missing-category', '/missing-page']) {
        await spa(route)
        assert.equal((await metadata()).robots, 'noindex, follow')
        assert.equal(await evaluate(`document.querySelectorAll('link[rel="canonical"]').length`), 1)
        assert.equal(await evaluate(`document.querySelectorAll('meta[property="og:title"]').length`), 1)
      }
      assert.equal((await metadata()).title, catalogMode ? 'Page not found | Marbello' : 'Page not found | Veina Marble')
      await spa('/product/missing-product')
      assert.match((await metadata()).description, /could not be found/)
      await spa('/shop')
      assert.equal((await metadata()).robots, 'index, follow')
      results.push('cart/wishlist/search/404 noindex, unique head tags, fallback descriptions and catalog index restoration')
      await spa('/search?q=cups')
      const beforeSearch = (await metadata()).title
      await spa('/search?q=clocks')
      await until(() => evaluate(`document.title===${JSON.stringify(catalogMode ? 'Search: clocks | Marbello' : 'Search: clocks | Veina Marble')}`), 'same-route query metadata update')
      assert.notEqual((await metadata()).title, beforeSearch)
      results.push('same-path search query updates title and social metadata')
    }
    if (catalogMode) {
      await go('/checkout')
      await evaluate(`localStorage.setItem('veina-cart', JSON.stringify([{id:1,qty:2}]))`)
      await reload()
      await until(() => evaluate(`document.querySelector('main').textContent.includes('Sign in to your account')`), 'checkout login gate')
      assert.equal(await evaluate(`!!document.querySelector('#checkout-name')`), false)
      const checkoutCart = await evaluate(`localStorage.getItem('veina-cart')`)
      assert.equal(await evaluate(`!!document.querySelector('main button[type="submit"]')`), false)
      await click('main a[href="/login?returnTo=%2Fcheckout"]')
      await until(() => evaluate(`location.pathname==='/login' && new URLSearchParams(location.search).get('returnTo')==='/checkout'`), 'checkout login return path')
      await go('/checkout')
      assert.equal(await evaluate(`localStorage.getItem('veina-cart')`), checkoutCart)
      assert.equal(await evaluate(`document.querySelector('meta[name="robots"]').content`), 'noindex, follow')
      for (const width of [320, 375, 768, 1366]) {
        await viewport(width, 812)
        assert.ok(await evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), 'checkout has no horizontal overflow')
      }
      await go('/cart')
      await click('main a[href="/checkout"]')
      await until(() => evaluate(`location.pathname==='/checkout' && document.querySelector('main').textContent.includes('Sign in to your account')`), 'cart checkout login gate')
      await evaluate(`localStorage.setItem('veina-cart','[]')`)
      await reload()
      await until(() => evaluate(`document.querySelector('main').textContent.includes('Sign in to your account')`), 'empty-cart checkout session gate resolved')
      assert.match(await evaluate(`document.querySelector('main').textContent`), /Sign in to your account/)
      assert.equal(await evaluate(`!!document.querySelector('main button[type="submit"]')`), false)
      results.push('login-required checkout, no guest form/submission, preserved cart, login return path, noindex and responsive cart navigation')
      await evaluate('localStorage.clear()')
      await go('/shop')
      assert.equal(await evaluate(`document.querySelectorAll('main article').length`), 34)
      assert.equal(await evaluate(`document.querySelectorAll('nav[aria-label="Collections"] a[href^="/category/"]').length`), 6)
      for (const [category, count] of [['kitchen',6],['home-decor',10],['bathroom',3],['pooja',3],['tableware',9],['furniture',3]]) {
        await go('/category/'+category)
        assert.equal(await evaluate(`document.querySelectorAll('main article').length`), count)
        assert.equal(await evaluate(`document.querySelectorAll('main article img').length`), count*2)
      }
      await go('/category/cups-mugs')
      assert.equal(await evaluate(`document.querySelectorAll('main article').length`), 3)
      await go('/category/clocks-watches')
      assert.equal(await evaluate(`document.querySelectorAll('main article').length`), 4)
      results.push('all six collections, 34 products, furniture visibility and legacy category links')
      await go('/product/carrara-espresso-cup')
      await click('button[aria-label="Increase quantity"]')
      await click('button[aria-label="Increase quantity"]')
      await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent==='Buy now').click()`)
      await until(() => evaluate(`location.pathname==='/cart' && JSON.parse(localStorage.getItem('veina-cart'))[0].qty===3`), 'Buy now selected quantity to cart')
      assert.equal(await evaluate(`document.querySelector('main h1').textContent`), 'Your cart')
      await reload()
      assert.equal(await evaluate(`JSON.parse(localStorage.getItem('veina-cart'))[0].qty`), 3)
      await go('/shop')
      await click('button[aria-label="Buy Carrara Espresso Cup now"]')
      await until(() => evaluate(`location.pathname==='/cart' && JSON.parse(localStorage.getItem('veina-cart'))[0].qty===4`), 'card Buy now accumulates same item')
      assert.equal(await evaluate(`JSON.parse(localStorage.getItem('veina-cart')).length`), 1)
      results.push('detail Buy now selected quantity, card Buy now, cart-only navigation and reload persistence')
      await evaluate(`localStorage.setItem('veina-cart','[{"id":1,"qty":10}]')`)
      await go('/product/carrara-espresso-cup')
      await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent==='Buy now').click()`)
      await until(() => evaluate(`location.pathname==='/cart'`), 'Buy now at existing limit still opens cart')
      assert.equal(await evaluate(`JSON.parse(localStorage.getItem('veina-cart'))[0].qty`), 10)
      await go('/product/sage-marble-vanity-set')
      assert.equal(await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent==='Buy now').disabled`), true)
      await go('/shop')
      assert.equal(await evaluate(`document.querySelector('button[aria-label="Buy Sage Marble Vanity Set now"]').disabled`), true)
      await evaluate('localStorage.clear()')
      await go('/product/nero-marble-coffee-table')
      await click('button[aria-label="Increase quantity"]')
      assert.equal(await evaluate(`document.querySelector('button[aria-label="Increase quantity"]').disabled`), true)
      await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent==='Buy now').click()`)
      await until(() => evaluate(`location.pathname==='/cart' && JSON.parse(localStorage.getItem('veina-cart'))[0].qty===2`), 'low-stock furniture Buy now')
      results.push('Buy now respects existing cart cap, zero stock and two-unit furniture stock')
      for (const width of [320,375,768,1024,1366]) {
        await viewport(width,900)
        await go('/shop')
        assert.equal(await evaluate(`document.documentElement.scrollWidth<=window.innerWidth`), true, 'shop responsive width '+width)
        await go('/product/nero-marble-coffee-table')
        assert.equal(await evaluate(`document.documentElement.scrollWidth<=window.innerWidth`), true, 'detail responsive width '+width)
      }
      results.push('shop and furniture detail responsive at 320, 375, 768, 1024 and 1366px')
      await evaluate(`localStorage.setItem('veina-cart','[{"id":1,"qty":10}]')`)
      await go('/shop')
      await evaluate(`(async()=>{const {mountFixture}=await import('/__catalog-fixture.js');let attempt=0;const service={getCatalog:({signal})=>{window.__catalogFixtureSignal=signal;if(++attempt===1)return Promise.reject(new Error('Test network failure'));return new Promise(resolve=>{window.__resolveCatalogFixture=resolve})}};window.__catalogFixture=mountFixture(service)})()`)
      await until(() => evaluate(`!!document.querySelector('#catalog-test-fixture [role="alert"]')`), 'catalog error UI')
      assert.equal(await evaluate(`JSON.parse(localStorage.getItem('veina-cart'))[0].qty`), 10)
      await click('#catalog-test-fixture button')
      await until(() => evaluate(`!!window.__resolveCatalogFixture && !!document.querySelector('#catalog-test-fixture [role="status"]')`), 'catalog retry loading state')
      assert.equal(await evaluate(`JSON.parse(localStorage.getItem('veina-cart'))[0].qty`), 10)
      await evaluate(`(async()=>{const {createCatalogService}=await import('/src/services/catalogService.js');const data=await createCatalogService().getCatalog();data.products=[{...data.products[0],name:'API Cup',price:2500,stock:2,images:[data.products[0].images[0]]}];window.__resolveCatalogFixture(data)})()`)
      await until(() => evaluate(`document.querySelector('[data-testid="catalog-probe"]')?.textContent==='API Cup|2'`), 'dynamic catalog populates Store and reconciles stock')
      assert.equal(await evaluate(`document.querySelectorAll('#catalog-test-fixture article img').length`), 1)
      assert.equal(await evaluate(`JSON.parse(localStorage.getItem('veina-cart'))[0].qty`), 2)
      await evaluate(`window.__catalogFixture.root.unmount();window.__catalogFixture.node.remove()`)
      assert.equal(await evaluate(`window.__catalogFixtureSignal.aborted`), true)
      results.push('dynamic catalog error/retry/loading, saved-cart protection, stock reconciliation, one-image rendering and request cleanup')
    }
    if (process.argv.includes('--customer')) {
      const fill = async (values, scope = 'main') => evaluate(`(() => { const values=${JSON.stringify(values)};for(const [name,value] of Object.entries(values)){const input=document.querySelector(${JSON.stringify(scope)}+' [name="'+name+'"]');Object.getOwnPropertyDescriptor(input.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}))} })()`)
      const press = async (text, scope = '#customer-test-fixture') => evaluate(`[...document.querySelectorAll(${JSON.stringify(scope)}+' button')].find(button=>button.textContent.trim()===${JSON.stringify(text)}).click()`)
      await go('/login?returnTo=%2Fcheckout')
      await click('main button[type="submit"]')
      assert.equal(await evaluate(`document.querySelectorAll('main [aria-invalid="true"]').length`), 2)
      await fill({email:'ayush@example.com',password:'privatepassword123'})
      await click('main button[type="submit"]')
      await until(() => evaluate(`document.querySelector('main [role="alert"]')?.textContent.includes('not available yet')`), 'login unavailable without fake success')
      assert.equal(await evaluate(`document.querySelector('[name="password"]').value`), '')
      assert.equal(await evaluate(`location.pathname`), '/login')
      await go('/signup')
      await fill({name:'Ayush',phone:'9876543210',email:'ayush@example.com',password:'privatepassword123',confirmPassword:'mismatch'})
      await click('main button[type="submit"]')
      assert.equal(await evaluate(`document.querySelector('[name="confirmPassword"]').getAttribute('aria-invalid')`), 'true')
      await fill({confirmPassword:'privatepassword123'})
      await click('main button[type="submit"]')
      await until(() => evaluate(`document.querySelector('main [role="alert"]')?.textContent.includes('not available yet')`), 'signup unavailable without fake success')
      assert.equal(await evaluate(`document.querySelector('[name="password"]').value`), '')
      assert.ok(await evaluate(`!JSON.stringify(localStorage).includes('privatepassword123') && !JSON.stringify(localStorage).includes('ayush@example.com')`))
      for (const route of ['/account/profile','/account/addresses','/account/orders','/account/orders/missing']) {
        await go(route)
        await until(() => evaluate(`document.querySelector('main').textContent.includes('Sign in to your account')`), 'account session gate resolved')
        assert.match(await evaluate(`document.querySelector('main').textContent`), /Sign in to your account/)
        assert.equal(await evaluate(`document.querySelector('meta[name="robots"]').content`), 'noindex, follow')
      }
      for (const width of [320,375,768,1366]) {
        await viewport(width,812)
        for (const route of ['/login','/signup','/account/addresses','/account/orders']) {
          await go(route)
          assert.ok(await evaluate(`document.documentElement.scrollWidth<=document.documentElement.clientWidth`), `${route} responsive at ${width}`)
        }
      }
      results.push('login/signup validation and truthful errors, cleared passwords, no sensitive localStorage, private-page gates and responsive account pages')
      await go('/shop')
      await evaluate(`localStorage.setItem('veina-cart',JSON.stringify([{id:1,qty:2}]))`)
      await evaluate(`(async()=>{const {mountCustomerFixture}=await import('/__catalog-fixture.js');window.__customerData={user:{id:'u1',name:'Ayush',email:'ayush@example.com',phone:'9876543210'},addresses:[{id:'a1',name:'Ayush',phone:'9876543210',address:'12 Marble Road, Delhi',pincode:'110001',isDefault:true},{id:'a2',name:'Second',phone:'9876543211',address:'14 Stone Road, Delhi',pincode:'110002',isDefault:false}],orders:[{id:'ORD1',status:'Dispatched',paymentMethod:'cod',total:1950,items:[{id:1,name:'Marble Cup',qty:2,price:900}],shippingAddress:{name:'Ayush',address:'12 Marble Road, Delhi',pincode:'110001'},tracking:{carrier:'Test carrier',number:'TRACK1',events:[{label:'Order confirmed',date:'2026-10-01'},{label:'Dispatched',date:'2026-10-02'}]}}],addressReads:0,saves:0};const d=window.__customerData;const service={getSession:async()=>d.user,login:async()=>d.user,signup:async()=>{throw new Error('Signup unavailable')},logout:async()=>{d.user=null},getAddresses:async()=>{if(++d.addressReads===1)throw new Error('Address load failed');return d.addresses.map(a=>({...a}))},saveAddress:async(value)=>{if(++d.saves===1)throw new Error('Address save failed');if(value.id)d.addresses=d.addresses.map(a=>a.id===value.id?{...a,...value}:a);else d.addresses.push({...value,id:'a3',isDefault:false})},deleteAddress:async({id})=>{d.addresses=d.addresses.filter(a=>a.id!==id)},setDefaultAddress:async({id})=>{d.addresses=d.addresses.map(a=>({...a,isDefault:a.id===id}))},updateProfile:async(value)=>{d.user={...d.user,...value};return {...d.user}},getOrders:async()=>d.orders.map(o=>({...o})),getOrder:async({id})=>{const order=d.orders.find(o=>o.id===id);if(!order)throw new Error('Order not found');return {...order}}};window.__customerFixture=mountCustomerFixture(service)})()`)
      await until(() => evaluate(`document.querySelector('#customer-test-fixture [role="alert"]')?.textContent==='Address load failed'`), 'address load error')
      await press('Retry')
      await until(() => evaluate(`document.querySelectorAll('#customer-test-fixture article').length===2`), 'addresses retry')
      await press('Add address')
      await press('Save address')
      assert.equal(await evaluate(`document.querySelectorAll('#customer-test-fixture [aria-invalid="true"]').length`), 4)
      await fill({name:'New Recipient',phone:'9876543212',address:'15 Marble Lane, Delhi',pincode:'110003'}, '#customer-test-fixture')
      await press('Save address')
      await until(() => evaluate(`document.querySelector('#customer-test-fixture [role="alert"]')?.textContent==='Address save failed'`), 'save address error')
      assert.equal(await evaluate(`document.querySelector('#customer-test-fixture [name="address"]').value`), '15 Marble Lane, Delhi')
      await press('Save address')
      await until(() => evaluate(`document.querySelectorAll('#customer-test-fixture article').length===3`), 'address added')
      await click('#customer-test-fixture button[aria-label="Edit address for Ayush"]')
      await fill({address:'Updated Marble Road, Delhi'}, '#customer-test-fixture')
      await press('Save address')
      await until(() => evaluate(`document.querySelector('#customer-test-fixture').textContent.includes('Updated Marble Road')`), 'address edited')
      await evaluate(`[...document.querySelectorAll('#customer-test-fixture article')].find(article=>article.textContent.includes('New Recipient')).querySelectorAll('button')[2].click()`)
      await until(() => evaluate(`window.__customerData.addresses.find(a=>a.id==='a3').isDefault`), 'default address update')
      assert.equal(await evaluate(`window.__customerData.addresses.filter(a=>a.isDefault).length`), 1)
      await click('#customer-test-fixture button[aria-label="Delete address for Second"]')
      await press('Cancel')
      assert.equal(await evaluate(`window.__customerData.addresses.length`), 3)
      await click('#customer-test-fixture button[aria-label="Delete address for Second"]')
      await press('Confirm delete')
      await until(() => evaluate(`document.querySelectorAll('#customer-test-fixture article').length===2`), 'address deleted')
      results.push('signed-in address loading/retry, validation, failed-save retention, Add/Edit/Delete/cancel and single Default address via test adapter')
      await click('#customer-test-fixture [data-testid="fixture-checkout"]')
      await until(() => evaluate(`document.querySelector('#customer-test-fixture #saved-shipping-address')?.value==='a3'`), 'checkout default address selected')
      assert.equal(await evaluate(`document.querySelector('#customer-test-fixture #checkout-address').value`), '15 Marble Lane, Delhi')
      await evaluate(`(()=>{const select=document.querySelector('#customer-test-fixture #saved-shipping-address');select.value='a1';select.dispatchEvent(new Event('change',{bubbles:true}))})()`)
      await until(() => evaluate(`document.querySelector('#customer-test-fixture #checkout-address').value==='Updated Marble Road, Delhi'`), 'checkout address selection')
      await click('#customer-test-fixture button[type="submit"]')
      await until(() => evaluate(`document.querySelector('#customer-test-fixture [role="status"]')?.textContent.includes('No order has been placed')`), 'signed-in checkout remains unavailable')
      await click('#customer-test-fixture input[name="addressSource"][value="manual"]')
      await click('#customer-test-fixture button[type="submit"]')
      assert.equal(await evaluate(`document.querySelectorAll('#customer-test-fixture [aria-invalid="true"]').length`), 5)
      assert.equal(await evaluate(`document.querySelector('#customer-test-fixture #checkout-address').getAttribute('aria-invalid')`), 'true')
      assert.equal(await evaluate(`document.querySelector('#customer-test-fixture input[name="paymentMethod"]').value`), 'cod')
      await fill({name:'Ayush',phone:'9876543210',email:'ayush@example.com',address:'22 Marble Road, Delhi',pincode:'110001'}, '#customer-test-fixture')
      await click('#customer-test-fixture button[type="submit"]')
      await until(() => evaluate(`document.querySelector('#customer-test-fixture [role="status"]')?.textContent.includes('No order has been placed')`), 'authenticated manual address checkout')
      results.push('signed-in checkout selects default/saved address, permits new mandatory address and preserves truthful COD submission')
      await evaluate(`window.__customerFixture.root.unmount();window.__customerFixture.node.remove()`)
      await evaluate(`(async()=>{const {mountCustomerFixture}=await import('/__catalog-fixture.js');const d=window.__customerData;const service={getSession:async()=>d.user,getAddresses:async()=>d.addresses,getOrders:async()=>d.orders,getOrder:async({id})=>{const order=d.orders.find(o=>o.id===id);if(!order)throw new Error('Order not found');return order},updateProfile:async(value)=>{d.user={...d.user,...value};return d.user},logout:async()=>{d.user=null}};window.__customerFixture=mountCustomerFixture(service)})()`)
      await until(() => evaluate(`document.querySelectorAll('#customer-test-fixture article').length===2`), 'second customer fixture')
      await click('#customer-test-fixture a[href="/account/profile"]')
      await until(() => evaluate(`!!document.querySelector('#customer-test-fixture [name="email"]')`), 'profile form')
      await fill({name:' '}, '#customer-test-fixture')
      await press('Save profile')
      assert.equal(await evaluate(`document.querySelector('#customer-test-fixture [name="name"]').getAttribute('aria-invalid')`), 'true')
      await fill({name:'Updated Profile'}, '#customer-test-fixture')
      await press('Save profile')
      await until(() => evaluate(`document.querySelector('#customer-test-fixture [role="status"]')?.textContent==='Your profile was updated.'`), 'server-confirmed profile save')
      await click('#customer-test-fixture a[href="/account/orders"]')
      await until(() => evaluate(`!!document.querySelector('#customer-test-fixture a[href="/account/orders/ORD1"]')`), 'orders list')
      await click('#customer-test-fixture a[href="/account/orders/ORD1"]')
      await until(() => evaluate(`document.querySelector('#customer-test-fixture').textContent.includes('TRACK1')`), 'order tracking details')
      assert.match(await evaluate(`document.querySelector('#customer-test-fixture').textContent`), /Cash on Delivery/)
      assert.equal(await evaluate(`document.querySelectorAll('#customer-test-fixture ol li').length`), 2)
      for (const width of [320,375,768,1366]) {
        await viewport(width,812)
        assert.ok(await evaluate(`document.documentElement.scrollWidth<=document.documentElement.clientWidth`), 'signed-in order details responsive')
      }
      await click('#customer-test-fixture [data-testid="fixture-missing"]')
      await until(() => evaluate(`document.querySelector('#customer-test-fixture [role="alert"]')?.textContent==='Order not found'`), 'missing order error')
      await evaluate(`window.__customerData.orders=[]`)
      await click('#customer-test-fixture a[href="/account/orders"]')
      await until(() => evaluate(`document.querySelector('#customer-test-fixture').textContent.includes('No orders yet')`), 'empty orders')
      await click('#customer-test-fixture a[href="/account/profile"]')
      await press('Sign out')
      await until(() => evaluate(`document.querySelector('#customer-test-fixture').textContent.includes('Sign in to your account')`), 'server-confirmed logout')
      await click('#customer-test-fixture [data-testid="fixture-checkout"]')
      await until(() => evaluate(`document.querySelector('#customer-test-fixture').textContent.includes('Sign in to your account') && !document.querySelector('#customer-test-fixture #checkout-name')`), 'checkout blocked after logout')
      await evaluate(`window.__customerFixture.root.unmount();window.__customerFixture.node.remove()`)
      results.push('profile validation/save, server-fed orders and responsive detail/tracking, missing/empty orders and logout gating via test adapter')
    }
    await evaluate("localStorage.clear()")
    await go('/')
    await reload()
    await until(() => evaluate(`!!document.querySelector('a[aria-label="Cart, 0 items"]')`), 'empty state after reload')
    const baselineOrigin = catalogMode ? null : await startServer(true)
    const visualCases = [[375, 812, '/'], [1366, 900, '/'], [375, 812, '/shop'], [1366, 900, '/shop']]
    if (process.argv.includes('--p2')) visualCases.push([375, 812, '/contact'], [1366, 900, '/contact'], [375, 812, '/product/carrara-espresso-cup'], [1366, 900, '/product/carrara-espresso-cup'])
    if (process.argv.includes('--customer')) visualCases.push([375,812,'/login'],[1366,900,'/login'],[375,812,'/signup'],[1366,900,'/signup'])
    if (process.argv.includes('--ui-before') || process.argv.includes('--ui-after')) {
      for (const width of [320,390,768]) for (const route of ['/','/shop','/product/carrara-espresso-cup','/login','/checkout']) visualCases.push([width,812,route])
    }
    for (const [width, height, route] of visualCases) {
      await viewport(width, height)
      await go(route)
      // Chrome's backdrop compositor intermittently changes a one-pixel header edge.
      // Disable that effect equally in both references to compare layout, colors and content.
      await evaluate("document.activeElement?.blur(); window.scrollTo(0,0); document.querySelector('header').style.backdropFilter='none'")
      await sleep(250)
      if (process.argv.includes('--no-screenshots')) { assert.equal(await evaluate(`document.documentElement.scrollWidth<=document.documentElement.clientWidth`),true,`no horizontal overflow: ${route} at ${width}px`); results.push(`responsive layout and overflow: ${route} at ${width}px`); continue }
      const current = await cdp('Page.captureScreenshot', { format: 'png' })
      if (catalogMode) {
        assert.equal(await evaluate(`document.documentElement.scrollWidth<=window.innerWidth`), true, `no horizontal overflow: ${route} at ${width}px`)
        const artifactDir = path.join(root, 'artifacts', process.argv.includes('--ui-before') ? 'ui-before' : process.argv.includes('--ui-after') ? 'ui-after' : 'catalog')
        await (await import('node:fs/promises')).mkdir(artifactDir, { recursive: true })
        await writeFile(path.join(artifactDir, `catalog-${route.replaceAll('/', '-') || 'home'}-${width}.png`), Buffer.from(current.data, 'base64'))
        results.push(`responsive redesigned UI snapshot and overflow check: ${route} at ${width}px`)
        continue
      }
      await go(route, baselineOrigin)
      await evaluate("document.activeElement?.blur(); window.scrollTo(0,0); document.querySelector('header').style.backdropFilter='none'")
      await sleep(250)
      const original = await cdp('Page.captureScreenshot', { format: 'png' })
      const comparison = compareScreenshots(current.data, original.data)
      if (!comparison.passed) {
        preserveArtifacts = true
        await writeFile(path.join(temp, 'current.png'), Buffer.from(current.data, 'base64'))
        await writeFile(path.join(temp, 'original.png'), Buffer.from(original.data, 'base64'))
        console.log(`Visual comparison artifacts: ${temp}`)
      }
      assert.ok(comparison.passed, `default UI screenshot changed: ${route} at ${width}px: ${JSON.stringify(comparison)}`)
      results.push(`unchanged UI layout/color screenshot (header blur disabled equally): ${route} at ${width}px`)
    }
  }
  assert.deepEqual(errors, [], 'no uncaught browser errors')
  console.log(JSON.stringify({ passed: true, checks: results, uncaughtBrowserErrors: errors.length }, null, 2))
} finally {
  socket?.close()
  if (chrome && chrome.exitCode === null) {
    chrome.kill()
    await Promise.race([new Promise((resolve) => chrome.once('exit', resolve)), sleep(5000)])
  }
  for (const server of servers) await server.close()
  assert.ok(path.resolve(temp).startsWith(temporaryRoot + path.sep) && path.basename(temp).startsWith('marbelo-p1-browser-'))
  if (!preserveArtifacts) await rm(temp, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 })
}
