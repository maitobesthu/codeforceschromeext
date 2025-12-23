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

## How to Use

### First Time Setup

1. Click the extension icon in Chrome toolbar
2. Click the ⚙️ settings button
3. Enter your Codeforces handle (default is "maitobesthu")
4. Toggle notifications if desired
5. Click "Save"

### Viewing Contests & Stats

- **User Info Section**: Shows your current rating and last contest rank
- **Contests Section**: Lists upcoming and ongoing contests
- Click **Refresh** buttons to manually update data

### Getting Notifications

- Enable notifications in settings
- You'll receive a desktop notification 30 minutes before each contest starts
- Click the notification to go to Codeforces contests page

## API Usage

The extension uses these public Codeforces APIs:

- `https://codeforces.com/api/contest.list` - Get all contests
- `https://codeforces.com/api/user.info` - Get user info (rating, rank)
- `https://codeforces.com/api/user.rating` - Get user's contest history

**Note**: These are free, public APIs with no authentication required.

## Features Breakdown

### 1. Popup Dashboard

- Lists upcoming Codeforces contests
- Shows your current Codeforces handle, rating, and last contest rank
- Simple, clean UI with color-coded contest status
- Refresh buttons for manual data updates

### 2. Contest Reminders

- Checks for contests every 5 minutes (configurable)
- Sends desktop notification 30 minutes before start
- Can be toggled on/off in settings
- Tracks notified contests to avoid duplicate notifications

### 3. Storage

- User handle saved in Chrome sync storage (syncs across devices)
- Notification preferences saved locally
- Notified contests tracked locally to prevent duplicates

## Configuration

Edit these constants in `popup.js` and `background.js` if needed:

- `DEFAULT_HANDLE` - Default Codeforces handle
- `CHECK_INTERVAL_MINUTES` - How often to check for contests (in `background.js`)
- `NOTIFICATION_TIME_BEFORE` - How many minutes before contest to notify

## Troubleshooting

### Extension not showing contests?

- Verify internet connection
- Check if Codeforces APIs are accessible
- Open Chrome DevTools (F12) → Console for error messages
- Click Refresh button in popup

### Notifications not working?

- Check if notifications are enabled in settings
- Verify Chrome notifications are allowed for your system
- Check if Codeforces APIs are accessible

### "User not found" error?

- Double-check the Codeforces handle spelling
- Ensure the handle exists on Codeforces.com
- Try a different handle to test

## Development Notes

### Manifest V3 Compliance

- Uses service workers instead of background pages
- All APIs are compatible with Manifest V3
- Supports Chrome Extensions API best practices

### Code Quality

- Well-commented, clean JavaScript code
- No external dependencies or frameworks
- Secure HTML escaping to prevent XSS
- Error handling for all API calls

## Publishing to Chrome Web Store

To publish on Chrome Web Store:

1. **Create a ZIP file** of the extension folder

   ```
   codeforces-extension.zip
   ```

2. **Sign up for Chrome Web Store Developer Account**

   - Go to: https://chrome.google.com/webstore/devconsole
   - Pay $5 one-time registration fee

3. **Upload your extension**

   - Click "New Item"
   - Upload the ZIP file
   - Fill in extension details:
     - Description
     - Screenshots (2 or more)
     - Category (Productivity)
     - Language
     - Content rating

4. **Add Store Listing**

   - Add detailed description
   - Add screenshots showing:
     - Contest list display
     - User stats display
     - Settings panel
   - Add privacy policy (can be simple for this extension)

5. **Review Requirements**

   - Icon must be 128x128px (included ✓)
   - Screenshots 1280x800 or 640x400px
   - Detailed description
   - Privacy policy (can reference Codeforces API usage)

6. **Submit for Review**
   - Click "Submit for Review"
   - Google reviews within 1-3 hours
   - Once approved, it's live on Chrome Web Store

## Privacy & Permissions

- **Storage Permission**: Only stores your Codeforces handle and notification preferences locally
- **Host Permission**: Needed to fetch data from Codeforces APIs
- **Notifications Permission**: For contest reminder notifications
- **No personal data collection**: Only uses public Codeforces API data

## Tips for Resume

This is a production-ready Chrome Extension that demonstrates:

- ✅ Chrome Extensions API mastery (Manifest V3)
- ✅ Service Workers & Alarms API
- ✅ Chrome Storage API (sync & local)
- ✅ Fetch API & async/await
- ✅ DOM manipulation & event handling
- ✅ CSS Grid & Flexbox layouts
- ✅ Error handling & edge cases
- ✅ User-centric design
- ✅ Clean, documented code

Perfect for showing potential employers your ability to:

- Build real-world browser extensions
- Work with APIs
- Create user-friendly interfaces
- Handle asynchronous operations
- Deploy software

## Future Enhancements (Optional)

- Add filtering by contest type (Div 1, Div 2, etc.)
- Track historical rating changes
- Display friend activity
- Custom notification times
- Dark mode support
- Codeforces blog feed integration

## License

This project is open source and available for personal and commercial use.

---

**Made with ❤️ for competitive programmers**

Questions? Check the [Codeforces API Documentation](https://codeforces.com/apiHelp)
