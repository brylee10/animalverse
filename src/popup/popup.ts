import Cleave from "cleave.js";
import { TimeManager } from "../utils";
import {
  AnimalType,
  Movement,
  SyncStorage,
  allSyncKeys,
  defaultSyncStorage,
} from "../types";

document.addEventListener("DOMContentLoaded", function () {
  const timeManager = new TimeManager();
  // Map keys to their corresponding DOM input elements
  const animalverseElements: {
    [key: string]: HTMLInputElement | null;
  } = {
    animal: document.querySelector("#animal") as HTMLInputElement,
    startTime: document.querySelector(".start-time") as HTMLInputElement,
    endTime: document.querySelector(".end-time") as HTMLInputElement,
    interval: document.querySelector("#interval") as HTMLInputElement,
    animalCnt: document.querySelector("#animalCnt") as HTMLInputElement,
    animalverseOn: document.querySelector(
      "#animalverseToggle"
    ) as HTMLInputElement,
    speed: document.querySelector("#speed") as HTMLInputElement,
    movement: document.querySelector("#movementPattern") as HTMLInputElement,
    height: document.querySelector("#height") as HTMLInputElement,
  };

  function updateUI(storage: Partial<SyncStorage>) {
    // Update each element with either stored value or default
    if (animalverseElements.animal)
      animalverseElements.animal.value =
        storage.animal ?? defaultSyncStorage.animal;
    if (animalverseElements.animalCnt)
      animalverseElements.animalCnt.value = String(
        storage.animalCnt ?? defaultSyncStorage.animalCnt
      );
    if (animalverseElements.interval)
      animalverseElements.interval.value = String(
        storage.intervalMinutes ?? defaultSyncStorage.intervalMinutes
      );
    if (animalverseElements.startTime)
      animalverseElements.startTime.value =
        storage.startTime ?? defaultSyncStorage.startTime;
    if (animalverseElements.endTime)
      animalverseElements.endTime.value =
        storage.endTime ?? defaultSyncStorage.endTime;
    if (animalverseElements.animalverseOn)
      animalverseElements.animalverseOn.checked =
        storage.animalverseOn ?? defaultSyncStorage.animalverseOn;
    if (animalverseElements.speed)
      animalverseElements.speed.value = String(
        storage.speed ?? defaultSyncStorage.speed
      );
    if (animalverseElements.movement)
      animalverseElements.movement.value =
        storage.movement ?? defaultSyncStorage.movement;
    if (animalverseElements.height)
      animalverseElements.height.value = String(
        storage.height ?? defaultSyncStorage.height
      );
  }

  chrome.storage.sync.get(allSyncKeys, (result: Partial<SyncStorage>) => {
    // Load saved values or defaults to UI elements
    updateUI(result);
    // update animalverseToggle' settings given the new UI values
    saveAnimalverseSettings();
  });

  // Create error message elements for date fields
  const startTimeError = document.createElement("div");
  startTimeError.className = "validation-error";

  const endTimeError = document.createElement("div");
  endTimeError.className = "validation-error";

  // Insert error elements after the date inputs
  if (
    animalverseElements.startTime &&
    animalverseElements.startTime.parentNode
  ) {
    animalverseElements.startTime.parentNode.appendChild(startTimeError);
  }

  if (animalverseElements.endTime && animalverseElements.endTime.parentNode) {
    animalverseElements.endTime.parentNode.appendChild(endTimeError);
  }

  // Helper function to update a DOM element's value based on type
  const updateAnimalverseElement = (key: string, newValue: any) => {
    const el = animalverseElements[key];
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
    const element = animalverseElements[field];
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

      const startTime = animalverseElements.startTime;

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

  const saveAnimalverseSettings = () => {
    // Validate date fields before saving
    const startTimeValid = validateDateField("startTime");
    const endTimeValid = validateDateField("endTime");

    const syncData: Partial<SyncStorage> = {};

    if (
      animalverseElements.animal &&
      Object.values(AnimalType).includes(
        animalverseElements.animal.value as AnimalType
      )
    )
      syncData.animal = animalverseElements.animal.value as AnimalType;

    if (startTimeValid && animalverseElements.startTime)
      syncData.startTime = animalverseElements.startTime.value;

    if (endTimeValid && animalverseElements.endTime)
      syncData.endTime = animalverseElements.endTime.value;

    if (animalverseElements.interval)
      syncData.intervalMinutes = parseInt(
        animalverseElements.interval.value,
        10
      );

    if (animalverseElements.animalCnt)
      syncData.animalCnt = parseInt(animalverseElements.animalCnt.value, 10);

    if (animalverseElements.animalverseOn)
      syncData.animalverseOn = animalverseElements.animalverseOn.checked;

    if (animalverseElements.speed)
      syncData.speed = parseInt(animalverseElements.speed.value, 10);

    if (animalverseElements.movement)
      syncData.movement = animalverseElements.movement.value as Movement;

    if (animalverseElements.height)
      syncData.height = parseInt(animalverseElements.height.value, 10);

    chrome.storage.sync.set(syncData, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error saving animalverse settings:",
          chrome.runtime.lastError
        );
      }
    });
  };

  // Add input event listeners for date fields to provide real-time validation
  if (animalverseElements.startTime) {
    animalverseElements.startTime.addEventListener("input", () => {
      validateDateField("startTime");
    });

    animalverseElements.startTime.addEventListener("blur", () => {
      validateDateField("startTime");
    });
  }

  if (animalverseElements.endTime) {
    animalverseElements.endTime.addEventListener("input", () => {
      validateDateField("endTime");
    });

    animalverseElements.endTime.addEventListener("blur", () => {
      validateDateField("endTime");
    });
  }

  // When any input or select changes, save the settings
  Object.values(animalverseElements).forEach((element) => {
    if (element) {
      element.addEventListener("change", saveAnimalverseSettings);
    }
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync") {
      for (const key in changes) {
        if (key in animalverseElements) {
          const { newValue } = changes[key];
          updateAnimalverseElement(key, newValue);
        }
      }
    }
  });
});
