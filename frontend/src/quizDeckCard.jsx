import {useNavigate} from 'react-router-dom';
import './studyPage.css';

export default function DeckCard({ deck }) {
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

    return (
        <div className="deck-card">
            <div className="deck-info">
                <h5>{deck.name}</h5>
                <span className="deck-term-numbers">
                    {/*deck.length ?? deck.terms?.length ?? 0*/} cards in deck
                </span>
            </div>
            <div className="deck-buttons">
                <button className="primary-button" onClick={onStudy}>Study</button>
                <div className="button-pair">
                    <button className="icon-button" onClick={onAddTerms}><i className="bi bi-plus-circle"></i></button>
                    <button className="icon-button" onClick={onSettings}><i className="bi bi-gear"></i></button>
                </div>
            </div>
        </div>
    );
}