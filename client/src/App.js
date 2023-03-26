import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
  const [state, setState] = useState({message: '', name: ''});
  const [chat, setChat] = useState([]);

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('/');
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    socketRef.current.on('message', ({name, message}) => {
      console.log('The server has sent some data to all clients');
      setChat([...chat, {name, message}]);
    });
    socketRef.current.on('user_join', function (data) {
      setChat([
        ...chat,
        {name: 'ChatBot', message: `${data} has joined the chat`}
      ]);
    });

    return () => {
      socketRef.current.off('message');
      socketRef.current.off('user-join');
    };
  }, [chat]);

  const userjoin = (name, room) => {
    socketRef.current.emit("user_join", { name, room });
    setState({ ...state, name, room });
  };

  const onMessageSubmit = (e) => {
    e.preventDefault();
    let msgEle = document.getElementById("message");
    console.log([msgEle.name], msgEle.value);
    setState({ ...state, [msgEle.name]: msgEle.value });
    socketRef.current.emit("message", {
      name: state.name,
      message: msgEle.value,
      room: state.room,
    });
    setState({ message: "", name: state.name });
    msgEle.value = "";
    msgEle.focus();
  };

  const renderChat = () => {
    console.log('In render chat');
    return chat.map(({name, message}, index) => (
      <div key={index}>
        <h3>
          {name}: <span>{message}</span>
        </h3>
      </div>
    ));
  };

  return (
    <div>
      {state.name && (
        <div className='card'>
          <div className='render-chat'>
            <h1>Chat Log</h1>
            {renderChat()}
          </div>
          <form onSubmit={onMessageSubmit}>
            <h1>Messenger</h1>
            <div>
              <input
                name='message'
                id='message'
                variant='outlined'
                label='Message'
              />
            </div>
            <button>Send Message</button>
          </form>
        </div>
      )}

      {!state.name && (
          <form
              className="form"
              onSubmit={(e) => {
                let nameEle = document.getElementById("username_input");
                let roomEle = document.getElementById("room_input");
                console.log(nameEle.value);
                e.preventDefault();
                userjoin(nameEle.value, roomEle.value);
              }}
          >
            <div className="form-group">
              <label>
                User Name:
                <br />
                <input id="username_input" />
              </label>
            </div>
            <div className="form-group">
              <label>
                Room:
                <br />
                <input id="room_input" />
              </label>
            </div>
            <br />

            <br />
            <br />
            <button type="submit">Click to join</button>
          </form>
      )}
    </div>
  );
}

export default App;
