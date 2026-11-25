import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecks, useCurrentDeck } from './hooks/useDecks';
import DictSearch from "./dictSearchArea.jsx"
import './studyPage.css';
import './dictPage.css';

export default function EditDeck() {
    const {deck, loading, error } = useCurrentDeck();
    const { addTerm, removeTerm } = useDecks();
    const navigate = useNavigate();

    const terms = deck?.terms ?? [];

    if (loading) return <p>Loading…</p>;
    if (error) return <p>Couldn't load your deck.</p>;
    if (!deck) return <p>Deck not found.</p>;

    function onBack() {
        navigate(`/study`);
    }

    return (
        <div className="edit-page">
            {/* top half of page */}
            <button className="icon-button" onClick={onBack}><i class="bi bi-arrow-left"></i></button>
            <div className="edit-header">
                <div className="edit-deck-info">
                    <h3>Deck Name: {deck.name}</h3>
                    <p>{/*size*/} terms added</p>
                </div>
                <div className="button-pair">
                    <button className="primary-button" type="submit">Save Changes</button>
                    <button className="secondary-button" type="reset">Discard Changes</button>
                </div>
            </div>

            {/* buttom half of page */}
            <div className="edit-contents">
                {/* add new terms */}
                <DictSearch 
                    fixedWordType={deck.type}
                    renderAction={({ kind, entryId }) => (
                        <button onClick={() => addTerm(deck.id, kind, entryId)}>Add</button>
                    )}
                />
               
                {/* list of existing terms */}
                <div className="edit-added-terms">
                    {terms.length === 0 ? (
                        <p>This deck has no terms yet.</p>
                    ) : (
                        <ul>
                        {terms.map((term) => (
                            <li key={term.id}>
                            {term.entryId}
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}