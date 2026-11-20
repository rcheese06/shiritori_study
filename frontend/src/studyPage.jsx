import { useEffect, useState } from 'react';
import QuizDecks from './quizDeckList.jsx';
import CreateDeck from './quizCreateDeck.jsx';
import {useDecks, useCurrentDeck} from './hooks/useDecks';
import './studyPage.css';

function StudyPage() {
    const {decks, loading, error} = useDecks();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (loading) return <p>Loading…</p>;
    if (error) return <p>Couldn't load your decks.</p>;

    return (
        <main>
            <QuizDecks decks={decks} onAddClick={() => setIsModalOpen(true)} />
            <CreateDeck isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </main>
    );
}

export default StudyPage;