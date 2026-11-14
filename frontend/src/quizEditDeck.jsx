export default function EditDeck(name, size, query, setQuery, isSearching) {
    
    return (
        <div className="edit-page">
            <div className="edit-header">
                <h3>Deck Name: {name}</h3>
                <p>{size} terms added</p>
                <div className="edit-header-buttons">
                    <button className="primary-button" type="submit">Save Changes</button>
                    <button className="secondary-button" type="reset">Discard Changes</button>
                </div>
            </div>
            <div className="edit-contents">
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

                <div className="edit-added-terms">

                </div>
            </div>
        </div>
    )
}