import SecretLetter from './SecretLetter';

import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import {Buffer} from 'buffer';
Buffer.from('anything','base64');
window.Buffer = window.Buffer || require("buffer").Buffer;

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SecretLetter/>}></Route>
          <Route path="/ua-zoo" element={<SecretLetter/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
