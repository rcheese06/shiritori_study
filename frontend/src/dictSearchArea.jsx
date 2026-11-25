import { useState } from 'react';
import './dictPage.css';
import KanjiEntry from './dictionaryKanjiEntry.jsx';
import WordEntry from './dictionaryWordEntry.jsx';
import DictionarySearchArea from './dictSearchBar.jsx';
import { useDictionarySearch } from './hooks/useDictSearch.js';

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

export default function DictSearch({fixedWordType, renderAction}) {
    console.log(!fixedWordType);
    //selected type is a kind of word type
    const [selectedType, setSelectedType] = useState('vocab');
    const [query, setQuery] = useState('');
    //fixed word type is for when this component is used in the edit deck page
    //non-fixed is for the actual dictionary
    //const hasFixedWordType = fixedWordType !== undefined && fixedWordType !== null;
    const wordType = fixedWordType ?? selectedType;

    const vocabSearch = useDictionarySearch('/api/dictionary/search');
    const kanjiSearch = useDictionarySearch('/api/dictionary/kanji');

    //if word type is vocab then do vocab search, otherwise kanji search
    const active = wordType === 'vocab' ? vocabSearch : kanjiSearch;
    const { results, error, isSearching, searched, search } = active;

    console.log(wordType, Object.keys(errorMessages));
    function handleSubmit(event) {
        event.preventDefault();
        search(query);
    }  

    return (
        <div className="dict-search-area">
            {!fixedWordType && (
                <div className="dict-tabs">
                    <button
                        type="button"
                        onClick={() => setSelectedType('vocab')}
                    >
                        Vocab
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedType('kanji')}
                    >
                        Kanji
                    </button>
                </div>
            )}
            
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
            {results.map((entry, index) => {
                const kind = wordType === 'vocab' ? 'word' : 'kanji';
                const entryId = entry.sequence_id ?? entry.literal;
                console.log(entryId);

                return (
                    <div key={`${entryId}-${index}`}>
                    {wordType === 'vocab' ? (
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
                    )}
                    {renderAction && renderAction({ entry, kind, entryId })}
                    </div>
                );
            })}
            </div>
        </div>
    );
}