import MapData from './modules/MapData.js';
import CanvasManager from './modules/CanvasManager.js';
import TokenManager from './modules/TokenManager.js';
import CombatManager from './modules/CombatManager.js';
import DiceRoller from './modules/DiceRoller.js';
import Renderer from './modules/Renderer.js';

class Game {
    constructor() {
        this.mapData = new MapData();
        this.initializeManagers();
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.render();
    }

    initializeManagers() {
        const canvas = document.getElementById('mapCanvas');
        this.canvasManager = new CanvasManager(canvas, this.mapData);
        this.tokenManager = new TokenManager(this.mapData);
        this.combatManager = new CombatManager(this.mapData);
        this.renderer = new Renderer(this.canvasManager, this.mapData);
        
        // Initialize UI
        this.initModeToggle();
        this.initCharacterSheet();
        this.initDiceRoller();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.canvasManager.resizeCanvas());
        
        // Canvas click handling
        this.canvasManager.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvasManager.canvas.addEventListener('dblclick', (e) => this.handleCanvasDoubleClick(e));
        
        // Grid controls
        this.setupGridControls();
        
        // Tool selection
        this.setupToolControls();
        
        // Layer selection
        this.setupLayerControls();
        
        // Save/Load/Export
        this.setupStorageControls();
        
        // Fog of War controls
        this.setupFogControls();
        
