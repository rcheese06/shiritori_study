import AddToDeck from './dictionaryAddToDeck.jsx';
import './dictPage.css';

export default function WordEntry({ word, reading, senses = [] }) {
    return (
        <div className="dict-entry">
            <div className="dict-word-heading">
                <h4 className="dict-word">{word}</h4>
                <p className="dict-reading">{reading}</p>
            </div>
            <ol className="dict-sense">
                {senses.map((sense, i) => (
                    <li key={i} >
                        {sense.glosses.join("; ")}

                        {sense.examples?.length > 0 && (
                            <ul className="dict-examples">
                                {sense.examples.map((ex, j) => (
                                    <li key={j} className="dict-example">
                                        <span lang="ja">{ex.a}</span>
                                        <br />
                                        <span>{ex.b}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                    </li>
                ))}
            </ol>
            <AddToDeck word={word} />
        </div>
    );
}