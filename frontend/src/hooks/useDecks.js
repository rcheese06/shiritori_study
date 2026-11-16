import useContext from 'react';
import useParams from 'react-router-dom';
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
    const {decks, loading, error} = useDecks();
    const deck = decks.find(d => String(d.id) === deckId);
    return {deck, loading, error};
}