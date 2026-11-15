

import { useState } from 'react';

export default function AddToDeck({ word }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDeckIds, setSelectedDeckIds] = useState([]);

    function toggleDeck(deckId) {
        setSelectedDeckIds((current) => (
            current.includes(deckId)
                ? current.filter((id) => id !== deckId)
                : [...current, deckId]
        ));
    }

    return (
        <div className="add-to-deck">
            <button type="button" className="primary-button" onClick={loadDecks}>+</button>
            
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