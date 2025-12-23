/**
 * popup.js - Handles UI logic and API interactions for the popup
 * Fetches contest data, user info, and manages settings
 */

// Constants
const CODEFORCES_API_BASE = "https://codeforces.com/api";
const DEFAULT_HANDLE = "maitobesthu";

// DOM Elements
const userHandleEl = document.getElementById("userHandle");
const userRatingEl = document.getElementById("userRating");
const userRankEl = document.getElementById("userRank");
const contestsListEl = document.getElementById("contestsList");
const errorMessageEl = document.getElementById("errorMessage");
const settingsPanelEl = document.getElementById("settingsPanel");
const handleInputEl = document.getElementById("handleInput");
const notificationToggleEl = document.getElementById("notificationToggle");
const mainContentEl = document.getElementById("mainContent");

// Buttons
const settingsBtnEl = document.getElementById("settingsBtn");
const closeSettingsBtnEl = document.getElementById("closeSettingsBtn");
const saveHandleBtnEl = document.getElementById("saveHandleBtn");
const refreshUserBtnEl = document.getElementById("refreshUserBtn");
const refreshContestsBtnEl = document.getElementById("refreshContestsBtn");

/**
 * Initialize the popup on load
 */
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  loadUpcomingContests();
  setupEventListeners();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  settingsBtnEl.addEventListener("click", toggleSettingsPanel);
  closeSettingsBtnEl.addEventListener("click", toggleSettingsPanel);
  saveHandleBtnEl.addEventListener("click", saveHandle);
  notificationToggleEl.addEventListener("change", saveNotificationPreference);
  refreshUserBtnEl.addEventListener("click", loadUserInfo);
  refreshContestsBtnEl.addEventListener("click", loadUpcomingContests);
  handleInputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveHandle();
  });
}

/**
 * Toggle settings panel visibility
 */
function toggleSettingsPanel() {
  settingsPanelEl.classList.toggle("hidden");
  if (!settingsPanelEl.classList.contains("hidden")) {
    mainContentEl.style.display = "none";
  } else {
    mainContentEl.style.display = "block";
  }
}

/**
 * Load settings from Chrome storage
 */
function loadSettings() {
  chrome.storage.sync.get(["userHandle", "notificationEnabled"], (result) => {
    const handle = result.userHandle;
    if (handle) {
      handleInputEl.value = handle;
      userHandleEl.textContent = handle;
      loadUserInfo();
    } else {
      userHandleEl.textContent = "Please set your handle in settings";
      handleInputEl.value = "";
    }
    notificationToggleEl.checked = result.notificationEnabled !== false;
  });
}

/**
 * Save user handle to Chrome storage
 */
function saveHandle() {
  const handle = handleInputEl.value.trim();

  if (!handle) {
    showError("Please enter a valid Codeforces handle");
    return;
  }

  chrome.storage.sync.set({ userHandle: handle }, () => {
    userHandleEl.textContent = handle;
    showSuccess("Handle saved successfully!");
    settingsPanelEl.classList.add("hidden");
    mainContentEl.style.display = "block";
    loadUserInfo();
  });
}

/**
 * Save notification preference to Chrome storage
 */
function saveNotificationPreference() {
  const enabled = notificationToggleEl.checked;
  chrome.storage.sync.set({ notificationEnabled: enabled }, () => {
    const message = enabled
      ? "Notifications enabled!"
      : "Notifications disabled!";
    showSuccess(message);

    // Trigger background script to update alarm
    chrome.runtime.sendMessage({ action: "updateNotifications" });
  });
}

/**
 * Fetch and display user info (rating, rank, etc.)
 */
