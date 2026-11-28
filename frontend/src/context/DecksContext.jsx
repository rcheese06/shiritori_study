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
        //setDecks(prev => prev.map(d => (d.id === saved.id ? saved : d))); //replace
        setDecks(prev => prev.map(d => (d.id === saved.id ? { ...d, ...saved } : d))); //merge
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

    async function deleteDeck(id) {
        await deckAPI.deleteDeck(id);
        setDecks(prev => prev.filter(d => d.id !== id));
    }

    async function getDeck(id) {
        const deck = await deckAPI.getDeck(id);
        updateDeck(deck);
        return deck
    }

    async function addWord(id, word) {
        await deckAPI.addWord(id, word);
        return getDeck(id);
    }

    async function deleteWord(id, word) {
        await deckAPI.deleteWord(id, word);
        return getDeck(id);
    }

  const value = {decks, loading, error, addDeck, editDeck, deleteDeck, getDeck, addWord, deleteWord};

  return <DecksContext.Provider value={value}>{children}</DecksContext.Provider>;
}