import { useRef, useEffect } from 'react';

/**
 * 6-digit Auto-Focus Numeric OTP Input Component
 * Supports keyboard navigation, auto-focus next, backspace fallback,
 * and multi-digit clipboard paste (Ctrl+V / Cmd+V).
 */
export default function OtpInput({
  value = '',
  onChange,
  onComplete,
  disabled = false,
  error = '',
  length = 6,
}) {
  const inputsRef = useRef([]);

  // Split current string value into individual character array
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  // Auto-focus the first input on mount
  useEffect(() => {
    if (!disabled && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (index, e) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleaned = rawVal.replace(/\D/g, '');

    if (!cleaned) {
      // User cleared the box
      const newDigits = [...digits];
      newDigits[index] = '';
      const newVal = newDigits.join('');
      onChange?.(newVal);
      return;
    }

    // Handle if browser typed multiple chars without firing paste event
    if (cleaned.length > 1) {
      handlePasteDirect(cleaned, index);
      return;
    }

    const digit = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newVal = newDigits.join('');
    onChange?.(newVal);

    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newVal.length === length && !newDigits.includes('')) {
      onComplete?.(newVal);
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current box is empty, jump to previous box and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        const newVal = newDigits.join('');
        onChange?.(newVal);
        inputsRef.current[index - 1]?.focus();
      } else if (digits[index]) {
        // Clear current box
        const newDigits = [...digits];
        newDigits[index] = '';
        const newVal = newDigits.join('');
        onChange?.(newVal);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePasteDirect = (pastedText, startIndex = 0) => {
    const onlyDigits = pastedText.replace(/\D/g, '').slice(0, length);
    if (!onlyDigits) return;

    const newDigits = [...digits];
    for (let i = 0; i < onlyDigits.length; i++) {
      const targetIndex = startIndex === 0 ? i : startIndex + i;
      if (targetIndex < length) {
        newDigits[targetIndex] = onlyDigits[i];
      }
    }

    const newVal = newDigits.join('');
    onChange?.(newVal);

    // Focus either the next empty box or the last box
    const nextEmpty = newDigits.findIndex((d) => !d);
    const focusTarget = nextEmpty === -1 ? length - 1 : nextEmpty;
    inputsRef.current[focusTarget]?.focus();

    if (newVal.length === length && !newDigits.includes('')) {
      onComplete?.(newVal);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;
    const pastedData = e.clipboardData.getData('text/plain');
    handlePasteDirect(pastedData, 0);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {Array.from({ length }, (_, index) => {
          const isFilled = Boolean(digits[index]);
          const hasError = Boolean(error);

          return (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digits[index]}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              disabled={disabled}
              className={`h-12 w-11 sm:h-14 sm:w-13 text-center text-xl sm:text-2xl font-bold font-mono rounded-2xl border transition-all duration-200 outline-none
                ${
                  hasError
                    ? 'border-danger-400 bg-danger-50/40 text-danger-900 focus:border-danger-500 focus:ring-4 focus:ring-danger-500/15'
                    : isFilled
                      ? 'border-brand-500 bg-brand-50/20 text-brand-900 ring-2 ring-brand-500/20'
                      : 'border-border-light bg-surface text-text-primary hover:border-border focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-subtle' : ''}
              `}
              aria-label={`OTP digit ${index + 1}`}
            />
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-center text-xs font-medium text-danger-600 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
}
