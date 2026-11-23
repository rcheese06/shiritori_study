import { useState } from 'react';
import './dictPage.css';
import KanjiEntry from './dictionaryKanjiEntry.jsx';
import WordEntry from './dictionaryWordEntry.jsx';
import DictionarySearchArea from './dictSearch.jsx';
import { useDictionarySearch } from './hooks/useDictSearch';

export default function DictPage() {
    const [query, setQuery] = useState('');
    const vocabSearch = useDictionarySearch('/api/dictionary/search');
    const kanjiSearch = useDictionarySearch('/api/dictionary/kanji');

    const [wordType, setWordType] = useState('vocab');
    const active = wordType === 'vocab' ? vocabSearch : kanjiSearch;
    const { results, error, isSearching, searched, search } = active;

    const errorMessages = {
        vocab: {
            empty: 'Search for a Japanese word by its reading or English meaning.',
            none:  'No matching words found.',
        },
        kanji: {
            empty: 'Search for a kanji by its character, reading or meaning.',
            none:  'No matching kanji found.',
        },
    };

    function handleSubmit(event) {
        event.preventDefault();
        search(query);
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
                        onClick={() => setWordType('vocab')}
                    >
                        Vocab
                    </button>
                    <button
                        id="kanji-search-tab"
                        type="button"
                        role="tab"
                        onClick={() => setWordType('kanji')}
                    >
                        Kanji
                    </button>
                </div>
                
                <form
                    className="dict-search-form"
                    onSubmit={handleSubmit}
                >
                    <DictionarySearchArea
                        wordType={wordType}
                        query={query}
                        setQuery={setQuery}
                        isSearching={isSearching}
                    />
                </form>

                {error && <p role="alert">{error}</p>}
                {isSearching && <p>Searching...</p>}
                {!isSearching && !error && results.length === 0 && (
                    <p>{searched ? errorMessages[wordType].none : errorMessages[wordType].empty}</p>
                )}

                <div className="dict-results">
                {/*show multiple entries*/}
                {results.map((entry, index) =>
                    wordType === 'vocab' ? (
                        <WordEntry
                            key={`${entry.expression}-${entry.reading}-${index}`}
                            word={entry.expression}
                            reading={entry.reading}
                            senses={entry.senses}
                        />
                        ) : (
                        <KanjiEntry
                            key={entry.literal}
                            kanji={entry.literal}
                            on={entry.on}
                            kun={entry.kun}
                            stroke={entry.stroke}
                            meanings={entry.meanings}
                        />
                    )
                )}
                </div>
            </div>
        </main>
    );
}