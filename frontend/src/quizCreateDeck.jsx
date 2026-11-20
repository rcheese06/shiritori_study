import { useState } from 'react';
import './studyPage.css';

export default function CreateDeck({onSubmit, onClose}) {
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const deckName = name.trim();
        if (!deckName) {
            setError('Please enter a name for your deck.');
            return;
        }
        setError(null);
        setSaving(true);
        try {
            await onSubmit(deckName);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create deck. Please try again.');
            setSaving(false);
        }
    }

    return (
        <div className="create-deck-modal">
            <form onSubmit={handleSubmit}>
                <button className="cancel-button" type="button" onClick={onClose}>✕</button>
                <input
                    className="search-bar"
                    id="deck-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={`Enter name...`}
                />

                <button type="submit" className="primary-button">Create</button>
                {error && <p className="form-error">{error}</p>}
            </form>
        </div>
    )
}