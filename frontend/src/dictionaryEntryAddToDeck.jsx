import { useState } from 'react';
import { useCurrentDeck, useDecks } from './hooks/useDecks.js';
import './dictPage.css';

export default function AddToDeck({ word, type, modal }) {
    const { decks, loading, error, addWord } = useDecks();
    const {deck} = useCurrentDeck();
    const [isModalOpen, setIsModalOpen] = useState(modal);
    const [selectedDeckIds, setSelectedDeckIds] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [isAdded, setIsAdded] = useState(false);

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

    async function addWordToDeck() {
        try{
            await addWord(deck.id, word);
            console.log(`added ${word} to deck ${deck.id}`);
            return true;
        } catch (err) {
            setSaveError(err.message);
            return false;
        }
    }

    return (
        <div className="add-to-deck">
            {/* modal does not exist (add terms to deck page) */}
            {isModalOpen == undefined && (
                <button
                    type="button"
                    className="add-words-button primary-button"
                    disabled={!deck || isAdded}
                    onClick={async () => {
                        setSaveError('');
                        await addWordToDeck();
                        setIsAdded(true);
                    }}
                >
                    {isAdded ? '✓' : '+'}
                </button>
            )}

            {/* modal exists (dict page) */}
            {isModalOpen == false && (
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
            )}
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
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        {loading ? (
                            <p>Loading decks...</p>
                        ) : (
                            <>
                                {decks.length === 0 && !error && <p>You have no decks yet.</p>}
                                <ul className="list-of-decks">
                                    {decks
                                    .filter((deck) => deck.type == type)
                                    .map((deck) => (
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
                        {error && <p role="alert">Couldn't load your decks.</p>} {/* deck error */}
                        {saveError && <p role="alert">{saveError}</p>} {/* saving error */}
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