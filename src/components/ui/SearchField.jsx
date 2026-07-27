import { useId } from 'react';
import Icon from './Icon';

export default function SearchField({ value, onChange, label, placeholder }) {
  const inputId = useId();
  return (
    <div className="search-field" role="search">
      <label className="visually-hidden" htmlFor={inputId}>{label}</label>
      <Icon name="search" size={20} />
      <input id={inputId} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}
