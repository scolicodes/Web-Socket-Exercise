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

  const userjoin = (name) => {
    socketRef.current.emit('user_join', name);
  };

  const onMessageSubmit = (e) => {
    let msgEle = document.getElementById('message');
    console.log([msgEle.name], msgEle.value);
    setState({...state, [msgEle.name]: msgEle.value});
    socketRef.current.emit('message', {
      name: state.name,
      message: msgEle.value
    });
    e.preventDefault();
    setState({message: '', name: state.name});
    msgEle.value = '';
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
          className='form'
          onSubmit={(e) => {
            console.log(document.getElementById('username_input').value);
            e.preventDefault();
            setState({name: document.getElementById('username_input').value});
            userjoin(document.getElementById('username_input').value);
            // userName.value = '';
          }}
        >
          <div className='form-group'>
            <label>
              User Name:
              <br />
              <input id='username_input' />
            </label>
          </div>
          <br />

          <br />
          <br />
          <button type='submit'> Click to join</button>
        </form>
      )}
    </div>
  );
}

export default App;
