// Main Application Logic for TTRPG Grid Combat & Map Manager

// Global variables
let canvas;
let ctx;
let gridSize = 50;
let mapData = {
    grid: { size: gridSize, color: '#cccccc' },
    tokens: [],
    fogOfWar: [],
    terrain: [],
    initiative: [],
    editMode: true // Start in edit mode by default
};

// Initialize the application
function init() {
    console.log('TTRPG Grid Combat & Map Manager loaded successfully.');
    canvas = document.getElementById('mapCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    setupEventListeners();
    drawGrid();
    loadFromLocalStorage();
    
    // Initialize UI components
    initMapEditor();
    initTokenManager();
    initCombatTracker();
    initFogOfWar();
    initModeToggle();
    initPlayMode();
    initCharacterSheet();
    initDiceRoller();
    
    // Draw initial state
    render();
}

// Play/Edit Mode Toggle
function initModeToggle() {
    const modeToggleBtn = document.getElementById('modeToggleBtn');
    
    modeToggleBtn.addEventListener('click', function() {
        mapData.editMode = !mapData.editMode;
        
        if (mapData.editMode) {
            // Switch to Edit Mode
            modeToggleBtn.textContent = 'Play Mode';
            modeToggleBtn.classList.remove('play-active');
            
            // Show editor panel, hide play panel
            document.querySelector('.editor-panel').style.display = 'block';
            document.querySelector('.play-panel').style.display = 'none';
        } else {
            // Switch to Play Mode
            modeToggleBtn.textContent = 'Edit Mode';
            modeToggleBtn.classList.add('play-active');
            
            // Show play panel, hide editor panel
            document.querySelector('.editor-panel').style.display = 'none';
            document.querySelector('.play-panel').style.display = 'block';
        }
    });
}

// Character Sheet Functionality
function initCharacterSheet() {
    const characterSheetDialog = document.getElementById('characterSheetDialog');
    const closeCharacterSheetBtn = document.getElementById('closeCharacterSheet');
    const viewCharacterBtn = document.getElementById('viewCharacterBtn');
    const saveCharacterBtn = document.getElementById('saveCharacterBtn');
    
    // Open character sheet when view button clicked
    viewCharacterBtn.addEventListener('click', function() {
        openCharacterSheet();
    });
    
    // Double click on token to open character sheet in play mode
    canvas.addEventListener('dblclick', function(e) {
        if (!mapData.editMode) {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / mapData.grid.size) * mapData.grid.size;
            const y = Math.floor((e.clientY - rect.top) / mapData.grid.size) * mapData.grid.size;
            
            // Find token at this position
            const token = mapData.tokens.find(t => t.x === x && t.y === y);
            if (token) {
                openCharacterSheet(token);
            }
        }
    });
    
    // Close character sheet dialog
    closeCharacterSheetBtn.addEventListener('click', function() {
        characterSheetDialog.style.display = 'none';
    });
    
    // Save character data
    saveCharacterBtn.addEventListener('click', function() {
        saveCharacterData();
        characterSheetDialog.style.display = 'none';
    });
    
    // Attribute score change event
    const attributeInputs = document.querySelectorAll('.attr-input');
    attributeInputs.forEach(input => {
        input.addEventListener('change', updateModifiers);
    });
    
    // HP Adjustment buttons
    const hpButtons = document.querySelectorAll('.stat-btn');
    hpButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            const hpInput = document.getElementById('charHP');
            const currentHP = parseInt(hpInput.value) || 0;
            
            if (action === 'increase') {
                hpInput.value = currentHP + 1;
            } else if (action === 'decrease' && currentHP > 0) {
                hpInput.value = currentHP - 1;
            }
        });
    });
    
    // Roll initiative button
    document.getElementById('rollInitiativeBtn').addEventListener('click', function() {
        const dexMod = parseInt(document.getElementById('dexMod').textContent) || 0;
        const result = rollDice(1, 20) + dexMod;
        document.getElementById('charInitiative').value = result;
        logDiceRoll(`Initiative Roll: ${result} (1d20 + ${dexMod})`);
    });
    
    // Attribute roll buttons
    const attrRollBtns = document.querySelectorAll('.roll-attr-btn');
    attrRollBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const attr = this.dataset.attr;
            const modId = attr.toLowerCase() + 'Mod';
            const mod = parseInt(document.getElementById(modId).textContent) || 0;
            const result = rollDice(1, 20) + mod;
            logDiceRoll(`${attr} Check: ${result} (1d20 + ${mod})`);
        });
    });
}

