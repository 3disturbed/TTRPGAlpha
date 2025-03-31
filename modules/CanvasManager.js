export default class CanvasManager {
    constructor(canvas, mapData) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mapData = mapData;
    }

    resizeCanvas(width, height) {
        if (width && height) {
            this.canvas.width = width;
            this.canvas.height = height;
        } else {
            this.canvas.width = window.innerWidth - 500; // Account for both sidebars
            this.canvas.height = window.innerHeight - 100; // Account for header/footer
        }
        this.drawGrid();
    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = this.mapData.grid.color;
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= this.canvas.width; x += this.mapData.grid.size) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= this.canvas.height; y += this.mapData.grid.size) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    getGridPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left + window.scrollX;
        const y = clientY - rect.top + window.scrollY;
        return {
            x: Math.floor(x / this.mapData.grid.size) * this.mapData.grid.size,
            y: Math.floor(y / this.mapData.grid.size) * this.mapData.grid.size
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}