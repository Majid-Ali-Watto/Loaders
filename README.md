# Circle-Loader

**circle-loader** is a simple, lightweight loader component that can be programmatically started and stopped. It dynamically injects a loading spinner into the DOM and removes it when loading is complete.

## Installation

You can install the package via npm:

```bash
npm install circle-loader
```
## Usage

Import the ``Loader`` class and use the `start` and `close` methods to control the loader.

```javascript
import { Loader } from 'circle-loader';

// Start the loader
Loader.start();


// Stop the loader
Loader.close();

```