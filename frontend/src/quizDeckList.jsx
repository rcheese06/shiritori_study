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

    async function onAddDeck(name, type) {
        const deck = await addDeck(name, type);
        setIsModalOpen(false);
        navigate(`/study/${deck.id}/add-terms`);
    }

    if (loading) return <p>Loading…</p>;
    if (error) return <p>Couldn't load your decks.</p>;

    return (
        <div>
            <ul className="deck-list">
                {decks.map((deck) => (
                    <li key={deck.id}>
                        <DeckCard deck={deck} />
                    </li>
                ))}
                <div className="add-deck-button-wrapper">
                    <button className="primary-button" onClick={() => setIsModalOpen(true)}>+</button>
                </div>
            </ul>
            
            {isModalOpen && (
                <CreateDeck
                    onSubmit={onAddDeck}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}