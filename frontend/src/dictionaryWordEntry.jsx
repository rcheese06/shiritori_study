import AddToDeck from './dictionaryAddToDeck.jsx';
import './dictPage.css';

export default function WordEntry({ word, reading, definitions = [] }) {
    return (
        <div className="dictionary-entry">
            <div className="dictionary-word-heading">
                <h3>{word}</h3>
                <AddToDeck word={word} />
            </div>
            {reading && <p>Reading: {reading}</p>}
            //meaning
        </div>
    );
}