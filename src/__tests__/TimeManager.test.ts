import { TimeManager } from "../utils";

describe("TimeManager", () => {
  let timeManager: TimeManager;

  beforeEach(() => {
    timeManager = new TimeManager();
  });

  describe("parseTimestamp", () => {
    it("should parse valid timestamp correctly", () => {
      const timestamp = "03/15/24 14:30";
      const result = timeManager.parseTimestamp(timestamp);

      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2); // March is 2 (0-based)
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it("should throw error for invalid timestamp format", () => {
      const invalidTimestamps = [
        "13/15/24 14:30", // invalid month
        "12/32/24 14:30", // invalid day
        "12/15/24 24:30", // invalid hour
        "12/15/24 14:60", // invalid minute
        "12/15/2024 14:30", // year should be 2 digits
        "invalid string",
      ];

      invalidTimestamps.forEach((timestamp) => {
        expect(() => timeManager.parseTimestamp(timestamp)).toThrow();
      });
    });
  });

  describe("validateDateTime", () => {
    it("should return true for valid dates", () => {
      const validDates = ["03/15/24 14:30", "12/31/23 09:45", "01/01/24 00:00"];

      validDates.forEach((date) => {
        expect(timeManager.validateDateTime(date)).toBe(true);
      });
    });

    it("should return false for invalid dates", () => {
      const invalidDates = [
        "02/30/24 14:30", // invalid day for February
        "04/31/24 14:30", // invalid day for April
        "13/01/24 14:30", // invalid month
        "12/15/24 24:00", // invalid hour
      ];

      invalidDates.forEach((date) => {
        expect(timeManager.validateDateTime(date)).toBe(false);
      });
    });
  });
});
