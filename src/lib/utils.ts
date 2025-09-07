import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addDays, isSaturday, isSunday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateEndDate(startDate: Date, durationDays: number, weekdaysOnly: boolean): Date {
  if (durationDays <= 0) {
    return startDate;
  }

  let currentDate = new Date(startDate);
  let daysAdded = 0;

  if (weekdaysOnly) {
    while (daysAdded < durationDays -1) {
      currentDate = addDays(currentDate, 1);
      if (!isSaturday(currentDate) && !isSunday(currentDate)) {
        daysAdded++;
      }
    }
  } else {
    currentDate = addDays(startDate, durationDays - 1);
  }

  return currentDate;
}
