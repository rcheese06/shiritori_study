import AddToDeck from './dictionaryAddToDeck.jsx';
import './dictPage.css';

export default function KanjiEntry({ kanji, on = [], kun = [], stroke, meanings = [] }) {
    return (
        <div className="dict-entry">
            <div className="dict-word-heading">
                <h3 className="dict-word">{kanji}</h3>
                <div>
                    <p className="dict-reading">Onyomi: {on?.length ? on.join(', ') : 'None'}</p>
                    <p className="dict-reading">Kunyomi: {on?.length ? kun.join(', '): None}</p>
                    <p className="dict-reading">Strokes: {stroke}</p>
                </div>
            </div>
            
            
            <ol className="dict-sense">
                {meanings.map((meaning, i) => (
                    <li key={i}>{meaning}</li>
                ))}
            </ol>

            <AddToDeck word={kanji} />
        </div>
    );
}