function updateModifiers() {
    const attributes = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    
    attributes.forEach(attr => {
        const attrValue = parseInt(document.getElementById(`char${attr}`).value) || 10;
        const modifier = Math.floor((attrValue - 10) / 2);
        const sign = modifier >= 0 ? '+' : '';
        document.getElementById(`${attr.toLowerCase()}Mod`).textContent = `${sign}${modifier}`;
    });
}

function openCharacterSheet(token) {
    const characterSheetDialog = document.getElementById('characterSheetDialog');
    
    // If no token provided, use currently selected token
    if (!token) {
        const tokenSelect = document.getElementById('tokenSelect');
        if (!tokenSelect.value) {
            alert('Please select a token first.');
            return;
        }
        
        const selectedTokenId = tokenSelect.value;
        token = mapData.initiative.find(t => t.id === selectedTokenId);
        
        if (!token) {
            alert('Selected token not found.');
            return;
        }
    }
    
    // Populate character sheet with token data
    document.getElementById('charName').value = token.name;
    document.getElementById('charType').value = token.type;
    document.getElementById('charHP').value = token.hp || 10;
    document.getElementById('charAC').value = token.ac || 10;
    document.getElementById('charInitiative').value = token.initiative || 0;
    
    // Load attribute scores if available, otherwise use defaults
    document.getElementById('charSTR').value = token.attributes?.str || 10;
    document.getElementById('charDEX').value = token.attributes?.dex || 10;
    document.getElementById('charCON').value = token.attributes?.con || 10;
    document.getElementById('charINT').value = token.attributes?.int || 10;
    document.getElementById('charWIS').value = token.attributes?.wis || 10;
    document.getElementById('charCHA').value = token.attributes?.cha || 10;
    
    // Update attribute modifiers
    updateModifiers();
    
    // Load notes if available
    document.getElementById('charNotes').value = token.notes || '';
    
    // Store current token ID for saving
    characterSheetDialog.dataset.tokenId = token.id;
    
    // Show dialog
    characterSheetDialog.style.display = 'flex';
}

function saveCharacterData() {
    const characterSheetDialog = document.getElementById('characterSheetDialog');
    const tokenId = characterSheetDialog.dataset.tokenId;
    
    if (!tokenId) return;
    
    // Find token in initiative list
    const tokenIndex = mapData.initiative.findIndex(t => t.id === tokenId);
    if (tokenIndex === -1) return;
    
    // Update token data
    mapData.initiative[tokenIndex].hp = parseInt(document.getElementById('charHP').value) || 10;
    mapData.initiative[tokenIndex].ac = parseInt(document.getElementById('charAC').value) || 10;
    mapData.initiative[tokenIndex].initiative = parseInt(document.getElementById('charInitiative').value) || 0;
    
    // Update attributes
    mapData.initiative[tokenIndex].attributes = {
        str: parseInt(document.getElementById('charSTR').value) || 10,
        dex: parseInt(document.getElementById('charDEX').value) || 10,
        con: parseInt(document.getElementById('charCON').value) || 10,
        int: parseInt(document.getElementById('charINT').value) || 10,
        wis: parseInt(document.getElementById('charWIS').value) || 10,
        cha: parseInt(document.getElementById('charCHA').value) || 10
    };
    
    // Update notes
    mapData.initiative[tokenIndex].notes = document.getElementById('charNotes').value;
    
    // Update token on map if it exists
    const mapTokenIndex = mapData.tokens.findIndex(t => t.id === tokenId);
    if (mapTokenIndex !== -1) {
        mapData.tokens[mapTokenIndex] = {
            ...mapData.tokens[mapTokenIndex],
            ...mapData.initiative[tokenIndex]
        };
    }
    
    // Update initiative display
    updateInitiativeDisplay();
    
    // Render changes
    render();
}

