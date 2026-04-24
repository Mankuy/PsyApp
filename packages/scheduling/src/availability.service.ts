import { AvailabilityRuleDto, TimeSlotDto } from '../dto/availability.dto';

/**
 * Stub service for generating time slots based on availability rules.
 * To be expanded with actual business logic and persistence.
 */
export class AvailabilityService {
  private rules: AvailabilityRuleDto[] = [];

  addRule(rule: AvailabilityRuleDto): void {
    this.rules.push(rule);
  }

  getRulesByPractitioner(practitionerId: string): AvailabilityRuleDto[] {
    return this.rules.filter((r) => r.practitionerId === practitionerId);
  }

  /**
   * Generate time slots for a given practitioner and date range.
   * Currently returns an empty array as a stub.
   */
  generateTimeSlots(
    practitionerId: string,
    from: Date,
    to: Date,
  ): TimeSlotDto[] {
    // TODO: implement slot generation based on availability rules,
    // existing appointments, buffers, etc.
    console.log(
      `[AvailabilityService] generateTimeSlots stub called for practitioner=${practitionerId} from=${from.toISOString()} to=${to.toISOString()}`,
    );
    return [];
  }
}
