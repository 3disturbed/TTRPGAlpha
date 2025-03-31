export class DiceResult {
    constructor(rolls, modifier = 0) {
        this.rolls = rolls;
        this.modifier = modifier;
        this.total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
    }

    toString() {
        const rollsStr = this.rolls.join(', ');
        const modStr = this.modifier !== 0 
            ? ` ${this.modifier > 0 ? '+' : ''}${this.modifier}` 
            : '';
        return `${this.total} (${rollsStr}${modStr})`;
    }
}

export default class DiceRoller {
    static rollDice(count, sides) {
        const rolls = [];
        for (let i = 0; i < count; i++) {
            rolls.push(Math.floor(Math.random() * sides) + 1);
        }
        return rolls;
    }

    static roll(diceType, count = 1, modifier = 0) {
        const sides = parseInt(diceType.substring(1));
        if (isNaN(sides)) throw new Error('Invalid dice type');
        
        const rolls = this.rollDice(count, sides);
        return new DiceResult(rolls, modifier);
    }

    static parseExpression(expression) {
        const regex = /(\d+)[dD](\d+)(?:([-+])(\d+))?/;
        const match = expression.match(regex);
        
        if (!match) {
            throw new Error('Invalid dice expression. Please use format like "2d6+3".');
        }
        
        const count = parseInt(match[1]);
        const sides = parseInt(match[2]);
        const hasModifier = match[3] !== undefined;
        const modifierSign = match[3] === '+' ? 1 : -1;
        const modifier = hasModifier ? parseInt(match[4]) * modifierSign : 0;
        
        return this.roll(`d${sides}`, count, modifier);
    }

    static rollAttribute(score) {
        const modifier = Math.floor((score - 10) / 2);
        const rolls = this.rollDice(1, 20);
        return new DiceResult(rolls, modifier);
    }
}