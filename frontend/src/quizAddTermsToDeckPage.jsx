import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecks, useCurrentDeck } from './hooks/useDecks';
import DictSearch from "./dictSearchArea.jsx"
import './studyPage.css';
import './dictPage.css';

export default function EditDeck() {
    const {deck, loading, error } = useCurrentDeck();
    const { deleteWord } = useDecks();
    const navigate = useNavigate();

    if (loading) return <p>Loading…</p>;
    if (error) return <p>Couldn't load your deck.</p>;
    if (!deck) return <p>Deck not found.</p>;

    const terms = deck.terms;

    async function deleteWordFromDeck(word) {
        try{
            await deleteWord(deck.id, word);
            console.log(`deleted ${word} from deck ${deck.id}`);
            //remove frontend entry
            return true;
        } catch (err) {
            return false;
        }
    }

    function onBack() {
        navigate(`/study`);
    }

    return (
        <div className="edit-page">
            {/* top half of page */}
            <button className="icon-button" onClick={onBack}><i className="bi bi-arrow-left"></i></button>
            <div className="edit-header">
                <div className="edit-deck-info">
                    <h3>Deck Name: {deck.name}</h3>
                    <p>{deck.length} {deck.length === 1 ? 'term' : 'terms'} added</p>
                </div>
                <div className="button-pair">
                    <button className="primary-button" type="submit">Save Changes</button>
                    <button className="secondary-button" type="reset">Discard Changes</button>
                </div>
            </div>

            {/* buttom half of page */}
            <div className="edit-contents">
                {/* add new terms */}
                <DictSearch fixedWordType={deck.type}/>
               
                {/* list of existing terms */}
                <div className="edit-added-terms">
                    <h5>Added Terms</h5>
                    {terms.length === 0 ? (
                        <p>This deck has no terms yet.</p>
                    ) : (
                        <ul>
                        {terms.map((term) => (
                            <li key={term.id} className="term-list-items">
                            {term.word}
                            <i className="bi bi-trash3" onClick={async () => await deleteWordFromDeck(term.word)}></i>
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}