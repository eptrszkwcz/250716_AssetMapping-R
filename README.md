# Asset Mapping - Mapbox Application

A single-page web application that displays points from a Google Sheet on an interactive Mapbox map.

## Features

- 🗺️ Interactive Mapbox map with navigation controls
- 📊 Real-time data loading from Google Sheets
- 🌍 Automatic geocoding of city/state/country locations to coordinates
- 🎯 Clickable markers with detailed popups
- 📱 Responsive design for mobile and desktop
- 🔄 Refresh button to reload data
- 📋 Sidebar with detailed point information
- 🎨 Modern, clean UI design
- ⚡ Intelligent caching to avoid re-geocoding the same locations

## Setup Instructions

### 1. Get a Mapbox Access Token

1. Go to [Mapbox](https://www.mapbox.com/) and create a free account
2. Navigate to your account dashboard
3. Create a new access token or use the default public token
4. Copy your access token

### 2. Configure the Application

1. Open `script.js` in your code editor
2. Replace `YOUR_MAPBOX_ACCESS_TOKEN_HERE` with your actual Mapbox access token:

```javascript
const MAPBOX_ACCESS_TOKEN = 'pk.your_actual_token_here';
```

### 3. Prepare Your Google Sheet

Your Google Sheet should have the following structure:

| HQ Location | Company Name | Industry | other_fields... |
|-------------|--------------|----------|-----------------|
| New York, NY | Company A    | Tech     | ...             |
| London, UK  | Company B    | Finance  | ...             |

**Important Notes:**
- The sheet must have a column called "HQ Location" (or modify the `LOCATION_COLUMN` constant in script.js)
- The "HQ Location" column should contain city names, city+state, or city+country
- The application will automatically geocode these locations to coordinates
- Make sure your Google Sheet is publicly accessible (anyone with the link can view)
- The application is configured to use the "Allocator LPs" tab by default (modify `SHEET_TAB_NAME` in script.js if needed)

### 4. Make Your Google Sheet Public

1. Open your Google Sheet
2. Click "Share" in the top right
3. Click "Change to anyone with the link"
4. Set permission to "Viewer"
5. Copy the sheet ID from the URL (it's the long string between `/d/` and `/edit`)

### 5. Run the Application

1. Open `index.html` in a web browser
2. Or serve the files using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Navigate to `http://localhost:8000` in your browser

## Usage

- **View Points**: Points from your Google Sheet will automatically load and display on the map
- **Geocoding**: The application automatically converts city names to coordinates using OpenStreetMap's Nominatim service
- **Click Markers**: Click any marker to see a popup with point details
- **Detailed View**: Click a marker to open the sidebar with full point information
- **Refresh Data**: Click the "Refresh Data" button to reload data from the Google Sheet
- **Navigate**: Use the map controls to zoom, pan, and explore

## Geocoding Details

The application uses the OpenStreetMap Nominatim service to convert city names to coordinates:

- **Rate Limiting**: 1 second delay between geocoding requests (Nominatim requirement)
- **Caching**: Results are cached in memory to avoid re-geocoding the same locations
- **Error Handling**: Locations that can't be geocoded are skipped with console logging
- **Progress Updates**: Status bar shows geocoding progress in real-time

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Customization

### Changing Map Style

In `script.js`, modify the map style:

```javascript
map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12', // Change this line
    // ...
});
```

Available styles:
- `mapbox://styles/mapbox/streets-v12` (default)
- `mapbox://styles/mapbox/outdoors-v12`
- `mapbox://styles/mapbox/light-v11`
- `mapbox://styles/mapbox/dark-v11`
- `mapbox://styles/mapbox/satellite-v9`

### Changing Marker Colors

In `script.js`, modify the marker color:

```javascript
const marker = new mapboxgl.Marker({
    color: '#ff6b6b', // Change this color
    scale: 0.8
})
```

### Adding Custom Fields

The application automatically displays all columns from your Google Sheet. To customize which fields are shown:

1. Modify the `createPopupContent()` function in `script.js`
2. Add field filtering logic
3. Customize the display format

## Troubleshooting

### Common Issues

1. **"Please set your Mapbox access token" error**
   - Make sure you've replaced the placeholder token in `script.js`

2. **"Failed to fetch data" error**
   - Ensure your Google Sheet is publicly accessible
   - Check that the sheet ID is correct
   - Verify the sheet has data in the expected format

3. **No points showing on the map**
   - Check that your sheet has valid latitude/longitude columns
   - Ensure the coordinate values are numeric
   - Verify the column names match the expected format

4. **CORS errors**
   - Serve the files through a web server (not just opening the HTML file)
   - Use a local development server as described in the setup

### Debug Mode

Open your browser's developer console (F12) to see detailed error messages and debug information.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or need help customizing the application, please check the troubleshooting section above or create an issue in the project repository.
