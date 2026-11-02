export default function QuizDecksSettings({ deck }) {
    function handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        fetch('/some-api', { method: form.method, body: formData }); //do this ltr
    }

    return (
        <form method="post" onSubmit={handleSubmit}>
            <header className="page-header">
                <h1>Settings</h1>
            </header>
            <div className="deck-settings">
                <label>
                    Deck Name: <input name="deckName" value={deck.name} onChange={e => setName(e.target.value)}/>
                </label>
                <label>
                    Deck Size: <input name="deckSize" value={deck.size} onChange={e => setSize(e.target.value)}/>
                </label>
                <p>Type a value between 5 and 500</p>
                <hr />

                <label>
                    Kanji to Kana: <input type="checkbox" name="kanjiToKana" defaultChecked={true}/>
                </label>
                <label>
                    Kana to Kanji: <input type="checkbox" name="kanaToKanji" defaultChecked={true}/>
                </label>
                <label>
                    Japanese to Meaning: <input type="checkbox" name="japaneseToMeaning" defaultChecked={true}/>
                </label>
                <label>
                    Meaning to Japanese: <input type="checkbox" name="meaningToJapanese" defaultChecked={true} />
                </label>

                <hr />

                <label>
                    Type the answer: <input type="checkbox" name="typeTheAnswer" defaultChecked={true} />
                </label>
                <label>
                    MCQ answers: <input type="checkbox" name="mcqAnswers" defaultChecked={true} />
                </label>
            </div>
            
            <div className="deck-settings-buttons">
                <button type="reset" onClick={() => onBackToHome()}>Back to Home</button>
                <div className="button-pair">
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={() => onDeleteDeck(deck)}>Delete Deck</button>
                </div>
            </div>

        </form>
    );
}