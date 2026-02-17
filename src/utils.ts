/**
 * Calculate the duration an ad was running in days
 * @param startDate - ISO date string (e.g., "2024-01-15T08:00:00.000Z")
 * @param endDate - ISO date string (e.g., "2024-02-15T08:00:00.000Z")
 * @returns Number of days the ad ran, or null if dates are invalid
 */
export function calculateAdDuration(startDate: string, endDate: string): number | null {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }
    
    // Calculate difference in milliseconds
    const diffMs = end.getTime() - start.getTime();
    
    // Convert to days (round to nearest day)
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    return null;
  }
}

/**
 * Format ad duration as a human-readable string
 * @param days - Number of days
 * @returns Formatted string like "34 days" or "1 day"
 */
export function formatAdDuration(days: number | null): string {
  if (days === null) {
    return 'Unknown';
  }
  
  if (days === 0) {
    return 'Less than 1 day';
  }
  
  if (days === 1) {
    return '1 day';
  }
  
  return `${days} days`;
}

/**
 * Calculate how many days an ad has been active (from startDate to now, or endDate if ended)
 * @param startDate - ISO date string (e.g., "2024-01-15T08:00:00.000Z")
 * @param endDate - ISO date string (e.g., "2024-02-15T08:00:00.000Z") or null if still active
 * @param isActive - Whether the ad is currently active
 * @returns Number of days the ad has been active, or null if dates are invalid
 */
export function calculateActiveDays(startDate: string, endDate: string, isActive: boolean): number | null {
  try {
    const start = new Date(startDate);
    const now = new Date();
    
    // Check if start date is valid
    if (isNaN(start.getTime())) {
      return null;
    }
    
    // If ad is still active, calculate from start to now
    // If ad has ended, calculate from start to end date
    const end = isActive ? now : new Date(endDate);
    
    // Check if end date is valid (only if not active)
    if (!isActive && isNaN(end.getTime())) {
      return null;
    }
    
    // Calculate difference in milliseconds
    const diffMs = end.getTime() - start.getTime();
    
    // Convert to days (round down to get full days)
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Return 0 if negative (shouldn't happen, but safety check)
    return Math.max(0, diffDays);
  } catch (error) {
    return null;
  }
}

