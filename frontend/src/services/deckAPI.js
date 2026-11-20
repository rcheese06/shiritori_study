const BASE = '/api/deck'; 

export async function createDeck(name, type) {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({name,type}),
    });
    if (!res.ok) throw new Error('Failed to create deck.');
    return res.json();
}

export async function listDecks() {
    const res = await fetch(BASE, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to load decks (${res.status}).');

    const deckList = await res.json();
    if (!Array.isArray(deckList)) throw new Error('The deck response was not a list');
    return res.json();
}

export async function getDeck(id) {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to get deck (${res.status}).');
    return res.json();
}

export async function editDeck(id, changes) {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({changes}), //new name, question settings and size are all in one json
    });
    if (!res.ok) throw new Error('Failed to edit deck (${res.status}).');
    return res.json();
}

export async function deleteDeck(id) {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to delete deck (${res.status}).');
    return res.json();
}

export async function getDeckWords(id) {
    const res = await fetch(`${BASE}/${id}/words`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to add word (${res.status}).');
    return res.json();
}

export async function addWord(id, word) {
    const res = await fetch(`${BASE}/${id}/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({word}),
    });
    if (!res.ok) throw new Error('Failed to add word (${res.status}).');
    return res.json();
}

export async function deleteWord(id, word) {
    const res = await fetch(`${BASE}/${id}/words`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({word}),
    });
    if (!res.ok) throw new Error('Failed to delete word (${res.status}).');
    return res.json();
}