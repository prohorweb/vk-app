/**
 * Capture demo scenario fixtures from a running local API.
 * Usage: node scripts/capture-demo-fixtures.mjs [baseUrl]
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outRoot = path.join(root, 'src', 'api', 'mocks', 'scenarios')
const baseUrl = (process.argv[2] || 'http://127.0.0.1:8000').replace(/\/$/, '')

const scenarios = ['upcoming', 'live', 'finished']

async function getJson(urlPath) {
  const response = await fetch(`${baseUrl}${urlPath}`)
  if (!response.ok) {
    throw new Error(`GET ${urlPath} -> ${response.status}`)
  }
  return response.json()
}

async function postScenario(name) {
  const response = await fetch(`${baseUrl}/api/v1/dev/scenarios/${name}`, { method: 'POST' })
  if (!response.ok) {
    throw new Error(`POST scenario ${name} -> ${response.status}`)
  }
  return response.json()
}

async function writeJson(dir, name, data) {
  await writeFile(path.join(dir, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

async function captureScenario(name) {
  console.log(`\n=== ${name} ===`)
  await postScenario(name)
  // Give DB a beat after seed
  await new Promise((r) => setTimeout(r, 400))

  const dir = path.join(outRoot, name)
  await mkdir(dir, { recursive: true })

  const season = await getJson('/api/v1/directory/seasons/active')
  await writeJson(dir, 'season', season)

  const seasonId = season.id
  const stages = await getJson(`/api/v1/directory/stages?season_id=${seasonId}`)
  await writeJson(dir, 'stages', stages)

  const disciplines = await getJson(`/api/v1/directory/disciplines?season_id=${seasonId}`)
  await writeJson(dir, 'disciplines', disciplines)

  const participants = await getJson('/api/v1/participants?sort=bib')
  await writeJson(dir, 'participants', participants)

  const details = {}
  for (const item of participants) {
    details[item.id] = await getJson(`/api/v1/participants/${item.id}`)
  }
  await writeJson(dir, 'participant-details', details)

  const supporters = {}
  for (const item of participants) {
    supporters[item.id] = await getJson(`/api/v1/participants/${item.id}/supporters`)
  }
  await writeJson(dir, 'supporters', supporters)

  try {
    const rating = await getJson('/api/v1/participants/supporters/rating?limit=200')
    await writeJson(dir, 'supporters-rating', rating)
  } catch {
    await writeJson(dir, 'supporters-rating', [])
  }

  const standings = await getJson('/api/v1/results/standings')
  await writeJson(dir, 'standings', standings)

  const protocols = {}
  for (const stage of stages) {
    try {
      protocols[stage.id] = await getJson(`/api/v1/results/stage/${stage.id}`)
    } catch {
      // 404 for unpublished / empty
    }
  }
  await writeJson(dir, 'protocols', protocols)

  let mapParticipants
  try {
    mapParticipants = await getJson('/api/v1/map/participants?limit=500')
  } catch {
    mapParticipants = { stage_id: stages[0]?.id ?? 1, items: [] }
  }
  await writeJson(dir, 'map-participants', mapParticipants)

  const tracks = {}
  const checkpoints = {}
  for (const stage of stages) {
    try {
      tracks[stage.id] = await getJson(`/api/v1/stages/${stage.id}/track`)
    } catch {
      tracks[stage.id] = { type: 'LineString', coordinates: [] }
    }
    try {
      checkpoints[stage.id] = await getJson(`/api/v1/stages/${stage.id}/checkpoints`)
    } catch {
      checkpoints[stage.id] = []
    }
  }
  await writeJson(dir, 'tracks', tracks)
  await writeJson(dir, 'checkpoints', checkpoints)

  await writeJson(dir, 'news', await getJson('/api/v1/content/news?limit=50&offset=0'))
  await writeJson(dir, 'schedule', await getJson('/api/v1/content/schedule?limit=50&offset=0'))
  await writeJson(dir, 'faq', await getJson('/api/v1/content/faq?limit=50&offset=0'))
  await writeJson(
    dir,
    'viewer-locations',
    await getJson('/api/v1/content/viewer-locations'),
  )

  console.log(`wrote ${dir}`)
}

async function main() {
  for (const name of scenarios) {
    await captureScenario(name)
  }
  console.log('\nDone.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
