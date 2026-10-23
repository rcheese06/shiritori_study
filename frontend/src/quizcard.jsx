function shuffler(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export default function buildOptions(answer, pool) {
    //const options = ; // sort pool to same JLPT level
    return shuffler(options);
}

export default function QuizCard({ word, answer, pool }) {

    const handleAnswerClick = (selectedOption) => {
        if (selectedOption === answer) {
            AnswerCard(true); //answercard opens a new page
        } else {
            AnswerCard(false); 
        }
    };

    const options = buildOptions(answer, pool);
    return (
        <div className="quizcard">
        <h3>{word}</h3>
        <div className="options">
            {options.map((option, index) => (
            <button key={index} onClick={() => handleAnswerClick(option)}>
                {option}
            </button>
            ))}
        </div>
        </div>
    );
}


