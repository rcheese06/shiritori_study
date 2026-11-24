import {useEffect, useState, useContext} from 'react';
import {useParams} from 'react-router-dom';
import DecksContext from '../context/DecksContext';

export function useDecks() {
    const context = useContext(DecksContext);
    if (!context) {
        throw new Error('useDecks must be used inside <DecksProvider>');
    }
    return context;
}

export function useCurrentDeck() {
    const {deckId} = useParams();
    const {decks, loading, error, getDeck} = useDecks();
    const [loadError, setLoadError] = useState(null);

    const deck = decks.find(d => String(d.id) === deckId);
    const needsTerms = Boolean(deck) && deck.terms === undefined;

    useEffect(() => {
        if (!needsTerms) return;
        getDeck(deck.id)
        .then(() => console.log('loadDeck resolved'))
        .catch(err => {
            console.log('getDeck failed:', err);
            setLoadError(err);
        });
    }, [needsTerms, deck?.id]);

    console.log({ deck, needsTerms, loadError });
    return {
        deck, 
        loading: loading || (needsTerms && !loadError),
        error: error || loadError,
    };
}