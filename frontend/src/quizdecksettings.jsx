import { useState } from 'react';

export default function QuizDecksSettings({ deck }) {
    const [deckName, setDeckName] = useState(deck.name);
    const [deckSize, setDeckSize] = useState(deck.size);
    const [options, setOptions] = useState({
        kanjiToKana: true,
        kanaToKanji: true,
        japaneseToMeaning: true,
        meaningToJapanese: true,
    });

    function handleCheckboxChange(e) {
        const { name, checked } = e.target;
        setOptions(prev => ({ ...prev, [name]: checked }));
    }

    /*useEffect(() => {
        post('/analytics/event', { eventName: 'visit_form' });
    }, []);*/ //??

    function handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        fetch('/some-api', { //check this ltr after setting up api
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deckName, deckSize, ...options }),
         }); 
    }

    const checkboxes = [
        { name: 'kanjiToKana', label: 'Kanji to Kana' },
        { name: 'kanaToKanji', label: 'Kana to Kanji' },
        { name: 'japaneseToMeaning', label: 'Japanese to Meaning' },
        { name: 'meaningToJapanese', label: 'Meaning to Japanese' },
    ];

    return (
        <form method="post" onSubmit={handleSubmit}>
            <header className="page-header">
                <h1>Settings</h1>
            </header>
            <div className="deck-settings">
                <label>
                    Deck Name: <input name="deckName" value={deckName} onChange={e => setDeckName(e.target.value)}/>
                </label>
                <label>
                    Deck Size: <input name="deckSize" value={deckSize} onChange={e => setDeckSize(e.target.value)}/>
                </label>
                <p>Type a value between 5 and 500</p>
                <hr />

                {checkboxes.map(({ name, label }) => (
                    <label key={name}>
                        {label}:
                        <input
                            type="checkbox"
                            name={name}
                            checked={options[name]}
                            onChange={handleCheckboxChange}
                        />
                    </label>
                ))}

                <hr />
                
                //to-do
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