export default function DeckCard(id, deckName) {
    <div className="deck-card">
        <div className="deck-info">
            <h2>{deckName}</h2>
            //deck size - check ltr
            <span className="deck-term-numbers">
                {count} {count === 1 ? 'card' : 'cards'} per session · {deck.cards.length} in deck
            </span>
        </div>
        <div className="deck-buttons">
            <button onClick={() => onStudy(deck)}>
                Study
            </button>
            <button onClick={() => onAddTerms(deck)}>
                Add Terms
            </button>
            <button onClick={() => onSettings(deck)}>
                Settings
            </button>
        </div>
    </div>
}