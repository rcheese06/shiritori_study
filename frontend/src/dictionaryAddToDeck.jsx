

import { useState } from 'react';
import { useDecks } from './hooks/useDecks.js';

export default function AddToDeck({ word }) {
    const { decks, loading, error, addWord } = useDecks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeckIds, setSelectedDeckIds] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    function toggleDeck(deckId) {
        setSelectedDeckIds((current) => (
            current.includes(deckId)
                ? current.filter((id) => id !== deckId)
                : [...current, deckId]
        ));
    }

    async function addWordToSelectedDecks() {
        if (selectedDeckIds.length === 0 || isSaving) return;

        setIsSaving(true);
        setSaveError('');

        const results = await Promise.allSettled(
            selectedDeckIds.map((deckId) => addWord(deckId, word))
        );
        const failedDeckIds = selectedDeckIds.filter(
            (_, index) => results[index].status === 'rejected'
        );

        if (failedDeckIds.length > 0) {
            const failedNames = failedDeckIds
                .map((deckId) => decks.find((deck) => deck.id === deckId)?.name ?? deckId)
                .join(', ');
            setSelectedDeckIds(failedDeckIds);
            setSaveError(`Could not add the word to: ${failedNames}.`);
        } else {
            setSelectedDeckIds([]);
            setIsModalOpen(false);
        }

        setIsSaving(false);
    }

    return (
        <div className="add-to-deck">
            <button
                type="button"
                className="add-words-button primary-button"
                onClick={() => {
                    setSaveError('');
                    setIsModalOpen(true);
                }}
            >
                +
            </button>
            
            {isModalOpen && (
            <div>
                <div className="modal-bg" onClick={() => setIsModalOpen(false)}></div>
                <div className="add-words-modal">
                    <form onSubmit={addWordToSelectedDecks}>
                        <div className="add-words-modal-header">
                            <h5 id="add-to-deck-title">Add to decks</h5>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isSaving}
                                className="icon-button cancel-button"
                            >
                                ✕
                            </button>
                        </div>
                        {loading ? (
                            <p>Loading decks...</p>
                        ) : (
                            <>
                                {decks.length === 0 && !error && <p>You have no decks yet.</p>}
                                <ul className="list-of-decks">
                                    {decks.map((deck) => (
                                        <li key={deck.id}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDeckIds.includes(deck.id)}
                                                    onChange={() => toggleDeck(deck.id)}
                                                    disabled={isSaving}
                                                />
                                                {deck.name}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {error && <p role="alert">{error.message}</p>}
                        {saveError && <p role="alert">{saveError}</p>}
                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading || isSaving || selectedDeckIds.length === 0 || Boolean(error)}
                        >
                            {isSaving ? 'Adding...' : 'Add to Decks'}
                        </button>
                    </form>
                </div>
            </div>
            )}
        </div>
    );
}