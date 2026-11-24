import { useId, type ReactNode } from 'react';
import { Check } from 'lucide-react';

// Campos con etiqueta siempre visible, ayuda y error junto al campo (nunca solo un placeholder).

const CAJA =
  'w-full min-h-12 rounded-md border-[2px] bg-surface px-3.5 text-body text-fg outline-none transition-[border-color,box-shadow] duration-(--duration-fast) placeholder:text-fg-muted focus:border-link focus:ring-3 focus:ring-link/25 disabled:cursor-not-allowed disabled:opacity-50';

interface Base {
  label: string;
  /** Una línea de ayuda debajo */
  hint?: string;
  /** Qué está mal y cómo arreglarlo; marca el campo como inválido */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** id fijo, para poder enfocar el primer campo con error */
  id?: string;
  className?: string;
}

function Envoltura({ id, label, hint, error, required, children, className = '' }: Base & { id: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-label text-fg">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-danger">
            {' '}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-small text-fg-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-small font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const describe = (id: string, hint?: string, error?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export interface TextFieldProps extends Base {
  value: string;
  onChangeText: (texto: string) => void;
  /** Pone el teclado adecuado en el celular */
  kind?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'search';
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  onBlur?: () => void;
}

const TECLADO = { text: 'text', email: 'email', tel: 'tel', number: 'numeric', password: 'text', search: 'search' } as const;

export function TextField({
  id: fijo,
  label,
  value,
  onChangeText,
  kind = 'text',
  placeholder,
  hint,
  error,
  required,
  disabled,
  autoComplete,
  maxLength,
  onBlur,
  className,
}: TextFieldProps) {
  const auto = useId();
  const id = fijo ?? auto;
  return (
    <Envoltura id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={id}
        type={kind === 'number' ? 'text' : kind}
        inputMode={TECLADO[kind]}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        spellCheck={kind === 'email' ? false : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        onChange={(e) => onChangeText(e.target.value)}
        onBlur={onBlur}
        className={`${CAJA} ${error ? 'border-danger' : 'border-line-strong'}`}
      />
    </Envoltura>
  );
}

export interface SelectProps extends Base {
  value: string;
  onChange: (valor: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ id: fijo, label, value, onChange, options, placeholder = 'Elige una opción', hint, error, required, disabled, className }: SelectProps) {
  const auto = useId();
  const id = fijo ?? auto;
  return (
    <Envoltura id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={id}
        value={value}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        onChange={(e) => onChange(e.target.value)}
        className={`${CAJA} bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' stroke='%236A4207' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 8 5 5 5-5'/%3E%3C/svg%3E")] cursor-pointer appearance-none bg-[position:right_0.75rem_center] bg-no-repeat pr-10 ${error ? 'border-danger' : 'border-line-strong'}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Envoltura>
  );
}

/** Casilla con su texto; el texto puede llevar enlaces o botones. */
export function Checkbox({ checked, onChange, children, error }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; error?: string }) {
  const id = useId();
  return (
    <div>
      <div className={`flex items-start gap-3 rounded-md p-3 ${error && !checked ? 'bg-danger-soft' : 'bg-sunken'}`}>
        <span className="relative mt-0.5 inline-flex size-6 shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={error && !checked ? true : undefined}
            aria-describedby={error && !checked ? `${id}-error` : undefined}
            className="peer size-6 cursor-pointer appearance-none rounded-sm border-[2.5px] border-outline bg-surface checked:bg-accent"
          />
          <Check size={16} strokeWidth={3.5} aria-hidden="true" className="pointer-events-none absolute inset-1 hidden text-on-accent peer-checked:block" />
        </span>
        <label htmlFor={id} className="cursor-pointer text-body">
          {children}
        </label>
      </div>
      {error && !checked ? (
        <p id={`${id}-error`} className="mt-1.5 text-small font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
