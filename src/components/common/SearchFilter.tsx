import { FormControl, InputGroup } from 'react-bootstrap'
import { LuSearch } from 'react-icons/lu'

export type SearchFilterProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const SearchFilter = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: SearchFilterProps) => {
  return (
    <div className={className ?? 'app-search'}>
      <InputGroup>
        <InputGroup.Text className="bg-light">
          <LuSearch />
        </InputGroup.Text>
        <FormControl
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </InputGroup>
    </div>
  )
}

export default SearchFilter
