import { BUILDINGS, CARD_TYPES, DECK_COMPOSITION, MAX_CARD_SLOTS, REWARDS, STARTING_HAND } from '../config/game-data';

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
            this.addCardToDeck(cardId, count);
        });
        
        // Apply deck cards from rewards if rewards manager exists
        if (this.scene.rewardsManager) {
            const rewardCards = this.scene.rewardsManager.getDeckRewardCards();
            Object.entries(rewardCards).forEach(([cardId, count]) => {
                this.addCardToDeck(cardId, count);
            });
        }
        
        // If the deck is empty (e.g., if DECK_COMPOSITION is invalid),
        // fall back to the default deck creation logic
        if (this.deck.length === 0) {
            console.warn('Deck composition is empty or invalid. Using default deck.');
            this.createDefaultDeck();
        }
    }
    
    // Find a reward by ID across all categories
    findRewardById(rewardId) {
        // Search in all reward categories
        const allCategories = [
            REWARDS.STARTING_HAND_REWARDS,
            REWARDS.DECK_CARDS_REWARDS,
            REWARDS.BUILDING_UPGRADE_REWARDS
        ];
        
        for (const category of allCategories) {
            for (const key in category) {
                if (category[key].id === rewardId) {
                    return category[key];
                }
            }
        }
        
        return null;
    }
    
    // Helper method to add cards to the deck
    addCardToDeck(cardId, count) {
        // Find the card definition
        const cardType = Object.values(CARD_TYPES).find(c => c.id === cardId);
        
        // Skip if card not found
        if (!cardType) {
            console.warn(`Card type ${cardId} not found in CARD_TYPES configuration.`);
            return;
        }
        
        // Determine the card type (building or event)
        const cardTypeString = cardType.cardType === 'event' ? 'event' : 'building';
        
        // Add the specified number of copies to the deck
        for (let i = 0; i < count; i++) {
            // Create a card object
            const card = {
                type: cardTypeString,
                cardType: cardType
            };
            
            // Add building reference only for building cards
            if (cardTypeString === 'building' && cardType.buildingId) {
                card.building = Object.values(BUILDINGS).find(b => b.id === cardType.buildingId);
            }
            
            this.deck.push(card);
        }
    }
    
    // Fallback method to create a default deck if DECK_COMPOSITION is invalid
    createDefaultDeck() {
        // Add one of each card type defined in CARD_TYPES
        Object.values(CARD_TYPES).forEach(cardType => {
            // Determine the card type (building or event)
            const cardTypeString = cardType.cardType === 'event' ? 'event' : 'building';
            
            // Create the card object
            const card = {
                type: cardTypeString,
                cardType: cardType
            };
            
            // Add building reference only for building cards
            if (cardTypeString === 'building' && cardType.buildingId) {
                card.building = Object.values(BUILDINGS).find(b => b.id === cardType.buildingId);
            }
            
            this.deck.push(card);
        });
    }
    
    // Shuffle the deck using Fisher-Yates algorithm
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    shuffleDiscardIntoDeck() {
        this.deck = [...this.discardPile];
        this.discardPile = [];
        this.shuffleDeck();
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
    
    // Set up specific starting cards for the player
    setupStartingHand() {
        // Clear any cards that might be in the hand
        this.hand = [];
        const startingHandSize = 4; // Total cards we want in starting hand
        
        // Add cards specified in STARTING_HAND configuration
        const startingCards = [];
        
        // 1. Collect all cards that should be in the starting hand from base config
        Object.entries(STARTING_HAND).forEach(([cardId, shouldInclude]) => {
            if (shouldInclude) {
                this.addCardToStartingCards(cardId, startingCards);
            }
        });
        
        // 2. Add cards from Starting hand rewards if rewards manager exists
        if (this.scene.rewardsManager) {
            const rewardCardIds = this.scene.rewardsManager.getStartingHandRewardCards();
            rewardCardIds.forEach(cardId => {
                this.addCardToStartingCards(cardId, startingCards);
            });
        }
        
        // Add the starting cards to hand
        startingCards.forEach(card => {
            this.hand.push(card);
        });
        
        // 3. Draw remaining random cards to complete starting hand
        this.drawCards(startingHandSize - startingCards.length);
    }
    
    // Helper method to add a card to starting cards array
    addCardToStartingCards(cardId, startingCards) {
        // Find the card definition by ID
        const cardType = Object.values(CARD_TYPES).find(c => c.id === cardId);
        if (cardType) {
            // Determine the card type (building or event)
            const cardTypeString = cardType.cardType === 'event' ? 'event' : 'building';
            
            // Create the card object
            const card = {
                type: cardTypeString,
                cardType: cardType
            };
            
            // Add building reference only for building cards
            if (cardTypeString === 'building' && cardType.buildingId) {
                card.building = Object.values(BUILDINGS).find(b => b.id === cardType.buildingId);
            }
            
            startingCards.push(card);
        }
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