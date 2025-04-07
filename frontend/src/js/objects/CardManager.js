import { BUILDINGS, CARD_TYPES, DECK_COMPOSITION, MAX_CARD_SLOTS } from '../config/game-data';

export default class CardManager {
    constructor(scene) {
        this.scene = scene;
        this.deck = [];
        this.hand = [];
        this.discardPile = [];
        
        // Initialize the deck with cards
        this.initializeDeck();
        this.shuffleDeck();
    }
    
    // Create the initial deck with cards based on DECK_COMPOSITION
    initializeDeck() {
        this.deck = [];
        
        // Add cards based on the DECK_COMPOSITION configuration
        Object.entries(DECK_COMPOSITION).forEach(([cardId, count]) => {
            // Find the card definition
            const cardType = Object.values(CARD_TYPES).find(c => c.id === cardId);
            
            // Skip if card not found
            if (!cardType) {
                console.warn(`Card type ${cardId} not found in CARD_TYPES configuration.`);
                return;
            }
            
            // Add the specified number of copies to the deck
            for (let i = 0; i < count; i++) {
                this.deck.push({
                    type: 'building',
                    cardType: cardType,
                    building: cardType.buildingId ? BUILDINGS[Object.keys(BUILDINGS).find(key => 
                        BUILDINGS[key].id === cardType.buildingId
                    )] : null
                });
            }
        });
        
        // If the deck is empty (e.g., if DECK_COMPOSITION is invalid),
        // fall back to the default deck creation logic
        if (this.deck.length === 0) {
            console.warn('Deck composition is empty or invalid. Using default deck.');
            this.createDefaultDeck();
        }
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
            
            // Check if hand size would exceed maximum slots available in UI
            if (this.hand.length >= MAX_CARD_SLOTS) {
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