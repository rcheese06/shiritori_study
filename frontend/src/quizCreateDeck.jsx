export default function CreateDeck(name,setName) {
    
    return (
        <div className="create-deck-modal">
            <input
                className="search-bar"
                id="deck-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={`Enter name...`}
            />
            <button type="submit" className="primary-button">
                Create
            </button>
        </div>
    )
}