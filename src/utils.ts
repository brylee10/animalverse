import { SpriteType, Movement, ShowSpriteMessage } from "./types";

export class TimeManager {
  // Helper method to parse "MM/DD/YY HH:mm" into a Date object
  parseTimestamp(timestamp: string): Date {
    // Regular expression to validate the format: MM/DD/YY HH:mm
    const regex =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(\d{2})\s(0\d|1\d|2[0-3]):([0-5]\d)$/;
    const match = timestamp.match(regex);
    if (!match) {
      throw new Error("Invalid timestamp format, expected MM/DD/YY HH:mm");
    }

    // Destructure the captured groups: month, day, year, hour, minute
    const [, month, day, year, hour, minute] = match;

    // Convert string parts to numbers
    const m = Number(month);
    const d = Number(day);
    const y = Number(year);
    const h = Number(hour);
    const min = Number(minute);

    // Convert the two-digit year to a full year
    const fullYear = 2000 + y;

    // Note: JavaScript's Date constructor uses 0-based months
    return new Date(fullYear, m - 1, d, h, min);
  }

  // Helper function to validate date format (MM/DD/YY HH:MM)
  validateDateTime = (dateTimeStr: string): boolean => {
    // Check basic format with regex
    const regex =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{2} ([01][0-9]|2[0-3]):([0-5][0-9])$/;
    if (!regex.test(dateTimeStr)) {
      return false;
    }

    // Further validate the date is real
    const parts = dateTimeStr.split(" ")[0].split("/");
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = 2000 + parseInt(parts[2], 10); // Assuming 20xx for simplicity

    // Check if date is valid
    const date = new Date(year, month - 1, day);
    return (
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      date.getFullYear() === year
    );
  };

  // Helper method to convert seconds to MM:SS format
  secondsToMMSS(seconds: number) {
    if (seconds <= 0) {
      return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
}

export class MessageManager {
  private timeManager = new TimeManager();

  constructor() {
    this.timeManager = new TimeManager();
  }

  // Method to check if the current date and time is within the sprite's range
  // Sends a message to the active tab to show the sprite for 60 seconds
  checkTimeRangeAndActivate(
    startTime: string | undefined,
    endTime: string | undefined,
    sprite: SpriteType,
    animalCnt: number,
    spriteverseOn: boolean,
    speed: number,
    movement: Movement,
    height: number
  ) {
    if (!spriteverseOn) {
      return;
    }

    try {
      const now = new Date();
      let startDate: Date;
      if (startTime) {
        startDate = this.timeManager.parseTimestamp(startTime);
      } else {
        // default to now
        startDate = now;
      }

      let endDate: Date;
      if (endTime) {
        endDate = this.timeManager.parseTimestamp(endTime);
      } else {
        // default to far into the future (effectively no end time)
        endDate = new Date(2100, 1, 1);
      }

      // Compare the full Date objects
      if (now >= startDate && now <= endDate) {
        // We're in the time range—activate the bird
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            if (tabs[0] && tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "showSprite",
                sprite,
                animalCnt,
                speed,
                movement,
                height,
              } as ShowSpriteMessage);
            }
          }
        );
      }
    } catch (error) {
      console.error("Error parsing timestamp:", error);
    }
  }
}
