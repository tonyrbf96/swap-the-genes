# Swap the Genes 🧬

AI-powered celebrity face swap extension for American Eagle website. Replace product models with your favorite celebrities, musicians, athletes, politicians, and more!

## Features

- 🎭 **75+ Celebrities** across multiple categories:
  - Actors & Actresses (Sydney Sweeney, Zendaya, Ryan Reynolds, etc.)
  - Musicians (Taylor Swift, Harry Styles, Billie Eilish, etc.)
  - Athletes (LeBron James, Cristiano Ronaldo, Serena Williams, etc.)
  - Politicians (Donald Trump, Barack Obama, Elon Musk, etc.)
  - Tech Leaders & Influencers

- 🔄 **Real-time AI Processing** using Gemini's nano-banana model
- 🎯 **Smart Detection** works on American Eagle product pages
- 🖼️ **Seamless Integration** preserves original image layout and styling
- 🔐 **Secure** - your API key is stored locally

## Installation

### Prerequisites
- Google Chrome browser
- fal.ai API key ([Get one here](https://fal.ai/))

### Local Installation Steps

1. **Clone or Download** this repository:
   ```bash
   git clone https://github.com/your-username/swap-the-genes.git
   # OR download and extract the ZIP file
   ```

2. **Open Chrome Extensions Page**:
   - Go to `chrome://extensions/` in your Chrome browser
   - OR click the three dots menu → More Tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**:
   - Click "Load unpacked" button
   - Navigate to the `plugin` folder inside the downloaded repository
   - Select the `plugin` folder and click "Open"

5. **Verify Installation**:
   - You should see "Swap the Genes" appear in your extensions list
   - The extension icon should appear in your Chrome toolbar

## Setup & Usage

### 1. Configure API Key
- Click the "Swap the Genes" extension icon in your Chrome toolbar
- Enter your fal.ai API key in the input field
- Click "Save API Key"

### 2. Select Celebrity
- Choose your favorite celebrity from the dropdown menu
- Categories include actors, musicians, athletes, politicians, and more

### 3. Use on American Eagle
- Visit any American Eagle product page (ae.com)
- Look for magic wand buttons (🪄) on product images
- Click a button to swap the model with your selected celebrity
- Wait for AI processing (usually 10-30 seconds)
- The image will be replaced with the AI-generated version

## How It Works

1. **Detection**: Automatically detects American Eagle product images
2. **Processing**: Downloads the original image and sends it to fal.ai
3. **AI Magic**: Uses advanced AI to replace the model while preserving clothing, pose, and background
4. **Display**: Seamlessly replaces the original image with the AI-generated result

## Supported Websites

Currently supports:
- ✅ American Eagle (ae.com)
- 🔄 More retailers coming soon!

## Technical Details

- **AI Model**: Gemini nano-banana
- **Framework**: Chrome Extension Manifest V3
- **Storage**: Chrome local storage (secure)
- **Processing**: Real-time synchronous API calls

## Troubleshooting

### Extension Not Loading
- Make sure you selected the `plugin` folder, not the root repository folder
- Check that Developer mode is enabled
- Try refreshing the extensions page

### Magic Wand Buttons Not Appearing
- Make sure you're on ae.com (American Eagle website)
- Try refreshing the page
- Check that the extension is enabled

### API Errors
- Verify your fal.ai API key is correct
- Check your internet connection
- Make sure you have sufficient fal.ai credits

### Images Not Processing
- Wait up to 60 seconds for processing
- Check browser console for error messages (F12 → Console tab)
- Try with a different celebrity selection

## Privacy & Security

- ✅ **No data collection** - all processing happens locally and via fal.ai
- ✅ **API key stored locally** in Chrome's secure storage
- ✅ **No external tracking** or analytics
- ✅ **Open source** - inspect all code yourself

## Development

### File Structure
```
plugin/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── content.js            # Website integration script
├── background.js         # API communication
├── icons/
│   └── icon.png          # Extension icon
└── test.html             # Testing page
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use, modify, and distribute!

## Support

Having issues? Please:
1. Check the troubleshooting section above
2. Open an issue on GitHub with details about your problem
3. Include browser console logs if applicable

---

**Disclaimer**: This extension is for entertainment purposes. Please respect intellectual property and use responsibly.