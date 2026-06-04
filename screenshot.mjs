import puppeteer from 'puppeteer'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import path from 'path'

const url = process.argv[2] || 'http://localhost:3000'
const label = process.argv[3] ? `-${process.argv[3]}` : ''
const dir = './temporary screenshots'

if (!existsSync(dir)) mkdirSync(dir)

const existing = readdirSync(dir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'))
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] ?? '0')).filter(Boolean)
const n = nums.length ? Math.max(...nums) + 1 : 1
const outPath = path.join(dir, `screenshot-${n}${label}.png`)

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(url, { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 600))

// Scroll through to trigger IntersectionObserver reveal animations
await page.evaluate(async () => {
  await new Promise(resolve => {
    const step = 400
    let pos = 0
    const timer = setInterval(() => {
      pos += step
      window.scrollTo(0, pos)
      if (pos >= document.body.scrollHeight) {
        clearInterval(timer)
        window.scrollTo(0, 0)
        resolve()
      }
    }, 60)
  })
})
await new Promise(r => setTimeout(r, 700))

await page.screenshot({ path: outPath, fullPage: true })
await browser.close()

console.log(`Saved: ${outPath}`)
