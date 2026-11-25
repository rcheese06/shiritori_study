import DictSearch from './dictSearchArea.jsx'
import './dictPage.css';

export default function DictPage() {
    return (
        <main className="dict-page">
            <header className="page-header">
                <h1>Dictionary</h1>
            </header>        
            {/* search bar and search results */}
            <DictSearch showModal={true}/>
            {/* add word to deck modal */}
            {/*modalEntry && <AddToDecksModal
            
            />*/}
        </main>
    );
}