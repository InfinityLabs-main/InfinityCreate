import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Слияние Tailwind-классов без конфликтов.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
