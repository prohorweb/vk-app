#!/usr/bin/env node
/**
 * Capture VKUI mini-app screenshots (360px viewport, no browser chrome).
 *
 * Theme: add ?appearance=light|dark (read in dev by AppConfig → ConfigProvider colorScheme).
 *
 * Usage:
 *   npm run dev   # in another terminal
 *   node scripts/screens.mjs
 *   node scripts/screens.mjs --manifest scripts/manifests/v2-step1.json
 *   node scripts/screens.mjs --base-url http://127.0.0.1:5173 --route /map --appearance dark --out /tmp/map-dark.png
 *
 * Manifest fields:
 *   baseUrl, width, height, outputDir, shots[]
 *   shot: { file, route, appearance, localStorage?, actions?, waitForRole? }
 */

import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const DEFAULT_MANIFEST = path.join(repoRoot, 'scripts/manifests/v2-step1.json')

function parseArgs(argv) {
  const options = { manifest: DEFAULT_MANIFEST, baseUrl: null, route: null, appearance: null, out: null }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--manifest') {
      options.manifest = path.resolve(repoRoot, argv[++i])
    } else if (arg === '--base-url') {
      options.baseUrl = argv[++i]
    } else if (arg === '--route') {
      options.route = argv[++i]
    } else if (arg === '--appearance') {
      options.appearance = argv[++i]
    } else if (arg === '--out') {
      options.out = argv[++i]
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/screens.mjs [--manifest path] [--base-url url --route /map --appearance dark --out file.png]`)
      process.exit(0)
    }
  }
  return options
}

function buildPageUrl(baseUrl, route, appearance) {
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`
  const url = new URL(baseUrl)
  url.searchParams.set('appearance', appearance)
  url.hash = normalizedRoute === '/' ? '#/' : `#${normalizedRoute}`
  return url.toString()
}

async function applyLocalStorage(context, localStorage) {
  if (!localStorage || Object.keys(localStorage).length === 0) {
    return
  }
  await context.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      if (value === null || value === undefined) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, String(value))
      }
    }
  }, localStorage)
}

async function runActions(page, actions) {
  for (const action of actions ?? []) {
    if (action === 'openMoreMenu') {
      await page.getByRole('button', { name: 'Ещё', exact: true }).click()
      await page.locator('.more-menu-sheet--visible .more-menu-sheet__panel').waitFor({
        state: 'visible',
        timeout: 15_000,
      })
      await page.waitForTimeout(280)
      await page.mouse.move(8, 8)
    } else {
      throw new Error(`Unknown action: ${action}`)
    }
  }
}

async function waitForReady(page, shot, phase) {
  if (phase === 'before') {
    if (shot.waitForText) {
      await page.getByText(shot.waitForText, { exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
    }
    if (shot.waitForRole) {
      const [role, name] = shot.waitForRole
      await page.getByRole(role, { name, exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
    }
    if (shot.beforeWaitSelector) {
      const locator = page.locator(shot.beforeWaitSelector).first()
      await locator.waitFor({ state: 'visible', timeout: 15_000 })
      if (shot.beforeWaitSelector.includes('picture__img')) {
        await locator.evaluate((image) => {
          if (!(image instanceof HTMLImageElement)) {
            return
          }
          if (image.complete && image.naturalWidth > 0) {
            return
          }
          return new Promise((resolve, reject) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => reject(new Error('Image failed to load')), { once: true })
          })
        })
      }
    } else if (!shot.actions?.length) {
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined)
    }
    return
  }

  if (shot.waitForSelector) {
    await page.locator(shot.waitForSelector).first().waitFor({ state: 'visible', timeout: 15_000 })
  }
}

async function captureShot(browser, manifest, shot, outputPath) {
  const width = manifest.width ?? 360
  const height = manifest.height ?? 800
  const baseUrl = manifest.baseUrl ?? 'http://127.0.0.1:5173'
  const appearance = shot.appearance ?? 'light'

  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: appearance === 'dark' ? 'dark' : 'light',
  })

  await applyLocalStorage(context, shot.localStorage)

  const page = await context.newPage()
  const url = buildPageUrl(baseUrl, shot.route ?? '/', appearance)

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await waitForReady(page, shot, 'before')
  await runActions(page, shot.actions)
  await waitForReady(page, shot, 'after')

  await page.screenshot({ path: outputPath, fullPage: false })
  await context.close()
}

async function loadManifest(manifestPath) {
  const raw = await readFile(manifestPath, 'utf8')
  return JSON.parse(raw)
}

async function main() {
  const cli = parseArgs(process.argv.slice(2))

  if (cli.route && cli.out && cli.appearance) {
    const browser = await chromium.launch({ headless: true })
    try {
      const baseUrl = cli.baseUrl ?? 'http://127.0.0.1:5173'
      await captureShot(
        browser,
        { baseUrl, width: 360, height: 800 },
        { route: cli.route, appearance: cli.appearance },
        path.resolve(repoRoot, cli.out),
      )
      console.log(`Saved ${cli.out}`)
    } finally {
      await browser.close()
    }
    return
  }

  const manifest = await loadManifest(cli.manifest)
  if (cli.baseUrl) {
    manifest.baseUrl = cli.baseUrl
  }

  const outputDir = path.resolve(repoRoot, manifest.outputDir)
  await mkdir(outputDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  try {
    for (const shot of manifest.shots) {
      const outFile = path.join(outputDir, shot.file)
      await captureShot(browser, manifest, shot, outFile)
      console.log(`Saved ${path.relative(repoRoot, outFile)}`)
    }
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
