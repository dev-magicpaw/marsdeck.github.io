import { BUILDINGS, MAX_HAND_SIZE } from '../config/game-data';

export default class CardManager {
    constructor(scene) {
        this.scene = scene;
        this.deck = [];
        this.hand = [];
        this.discardPile = [];
        
        // Initialize the deck with building cards
        this.initializeDeck();
        this.shuffleDeck();
    }
    
    // Create the initial deck with multiple copies of each building card
    initializeDeck() {
        this.deck = [];
        
        // Add multiple copies of each building
        Object.values(BUILDINGS).forEach(building => {
            // The number of copies depends on the rarity/importance
            // For prototype, add 2-3 copies of each building
            const numCopies = building.id === 'launchPad' ? 1 : 3;
            
            for (let i = 0; i < numCopies; i++) {
                this.deck.push({
                    type: 'building',
                    building: building
                });
            }
        });
    }
    
    // Shuffle the deck using Fisher-Yates algorithm
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    // Draw a specified number of cards from the deck to hand
    drawCards(count = 1) {
        const drawnCards = [];
        
        for (let i = 0; i < count; i++) {
            // If deck is empty, reshuffle discard pile into deck
            if (this.deck.length === 0) {
                if (this.discardPile.length === 0) {
                    break; // No more cards to draw
                }
                
                this.deck = [...this.discardPile];
                this.discardPile = [];
                this.shuffleDeck();
            }
            
            // Check if hand size would exceed maximum
            if (this.hand.length >= MAX_HAND_SIZE) {
                break;
            }
            
            const card = this.deck.pop();
            this.hand.push(card);
            drawnCards.push(card);
        }
        
        return drawnCards;
    }
    
    // Discard a card from hand
    discardCard(cardIndex) {
        if (cardIndex < 0 || cardIndex >= this.hand.length) {
            return null;
        }
        
        const [discardedCard] = this.hand.splice(cardIndex, 1);
        this.discardPile.push(discardedCard);
        
        return discardedCard;
    }
    
    // Play a card from hand (removes it from hand)
    playCard(cardIndex) {
        if (cardIndex < 0 || cardIndex >= this.hand.length) {
            return null;
        }
        
        const [playedCard] = this.hand.splice(cardIndex, 1);
        return playedCard;
    }
    
    // Get a card from hand without removing it
    getCardFromHand(cardIndex) {
        if (cardIndex < 0 || cardIndex >= this.hand.length) {
            return null;
        }
        
        return this.hand[cardIndex];
    }
    
    // Get the current hand
    getHand() {
        return [...this.hand];
    }
    
    // Get counts of cards in different areas
    getCardCounts() {
        return {
            deck: this.deck.length,
            hand: this.hand.length,
            discardPile: this.discardPile.length
        };
    }
} 