import {buildOptions} from './utils/quiz';

export default function QuizCard({word, answer}) {

    const handleAnswerClick = (selectedOption) => {
        if (selectedOption === answer) {
            AnswerCard(true); //answercard opens a new page
        } else {
            AnswerCard(false); 
        }
    };

    const options = buildOptions(answer);
    return (
        <div className="quiz-card">
            <h3>{word}</h3>
            <div className="options">
                //randomly display either MCQ or type your own answer
                {Math.random() > 0.5 ? <MCQOptions answer={answer} /> : <TypeOption answer={answer} />}
            </div>
        </div>
    );
}

export default function TypeOption(answer) { //type your own answer
    const handleAnswerSubmit = (event) => {
        event.preventDefault();
        const userAnswer = event.target.elements.answerInput.value;
        if (userAnswer === answer) {
            AnswerCard(true); //answercard opens a new page
        } else {
            AnswerCard(false); 
        }
    }
    return (
        <form onSubmit={handleAnswerSubmit}>
            <input type="text" name="answerInput" />
            <button type="submit">Submit</button>
        </form>
    );
}

export default function MCQOptions(answer) { //pick your answer
    const options = buildOptions(answer);
    return (
        <div className="mcq-options">
            {options.map((option, index) => (
            <button key={index} onClick={() => handleAnswerClick(option)}>
                {option}
            </button>
            ))}
        </div>
    );
}

export default function AnswerCard(isCorrect) {
    return (
        <div className="answer-card">
            //layout gonna look like the dictionary entry
        </div>
    );
}


