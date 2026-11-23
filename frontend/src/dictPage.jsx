import './dictPage.css';

export default function DictPage() {
    return (
        <main className="dict-page">
            <header className="page-header">
                <h1>Dictionary</h1>
            </header>        
            {/* search bar and search results */}
            <DictionarySearch
                renderAction={({ entry, kind, entryId }) => (
                    //to-do: setModal
                    <button onClick={() => setModal({ entry, kind, entryId })}>
                    Add to deck
                    </button>
                )}
            />
            {/* add word to deck modal */}
            {modalEntry && <AddToDecksModal
            
            />}
        </main>
    );
}