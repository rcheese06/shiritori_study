export async function searchDictionary(endpoint, text) {
    const response = await fetch(`${endpoint}?text=${encodeURIComponent(text)}`);
    if (!response.ok) {
        throw new Error(`Search failed (${response.status})`);
    }
    const results = await response.json();
    if (!Array.isArray(results)) {
        throw new Error('The search response was not a list.');
    }
    return results;
}