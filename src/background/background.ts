// background.ts - Background Script

import {
  ALARM_NAME,
  Message,
  NEXT_APPEARANCE_SEC_KEY,
  SyncStorage,
  allSyncKeys,
} from "../types";
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

// Setup alarms based on saved sprites
function setupAlarms(): void {
  const messageManager = new MessageManager();
  chrome.alarms.clearAll();
  chrome.storage.sync.get(allSyncKeys, function (data: Partial<SyncStorage>) {
    if (data.sprite && data.intervalMinutes) {
      chrome.alarms.create(ALARM_NAME, {
        periodInMinutes: data.intervalMinutes,
        // First attempt runs at the interval
        delayInMinutes: data.intervalMinutes,
      });
    }

    // start time and end time are optional, they have defaults
    if (
      data.sprite &&
      data.animalCnt &&
      data.spriteverseOn &&
      data.speed &&
      data.movement &&
      data.height
    ) {
      messageManager.checkTimeRangeAndActivate(
        data.startTime,
        data.endTime,
        data.sprite,
        data.animalCnt,
        data.spriteverseOn,
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
      const sprite = data.sprite;
      const animalCnt = data.animalCnt;
      const startTime = data.startTime;
      const endTime = data.endTime;
      const spriteverseOn = data.spriteverseOn;
      const speed = data.speed;
      const movement = data.movement;
      const height = data.height;

      // start time and end time are optional, they have defaults
      if (spriteverseOn && sprite && animalCnt && speed && movement && height) {
        messageManager.checkTimeRangeAndActivate(
          startTime,
          endTime,
          sprite,
          animalCnt,
          spriteverseOn,
          speed,
          movement,
          height
        );
      }
    });
  }
});

// Listen for storage changes, reset alarms if any sync keys change so they are immediately visible
// Do not reset alarms for the nextAppearanceSec key since it is only displayed and not a user input
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    for (const key in changes) {
      if (key === NEXT_APPEARANCE_SEC_KEY) {
        continue;
      }
      if (allSyncKeys.includes(key as keyof SyncStorage)) {
        setupAlarms();
        break;
      }
    }
  }
});
