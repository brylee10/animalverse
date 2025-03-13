// background.ts - Background Script

import { Message, SyncStorage, allSyncKeys } from "../types";
import { MessageManager } from "../utils";

// Initialize when extension is installed or updated
chrome.runtime.onInstalled.addListener(function () {
  setupAlarms();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function (
  message: Message,
  sender,
  sendResponse
) {
  if (message.action === "updateAlarms") {
    setupAlarms();
  }
  return true;
});

// Setup alarms based on saved animals
function setupAlarms(): void {
  const messageManager = new MessageManager();
  chrome.alarms.clearAll();
  chrome.storage.sync.get(allSyncKeys, function (data: Partial<SyncStorage>) {
    if (data.animal && data.intervalMinutes) {
      chrome.alarms.create(`animal_${data.animal}`, {
        periodInMinutes: data.intervalMinutes,
        // First attempt runs at the interval
        delayInMinutes: data.intervalMinutes,
      });
    }

    // start time and end time are optional, they have defaults
    if (
      data.animal &&
      data.animalCnt &&
      data.animalverseOn &&
      data.speed &&
      data.movement &&
      data.height
    ) {
      messageManager.checkTimeRangeAndActivate(
        data.startTime,
        data.endTime,
        data.animal,
        data.animalCnt,
        data.animalverseOn,
        data.speed,
        data.movement,
        data.height
      );
    }
  });
}

// Periodic alarm handler
chrome.alarms.onAlarm.addListener(function (alarm) {
  const messageManager = new MessageManager();
  if (alarm.name.startsWith("animal_")) {
    chrome.storage.sync.get(allSyncKeys, function (data: Partial<SyncStorage>) {
      const animal = data.animal;
      const animalCnt = data.animalCnt;
      const startTime = data.startTime;
      const endTime = data.endTime;
      const animalverseOn = data.animalverseOn;
      const speed = data.speed;
      const movement = data.movement;
      const height = data.height;

      // start time and end time are optional, they have defaults
      if (animalverseOn && animal && animalCnt && speed && movement && height) {
        messageManager.checkTimeRangeAndActivate(
          startTime,
          endTime,
          animal,
          animalCnt,
          animalverseOn,
          speed,
          movement,
          height
        );
      }
    });
  }
});

// Listen for storage changes, reset alarms if any sync keys change so they are immediately visible
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    for (const key in changes) {
      if (allSyncKeys.includes(key as keyof SyncStorage)) {
        setupAlarms();
        break;
      }
    }
  }
});
