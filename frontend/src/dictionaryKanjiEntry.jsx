import AddToDeck from './dictionaryAddToDeck.jsx';
import './dictPage.css';

export default function KanjiEntry({ kanji, on = [], kun = [], stroke, meanings = [] }) {
    return (
        <div className="dictionary-entry">
            <div className="dictionary-word-heading">
                <h3>{kanji}</h3>
                <AddToDeck word={kanji} />
            </div>
            <p>Onyomi: {on.join(', ')}</p>
            <p>Kunyomi: {kun.join(', ')}</p>
            <p>Strokes: {stroke}</p>
            
            <ul className="dictionary-sense">
                {meanings.map((meaning, i) => (
                    <li key={i}>{meaning}</li>
                ))}
            </ul>
        </div>
    );
}