import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Separator, SimpleCell, Spinner } from '@vkontakte/vkui'
import {
  applyDevScenario,
  DEV_KINETIC_DEVICE_ID,
  startKineticDemo,
  type DevScenarioName,
} from '../../api/devScenarios.ts'
import { ApiError } from '../../api/client.ts'
import { enableDevKineticPolling } from '../../lib/devKinetic.ts'

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

/** Пункты демо-сценариев в меню карты — только DEV-сборка. */
export function DevScenariosMenu({ onClose, onNotice }: DevScenariosMenuProps) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<PendingAction>(null)

  const scenarioMutation = useMutation({
    mutationFn: applyDevScenario,
    onMutate: (name) => {
      setPending(name)
    },
    onSuccess: async (_data, name) => {
      await queryClient.invalidateQueries()
      onNotice(`Сценарий: ${SCENARIO_LABELS[name]}`)
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
      onNotice('Движение Волкова запущено')
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
      <SimpleCell disabled subtitle="Только ENV=dev на бэке">
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
        disabled={busy}
        indicator={pending === 'move' ? <Spinner size="s" /> : undefined}
        subtitle={`device_id ${DEV_KINETIC_DEVICE_ID}`}
        onClick={() => {
          moveMutation.mutate()
        }}
      >
        Движение Волкова
      </SimpleCell>
    </>
  )
}