async function loadUserInfo() {
  try {
    // Get current handle from storage
    const result = await chrome.storage.sync.get(["userHandle"]);
    const handle = result.userHandle || DEFAULT_HANDLE;

    // Fetch user info
    const userInfoResponse = await fetch(
      `${CODEFORCES_API_BASE}/user.info?handles=${handle}`
    );

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch user info");
    }

    const userInfoData = await userInfoResponse.json();

    if (!userInfoData.result || userInfoData.result.length === 0) {
      throw new Error("User not found");
    }

    const user = userInfoData.result[0];
    const rating = user.rating || "--";

    userRatingEl.textContent = rating;

    // Fetch user rating history to get last contest rank
    const ratingResponse = await fetch(
      `${CODEFORCES_API_BASE}/user.rating?handle=${handle}`
    );

    if (!ratingResponse.ok) {
      throw new Error("Failed to fetch rating history");
    }

    const ratingData = await ratingResponse.json();

    if (ratingData.result && ratingData.result.length > 0) {
      const lastContest = ratingData.result[ratingData.result.length - 1];
      userRankEl.textContent = lastContest.rank || "--";
    } else {
      userRankEl.textContent = "No contests";
    }

    clearError();
  } catch (error) {
    console.error("Error loading user info:", error);
    showError(`Error loading user info: ${error.message}`);
    userRatingEl.textContent = "--";
    userRankEl.textContent = "--";
  }
}

/**
 * Fetch and display upcoming contests
 */
async function loadUpcomingContests() {
  contestsListEl.innerHTML = '<p class="loading">Loading contests...</p>';

  try {
    const response = await fetch(`${CODEFORCES_API_BASE}/contest.list`);

    if (!response.ok) {
      throw new Error("Failed to fetch contests");
    }

    const data = await response.json();

    if (!data.result) {
      throw new Error("Invalid API response");
    }

    const contests = data.result;
    const now = Math.floor(Date.now() / 1000);

    // Filter and categorize contests
    const upcomingContests = contests
      .filter((c) => c.startTimeSeconds > now)
      .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
      .slice(0, 8); // Show top 8 upcoming contests

    const ongoingContests = contests.filter((c) => {
      const endTime = c.startTimeSeconds + c.durationSeconds;
      return c.startTimeSeconds <= now && endTime > now;
    });

    // Clear and rebuild list
    contestsListEl.innerHTML = "";

    // Show ongoing contests first
    if (ongoingContests.length > 0) {
      ongoingContests.forEach((contest) => {
        contestsListEl.appendChild(createContestElement(contest, "ongoing"));
      });
    }

    // Show upcoming contests
    if (upcomingContests.length > 0) {
      upcomingContests.forEach((contest) => {
        contestsListEl.appendChild(createContestElement(contest, "upcoming"));
      });
    }

    if (contests.length === 0) {
      contestsListEl.innerHTML = '<p class="loading">No contests available</p>';
    }

    clearError();
  } catch (error) {
    console.error("Error loading contests:", error);
    showError(`Error loading contests: ${error.message}`);
    contestsListEl.innerHTML = '<p class="loading">Failed to load contests</p>';
  }
}

/**
 * Create a contest item element
 * @param {Object} contest - Contest data from API
 * @param {String} status - Contest status: 'upcoming', 'ongoing', or 'finished'
 */
function createContestElement(contest, status) {
  const div = document.createElement("div");
  div.className = "contest-item";

  const startTime = new Date(contest.startTimeSeconds * 1000);
  const duration = formatDuration(contest.durationSeconds);
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  let timeInfo = "";
  if (status === "upcoming") {
    const timeUntilStart =
      contest.startTimeSeconds - Math.floor(Date.now() / 1000);
    timeInfo = `<br><span class="contest-info">Starts in: ${formatTimeUntil(
      timeUntilStart
    )}</span>`;
  }

  div.innerHTML = `
        <div class="contest-name">${escapeHtml(contest.name)}</div>
        <div class="contest-info">🕐 ${startTime.toLocaleString()}</div>
        <div class="contest-info">⏱️ Duration: ${duration}</div>
        ${timeInfo}
        <span class="contest-status status-${status.toLowerCase()}">${statusText}</span>
    `;

  return div;
}

/**
 * Format duration in seconds to readable format
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Format time until contest start
 */
function formatTimeUntil(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show error message
 */
function showError(message) {
  errorMessageEl.textContent = message;
  errorMessageEl.classList.remove("hidden");
  setTimeout(() => {
    errorMessageEl.classList.add("hidden");
  }, 5000);
}

/**
 * Clear error message
 */
function clearError() {
  errorMessageEl.classList.add("hidden");
}

/**
 * Show success message
 */
function showSuccess(message) {
  const successEl = document.createElement("div");
  successEl.className = "success-message";
  successEl.textContent = message;
  mainContentEl.insertBefore(successEl, mainContentEl.firstChild);

  setTimeout(() => {
    successEl.remove();
  }, 3000);
}