// Dice Rolling Functionality
function initDiceRoller() {
    const diceRollDialog = document.getElementById('diceRollDialog');
    const closeDiceRollBtn = document.getElementById('closeDiceRoll');
    const rollDiceBtn = document.getElementById('rollDiceBtn');
    
    // Open dice roll dialog
    rollDiceBtn.addEventListener('click', function() {
        diceRollDialog.style.display = 'flex';
    });
    
    // Close dice roll dialog
    closeDiceRollBtn.addEventListener('click', function() {
        diceRollDialog.style.display = 'none';
    });
    
    // Roll selected dice
    document.getElementById('rollSelectedDice').addEventListener('click', function() {
        const activeDiceBtn = document.querySelector('.dice-btn-lg.active');
        if (!activeDiceBtn) {
            alert('Please select a die type.');
            return;
        }
        
        const diceType = activeDiceBtn.dataset.dice;
        const count = parseInt(document.getElementById('diceCount').value) || 1;
        const modifier = parseInt(document.getElementById('diceModifier').value) || 0;
        
        rollDiceWithType(diceType, count, modifier);
    });
    
    // Dice type selection
    const diceBtns = document.querySelectorAll('.dice-btn-lg');
    diceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            diceBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Quick dice buttons
    const quickDiceBtns = document.querySelectorAll('.dice-btn');
    quickDiceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            rollDiceWithType(this.dataset.dice, 1, 0);
        });
    });
    
    // Custom roll input
    document.getElementById('customRollBtn').addEventListener('click', function() {
        const customRollInput = document.getElementById('customRollInput');
        const rollExpression = customRollInput.value.trim();
        
        if (!rollExpression) {
            alert('Please enter a valid dice expression (e.g. 2d6+3).');
            return;
        }
        
        rollCustomExpression(rollExpression);
    });
}

function initPlayMode() {
    // Additional play mode initialization
    // This section would include any extra setup needed for play mode that hasn't been covered elsewhere
}

function rollDice(count, sides) {
    let total = 0;
    const rolls = [];
    
    for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        total += roll;
    }
    
    return {
        total,
        rolls
    };
}

function rollDiceWithType(diceType, count, modifier) {
    const sides = parseInt(diceType.substring(1));
    const { total, rolls } = rollDice(count, sides);
    const finalTotal = total + modifier;
    
    const resultText = `${count}${diceType} ${modifier >= 0 ? '+' : ''}${modifier !== 0 ? modifier : ''} = ${finalTotal} (${rolls.join(', ')}${modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : ''})`;
    
    logDiceRoll(resultText);
    
    return finalTotal;
}

function rollCustomExpression(expression) {
    // Parse dice expression like "2d6+3"
    const regex = /(\d+)[dD](\d+)(?:([-+])(\d+))?/;
    const match = expression.match(regex);
    
    if (!match) {
        alert('Invalid dice expression. Please use format like "2d6+3".');
        return;
    }
    
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const hasModifier = match[3] !== undefined;
    const modifierSign = match[3] === '+' ? 1 : -1;
    const modifier = hasModifier ? parseInt(match[4]) * modifierSign : 0;
    
    const { total, rolls } = rollDice(count, sides);
    const finalTotal = total + modifier;
    
    const resultText = `${expression} = ${finalTotal} (${rolls.join(', ')}${modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''})`;
    
    logDiceRoll(resultText);
    
    return finalTotal;
}

function logDiceRoll(resultText) {
    // Log to the quick roll results area
    const diceLog = document.getElementById('diceLog');
    const logEntry = document.createElement('div');
    logEntry.classList.add('dice-result');
    logEntry.textContent = resultText;
    diceLog.prepend(logEntry);
    
    // Keep only the last 10 rolls
    const entries = diceLog.children;
    while (entries.length > 10) {
        diceLog.removeChild(entries[entries.length - 1]);
    }
    
    // Also log to the dialog results if it's open
    const diceResultsDisplay = document.getElementById('diceResultsDisplay');
    if (diceResultsDisplay) {
        const dialogEntry = document.createElement('div');
        dialogEntry.classList.add('dice-result');
        dialogEntry.textContent = resultText;
        diceResultsDisplay.prepend(dialogEntry);
    }
}

