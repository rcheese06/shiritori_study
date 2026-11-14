import { useEffect, useState } from 'react';
import QuizDecks from './quizDecks.jsx';
import QuizDecksSettings from './quizDeckSettings.jsx';
import './studyPage.css';

function StudyPage() {
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [page, setPage] = useState('decks');
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        async function loadDecks() {
            try {
                const response = await fetch('/api/deck', { signal: controller.signal });
                if (!response.ok) {
                    throw new Error(`Failed to load decks (${response.status})`);
                }

                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error('The deck response was not a list');
                }

                setDecks(data);
            } catch (fetchError) {
                if (!controller.signal.aborted) {
                    setError(fetchError.message);
                }
            }
        }

        loadDecks();
        return () => controller.abort();
    }, []);

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