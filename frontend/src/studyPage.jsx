import { useEffect, useState } from 'react';
import QuizDecks from './quizDeckList.jsx';
import CreateDeck from './quizCreateDeck.jsx';
import './studyPage.css';

function StudyPage() {
    const {decks, loading, error} = useDecks();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (loading) return <Spinner />;
    if (error) return <ErrorMessage message="Couldn't load your decks." />;

    return (
        <main>
            <QuizDecks decks={decks} onAddClick={() => setIsModalOpen(true)} />
            <CreateDeck isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </main>
    );
}

export default StudyPage;