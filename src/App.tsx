import { useReducer, useEffect, useState } from "react";
import { fromEvent, Timestamp, timestamp } from "rxjs";
import { ID_KEY, MESSAGES, UPDATE_MESSAGES, USER, USER_PROFILE } from "./constants";
import useTheme from "./hooks/useTheme";
import { AppReducer } from "./reducers/appReducer";
import types from "./types/index";

interface Message {
  id: number;
  message: string;
  user: string,
  timestamp: Date,
  color: string
};

const initialState = {
  messages: [],
  userProfile: {},
  messageValue: ''
}

export const App = () => {
  const bc = new BroadcastChannel('message_channel');

  const {appTheme, toggleTheme} = useTheme();

  const [state, dispatch] = useReducer(AppReducer, initialState)
  const sessionId = sessionStorage.getItem(ID_KEY);

  const [currentTimeStamp, setCurrentTimeStamp] = useState<number>(0)

  function retrieveUserProfile() {
    // Retrieve unique session id to differentiate tabs or windows
    const localStorageProfile = localStorage.getItem([USER_PROFILE, sessionId].join('-'))
    let currentUserProfile = localStorageProfile ? JSON.parse(localStorageProfile) : null;

    if(!currentUserProfile) {
      const userName = [USER, new Date().getTime()].join('-');
      const newMessageColor = Math.random().toString(16).substr(-6);

      if(!sessionId) {
        const id = JSON.stringify(Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))); // generate unique id
        sessionStorage.setItem(ID_KEY, id);
      }

      currentUserProfile = { userName, messageColor: newMessageColor };
      localStorage.setItem([USER_PROFILE, sessionId].join('-'), JSON.stringify(currentUserProfile));
    }

    return currentUserProfile;
  }

  function retrieveMessages() {
    // retrieve stored messages
    const storedMessages: string | null = localStorage.getItem(MESSAGES);
    const initialValue: Message[] = storedMessages ? JSON.parse(storedMessages) : null;
    return initialValue || [];
  }

  useEffect(() => {
    dispatch({type: types.MESSAGES, value: retrieveMessages()});
  }, []);

  useEffect(() => {
    dispatch({type: types.USERPROFILE, value: retrieveUserProfile()})
  }, []);

  bc.onmessage = (messageEvent) => {
    // If our broadcast message is 'update_title' then get the new title from localStorage
    if (messageEvent.data === UPDATE_MESSAGES) {
      // localStorage is domain specific so when it changes in one window it changes in the other
      const localStorageMessages = localStorage.getItem(MESSAGES)
      const newMessages = localStorageMessages ? JSON.parse(localStorageMessages) : [];

      dispatch({type: types.MESSAGES, value: newMessages});
    }
  }

  // Clears all in-use values from localStorage and local state
  function cleanSlate() {
    dispatch({type: types.MESSAGES, value: []});
    localStorage.removeItem([USER_PROFILE, sessionId].join('-'));
    localStorage.setItem(MESSAGES, JSON.stringify([]));
    bc.postMessage(UPDATE_MESSAGES);
  }

  // Trying RXjs
  // Using to retrieve current timestamp
  const clickWithTimestamp = fromEvent(document, 'click').pipe(
    timestamp()
  );
  
  // Emits data of type { value: PointerEvent, timestamp: number }
  clickWithTimestamp.subscribe(data => {
    setCurrentTimeStamp(data.timestamp);
  });

  function addMessage() {
    const timestamp = new Date(currentTimeStamp).toLocaleString();
    const newMessage = {
      user: state.userProfile.userName,
      id: Math.random(),
      message: state.messageValue,
      timestamp: timestamp,
      color: state.userProfile.messageColor
    }

    dispatch({ type:types.MESSAGEVALUE, value: '' });
    localStorage.setItem(MESSAGES, JSON.stringify([...state.messages, newMessage]));
    bc.postMessage(UPDATE_MESSAGES);
  }

  function removeMessage(message: Message) {
    const updatedMessages = state.messages.filter((msg: Message) => {
      return msg.message !== message.message && msg.timestamp !== message.timestamp
    });

    localStorage.setItem(MESSAGES, JSON.stringify(updatedMessages));
    bc.postMessage(UPDATE_MESSAGES);
  }

  return (
    <div className="App margin-top-1rem"  style={{background: appTheme === 'dark' ? '#3a3b3d' : '#fff',
    color: appTheme === 'dark' ? '#fff' : '#000'}}>
      <div className="Widget margin-top-1rem">
        <header className="Widget-header" style={{marginLeft: '2rem', paddingTop: '.25rem'}}>
          <h1>Valstro Frontend Challenge</h1>
          <div className={appTheme === 'light' ? "toggle-light": "toggle-dark"}>
            <h4 className="light-btn-theme" onClick={() => toggleTheme('light')}>
              Light
            </h4>
            <h4 className="dark-btn-theme" onClick={() => toggleTheme('dark')}>
              Dark
            </h4>
          </div>
        </header>

        <div className="margin-top-1rem" style={{padding: '2rem', background: appTheme === 'dark' ? '#3a3b3d' : '#fff',
        color: appTheme === 'dark' ? '#fff' : '#000',}}>
          <form className="margin-top-1rem">
            <input value={state.messageValue} type="text" name="name" placeholder="Enter Message" onChange={(e) => dispatch({type: types.MESSAGEVALUE, value: e.target.value})} />
            <button className="margin-left-1rem" disabled={!state.messageValue.length} onClick={() => state.messageValue.length ? addMessage() : null}>Add New Message</button>
          </form>
          <div style={{marginBottom: '1rem'}}> 
            <h3> Messages</h3>          
            <button title="Clears messages from state and localstorage" style={{backgroundColor: '#c91c56'}} onClick={() => cleanSlate()}>
              Clean Slate
            </button>
          </div>
          {state.messages.length ? 
            <div className="messages-container">
              {state.messages?.length ? state.messages.map((m: Message) => {
                return (
                  // Math.floor is used with a combination of parameters to create as unique a key as possible without use of a third party library                
                  <div key={Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))} className="message-container" style={{backgroundColor: `#${m.color}`, order: 2}}>
                    <span>{m.timestamp}</span>
                    <span style={{paddingLeft: '1rem'}}>{m.user}: {m.message}</span>
                    {m.user === state.userProfile.userName ?
                      <span style={{marginLeft: 'auto', float: "right", marginTop: '-.3rem'}}><button onClick={() => removeMessage(m)}>X</button></span>: null
                    } 
                  </div>
                )
              }) : null
            }
            </div> :
            "Oh no! Add some new messages!"
          }
        </div>
      </div>
    </div>
  );
};

export default App;
