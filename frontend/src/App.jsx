import { useState } from 'react';
import './App.css';
import DictPage from './dictPage.jsx';
//import DeckStudyPage from './'; //here
import EditDeck from './quizAddTermsToDeckPage.jsx';
import QuizDecksSettings from './quizDeckSettingsPage.jsx';
import StudyPage from './studyPage.jsx';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { DecksProvider } from './context/DecksContext';

function App() {
  return (
    <DecksProvider>
      <div className="main-app">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/study" replace />} />
            <Route path="/study" element={<StudyPage />} />
            {/*<Route path="/study/:deckId" element={<DeckStudyPage />} />*/} {/*quizCard + quizAnswer (create this)*/}
            <Route path="/study/:deckId/add-terms" element={<EditDeck />} /> 
            <Route path="/study/:deckId/settings" element={<QuizDecksSettings />} />
            <Route path="/dictionary" element={<DictPage />} />
          </Routes>
        </div>
        <nav className="page-switcher">
          <NavLink to="/study" className="page-switcher-item">Decks</NavLink>
          <NavLink to="/dictionary" className="page-switcher-item">Dictionary</NavLink>
        </nav>
      </div>
    </DecksProvider>
  );
}

export default App;