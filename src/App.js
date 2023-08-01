import './App.css';
import Annotation from './Annotation.js';
import dataFiles from './data/dataFiles.js';

function App() {

  return (
    <Annotation dataFiles={ dataFiles }></Annotation>
  );
}

export default App;
