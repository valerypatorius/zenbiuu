/**
 * Base ms in second value
 */
const MS = 1000;

/**
 * Ms in second
 */
export const Second = MS;

/**
 * Ms in minute
 */
export const Minute = 60 * Second;

/**
 * Ms in hour
 */
export const Hour = 60 * Minute;

/**
 * Ms in day
 */
export const Day = 24 * Hour;

/**
 * Converts date string to unix timestamp
 */
export const unixtime = (dateString?: string): number => {
  const date = dateString !== undefined ? new Date(dateString) : new Date();

  return date.getTime();
};

export const getExpirationDateFromNow = (remainingTime: number): string => {
  return new Date(unixtime() + remainingTime * 1000).toISOString();
};
