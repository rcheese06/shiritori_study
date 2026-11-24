import QuizDecks from './quizDeckList.jsx';
import './studyPage.css';

function StudyPage() {
    return (
        <main className="quiz-page">
            <header className="page-header">
                <h1>Study Decks</h1>
            </header>
            <QuizDecks />
        </main>
    );
}

export default StudyPage;