// Canvas Setup
function resizeCanvas() {
    canvas.width = window.innerWidth - 500; // Account for both sidebars
    canvas.height = window.innerHeight - 100; // Account for header/footer
    drawGrid();
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = mapData.grid.color;
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += mapData.grid.size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += mapData.grid.size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Event Listeners
function setupEventListeners() {
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('click', handleCanvasClick);
    
    // Grid size control
    const gridSizeControl = document.getElementById('gridSize');
    const gridSizeValue = document.getElementById('gridSizeValue');
    
    gridSizeControl.addEventListener('input', function() {
        mapData.grid.size = parseInt(this.value);
        gridSizeValue.textContent = `${mapData.grid.size}px`;
        drawGrid();
        render();
    });
    
    // Grid color control
    const gridColorControl = document.getElementById('gridColor');
    gridColorControl.addEventListener('input', function() {
        mapData.grid.color = this.value;
        drawGrid();
        render();
    });
    
    // Tool selection
    document.getElementById('drawBtn').addEventListener('click', () => setActiveTool('draw'));
    document.getElementById('eraseBtn').addEventListener('click', () => setActiveTool('erase'));
    document.getElementById('tokenBtn').addEventListener('click', () => setActiveTool('token'));
    document.getElementById('fogBtn').addEventListener('click', () => setActiveTool('fog'));
    
    // Layer selection
    document.getElementById('baseMapLayer').addEventListener('change', updateActiveLayer);
    document.getElementById('objectLayer').addEventListener('change', updateActiveLayer);
    document.getElementById('tokenLayer').addEventListener('change', updateActiveLayer);
    document.getElementById('effectLayer').addEventListener('change', updateActiveLayer);
    document.getElementById('fogLayer').addEventListener('change', updateActiveLayer);
    
    // Save/Load
    document.getElementById('saveBtn').addEventListener('click', saveToLocalStorage);
    document.getElementById('loadBtn').addEventListener('click', loadFromLocalStorage);
    document.getElementById('exportBtn').addEventListener('click', exportMap);
    
    // Fog of War controls
    document.getElementById('revealAllBtn').addEventListener('click', revealAllFog);
    document.getElementById('hideAllBtn').addEventListener('click', hideAllFog);
}

// Handle canvas click based on current mode
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / mapData.grid.size) * mapData.grid.size;
    const y = Math.floor((e.clientY - rect.top) / mapData.grid.size) * mapData.grid.size;
    
    // In edit mode, use tools as before
    if (mapData.editMode) {
        switch(activeTool) {
            case 'draw':
                addTerrain(x, y);
                break;
            case 'erase':
                eraseTerrain(x, y);
                break;
            case 'token':
                placeToken(x, y);
                break;
            case 'fog':
                toggleFog(x, y);
                break;
        }
    } else {
        // In play mode, select token to view properties (single click)
        const token = mapData.tokens.find(t => t.x === x && t.y === y);
        if (token) {
            const tokenSelect = document.getElementById('tokenSelect');
            tokenSelect.value = token.id;
        }
    }
    
    render();
}

// Token Manager Functions
function initTokenManager() {
    // Set up token manager UI and functionality
    console.log('Token Manager initialized');
    
    // Add token form submission
    document.getElementById('tokenForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const tokenData = {
            id: Date.now().toString(), // Generate unique ID
            name: document.getElementById('tokenName').value,
            type: document.getElementById('tokenType').value,
            hp: parseInt(document.getElementById('tokenHP').value),
            ac: parseInt(document.getElementById('tokenAC').value),
            initiative: parseInt(document.getElementById('tokenInitiative').value),
            // Add default attributes for new tokens
            attributes: {
                str: 10,
                dex: 10,
                con: 10,
                int: 10,
                wis: 10,
                cha: 10
            },
            notes: ''
        };
        
        addTokenToManager(tokenData);
        this.reset(); // Clear the form
    });
    
    // Add duplicate token button functionality
    document.getElementById('duplicateTokenBtn').addEventListener('click', duplicateSelectedToken);
}

