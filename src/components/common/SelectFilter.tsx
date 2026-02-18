import type { ReactNode } from 'react'
import { FormSelect, InputGroup } from 'react-bootstrap'

export type SelectOption = {
  value: string
  label: string
}

export type SelectFilterProps = {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  icon?: ReactNode
}

const SelectFilter = ({
  value,
  onChange,
  options,
  placeholder = 'All',
  className,
  icon,
}: SelectFilterProps) => {
  return (
    <InputGroup className={className}>
      {icon && <InputGroup.Text className="bg-light">{icon}</InputGroup.Text>}
      <FormSelect
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormSelect>
    </InputGroup>
  )
}

export default SelectFilter
