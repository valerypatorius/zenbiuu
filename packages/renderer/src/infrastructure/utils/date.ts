/**
 * Base ms in second value
 */
const MS = 1000;

/**
 * Ms in second
 */
const Second = MS;

/**
 * Ms in minute
 */
const Minute = 60 * Second;

/**
 * Ms in hour
 */
const Hour = 60 * Minute;

/**
 * Ms in day
 */
const Day = 24 * Hour;

/**
 * Returns current timestamp in ms
 */
export const now = (): number => {
  const date = new Date();

  return date.getTime();
};

/**
 * Converts date string to unix timestamp
 */
export const unixtime = (dateString: string): number => {
  const date = new Date(dateString);

  return date.getTime() / MS;
};

export default {
  Second,
  Minute,
  Hour,
  Day,
};
