import CreateDeck from './quizCreateDeck';
import DeckCard from './quizDeckCard';
import './studyPage.css';

export default function QuizDecks({decks}) {
    function onAddDeck() {
        <CreateDeck
            name={deckName}
            setName={setName}
            />
    }

    return (
        <div className="quiz-page">
            <header className="page-header">
                <h1>Study Decks</h1>
            </header>
            <ul className="deck-list">
                {decks.map((deck) => (
                    <li key={deck.id}>
                        <DeckCard
                            id={deck.id}
                            deckName = {deck.name}
                            />
                    </li>
                ))}
            </ul>
            
            <button className="primary-button" onClick={() => onAddDeck()}>+</button>
        </div>
    );
}