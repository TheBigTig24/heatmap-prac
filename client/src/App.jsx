import { useState } from "react";
import Main from "./pages/main";
import Start from "./components/start";
import '../src/App.css';

function App() {

  const [displayStart, setDisplayStart] = useState(false);

  const toggleStart = () => setDisplayStart(prev => !prev);

  return (
    <>
      <Start displayValue={displayStart} onStartBtn={toggleStart}/>
      <Main onExit={toggleStart}/>
    </>
  )
}

export default App;
