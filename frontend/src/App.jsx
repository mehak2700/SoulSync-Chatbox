import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [offline, setOffline] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: 'user', text: input }]);

    try {
      const response = await axios.post("http://127.0.0.1:8000/analyze", {
        text: input,
      }, { timeout: 2000 });

      const { mood, suggestion } = response.data;
      const botReply = `🧠 MOOD: ${mood}\n💡 SUGGESTION: ${suggestion}`;

      setMessages(prev => [...prev, { type: 'bot', text: botReply }]);
      setOffline(false);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', text: '⚠️ Offline or server error' }]);
      setOffline(true);
    }

    setInput('');
  };

  const handleFeedback = (rating) => {
    setFeedback(rating);
    setMessages(prev => [...prev, { type: 'feedback', text: `⭐ You rated the session: ${rating}/5` }]);
  };

  return (
    <div className="App">
      <h1>🧘 SoulSync Chat</h1>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="input-box">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={offline ? "Offline... please wait" : "Type how you're feeling..."}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={offline}
        />
        <button onClick={sendMessage} disabled={offline}>Send</button>
      </div>

      {messages.length > 2 && feedback === null && (
        <div className="feedback-box">
          <p>Was this helpful? Rate:</p>
          {[1, 2, 3, 4, 5].map(num => (
            <button key={num} onClick={() => handleFeedback(num)}>{num}⭐</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
