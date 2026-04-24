export interface AvailabilityRuleDto {
  id: string;
  practitionerId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  timezone: string;
  isRecurring: boolean;
  validFrom?: Date;
  validUntil?: Date;
}

export interface TimeSlotDto {
  start: Date;
  end: Date;
  available: boolean;
}
