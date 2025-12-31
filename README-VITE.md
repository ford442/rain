# Rain Animation - TypeScript + Vite

Drawing raindrops on HTML5 canvas with TypeScript and modern build tools.

![Rain Animation](https://github.com/user-attachments/assets/88fb1a76-43d7-44f4-9a03-191ac804e2af)

This is a TypeScript port of the original ClojureScript rain animation project. The animation simulates raindrops falling on glass with realistic physics including gravity, drop merging, and reflections.

## Features

- 🌧️ Realistic raindrop physics with gravity acceleration
- 💧 Drop merging when raindrops collide
- 🎨 Reflection effects using canvas manipulation
- ⚡ Built with Vite for fast development and optimized production builds
- 📦 TypeScript for type safety and better developer experience

## Prerequisites

- Node.js (v16 or higher recommended)
- npm (comes with Node.js)

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

Then open your browser to `http://localhost:5173/`

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
.
├── src/
│   ├── main.ts       # Main entry point, canvas rendering and animation loop
│   ├── drops.ts      # Raindrop physics and collision detection
│   ├── async.ts      # Async utilities for animation timing
│   └── util.ts       # Mathematical utility functions
├── resources/
│   └── public/
│       ├── css/      # Stylesheets
│       ├── images/   # Background images
│       └── js/       # stackblur.js library
├── index.html        # Main HTML file
├── package.json      # npm dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── vite.config.ts    # Vite bundler configuration
```

## How It Works

The animation uses several key concepts:

1. **Canvas Layers**: Three overlapping canvases create the effect:
   - Background canvas with blur applied
   - Glass canvas for drawing raindrops
   - Reflection canvas for drop reflections

2. **Physics Simulation**: Each raindrop has position, radius, and acceleration properties. Gravity is applied on each frame, with larger drops falling faster.

3. **Drop Merging**: When drops overlap, they merge into a single larger drop with combined volume and averaged position.

4. **Channel-based Animation**: Custom async channel implementation manages the animation timing and drop lifecycle.

## Technology Stack

- **TypeScript**: Type-safe JavaScript
- **Vite**: Next-generation frontend build tool
- **HTML5 Canvas**: For rendering the animation
- **StackBlur**: Fast Gaussian blur algorithm

## Original Project

This is a TypeScript port of the original ClojureScript implementation. Check out the original project and blog post for more details about the core.async approach and design decisions.

## License

See the original project for license information.
