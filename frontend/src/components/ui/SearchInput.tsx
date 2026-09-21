import { Search } from 'lucide-react';
import './SearchInput.css';

interface Props {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function SearchInput({ id, label, value, placeholder, onChange }: Props) {
  return (
    <div className="search-input">
      <label className="search-input__label" htmlFor={id}>{label}</label>
      <div className="search-input__box">
        <Search size={14} className="search-input__icon" aria-hidden="true" />
        <input
          id={id}
          type="text"
          className="search-input__field"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
