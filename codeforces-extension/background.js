/**
 * background.js - Service Worker for handling notifications and periodic checks
 * Manages contest reminders 30 minutes before start time
 */

const CODEFORCES_API_BASE = "https://codeforces.com/api";
const DEFAULT_HANDLE = "maitobesthu";
const CHECK_INTERVAL_MINUTES = 5; // Check for contests every 5 minutes
const NOTIFICATION_TIME_BEFORE = 30 * 60; // 30 minutes before start

/**
 * Initialize service worker on install
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log("Codeforces Tracker extension installed");

  // Set default storage values
  chrome.storage.sync.get(["userHandle", "notificationEnabled"], (result) => {
    if (!result.userHandle) {
      chrome.storage.sync.set({ userHandle: DEFAULT_HANDLE });
    }
    if (result.notificationEnabled === undefined) {
      chrome.storage.sync.set({ notificationEnabled: true });
    }
  });

  // Initialize periodic check
  setupAlarm();
});

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateNotifications") {
    setupAlarm();
    sendResponse({ status: "alarm updated" });
  }
});

/**
 * Setup periodic alarm for checking contests
 */
function setupAlarm() {
  chrome.alarms.clear("contestCheck", () => {
    chrome.storage.sync.get(["notificationEnabled"], (result) => {
      if (result.notificationEnabled !== false) {
        // Create alarm that fires every 5 minutes
        chrome.alarms.create("contestCheck", {
          periodInMinutes: CHECK_INTERVAL_MINUTES,
        });
        console.log(
          "Alarm set to check for contests every",
          CHECK_INTERVAL_MINUTES,
          "minutes"
        );
      }
    });
  });
}

/**
 * Handle alarm trigger - check for upcoming contests
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "contestCheck") {
    checkAndNotifyContests();
  }
});

/**
 * Check for upcoming contests and send notifications
 */
async function checkAndNotifyContests() {
  try {
    // Get user preferences
    const storageResult = await chrome.storage.sync.get([
      "userHandle",
      "notificationEnabled",
    ]);

    if (storageResult.notificationEnabled === false) {
      return;
    }

    const handle = storageResult.userHandle || DEFAULT_HANDLE;

    // Fetch contests
    const response = await fetch(`${CODEFORCES_API_BASE}/contest.list`);

    if (!response.ok) {
      console.error("Failed to fetch contests");
      return;
    }

    const data = await response.json();

    if (!data.result) {
      console.error("Invalid API response");
      return;
    }

    const contests = data.result;
    const now = Math.floor(Date.now() / 1000);

    // Find contests starting in approximately 30 minutes
    contests.forEach((contest) => {
      const timeUntilStart = contest.startTimeSeconds - now;

      // Check if contest is within notification window
      // Send notification if it's between 25-35 minutes before start
      if (timeUntilStart > 25 * 60 && timeUntilStart <= 35 * 60) {
        // Check if we haven't already notified about this contest
        getNotifiedContests((notifiedContests) => {
          if (!notifiedContests.includes(contest.id)) {
            sendContestNotification(contest);

            // Mark contest as notified
            notifiedContests.push(contest.id);
            // Keep only last 100 notified contests to avoid memory issues
            if (notifiedContests.length > 100) {
              notifiedContests = notifiedContests.slice(-100);
            }
            chrome.storage.local.set({ notifiedContests });
          }
        });
      }
    });
  } catch (error) {
    console.error("Error checking contests:", error);
  }
}

/**
 * Send desktop notification for a contest
 */
function sendContestNotification(contest) {
  const startTime = new Date(contest.startTimeSeconds * 1000);
  const timeStr = startTime.toLocaleTimeString();

  chrome.notifications.create(
    `contest-${contest.id}`,
    {
      type: "basic",
      title: "🏆 Contest Starting Soon!",
      message: `${contest.name} starts at ${timeStr}`,
      iconUrl: chrome.runtime.getURL("icons/icon-128.png"),
      priority: 1,
    },
    (notificationId) => {
      console.log("Notification sent:", notificationId);
    }
  );
}

/**
 * Get list of contests we've already notified about
 */
function getNotifiedContests(callback) {
  chrome.storage.local.get(["notifiedContests"], (result) => {
    callback(result.notifiedContests || []);
  });
}

/**
 * Handle notification click - open Codeforces website
 */
chrome.notifications.onClicked.addListener((notificationId) => {
  // Open Codeforces contests page
  chrome.tabs.create({ url: "https://codeforces.com/contests" });

  // Close the notification
  chrome.notifications.clear(notificationId);
});

/**
 * Clean up old notified contests data periodically
 */
chrome.alarms.create("cleanupNotifications", {
  periodInMinutes: 24 * 60, // Once per day
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "cleanupNotifications") {
    // Clear notified contests list to avoid stale data
    chrome.storage.local.set({ notifiedContests: [] });
    console.log("Cleared old notification history");
  }
});

console.log("Background service worker loaded");
