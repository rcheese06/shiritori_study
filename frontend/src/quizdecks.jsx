import {shuffler} from './utils/quiz';

export default function QuizDecks({ decks, onStudy, onSettings }) {
    return (
        <div className="quiz-page">
            <header className="page-header">
                <h1>Study Decks</h1>
            </header>
            <ul className="deck-list">
                {decks.map((deck) => (
                    <li key={deck.id}>
                        <div className="deck-info">
                            <h2>{deck.name}</h2>
                            <p>{deck.size}</p>
                            {/* <span className="deck-meta">
                            {count} {count === 1 ? 'card' : 'cards'} per session · {deck.cards.length} in deck
                            </span> */}
                        </div>
                        <div className="deck-buttons">
                            <button onClick={() => onStudy(deck)}>
                                Study
                            </button>
                            <button onClick={() => onSettings(deck)}>
                                Settings
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="add-deck">
                <button onClick={() => onAddDeck()}>Add Deck</button>
            </div>
        </div>
    );
}