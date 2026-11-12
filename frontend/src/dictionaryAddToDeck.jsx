

import { useState } from 'react';

export default function AddToDeck({ word }) {
    const [isOpen, setIsOpen] = useState(false);
    const [decks, setDecks] = useState([]);
    const [selectedDeckIds, setSelectedDeckIds] = useState([]);
    const [initialDeckIds, setInitialDeckIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    async function loadDecks() {
        setIsLoading(true);
        setError('');

        try {
            const decksResponse = await fetch('/api/deck');
            if (!decksResponse.ok) {
                throw new Error(`Failed to load decks (${decksResponse.status})`);
            }

            const deckList = await decksResponse.json();
            if (!Array.isArray(deckList)) {
                throw new Error('The deck response was not a list');
            }

            const memberships = await Promise.all(
                deckList.map(async (deck) => {
                    const response = await fetch(`/api/deck/${deck.id}/words`);
                    if (!response.ok) {
                        throw new Error(`Failed to load words for ${deck.name} (${response.status})`);
                    }

                    const words = await response.json();
                    if (!Array.isArray(words)) {
                        throw new Error(`The words response for ${deck.name} was not a list`);
                    }

                    return words.includes(word) ? deck.id : null;
                }),
            );
            const checkedDeckIds = memberships.filter((deckId) => deckId !== null);

            setDecks(deckList);
            setSelectedDeckIds(checkedDeckIds);
            setInitialDeckIds(checkedDeckIds);
            setIsOpen(true);
        } catch (loadError) {
            setError(loadError.message);
            setIsOpen(true);
        } finally {
            setIsLoading(false);
        }
    }

    function toggleDeck(deckId) {
        setSelectedDeckIds((current) => (
            current.includes(deckId)
                ? current.filter((id) => id !== deckId)
                : [...current, deckId]
        ));
    }

    async function saveDecks() {
        setIsSaving(true);
        setError('');

        const toAdd = selectedDeckIds.filter((deckId) => !initialDeckIds.includes(deckId));
        const toRemove = initialDeckIds.filter((deckId) => !selectedDeckIds.includes(deckId));

        try {
            const results = await Promise.all([
                ...toAdd.map((deckId) => fetch(`/api/deck/${deckId}/words`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ word }),
                })),
                ...toRemove.map((deckId) => fetch(`/api/deck/${deckId}/words`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ word }),
                })),
            ]);
            const failedResponse = results.find((response) => !response.ok);
            if (failedResponse) {
                throw new Error(`Failed to update deck membership (${failedResponse.status})`);
            }

            setIsOpen(false);
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="add-to-deck">
            <button type="button" className="add-button" onClick={loadDecks}>+</button>
            
            {isOpen && (
                <div className="deck-modal-backdrop" onClick={() => setIsOpen(false)}>
                    <section
                        className="deck-modal"
                        role="dialog"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="add-to-deck-title">Add to decks</h2>
                        {isLoading ? (
                            <p>Loading decks...</p>
                        ) : (
                            <>
                                {decks.length === 0 && !error && <p>You have no decks yet.</p>}
                                <ul>
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
                        {error && <p role="alert">{error}</p>}
                        <div className="deck-modal-actions">
                            <button type="button" onClick={() => setIsOpen(false)} disabled={isSaving}>
                                Cancel
                            </button>
                            <button type="button" onClick={saveDecks} disabled={isLoading || isSaving || Boolean(error)}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}