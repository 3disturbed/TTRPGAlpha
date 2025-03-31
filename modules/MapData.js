export default class MapData {
    constructor() {
        this.grid = { size: 50, color: '#cccccc' };
        this.tokens = [];
        this.fogOfWar = [];
        this.terrain = [];
        this.initiative = [];
        this.editMode = true;
        this.activeCombatantIndex = undefined;
    }

    toJSON() {
        return {
            grid: this.grid,
            tokens: this.tokens,
            fogOfWar: this.fogOfWar,
            terrain: this.terrain,
            initiative: this.initiative,
            editMode: this.editMode,
            activeCombatantIndex: this.activeCombatantIndex
        };
    }

    static fromJSON(data) {
        const mapData = new MapData();
        Object.assign(mapData, data);
        return mapData;
    }
}