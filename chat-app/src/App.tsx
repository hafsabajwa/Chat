import React, { useState } from "react";
import ChatRoom from "./ChatRoom";
import "./App.css"; // Import the CSS file

const App = () => {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (username.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div>
      {!submitted ? (
        <div className="app-container">
          <div className="form-container">
            <h2>Join Chat</h2>
            <input
              type="text"
              id="user"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
            />
            <button onClick={handleSubmit} className="submit-button">
              Submit
            </button>
          </div>
        </div>
      ) : (
        <ChatRoom username={username} />
      )}
    </div>
  );
};

export default App;
//node --loader ts-node/esm server.ts\