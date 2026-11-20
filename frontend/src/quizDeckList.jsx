import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecks } from './hooks/useDecks';
import CreateDeck from './quizCreateDeck';
import DeckCard from './quizDeckCard';
import './studyPage.css';

export default function QuizDecks() {
    const { decks, loading, error, addDeck } = useDecks();
    console.log({ decks, loading, error });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    async function onAddDeck(name) {
        const deck = await addDeck(name);
        setIsModalOpen(false);
        navigate(`/study/${deck.id}/add-terms`);
    }

    if (loading) return <p>Loading…</p>;
    if (error) return <p>Couldn't load your decks.</p>;

    return (
        <div className="quiz-page">
            <header className="page-header">
                <h1>Study Decks</h1>
            </header>
            <ul className="deck-list">
                {decks.map((deck) => (
                    <li key={deck.id}>
                        <DeckCard deck={deck}/>
                    </li>
                ))}
            </ul>
            
            <button className="primary-button" onClick={() => setIsModalOpen(true)}>+</button>

            {isModalOpen && (
                <CreateDeck
                    onSubmit={onAddDeck}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}