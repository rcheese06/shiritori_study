import { useEffect, useState } from 'react';
import QuizDecks from './quizDeckList.jsx';
import QuizDecksSettings from './quizDeckSettings.jsx';
import './studyPage.css';

function StudyPage() {
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [page, setPage] = useState('decks');

    return (
        <main>
        {error && <p role="alert">{error}</p>}
        {page === 'decks' && (
            <QuizDecks
            decks={decks}
            onSettings={(deck) => {
                setSelectedDeck(deck);
                setPage('settings');
            }}
            />
        )}
        {page === 'settings' && selectedDeck && (
            <QuizDecksSettings
            deck={selectedDeck}
            onBackToHome={() => setPage('decks')}
            />
        )}
        </main>
    );
}

export default StudyPage;