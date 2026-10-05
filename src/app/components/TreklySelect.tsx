'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';

const TREKLY_SELECT_OPEN_EVENT = 'trekly-select-open';

export interface TreklySelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: ReactNode;
  icon?: ReactNode;
  indicatorClassName?: string;
  disabled?: boolean;
}

export interface TreklySelectProps<T extends string = string> {
  value: T;
  options: TreklySelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: ReactNode;
  description?: ReactNode;
  variant?: 'default' | 'status' | 'priority';
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  renderOption?: (
    option: TreklySelectOption<T>,
    state: { selected: boolean; highlighted: boolean },
  ) => ReactNode;
  renderValue?: (option: TreklySelectOption<T>) => ReactNode;
}

function getEnabledIndex<T extends string>(options: TreklySelectOption<T>[], startIndex: number, direction: 1 | -1) {
  if (options.length === 0) return -1;

  for (let offset = 0; offset < options.length; offset += 1) {
    const index = (startIndex + offset * direction + options.length) % options.length;
    if (!options[index].disabled) return index;
  }

  return -1;
}

function getFirstEnabledIndex<T extends string>(options: TreklySelectOption<T>[]) {
  return options.findIndex((option) => !option.disabled);
}

export default function TreklySelect<T extends string = string>({
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  icon,
  description,
  variant = 'default',
  ariaLabel = 'Select an option',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  renderOption,
  renderValue,
}: TreklySelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(() => {
    const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);
    return selectedIndex >= 0 ? selectedIndex : getFirstEnabledIndex(options);
  });
  const instanceId = useId();
  const triggerId = `trekly-select-trigger-${instanceId}`;
  const listboxId = `trekly-select-listbox-${instanceId}`;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedOption = options.find((option) => option.value === value);
  const selectedIndex = selectedOption && !selectedOption.disabled
    ? options.findIndex((option) => option.value === value)
    : getFirstEnabledIndex(options);

  useEffect(() => {
    const handleOtherSelectOpen = (event: Event) => {
      const otherInstanceId = (event as CustomEvent<string>).detail;
      if (otherInstanceId !== instanceId) setIsOpen(false);
    };

    window.addEventListener(TREKLY_SELECT_OPEN_EVENT, handleOtherSelectOpen);
    return () => window.removeEventListener(TREKLY_SELECT_OPEN_EVENT, handleOtherSelectOpen);
  }, [instanceId]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return;
    const frame = window.requestAnimationFrame(() => optionRefs.current[highlightedIndex]?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [highlightedIndex, isOpen]);

  const announceOpen = () => {
    window.dispatchEvent(new CustomEvent(TREKLY_SELECT_OPEN_EVENT, { detail: instanceId }));
  };

  const openDropdown = (direction?: 1 | -1) => {
    const nextIndex = direction
      ? getEnabledIndex(options, (selectedIndex >= 0 ? selectedIndex : 0) + direction, direction)
      : selectedIndex;

    setHighlightedIndex(nextIndex >= 0 ? nextIndex : getFirstEnabledIndex(options));
    announceOpen();
    setIsOpen(true);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
    } else {
      openDropdown();
    }
  };

  const selectOption = (option: TreklySelectOption<T>) => {
    if (disabled || option.disabled) return;
    onChange(option.value);
    setHighlightedIndex(options.findIndex((candidate) => candidate.value === option.value));
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openDropdown(event.key === 'ArrowDown' ? 1 : -1);
    }
  };

  const handleOptionKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = getEnabledIndex(options, index + (event.key === 'ArrowDown' ? 1 : -1), event.key === 'ArrowDown' ? 1 : -1);
      if (nextIndex >= 0) {
        setHighlightedIndex(nextIndex);
        optionRefs.current[nextIndex]?.focus();
      }
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const enabledIndexes = options.reduce<number[]>((indexes, option, optionIndex) => {
        if (!option.disabled) indexes.push(optionIndex);
        return indexes;
      }, []);
      const nextIndex = event.key === 'Home' ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1];
      if (nextIndex !== undefined) {
        setHighlightedIndex(nextIndex);
        optionRefs.current[nextIndex]?.focus();
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(options[index]);
    }
  };

  const renderLeading = (option: TreklySelectOption<T>, size: 'trigger' | 'option') => {
    if (option.icon) return option.icon;
    if (!option.indicatorClassName) return null;

    return (
      <span
        aria-hidden="true"
        className={`shrink-0 rounded-full ${size === 'trigger' ? 'h-2.5 w-2.5' : 'h-2.5 w-2.5'} ${option.indicatorClassName}`}
      />
    );
  };

  const triggerContent = selectedOption
    ? renderValue?.(selectedOption) || selectedOption.label
    : placeholder;
  const selectedLeading = selectedOption ? renderLeading(selectedOption, 'trigger') : icon;

  return (
    <div ref={dropdownRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={toggleDropdown}
        onKeyDown={handleTriggerKeyDown}
        className={`flex min-h-11 w-full items-center gap-3 rounded-xl border-2 border-[#1a2e1f]/20 bg-[#fffdf7] px-3.5 py-2 text-left text-sm text-foreground shadow-sm transition-all duration-200 hover:border-[#1a2e1f]/45 focus:outline-none focus:ring-2 focus:ring-[#ffc93c]/70 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
          variant === 'priority' ? 'font-black' : 'font-semibold'
        } ${triggerClassName}`}
      >
        {selectedLeading && <span className="flex shrink-0 items-center">{selectedLeading}</span>}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[#1a2e1f]">{triggerContent}</span>
          {description && <span className="mt-0.5 block truncate text-[11px] font-medium text-muted-foreground">{description}</span>}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#1a2e1f]/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="trekly-select-menu"
            id={listboxId}
            role="listbox"
            aria-labelledby={triggerId}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-72 overflow-y-auto rounded-2xl border-2 border-[#1a2e1f]/20 bg-white p-2 shadow-[0_12px_28px_rgba(26,46,31,0.14)] ${menuClassName}`}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={option.value}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  disabled={option.disabled}
                  tabIndex={isHighlighted ? 0 : -1}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#ffc93c]/70 disabled:cursor-not-allowed disabled:opacity-45 ${
                    isSelected
                      ? 'bg-[#fff2c4] text-[#1a2e1f]'
                      : isHighlighted
                        ? 'translate-y-[-1px] bg-[#fff9e8] text-[#1a2e1f]'
                        : 'text-foreground hover:translate-y-[-1px] hover:bg-[#fff9e8]'
                  }`}
                >
                  {renderOption ? renderOption(option, { selected: isSelected, highlighted: isHighlighted }) : (
                    <>
                      <span className="flex shrink-0 items-center">{renderLeading(option, 'option')}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{option.label}</span>
                        {option.description && <span className="block truncate text-xs text-muted-foreground">{option.description}</span>}
                      </span>
                    </>
                  )}
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-[#e5651f]" strokeWidth={2.5} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
