import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Connect to the backend server

const ChatArea = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for incoming chat messages
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Clean up the socket connection on component unmount
    return () => {
      socket.off('chat message');
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Emit the chat message to the server
      socket.emit('chat message', message);
      setMessage(''); // Clear the input field
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', width: '300px' }}>
      <h3>Chat Area</h3>
      <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid #ccc', padding: '5px', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className='flex '>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: 'calc(100% - 22px)', padding: '5px' }}
          placeholder="Type a message..."
        />
        <button type="submit" className='bg-green-500 p-2 rounded-md text-[#fff]'>Send </button>
      </form>
    </div>
  );
};

export default ChatArea;
