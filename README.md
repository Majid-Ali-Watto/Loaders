# Circle-Loader

**circle-loader** is a simple, lightweight loader component for React and JavaScript applications. It allows you to easily display a loading spinner while data is being fetched or processed, ensuring a smooth user experience.

**circle-loader**  can be programmatically started and stopped. It dynamically injects a loading spinner into the DOM and removes it when loading is complete.

## Installation

You can install the package via npm:

```bash
npm install circle-loader
```
## Usage

Import the ``Loader`` class and use the `start` and `close` methods to control the loader.

By default, the loader will display a simple loading spinner with the text "Loading...". The default styles are minimal, and you can customize the appearance by passing custom styles and text.
```javascript
import { Loader } from 'circle-loader';

// Start the loader
Loader.start();


// Stop the loader
Loader.close();

```

## Custom Styles

You can customize the Loader by providing a styles object. The styles object can contain keys for the overlay, spinner, and text. The following keys are supported:

1. **loadingOverlayStyles**: Styles for the overlay that covers the screen.
2. **loadingSpinnerStyles**: Styles for the spinner element.
3. **loadingTextStyles**: Styles for the loading text.

**Note**:The sequence of arguments does not matter, but it only accepts two arguments: a loading text string and a styles object.

### Example of Custom Styles
```javascript
Loader.start({
    // below styles are optional
    // you can add your own styles here
	loadingOverlayStyles: {
            backgroundColor: "rgba(0, 128, 0, 0.8)", // Green overlay with some transparency
            border: "100px solid red"
	},

	loadingSpinnerStyles: {
	    borderBottom: "8px solid skyblue",
	    borderTop: "8px solid black",
	    borderRight: "8px solid rgba(255, 0, 0, 0.938)",
	    borderLeft: "8px solid yellow",
	    borderRadius: "5%",
	    backgroundColor: "white",
	    height: "60px",
	    width: "80px",
	    animation: `move 1s linear infinite`
	},
	loadingTextStyles: {
            color: "lightgreen",
            fontWeight: "bold",
            animation: `moveText 1s linear infinite`
        }
	},
	"Data is being fetched" // Loading Text
);
```