import { createContext, useEffect, useState } from 'react';
import * as deckAPI from '../services/deckAPI';

//context
const DecksContext = createContext(null);
export default DecksContext;

export function DecksProvider({children}) {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    let cancelled = false;

    async function load() {
        try {
            const data = await deckAPI.listDecks();
            if (!cancelled) setDecks(data);
        } catch (err) {
            console.error('listDecks failed:', err);
            if (!cancelled) setError(err);
        } finally {
            if (!cancelled) setLoading(false);
        }
    }

    load();
    return () => { cancelled = true; };   
    }, []);  

    function updateDeck(saved) {
        setDecks(prev => prev.map(d => (d.id === saved.id ? saved : d)));
    }

    async function addDeck(name, type) {
        const deck = await deckAPI.createDeck(name, type);
        setDecks(prev => [...prev, deck]);
        return deck;
    }

    async function editDeck(id, changes) {
        const saved = await deckAPI.editDeck(id, changes);
        updateDeck(saved);
        return saved
    }

    async function deleteDeck(id, word) {
        await deckAPI.deleteDeck(id);
        setDecks(prev => prev.filter(d => d.id !== id));
    }

    async function addWord(id, word) {
        const saved = await deckAPI.addWord(id, word);
        updateDeck(saved);
        return saved
    }

    async function deleteWord(id, word) {
        const saved = await deckAPI.deleteWord(id, word);
        updateDeck(saved);
        return saved
    }

  const value = {decks, loading, error, addDeck, editDeck, deleteDeck, addWord, deleteWord};

  return <DecksContext.Provider value={value}>{children}</DecksContext.Provider>;
}