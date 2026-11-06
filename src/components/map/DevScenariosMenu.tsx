import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Separator, SimpleCell, Spinner } from '@vkontakte/vkui'
import {
  applyDevScenario,
  DEV_KINETIC_DEVICE_ID,
  startKineticDemo,
  type DevScenarioName,
} from '../../api/devScenarios.ts'
import { ApiError } from '../../api/client.ts'
import { useMockApi } from '../../api/mocks/useMockApi.ts'
import { enableDevKineticPolling } from '../../lib/devKinetic.ts'
import {
  canStartDevKinetic,
  getDevKineticWaitMs,
  setActiveDevScenario,
  subscribeDevScenarioState,
} from '../../lib/devScenarioState.ts'
import { clearMapFilters } from '../../lib/mapFiltersStorage.ts'

type DevScenariosMenuProps = {
  onClose: () => void
  onNotice: (message: string) => void
}

type PendingAction = DevScenarioName | 'move' | null

const SCENARIO_LABELS: Record<DevScenarioName, string> = {
  upcoming: 'До старта',
  live: 'Гонка идёт',
  finished: 'Финиш',
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  return 'Не удалось выполнить действие'
}

function kineticSubtitle(waitMs: number, canMove: boolean): string {
  if (canMove) {
    return `только live · device_id ${DEV_KINETIC_DEVICE_ID}`
  }
  if (waitMs > 0) {
    return `ждём БД… ${Math.ceil(waitMs / 1000)} с`
  }
  return 'сначала сценарий «Гонка идёт»'
}

/** Пункты демо-сценариев в меню карты — только DEV-сборка. */
export function DevScenariosMenu({ onClose, onNotice }: DevScenariosMenuProps) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<PendingAction>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => subscribeDevScenarioState(() => setNowMs(Date.now())), [])

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [])

  const waitMs = getDevKineticWaitMs(nowMs)
  const canMove = canStartDevKinetic(nowMs)

  const scenarioMutation = useMutation({
    mutationFn: applyDevScenario,
    onMutate: (name) => {
      setPending(name)
    },
    onSuccess: async (_data, name) => {
      setActiveDevScenario(name)
      // Сброс фильтра карты: live → активный этап (2), не «все» / старый выбор.
      clearMapFilters()
      await queryClient.invalidateQueries()
      if (name === 'live') {
        onNotice('Сценарий: Гонка идёт · этап 2. Подождите ~6 с, затем «Движение Дорохова»')
      } else {
        onNotice(`Сценарий: ${SCENARIO_LABELS[name]}`)
      }
      onClose()
    },
    onError: (error) => {
      onNotice(errorMessage(error))
    },
    onSettled: () => {
      setPending(null)
    },
  })

  const moveMutation = useMutation({
    mutationFn: () => startKineticDemo(DEV_KINETIC_DEVICE_ID),
    onMutate: () => {
      setPending('move')
    },
    onSuccess: async () => {
      enableDevKineticPolling()
      await queryClient.invalidateQueries({ queryKey: ['map', 'positions'] })
      onNotice('Движение Дорохова запущено')
      onClose()
    },
    onError: (error) => {
      onNotice(errorMessage(error))
    },
    onSettled: () => {
      setPending(null)
    },
  })

  const busy = pending !== null

  return (
    <>
      <Separator />
      <SimpleCell
        disabled
        subtitle={useMockApi ? 'Презентация на моках' : 'Только ENV=dev на бэке'}
      >
        Демо
      </SimpleCell>
      {(Object.keys(SCENARIO_LABELS) as DevScenarioName[]).map((name) => (
        <SimpleCell
          key={name}
          disabled={busy}
          indicator={pending === name ? <Spinner size="s" /> : undefined}
          onClick={() => {
            scenarioMutation.mutate(name)
          }}
        >
          {SCENARIO_LABELS[name]}
        </SimpleCell>
      ))}
      <SimpleCell
        disabled={busy || !canMove}
        indicator={pending === 'move' ? <Spinner size="s" /> : undefined}
        subtitle={kineticSubtitle(waitMs, canMove)}
        onClick={() => {
          if (!canMove) {
            return
          }
          moveMutation.mutate()
        }}
      >
        Движение Дорохова
      </SimpleCell>
    </>
  )
}
