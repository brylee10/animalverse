import Cleave from "cleave.js";
import { TimeManager } from "../utils";
import {
  ALARM_NAME,
  SpriteType,
  Movement,
  SyncStorage,
  allSyncKeys,
  defaultSyncStorage,
} from "../types";

document.addEventListener("DOMContentLoaded", function () {
  const timeManager = new TimeManager();
  // Map keys to their corresponding DOM input elements
  const spriteverseElements: {
    [key: string]: HTMLInputElement | null;
  } = {
    sprite: document.querySelector("#sprite") as HTMLInputElement,
    startTime: document.querySelector(".start-time") as HTMLInputElement,
    endTime: document.querySelector(".end-time") as HTMLInputElement,
    interval: document.querySelector("#interval") as HTMLInputElement,
    animalCnt: document.querySelector("#animalCnt") as HTMLInputElement,
    spriteverseOn: document.querySelector(
      "#spriteverseToggle"
    ) as HTMLInputElement,
    speed: document.querySelector("#speed") as HTMLInputElement,
    movement: document.querySelector("#movementPattern") as HTMLInputElement,
    height: document.querySelector("#height") as HTMLInputElement,
    timeToNextApperance: document.querySelector(
      "#timeToNextApperance"
    ) as HTMLInputElement,
  };

  function updateUI(storage: Partial<SyncStorage>) {
    // Update each element with either stored value or default
    if (spriteverseElements.sprite)
      spriteverseElements.sprite.value =
        storage.sprite ?? defaultSyncStorage.sprite;
    if (spriteverseElements.animalCnt)
      spriteverseElements.animalCnt.value = String(
        storage.animalCnt ?? defaultSyncStorage.animalCnt
      );
    if (spriteverseElements.interval)
      spriteverseElements.interval.value = String(
        storage.intervalMinutes ?? defaultSyncStorage.intervalMinutes
      );
    if (spriteverseElements.startTime)
      spriteverseElements.startTime.value =
        storage.startTime ?? defaultSyncStorage.startTime;
    if (spriteverseElements.endTime)
      spriteverseElements.endTime.value =
        storage.endTime ?? defaultSyncStorage.endTime;
    if (spriteverseElements.spriteverseOn)
      spriteverseElements.spriteverseOn.checked =
        storage.spriteverseOn ?? defaultSyncStorage.spriteverseOn;
    if (spriteverseElements.speed)
      spriteverseElements.speed.value = String(
        storage.speed ?? defaultSyncStorage.speed
      );
    if (spriteverseElements.movement)
      spriteverseElements.movement.value =
        storage.movement ?? defaultSyncStorage.movement;
    if (spriteverseElements.height)
      spriteverseElements.height.value = String(
        storage.height ?? defaultSyncStorage.height
      );
    if (spriteverseElements.timeToNextApperance && storage.nextAppearanceSec) {
      spriteverseElements.timeToNextApperance.value = timeManager.secondsToMMSS(
        storage.nextAppearanceSec
      );
    }
  }

  chrome.storage.sync.get(allSyncKeys, (result: Partial<SyncStorage>) => {
    // Load saved values or defaults to UI elements
    updateUI(result);
    // update spriteverseToggle' settings given the new UI values
    saveSpriteverseSettings();
  });

  // Create error message elements for date fields
  const startTimeError = document.createElement("div");
  startTimeError.className = "validation-error";

  const endTimeError = document.createElement("div");
  endTimeError.className = "validation-error";

  // Insert error elements after the date inputs
  if (
    spriteverseElements.startTime &&
    spriteverseElements.startTime.parentNode
  ) {
    spriteverseElements.startTime.parentNode.appendChild(startTimeError);
  }

  if (spriteverseElements.endTime && spriteverseElements.endTime.parentNode) {
    spriteverseElements.endTime.parentNode.appendChild(endTimeError);
  }

  // Helper function to update a DOM element's value based on type
  const updateSpriteverseElement = (key: string, newValue: any) => {
    const el = spriteverseElements[key];
    if (!el) return;

    if (el.type === "checkbox") {
      el.checked = newValue;
    } else {
      el.value = newValue.toString();
    }

    // Validate date fields when updating
    if (key === "startTime" || key === "endTime") {
      validateDateField(key);
    }
  };

  // Function to validate date fields and show/hide error messages
  const validateDateField = (field: "startTime" | "endTime") => {
    const element = spriteverseElements[field];
    const errorElement = field === "startTime" ? startTimeError : endTimeError;

    if (element && errorElement) {
      const value = element.value.trim();

      // Skip validation if field is empty
      if (!value) {
        errorElement.style.display = "none";
        element.style.borderColor = "";
        return true;
      }

      const isValid = timeManager.validateDateTime(value);

      if (!isValid) {
        errorElement.textContent = "Invalid date format. Use MM/DD/YY HH:mm";
        errorElement.style.display = "block";
        element.style.borderColor = "red";
        return false;
      }

      const startTime = spriteverseElements.startTime;

      if (field == "endTime" && element && startTime) {
        const startValue = startTime.value.trim();
        const endValue = element.value.trim();

        if (startValue && endValue) {
          const startDate = timeManager.parseTimestamp(startValue);
          const endDate = timeManager.parseTimestamp(endValue);

          if (startDate > endDate) {
            errorElement.textContent = "End time cannot be before start time";
            errorElement.style.display = "block";
            element.style.borderColor = "red";
            return false;
          }
        }
      }

      errorElement.style.display = "none";
      element.style.borderColor = "";
      return true;
    }

    return true;
  };

  const saveSpriteverseSettings = () => {
    // Validate date fields before saving
    const startTimeValid = validateDateField("startTime");
    const endTimeValid = validateDateField("endTime");

    const syncData: Partial<SyncStorage> = {};

    if (
      spriteverseElements.sprite &&
      Object.values(SpriteType).includes(
        spriteverseElements.sprite.value as SpriteType
      )
    )
      syncData.sprite = spriteverseElements.sprite.value as SpriteType;

    if (startTimeValid && spriteverseElements.startTime)
      syncData.startTime = spriteverseElements.startTime.value;

    if (endTimeValid && spriteverseElements.endTime)
      syncData.endTime = spriteverseElements.endTime.value;

    if (spriteverseElements.interval)
      syncData.intervalMinutes = parseInt(
        spriteverseElements.interval.value,
        10
      );

    if (spriteverseElements.animalCnt)
      syncData.animalCnt = parseInt(spriteverseElements.animalCnt.value, 10);

    if (spriteverseElements.spriteverseOn)
      syncData.spriteverseOn = spriteverseElements.spriteverseOn.checked;

    if (spriteverseElements.speed)
      syncData.speed = parseInt(spriteverseElements.speed.value, 10);

    if (spriteverseElements.movement)
      syncData.movement = spriteverseElements.movement.value as Movement;

    if (spriteverseElements.height)
      syncData.height = parseInt(spriteverseElements.height.value, 10);

    chrome.storage.sync.set(syncData, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error saving spriteverse settings:",
          chrome.runtime.lastError
        );
      }
    });
  };

  // Add input event listeners for date fields to provide real-time validation
  if (spriteverseElements.startTime) {
    spriteverseElements.startTime.addEventListener("input", () => {
      validateDateField("startTime");
    });

    spriteverseElements.startTime.addEventListener("blur", () => {
      validateDateField("startTime");
    });
  }

  if (spriteverseElements.endTime) {
    spriteverseElements.endTime.addEventListener("input", () => {
      validateDateField("endTime");
    });

    spriteverseElements.endTime.addEventListener("blur", () => {
      validateDateField("endTime");
    });
  }

  // When any input or select changes, save the settings
  Object.values(spriteverseElements).forEach((element) => {
    if (element) {
      element.addEventListener("change", saveSpriteverseSettings);
    }
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync") {
      for (const key in changes) {
        if (key in spriteverseElements) {
          const { newValue } = changes[key];
          updateSpriteverseElement(key, newValue);
        }
      }
    }
  });
});

// Update the countdown to the next appearance and save it to storage
function updateCountdown() {
  const timeManager = new TimeManager();
  chrome.alarms.get(ALARM_NAME, (alarm) => {
    if (alarm) {
      const countdownElement = document.querySelector(
        "#timeToNextApperance"
      ) as HTMLInputElement;

      const timeRemainingSec: number = Math.floor(
        (alarm.scheduledTime - Date.now()) / 1000
      );
      chrome.storage.sync.set({ nextAppearanceSec: timeRemainingSec });
      countdownElement.value = timeManager.secondsToMMSS(timeRemainingSec);
    }
  });
}

// Call updateCountdown periodically
const intervalId = setInterval(updateCountdown, 500);
