import { IconButton } from '../../icon-button';
import { CloseIcon } from '../../icons';
import { cn } from '@/helpers/cn';
import { FC, useEffect, useRef, useState } from 'react';

export type Option = Readonly<{
  value: string;
  label: string;
}>;

type Props = {
  id: string;
  describedbyId: string | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  options: readonly Option[];
  value: string[];
  onChange: (value: string[]) => void;
};

export const Autocomplete: FC<Props> = ({
  id,
  describedbyId,
  isInvalid,
  isDisabled,
  isRequired,
  options,
  value,
  onChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [selectIndex, setSelectIndex] = useState<number>();

  const filteredOptions = options.filter((option) =>
    option.label.includes(text),
  );

  const reset = () => {
    setText('');
    setOpen(false);
    setSelectIndex(undefined);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      reset();
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'border-border-base bg-bg-base relative w-full rounded-md border shadow-xs',
        'focus-within:bordertransparent focus-within:ring-border-info focus-within:ring-2 focus-within:outline-hidden',
        'has-aria-invalid:border-border-error',
        'has-disabled:border-border-mute has-disabled:has-hover:hover:bg-bg-mute has-disabled:bg-bg-mute has-disabled:cursor-not-allowed',
      )}
    >
      <div className="flex min-h-12 items-center justify-between gap-2 px-3 py-2">
        <div className="flex w-full flex-wrap gap-1">
          {value.map((text) => {
            const label = options.find(
              (option) => option.value === text,
            )?.label;
            return (
              <div
                key={text}
                tabIndex={-1}
                className="bg-bg-mute inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
              >
                {label}
                <IconButton
                  label="閉じる"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                    onChange(value.filter((v) => v !== text));
                  }}
                >
                  <CloseIcon size="sm" />
                </IconButton>
              </div>
            );
          })}
          <input
            id={id}
            aria-describedby={describedbyId}
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={open ? `${id}_listbox` : undefined}
            aria-invalid={isInvalid}
            aria-required={isRequired}
            className={cn(
              'bgtransparent grow focus-visible:outline-hidden',
              'disabled:cursor-not-allowed',
            )}
            type="text"
            disabled={isDisabled}
            value={text}
            autoComplete="off"
            placeholder="入力して絞り込めます"
            onChange={(e) => {
              setOpen(true);
              setText(e.target.value);
              setSelectIndex(undefined);
            }}
            onBlur={(e) => {
              if (e.relatedTarget?.id.startsWith(`${id}_option_`)) {
                return;
              }
              setOpen(false);
            }}
            onClick={() => {
              if (open && text.length === 0) {
                setOpen(false);
                return;
              }
              setOpen(true);
              setSelectIndex(undefined);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && text.length === 0) {
                reset();
                onChange(value.slice(0, -1));
                return;
              }
              if (e.key === 'ArrowDown') {
                setOpen(true);
                setSelectIndex((prev) => {
                  if (prev === undefined) {
                    return 0;
                  }
                  return Math.min(prev + 1, options.length - 1);
                });
                return;
              }
              if (e.key === 'ArrowUp') {
                setOpen(true);
                setSelectIndex((prev) => {
                  if (prev === undefined) {
                    return 0;
                  }
                  return Math.max(prev - 1, 0);
                });
                return;
              }
              if (e.key === 'Enter') {
                if (selectIndex !== undefined && selectIndex >= 0) {
                  const selected = filteredOptions[selectIndex];
                  if (!selected) {
                    return;
                  }
                  if (value.includes(selected.value)) {
                    onChange(
                      value.filter((v) => v !== selected.value),
                    );
                    reset();
                    return;
                  }
                  onChange([...value, selected.value]);
                  reset();
                  return;
                }
              }
            }}
          />
        </div>
        {value.length > 0 && (
          <IconButton
            label="すべて閉じる"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
          >
            <CloseIcon size="sm" />
          </IconButton>
        )}
      </div>
      <div className="relative w-full">
        {open && (
          <div
            role="presentation"
            className="border-border-mute bg-bg-base absolute top-1 z-10 w-full rounded-md border shadow-md"
          >
            <ul
              id={`${id}_listbox`}
              role="listbox"
              className="max-h-96 py-2"
            >
              {filteredOptions.length === 0 && (
                <li className="text-fg-mute px-3 py-2">該当なし</li>
              )}
              {filteredOptions.map((option, idx) => {
                const selected = value.includes(option.value);
                return (
                  <li
                    key={option.value}
                    id={`${id}_option_${option.value}`}
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    className={cn(
                      'cursor-pointer px-3 py-2',
                      selected && 'bg-primary-bg text-fg-inverse',
                      selectIndex === idx &&
                        !selected &&
                        'bg-bg-emphasize',
                      selectIndex === idx &&
                        selected &&
                        'hover:bg-primary-bg/90',
                    )}
                    onMouseEnter={() => {
                      setSelectIndex(idx);
                    }}
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                      if (selected) {
                        onChange(
                          value.filter((v) => v !== option.value),
                        );
                        return;
                      }
                      onChange([...value, option.value]);
                    }}
                  >
                    {option.label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
