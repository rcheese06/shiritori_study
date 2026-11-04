

import AddToDeck from './dictionaryAddToDeck.jsx';

export default function WordEntry({ word, reading, definitions=[] }) {
    

    return (
        <div className="dictionary-entry">
            <div className="dictionary-word-heading">
                <h3>{word}</h3>
                <AddToDeck word={word} />
            </div>
            //ruby <p>Reading: {reading}</p>
            <ul>
                {meanings.map((meaning, index) => (
                    <li key={`${index}-${meaning}`}>{meaning}</li>
                ))}
            </ul>
        </div>
    );
}