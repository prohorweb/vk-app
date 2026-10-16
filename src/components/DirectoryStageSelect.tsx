import { FormItem, Select } from '@vkontakte/vkui'

type StageOption = {
  id: number
  name: string
}

type DirectoryStageSelectProps = {
  seasonTitle?: string | null
  stages: StageOption[]
  value: number | 'all'
  onChange: (value: number | 'all') => void
  allowAll?: boolean
}

export function DirectoryStageSelect({
  seasonTitle,
  stages,
  value,
  onChange,
  allowAll = false,
}: DirectoryStageSelectProps) {
  const options = [
    ...(allowAll ? [{ label: 'Все этапы', value: 'all' }] : []),
    ...stages.map((stage) => ({ label: stage.name, value: String(stage.id) })),
  ]

  return (
    <FormItem top={seasonTitle ? `${seasonTitle} → этап` : 'Этап'}>
      <Select
        value={value === 'all' ? 'all' : String(value)}
        options={options}
        onChange={(event) => {
          const next = event.target.value
          if (next === 'all') {
            onChange('all')
            return
          }
          const stageId = Number(next)
          if (Number.isInteger(stageId) && stageId > 0) {
            onChange(stageId)
          }
        }}
      />
    </FormItem>
  )
}
