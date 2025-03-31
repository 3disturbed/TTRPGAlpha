export default class CombatManager {
    constructor(mapData) {
        this.mapData = mapData;
    }

    startCombat() {
        // Sort initiative order
        this.mapData.initiative.sort((a, b) => b.initiative - a.initiative);
        this.mapData.activeCombatantIndex = 0;
        return this.getCurrentCombatant();
    }

    nextTurn() {
        if (this.mapData.initiative.length === 0) return null;
        
        this.mapData.activeCombatantIndex = 
            (this.mapData.activeCombatantIndex + 1) % this.mapData.initiative.length;
        
        return this.getCurrentCombatant();
    }

    getCurrentCombatant() {
        if (this.mapData.activeCombatantIndex === undefined || 
            this.mapData.initiative.length === 0) return null;
        
        return this.mapData.initiative[this.mapData.activeCombatantIndex];
    }

    setInitiative(tokenId, value) {
        const tokenIndex = this.mapData.initiative.findIndex(t => t.id === tokenId);
        if (tokenIndex === -1) return false;
        
        this.mapData.initiative[tokenIndex].initiative = value;
        return true;
    }

    rollInitiative(tokenId, modifier = 0) {
        const roll = Math.floor(Math.random() * 20) + 1 + modifier;
        return this.setInitiative(tokenId, roll) ? roll : null;
    }

    getCombatOrder() {
        return [...this.mapData.initiative].sort((a, b) => b.initiative - a.initiative);
    }

    endCombat() {
        this.mapData.activeCombatantIndex = undefined;
    }
}