function addTokenToManager(tokenData) {
    // Add token to initiative list
    mapData.initiative.push(tokenData);
    
    // Update token select dropdown
    updateTokenSelect();
    
    // Update initiative display
    updateInitiativeDisplay();
}

function updateTokenSelect() {
    const tokenSelect = document.getElementById('tokenSelect');
    tokenSelect.innerHTML = '';
    
    mapData.initiative.forEach(token => {
        const option = document.createElement('option');
        option.value = token.id;
        option.textContent = `${token.name} (${token.type})`;
        tokenSelect.appendChild(option);
    });
}

function duplicateSelectedToken() {
    // Get currently selected token from the token manager
    const tokenSelect = document.getElementById('tokenSelect');
    if (!tokenSelect.value) return;
    
    const selectedTokenId = tokenSelect.value;
    
    // Find the token in initiative list
    const tokenData = mapData.initiative.find(token => token.id === selectedTokenId);
    if (!tokenData) return;
    
    // Create a duplicate with a new ID
    const duplicatedToken = {
        ...tokenData,
        id: Date.now().toString(),
        name: `${tokenData.name} (Copy)`
    };
    
    // Add to initiative list
    addTokenToManager(duplicatedToken);
}

function placeToken(x, y) {
    // Get currently selected token from the token manager
    const tokenSelect = document.getElementById('tokenSelect');
    if (!tokenSelect.value) return;
    
    const selectedTokenId = tokenSelect.value;
    
    // Find the token in initiative list
    const tokenData = mapData.initiative.find(token => token.id === selectedTokenId);
    if (!tokenData) return;
    
    // Check if the token is already on the map
    const existingTokenIndex = mapData.tokens.findIndex(token => token.id === selectedTokenId);
    
    if (existingTokenIndex !== -1) {
        // Move existing token to new position
        mapData.tokens[existingTokenIndex].x = x;
        mapData.tokens[existingTokenIndex].y = y;
    } else {
        // Add token to map with position
        mapData.tokens.push({
            ...tokenData,
            x,
            y
        });
    }
    
    // Auto-reveal fog if enabled
    const autoReveal = document.getElementById('autoReveal').checked;
    if (autoReveal) {
        // Reveal fog in a 2-cell radius around the token
        const revealRadius = 2;
        for (let dx = -revealRadius; dx <= revealRadius; dx++) {
            for (let dy = -revealRadius; dy <= revealRadius; dy++) {
                const fx = x + dx * mapData.grid.size;
                const fy = y + dy * mapData.grid.size;
                
                // Remove fog at this location
                mapData.fogOfWar = mapData.fogOfWar.filter(fog => 
                    fog.x !== fx || fog.y !== fy
                );
            }
        }
    }
}

// LocalStorage Functions
function saveToLocalStorage() {
    localStorage.setItem('ttrpgMapData', JSON.stringify(mapData));
    alert('Map saved successfully!');
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('ttrpgMapData');
    if (savedData) {
        mapData = JSON.parse(savedData);
        render();
        updateTokenSelect();
        updateInitiativeDisplay();
        alert('Map loaded successfully!');
    }
}

// Export Functions
function exportMap() {
    // Create a data URL from the canvas
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.download = 'ttrpg-map.png';
    link.href = dataUrl;
    link.click();
}

// Tool functionality
let activeTool = 'draw';
let activeLayer = 'baseMap';

function setActiveTool(tool) {
    activeTool = tool;
    // Update UI to show active tool
    document.querySelectorAll('.tool').forEach(btn => {
        if (btn.id === `${tool}Btn`) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', init);

function updateActiveLayer() {
    const selectedLayer = document.querySelector('input[name="layer"]:checked')?.value || 'baseMap';
    activeLayer = selectedLayer;
    
    // Update any visual indicators or UI elements
    document.querySelectorAll('input[name="layer"]').forEach(radio => {
        const layerLabel = radio.parentElement;
        if (layerLabel) {
            if (radio.value === activeLayer) {
                layerLabel.classList.add('active-layer');
            } else {
                layerLabel.classList.remove('active-layer');
            }
        }
    });
    
    // Re-render with the active layer
    render();
}