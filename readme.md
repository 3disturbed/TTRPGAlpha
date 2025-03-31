# TTRPG Grid Combat & Map Manager

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [User Roles](#user-roles)
- [Key Components](#key-components)
- [Development Plan](#development-plan)
- [Goals](#goals)
- [License](#license)
- [Contributing](#contributing)
- [Contact](#contact)

## Overview
This project is a grid-based combat and map creation manager designed to simplify the role of a Dungeon Master (DM) during tabletop role-playing games (TTRPGs). The tool allows DMs to use a device (desktop, tablet, or laptop) to dynamically manage encounters, control visibility, and track units on a grid-based map in real time. It is a fully static web application hosted on GitHub Pages and uses browser localStorage for persistent data.

[Back to Table of Contents](#table-of-contents)

## Features
- Grid-based combat map creator with drag-and-drop assets
- Real-time fog of war control
- Initiative tracker and combat order management
- Player and enemy token placement
- Editable token stats and conditions
- Dynamic terrain, lighting, and environmental effects
- Scenario and map saving/loading via localStorage
- Export to printable maps or digital play formats

[Back to Table of Contents](#table-of-contents)

## Tech Stack
- **Frontend:** Native JS (Canvas/HTML5 based rendering)
- **Data Persistence:** Browser localStorage
- **Hosting/Deployment:** GitHub Pages (static site only)

[Back to Table of Contents](#table-of-contents)

## System Architecture
### Frontend
- **Canvas Renderer:** Renders the grid, terrain, tokens, and fog
- **UI Panels:** Controls for initiative, entity editing, environment toggles
- **LocalStorage Manager:** Saves and loads session data (maps, tokens, settings)

### Backend
**Note:** There is no backend. All application logic runs client-side. Data is saved locally via the browser.

[Back to Table of Contents](#table-of-contents)

## User Roles
- **Dungeon Master (DM):** Full control over map, tokens, and fog
- **Players:** View-only or limited interaction depending on permissions

[Back to Table of Contents](#table-of-contents)

## Key Components
### Map Editor
The Map Editor provides a powerful grid-based design environment where DMs can create, customize, and manage their maps in layers. Key functionalities include:

- **Grid Customization:** Adjustable grid size, spacing, and color settings.
- **Drawing Tools:** Pencil, shape, fill, erase, and terrain brushes.
- **Layered Design:** Work with multiple layers such as:
  - **Base Map Layer:** Terrain, walls, floor textures
  - **Object Layer:** Furniture, props, interactables
  - **Token Layer:** Characters, NPCs, monsters
  - **Effect Layer:** Lighting, weather, spell areas
  - **Fog of War Layer:** Hidden areas, DM vision control
- **Snap-to-grid or freeform placement** of assets
- **Undo/Redo** capabilities for quick corrections
- **Asset Library Integration:** Use predefined or custom uploaded tiles and assets
- **Zoom and Pan Controls:** Navigate large maps with ease
- **Coordinate System:** For precise placement and reference

### Play/Edit Mode
The application offers two distinct modes for different phases of gameplay:

- **Edit Mode:** Designed for DMs to prepare encounters, maps, and tokens before the gaming session. Features include:
  - Full access to all map editing tools and terrain types
  - Token creation and positioning
  - Fog of War drawing and erasing
  - Environmental effect placement
  
- **Play Mode:** Streamlined interface for active gameplay sessions. Features include:
  - Simplified controls focused on combat management
  - Character sheet access and editing
  - Dice rolling functionality for checks and attacks
  - Token HP tracking and adjustment
  - Hidden map editing tools to maintain immersion
  - Double-click on tokens to view/edit character sheets

### Token Manager
- Add/edit/remove tokens
- Assign initiative, HP, AC, conditions
- Snap to grid or free move
- Link tokens to initiative tracker
- Customize token appearance and labels
- Duplicate tokens with a single click
- Ensure only one instance of each token exists on the map

### Character Sheets
- Fully integrated character tracking system
- Core attributes (STR, DEX, CON, INT, WIS, CHA)
- Automatic modifier calculation
- HP tracking with increment/decrement controls
- Notes section for important character information
- Save updates directly to tokens
- Access sheets by double-clicking tokens in play mode or through the character button
- Roll attribute checks directly from character sheet

### Dice Roller
- Comprehensive dice rolling system for all standard TTRPG dice
- Quick-access buttons for common dice (d4, d6, d8, d10, d12, d20, d100)
- Advanced dice roller with:
  - Multiple dice rolls (e.g., 3d6)
  - Modifier support (e.g., +2, -1)
  - Customizable roll expressions (e.g., 2d8+1d6+3)
- Roll history log
- Attribute-based rolls from character sheets
- Initiative rolls with automatic DEX modifier application
- Visual dice results with roll breakdown

### Combat Tracker
- Roll/assign initiative
- Track turns and status effects
- Auto-highlight active token
- Skip/Delay/Ready action support
- Status effect icons and timers
- One-click HP adjustments during combat

### Fog of War
- Manually drawn/erased
- Token-vision option (line of sight)
- Auto-reveal with token movement (optional)
- DM-only vs player-visible overlays
- Quick reveal/hide all controls

[Back to Table of Contents](#table-of-contents)

## Development Plan
1. Base canvas rendering and grid tools
2. Token creation and management
3. Fog of war mechanics
4. Initiative and combat tracker
5. LocalStorage save/load support
6. UI/UX polish and accessibility
7. GitHub Pages deployment

[Back to Table of Contents](#table-of-contents)

## Goals
- Empower DMs with a powerful digital companion
- Enhance the visual and tactical elements of TTRPGs
- Maintain flexibility for use in multiple systems (D&D, Pathfinder, etc.)
- Remain lightweight and fully offline capable

[Back to Table of Contents](#table-of-contents)

## License
MIT License (TBD)

[Back to Table of Contents](#table-of-contents)

## Contributing
Contributions are welcome! Please submit issues and pull requests via GitHub.

[Back to Table of Contents](#table-of-contents)

## Contact
Project lead: [Your Name / GitHub Handle]  
Email: [your.email@example.com]  
Website: [optional personal/project site]

[Back to Table of Contents](#table-of-contents)

---

This document also acts as a living software design document. As the project evolves, so will this file, capturing both technical and functional changes over time.

