import {useNavigate} from 'react-router-dom';

export default function DeckCard({deck}) {
    const navigate = useNavigate();

    function onStudy() {
        navigate(`/study/${deck.id}`);
    }
    function onAddTerms() {
        navigate(`/study/${deck.id}/add-terms`);
    }
    function onSettings() {
        navigate(`/study/${deck.id}/settings`);
    }

    <div className="deck-card">
        <div className="deck-info">
            <h2>{deck.name}</h2>
            //x out of y cards need to be studied
            <span className="deck-term-numbers">
                {/*deck.terms.length*/} cards in deck
            </span>
        </div>
        <div className="deck-buttons">
            <button className="primary-button" onClick={onStudy}>Study</button>
            <div className="button-pair">
                <button onClick={onAddTerms}>Add Terms</button>
                <button onClick={onSettings}>Settings</button>
            </div>
        </div>
    </div>
}