import AddToDeck from './dictionaryAddToDeck.jsx';
import './dictPage.css';

export default function WordEntry({ word, reading, senses = [] }) {
    return (
        <div className="dictionary-entry">
            <div className="dictionary-word-heading">
                <h3>{word}</h3>
                <AddToDeck word={word} />
            </div>
            {reading && <p>Reading: {reading}</p>}
            <ul>
                {senses.map((sense, index) => (
                    <li key={index} className="dictionary-sense">
                        <p className="dictionary-glosses">
                            {sense.glosses.join("; ")}
                        </p>

                        {sense.examples?.length > 0 && (
                            <ul className="dictionary-examples">
                                {sense.examples.map((ex, j) => (
                                    <li key={j} className="dictionary-example">
                                        <span lang="ja">{ex.a}</span>
                                        <br />
                                        <span>{ex.b}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                    </li>
                ))}
            </ul>
        </div>
    );
}