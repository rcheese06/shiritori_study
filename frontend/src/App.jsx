import { useState } from 'react'
import './App.css'

import quizdecks from './quizdecks';
import quizdecksettings from './quizdecksettings';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">

        </div>
        <div>
          <h1>Get started</h1>
          <p>
            hi
          </p>
        </div>
      </section>

      <section id="next-steps">
        <div id="social">
          
        </div>
      </section>

      <section id="spacer"></section>
    </>
  )
}

export default App
