export default class TokenManager {
    constructor(mapData) {
        this.mapData = mapData;
    }

    addToken(tokenData) {
        const newToken = {
            id: Date.now().toString(),
            ...tokenData,
            attributes: tokenData.attributes || {
                str: 10,
                dex: 10,
                con: 10,
                int: 10,
                wis: 10,
                cha: 10
            },
            notes: tokenData.notes || ''
        };

        this.mapData.initiative.push(newToken);
        return newToken;
    }

    duplicateToken(tokenId) {
        const token = this.mapData.initiative.find(t => t.id === tokenId);
        if (!token) return null;

        return this.addToken({
            ...token,
            name: `${token.name} (Copy)`
        });
    }

    placeToken(tokenId, x, y) {
        const tokenData = this.mapData.initiative.find(token => token.id === tokenId);
        if (!tokenData) return false;

        const existingTokenIndex = this.mapData.tokens.findIndex(token => token.id === tokenId);
        
        if (existingTokenIndex !== -1) {
            this.mapData.tokens[existingTokenIndex].x = x;
            this.mapData.tokens[existingTokenIndex].y = y;
        } else {
            this.mapData.tokens.push({
                ...tokenData,
                x,
                y
            });
        }
        
        return true;
    }

    updateToken(tokenId, updates) {
        const initiativeIndex = this.mapData.initiative.findIndex(t => t.id === tokenId);
        if (initiativeIndex === -1) return false;

        this.mapData.initiative[initiativeIndex] = {
            ...this.mapData.initiative[initiativeIndex],
            ...updates
        };

        // Update token on map if it exists
        const mapTokenIndex = this.mapData.tokens.findIndex(t => t.id === tokenId);
        if (mapTokenIndex !== -1) {
            this.mapData.tokens[mapTokenIndex] = {
                ...this.mapData.tokens[mapTokenIndex],
                ...updates
            };
        }

        return true;
    }

    getToken(tokenId) {
        return this.mapData.initiative.find(t => t.id === tokenId);
    }

    removeToken(tokenId) {
        this.mapData.initiative = this.mapData.initiative.filter(t => t.id !== tokenId);
        this.mapData.tokens = this.mapData.tokens.filter(t => t.id !== tokenId);
    }
}