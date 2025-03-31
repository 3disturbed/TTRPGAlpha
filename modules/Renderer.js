export default class Renderer {
    constructor(canvasManager, mapData) {
        this.canvasManager = canvasManager;
        this.mapData = mapData;
        this.ctx = canvasManager.ctx;
    }

    render() {
        this.canvasManager.clearCanvas();
        this.canvasManager.drawGrid();
        this.renderTerrain();
        this.renderTokens();
        this.renderFogOfWar();
    }

    renderTerrain() {
        this.mapData.terrain.forEach(terrain => {
            switch(terrain.type) {
                case 'wall':
                    this.ctx.fillStyle = '#888888';
                    break;
                case 'water':
                    this.ctx.fillStyle = '#4444ff';
                    break;
                case 'difficult':
                    this.ctx.fillStyle = '#aa8844';
                    break;
                default:
                    this.ctx.fillStyle = '#dddddd';
            }
            
            this.ctx.fillRect(
                terrain.x, 
                terrain.y, 
                this.mapData.grid.size, 
                this.mapData.grid.size
            );
        });
    }

    renderTokens() {
        this.mapData.tokens.forEach(token => {
            // Draw token circle
            this.ctx.beginPath();
            
            // Different colors based on token type
            switch(token.type) {
                case 'player':
                    this.ctx.fillStyle = '#44aa44';
                    break;
                case 'enemy':
                    this.ctx.fillStyle = '#aa4444';
                    break;
                case 'npc':
                    this.ctx.fillStyle = '#4444aa';
                    break;
                default:
                    this.ctx.fillStyle = '#aa44aa';
            }
            
            // Highlight active token
            if (this.isActiveToken(token)) {
                this.ctx.shadowColor = '#ffff00';
                this.ctx.shadowBlur = 10;
            }
            
            const centerX = token.x + this.mapData.grid.size/2;
            const centerY = token.y + this.mapData.grid.size/2;
            
            this.ctx.arc(
                centerX,
                centerY,
                this.mapData.grid.size/2 - 5,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Reset shadow effect
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            
            // Draw token label
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(token.name, centerX, centerY + 4);
            
            // In play mode, show HP
            if (!this.mapData.editMode) {
                this.ctx.fillText(
                    `HP: ${token.hp || 0}`,
                    centerX,
                    centerY + 20
                );
            }
        });
    }

    renderFogOfWar() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.mapData.fogOfWar.forEach(fog => {
            this.ctx.fillRect(
                fog.x,
                fog.y,
                this.mapData.grid.size,
                this.mapData.grid.size
            );
        });
    }

    isActiveToken(token) {
        return this.mapData.activeCombatantIndex !== undefined && 
               this.mapData.initiative[this.mapData.activeCombatantIndex]?.id === token.id;
    }
}