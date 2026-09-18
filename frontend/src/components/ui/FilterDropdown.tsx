import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import './FilterDropdown.css';

interface Props {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function FilterDropdown({ id, label, value, options, onChange }: Props) {
  const selected = options.find((o) => o.value === value);

  return (
    <div className="filter-dropdown">
      <label className="filter-dropdown__label" htmlFor={id}>{label}</label>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger className="filter-dropdown__trigger" id={id} aria-label={label}>
          <Select.Value placeholder={selected?.label ?? 'All'} />
          <Select.Icon>
            <ChevronDown size={14} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="filter-dropdown__content" position="popper" sideOffset={4}>
            <Select.Viewport>
              {options.map((opt) => (
                <Select.Item key={opt.value} value={opt.value} className="filter-dropdown__item">
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator className="filter-dropdown__indicator">
                    <Check size={12} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
