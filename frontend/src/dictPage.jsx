import { useState } from 'react';
import './dictPage.css';
import KanjiEntry from './dictionaryKanjiEntry.jsx';
import WordEntry from './dictionaryWordEntry.jsx';
import DictionarySearchArea from './dictSearch.jsx';

export default function DictPage() {
    const [activeTab, setActiveTab] = useState('word');
    const [wordQuery, setWordQuery] = useState('');
    const [kanjiQuery, setKanjiQuery] = useState('');
    const [wordResults, setWordResults] = useState([]);
    const [kanjiResults, setKanjiResults] = useState([]);
    const [wordSearched, setWordSearched] = useState(false);
    const [kanjiSearched, setKanjiSearched] = useState(false);
    const [wordError, setWordError] = useState('');
    const [kanjiError, setKanjiError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    
    async function searchDictionary(event, query, endpoint, setResults, setError) {
        event.preventDefault();
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
            const response = await fetch(`${endpoint}?text=${encodeURIComponent(text)}`);
            if (!response.ok) {
                throw new Error(`Search failed (${response.status})`);
            }

            const results = await response.json();
            console.log(results);
            if (!Array.isArray(results)) {
                throw new Error('The search response was not a list.');
            }

            setResults(results);
        } catch (searchError) {
            setError(searchError.message);
        } finally {
            setIsSearching(false);
        }
    }

    return (
        <main className="dict-page">
            <header className="page-header">
                <h1>Dictionary</h1>
            </header>
            <div className="dict-search-area">
                <div className="dict-tabs" role="tablist">
                    <button
                        id="word-search-tab"
                        type="button"
                        role="tab"
                        onClick={() => setActiveTab('word')}
                    >
                        Vocab
                    </button>
                    <button
                        id="kanji-search-tab"
                        type="button"
                        role="tab"
                        onClick={() => setActiveTab('kanji')}
                    >
                        Kanji
                    </button>
                </div>

                {activeTab === 'word' ? (
                    //vocab tab
                    <section id="word-search-panel" className="search-section" role="tabpanel">
                        <form
                            className="dict-search-form"
                            onSubmit={(event) => searchDictionary(
                                event,
                                wordQuery,
                                '/api/dictionary/search',
                                setWordResults,
                                setWordError,
                                setWordSearched
                            )}
                        >
                            <DictionarySearchArea
                                wordType="vocabulary"
                                query={wordQuery}
                                setQuery={setWordQuery}
                                isSearching={isSearching}
                            />
                        </form>
                        {wordError && <p role="alert">{wordError}</p>}
                        {isSearching && <p>Searching...</p>}
                        {!isSearching && !wordError && wordResults.length === 0 && (
                            <p>
                                {wordSearched
                                    ? 'No matching words found.'
                                    : 'Search for a Japanese word or an using its reading or its english meaning.'}
                            </p>
                        )}
                        <div className="dict-results">
                            {/*show multiple entries*/}
                            {wordResults.map((entry, index) => (
                                <WordEntry
                                    key={`${entry.expression}-${entry.reading}-${index}`}
                                    word={entry.expression}
                                    reading={entry.reading}
                                    senses={entry.senses}
                                />
                            ))}
                        </div>
                    </section>
                ) : (
                    //kanji tab
                    <section id="kanji-search-panel" className="search-section" role="tabpanel">
                        <form
                            className="dict-search-form"
                            onSubmit={(event) => searchDictionary(
                                event,
                                kanjiQuery,
                                '/api/dictionary/kanji',
                                setKanjiResults,
                                setKanjiError,
                                setKanjiSearched
                            )}
                        >
                            <DictionarySearchArea
                                wordType="kanji"
                                query={kanjiQuery}
                                setQuery={setKanjiQuery}
                                isSearching={isSearching}
                            />
                        </form>
                        {kanjiError && <p role="alert">{kanjiError}</p>}
                        {isSearching && <p>Searching...</p>}
                        {!isSearching && !kanjiError && kanjiResults.length === 0 && (
                            <p>
                                {kanjiSearched
                                    ? 'No matching kanji found.'
                                    : 'No results found. Enter one or more kanji to look them up.'}
                            </p>
                        )}
                        <div className="dict-results">
                            {kanjiResults.map((entry) => (
                                <KanjiEntry
                                    key={entry.literal}
                                    kanji={entry.literal}
                                    on={entry.on}
                                    kun={entry.kun}
                                    stroke={entry.stroke}
                                    meanings={entry.meanings}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}