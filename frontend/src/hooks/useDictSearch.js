import { useState } from 'react';
import { searchDictionary } from '../services/dictAPI';

export function useDictionarySearch(endpoint) {
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searched, setSearched] = useState(false);

    async function search(query) {
        const text = query.trim();
        if (!text) {
            setError('Enter a search term.');
            setResults([]);
            return;
        }
        setIsSearching(true);
        setError('');
        setResults([]);
        try {
            setResults(await searchDictionary(endpoint, text));
            setSearched(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    }

    return { results, error, isSearching, searched, search };
}