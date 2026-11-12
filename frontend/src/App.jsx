import { useState } from 'react';
import './App.css';
import DictPage from './dictPage.jsx';
import StudyPage from './studyPage.jsx';
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
    const [activePage, setActivePage] = useState('study');

    return (
        <div className="main-app">
            <div className="app-content">
              {activePage === 'study' ? <StudyPage /> : <DictPage />}
            </div>
            <nav className="page-switcher">
                <button type="button" onClick={() => setActivePage('study')}>
                  Study
                </button>
                <button type="button" onClick={() => setActivePage('dictionary')}>
                  Dictionary
                </button>
            </nav>
        </div>
    );
}

export default App;