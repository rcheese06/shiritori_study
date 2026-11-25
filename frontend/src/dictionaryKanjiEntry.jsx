import AddToDeck from './dictionaryEntryAddToDeck.jsx';
import './dictPage.css';

export default function KanjiEntry({ kanji, on = [], kun = [], stroke, meanings = [], showModal }) {
    return (
        <div className="dict-entry">
            <div className="dict-heading">
                <div className="dict-word-heading">
                    <h3 className="dict-word">{kanji}</h3>
                    <div>
                        <p className="dict-reading">Onyomi: {on?.length ? on.join(', ') : 'None'}</p>
                        <p className="dict-reading">Kunyomi: {on?.length ? kun.join(', '): 'None'}</p>
                        <p className="dict-reading">Strokes: {stroke}</p>
                    </div>
                </div>
                <AddToDeck word={kanji} modal={showModal ? false : undefined} />
            </div>
            
            
            
            <ol className="dict-sense">
                {meanings.map((meaning, i) => (
                    <li key={i}>{meaning}</li>
                ))}
            </ol>
        </div>
    );
}