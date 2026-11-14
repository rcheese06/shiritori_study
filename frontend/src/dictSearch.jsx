export default function DictionarySearchArea({ wordType, query, setQuery, isSearching }) {
    return (
        <div className="dict-search-controls">
            <div className="dict-search-bar-wrapper">
                <input
                    className="search-bar"
                    id="word-query"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={`Search for ${wordType}...`}
                />
                <button className="dict-search-cancel" type="button" onClick={() => setQuery("") }>
                    ✕
                </button>
            </div>
            <button type="submit" className="primary-button" disabled={isSearching}>
                Search
            </button>
        </div>
    )
    
}