        // Token form submission
        this.setupTokenControls();
    }

    handleCanvasClick(e) {
        const pos = this.canvasManager.getGridPosition(e.clientX, e.clientY);
        
        if (this.mapData.editMode) {
            switch(this.activeTool) {
                case 'draw':
                    this.addTerrain(pos.x, pos.y);
                    break;
                case 'erase':
                    this.eraseTerrain(pos.x, pos.y);
                    break;
                case 'token':
                    this.placeSelectedToken(pos.x, pos.y);
                    break;
                case 'fog':
                    this.toggleFog(pos.x, pos.y);
                    break;
            }
        } else {
            this.selectTokenAtPosition(pos.x, pos.y);
        }
        
        this.render();
    }

    handleCanvasDoubleClick(e) {
        if (!this.mapData.editMode) {
            const pos = this.canvasManager.getGridPosition(e.clientX, e.clientY);
            const token = this.findTokenAtPosition(pos.x, pos.y);
            if (token) {
                this.openCharacterSheet(token);
            }
        }
    }

    render() {
        this.renderer.render();
    }

    // Storage methods
    saveToLocalStorage() {
        localStorage.setItem('ttrpgMapData', JSON.stringify(this.mapData));
    }

    loadFromLocalStorage() {
        const savedData = localStorage.getItem('ttrpgMapData');
        if (savedData) {
            this.mapData = MapData.fromJSON(JSON.parse(savedData));
            this.updateUI();
        }
    }

    exportMap() {
        const dataUrl = this.canvasManager.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'ttrpg-map.png';
        link.href = dataUrl;
        link.click();
    }

    // UI initialization methods
    initModeToggle() {
        const modeToggleBtn = document.getElementById('modeToggleBtn');
        modeToggleBtn.addEventListener('click', () => this.toggleMode());
    }

    toggleMode() {
        this.mapData.editMode = !this.mapData.editMode;
        this.updateModeUI();
        this.render();
    }

    updateModeUI() {
        const modeToggleBtn = document.getElementById('modeToggleBtn');
        const editorPanel = document.querySelector('.editor-panel');
        const playPanel = document.querySelector('.play-panel');
        
        if (this.mapData.editMode) {
            modeToggleBtn.textContent = 'Play Mode';
            modeToggleBtn.classList.remove('play-active');
            editorPanel.style.display = 'block';
            playPanel.style.display = 'none';
        } else {
            modeToggleBtn.textContent = 'Edit Mode';
            modeToggleBtn.classList.add('play-active');
            editorPanel.style.display = 'none';
            playPanel.style.display = 'block';
        }
    }

    updateUI() {
        this.updateModeUI();
        this.updateTokenList();
        this.updateInitiativeDisplay();
    }

    setupGridControls() {
        const gridSizeControl = document.getElementById('gridSize');
        const gridSizeValue = document.getElementById('gridSizeValue');
        const gridColorControl = document.getElementById('gridColor');
        
        gridSizeControl.addEventListener('input', () => {
            this.mapData.grid.size = parseInt(gridSizeControl.value);
            gridSizeValue.textContent = `${this.mapData.grid.size}px`;
            this.render();
        });
        
        gridColorControl.addEventListener('input', () => {
            this.mapData.grid.color = gridColorControl.value;
            this.render();
        });
    }

    setupToolControls() {
        this.activeTool = 'draw';
        document.querySelectorAll('.tool').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveTool(btn.id.replace('Btn', ''));
            });
        });
    }

    setActiveTool(tool) {
        this.activeTool = tool;
        document.querySelectorAll('.tool').forEach(btn => {
            btn.classList.toggle('active', btn.id === `${tool}Btn`);
        });
    }

    setupLayerControls() {
        this.activeLayer = 'baseMap';
        document.querySelectorAll('input[name="layer"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.activeLayer = radio.value;
            });
        });
    }

    setupStorageControls() {
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveToLocalStorage();
            alert('Map saved successfully!');
        });
        
        document.getElementById('loadBtn').addEventListener('click', () => {
            this.loadFromLocalStorage();
            alert('Map loaded successfully!');
        });
        
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportMap();
        });
    }

    setupFogControls() {
        document.getElementById('revealAllBtn').addEventListener('click', () => {
            this.mapData.fogOfWar = [];
            this.render();
        });
        
        document.getElementById('hideAllBtn').addEventListener('click', () => {
            this.hideAllFog();
            this.render();
        });
    }

    setupTokenControls() {
        const tokenForm = document.getElementById('tokenForm');
        const duplicateBtn = document.getElementById('duplicateTokenBtn');
        
        tokenForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const tokenData = {
                name: document.getElementById('tokenName').value,
                type: document.getElementById('tokenType').value,
                hp: parseInt(document.getElementById('tokenHP').value),
                ac: parseInt(document.getElementById('tokenAC').value),
                initiative: parseInt(document.getElementById('tokenInitiative').value)
            };
            
            this.tokenManager.addToken(tokenData);
            this.updateUI();
            tokenForm.reset();
        });
        
        duplicateBtn.addEventListener('click', () => {
            const tokenSelect = document.getElementById('tokenSelect');
            if (tokenSelect.value) {
                this.tokenManager.duplicateToken(tokenSelect.value);
                this.updateUI();
            }
        });
    }

    hideAllFog() {
        this.mapData.fogOfWar = [];
        for (let x = 0; x < this.canvasManager.canvas.width; x += this.mapData.grid.size) {
            for (let y = 0; y < this.canvasManager.canvas.height; y += this.mapData.grid.size) {
                this.mapData.fogOfWar.push({ x, y });
            }
        }
    }

    addTerrain(x, y) {
        const terrainType = document.getElementById('terrainType').value;
        const existingIndex = this.mapData.terrain.findIndex(t => t.x === x && t.y === y);
        
        if (existingIndex !== -1) {
            this.mapData.terrain.splice(existingIndex, 1);
        }
        
        this.mapData.terrain.push({ x, y, type: terrainType });
    }

    eraseTerrain(x, y) {
        this.mapData.terrain = this.mapData.terrain.filter(t => t.x !== x || t.y !== y);
    }

    placeSelectedToken(x, y) {
        const tokenSelect = document.getElementById('tokenSelect');
        if (tokenSelect.value) {
            this.tokenManager.placeToken(tokenSelect.value, x, y);
        }
    }

    toggleFog(x, y) {
        const fogIndex = this.mapData.fogOfWar.findIndex(f => f.x === x && f.y === y);
        if (fogIndex !== -1) {
            this.mapData.fogOfWar.splice(fogIndex, 1);
        } else {
            this.mapData.fogOfWar.push({ x, y });
        }
    }

    selectTokenAtPosition(x, y) {
        const token = this.findTokenAtPosition(x, y);
        if (token) {
            document.getElementById('tokenSelect').value = token.id;
        }
    }

    findTokenAtPosition(x, y) {
        return this.mapData.tokens.find(t => t.x === x && t.y === y);
    }

    updateTokenList() {
        const tokenSelect = document.getElementById('tokenSelect');
        tokenSelect.innerHTML = '';
        
        this.mapData.initiative.forEach(token => {
            const option = document.createElement('option');
            option.value = token.id;
            option.textContent = `${token.name} (${token.type})`;
            tokenSelect.appendChild(option);
        });
    }

    updateInitiativeDisplay() {
        const initiativeList = document.getElementById('initiativeList');
        initiativeList.innerHTML = '';
        
        this.mapData.initiative.forEach((combatant, index) => {
            const item = document.createElement('li');
            item.textContent = `${combatant.name} - Initiative: ${combatant.initiative}, HP: ${combatant.hp}, AC: ${combatant.ac}`;
            
            if (index === this.mapData.activeCombatantIndex) {
                item.classList.add('active');
            }
            
            initiativeList.appendChild(item);
        });
    }

    initCharacterSheet() {
        const characterSheetDialog = document.getElementById('characterSheetDialog');
        const closeCharacterSheetBtn = document.getElementById('closeCharacterSheet');
        const saveCharacterBtn = document.getElementById('saveCharacterBtn');
        
        closeCharacterSheetBtn.addEventListener('click', () => {
            characterSheetDialog.style.display = 'none';
        });
        
        saveCharacterBtn.addEventListener('click', () => {
            this.saveCharacterData();
            characterSheetDialog.style.display = 'none';
        });
        
        // Attribute score change events
        document.querySelectorAll('.attr-input').forEach(input => {
            input.addEventListener('change', () => this.updateModifiers());
        });
        
        // HP Adjustment buttons
        document.querySelectorAll('.stat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const hpInput = document.getElementById('charHP');
                const currentHP = parseInt(hpInput.value) || 0;
                
                if (action === 'increase') {
                    hpInput.value = currentHP + 1;
                } else if (action === 'decrease' && currentHP > 0) {
                    hpInput.value = currentHP - 1;
                }
            });
        });
        
        // Attribute roll buttons
        document.querySelectorAll('.roll-attr-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const attr = btn.dataset.attr;
                const modId = attr.toLowerCase() + 'Mod';
                const mod = parseInt(document.getElementById(modId).textContent) || 0;
                const result = DiceRoller.rollAttribute(parseInt(document.getElementById(`char${attr}`).value));
                this.logDiceRoll(`${attr} Check: ${result.toString()}`);
            });
        });
    }

    openCharacterSheet(token) {
        const characterSheetDialog = document.getElementById('characterSheetDialog');
        
        // Set current token ID
        characterSheetDialog.dataset.tokenId = token.id;
        
        // Populate character sheet
        document.getElementById('charName').value = token.name;
        document.getElementById('charType').value = token.type;
        document.getElementById('charHP').value = token.hp || 10;
        document.getElementById('charAC').value = token.ac || 10;
        document.getElementById('charInitiative').value = token.initiative || 0;
        
        // Load attributes
        document.getElementById('charSTR').value = token.attributes?.str || 10;
        document.getElementById('charDEX').value = token.attributes?.dex || 10;
        document.getElementById('charCON').value = token.attributes?.con || 10;
        document.getElementById('charINT').value = token.attributes?.int || 10;
        document.getElementById('charWIS').value = token.attributes?.wis || 10;
        document.getElementById('charCHA').value = token.attributes?.cha || 10;
        
        // Update modifiers
        this.updateModifiers();
        
        // Load notes
        document.getElementById('charNotes').value = token.notes || '';
        
        // Show dialog
        characterSheetDialog.style.display = 'flex';
    }

    saveCharacterData() {
        const characterSheetDialog = document.getElementById('characterSheetDialog');
        const tokenId = characterSheetDialog.dataset.tokenId;
        
        if (!tokenId) return;
        
        const updates = {
            hp: parseInt(document.getElementById('charHP').value) || 10,
            ac: parseInt(document.getElementById('charAC').value) || 10,
            initiative: parseInt(document.getElementById('charInitiative').value) || 0,
            attributes: {
                str: parseInt(document.getElementById('charSTR').value) || 10,
                dex: parseInt(document.getElementById('charDEX').value) || 10,
                con: parseInt(document.getElementById('charCON').value) || 10,
                int: parseInt(document.getElementById('charINT').value) || 10,
                wis: parseInt(document.getElementById('charWIS').value) || 10,
                cha: parseInt(document.getElementById('charCHA').value) || 10
            },
            notes: document.getElementById('charNotes').value
        };
        
        this.tokenManager.updateToken(tokenId, updates);
        this.updateUI();
    }

    updateModifiers() {
        const attributes = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
        
        attributes.forEach(attr => {
            const attrValue = parseInt(document.getElementById(`char${attr}`).value) || 10;
            const modifier = Math.floor((attrValue - 10) / 2);
            const sign = modifier >= 0 ? '+' : '';
            document.getElementById(`${attr.toLowerCase()}Mod`).textContent = `${sign}${modifier}`;
        });
    }

    initDiceRoller() {
        const diceRollDialog = document.getElementById('diceRollDialog');
        const closeDiceRollBtn = document.getElementById('closeDiceRoll');
        const rollDiceBtn = document.getElementById('rollDiceBtn');
        
        rollDiceBtn.addEventListener('click', () => {
            diceRollDialog.style.display = 'flex';
        });
        
        closeDiceRollBtn.addEventListener('click', () => {
            diceRollDialog.style.display = 'none';
        });
        
        // Roll selected dice
        document.getElementById('rollSelectedDice').addEventListener('click', () => {
            const activeDiceBtn = document.querySelector('.dice-btn-lg.active');
            if (!activeDiceBtn) {
                alert('Please select a die type.');
                return;
            }
            
            const diceType = activeDiceBtn.dataset.dice;
            const count = parseInt(document.getElementById('diceCount').value) || 1;
            const modifier = parseInt(document.getElementById('diceModifier').value) || 0;
            
            const result = DiceRoller.roll(diceType, count, modifier);
            this.logDiceRoll(result.toString());
        });
        
        // Dice type selection
        document.querySelectorAll('.dice-btn-lg').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.dice-btn-lg').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Quick dice buttons
        document.querySelectorAll('.dice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const result = DiceRoller.roll(btn.dataset.dice);
                this.logDiceRoll(result.toString());
            });
        });
        
        // Custom roll input
        document.getElementById('customRollBtn').addEventListener('click', () => {
            const customRollInput = document.getElementById('customRollInput');
            const rollExpression = customRollInput.value.trim();
            
            if (!rollExpression) {
                alert('Please enter a valid dice expression (e.g. 2d6+3).');
                return;
            }
            
            try {
                const result = DiceRoller.parseExpression(rollExpression);
                this.logDiceRoll(result.toString());
            } catch (error) {
                alert(error.message);
            }
        });
    }

    logDiceRoll(resultText) {
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
}

// Initialize the game when the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});