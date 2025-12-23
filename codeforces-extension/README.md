# Codeforces Contest Tracker & Rank Notifier

A lightweight Chrome Extension that tracks upcoming Codeforces contests, displays your rating and last contest rank, and sends desktop notifications before contests start.

## Features

✨ **Upcoming Contests Display** - View all upcoming Codeforces contests with start times and durations
📊 **User Stats** - Display your current rating and last contest rank
🔔 **Contest Notifications** - Get desktop notifications 30 minutes before contest start
⚙️ **Customizable Settings** - Change your Codeforces handle and notification preferences
🎨 **Clean UI** - Modern, intuitive popup interface
⚡ **No Backend Required** - Works entirely with Codeforces public APIs

## Installation & Setup

### Prerequisites

- Google Chrome (Version 88+)
- Internet connection (for API calls)

### Local Installation (Developer Mode)

1. **Extract/Clone the Extension**

   - Navigate to `codeforces-extension` folder in your file system

2. **Open Chrome Extension Management Page**

   - Open Chrome and go to: `chrome://extensions/`
   - Or: Click Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**

   - Toggle the **Developer Mode** switch in the top-right corner

4. **Load the Extension**

   - Click **"Load unpacked"**
   - Select the `codeforces-extension` folder
   - The extension will appear in your extensions list

5. **Verify Installation**
   - You should see the Codeforces Tracker icon in your Chrome toolbar
   - Click it to open the popup and verify it works

## Project Structure

```
codeforces-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── popup.html            # Popup UI
├── popup.js              # Popup logic and API calls
├── background.js         # Service worker for notifications
├── style.css             # Styling
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md             # This file
```

