type PresetOption = {
  group: string
  label: string
  value: string
}

type Props = {
  presets: PresetOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function PresetSelector({ presets, value, onChange, disabled }: Props) {
  const groups = presets.reduce<Record<string, PresetOption[]>>((acc, preset) => {
    (acc[preset.group] ??= []).push(preset)
    return acc
  }, {})

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
    >
      {Object.entries(groups).map(([group, options]) => (
        <optgroup key={group} label={group}>
          {options.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
