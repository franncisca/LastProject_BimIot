// import React, { useState, useCallback, useEffect } from 'react';
// import useWebSocket, { ReadyState } from 'react-use-websocket';

// function WebSocketDemo () {

  
//   // // ================== server============
//   // const webSocketsServerPort = 8000;
//   // const webSocketServer = require('websocket').server;
//   // const http = require('http');
//   // // Spinning the http server and the websocket server.
//   // const server = http.createServer();
//   // server.listen(webSocketsServerPort);
//   // const wsServer = new webSocketServer({
//   //   httpServer: server
//   // });


//   //Public API that will echo messages sent to it back to the client
//   const [socketUrl, setSocketUrl] = useState('wss://echo.websocket.org');
//   const [messageHistory, setMessageHistory] = useState([]);

//   const { 
//     sendMessage, 
//     lastMessage, 
//     readyState 
//   } = useWebSocket(socketUrl,{
//     onOpen: () => console.log("opened"),
//     //Will attempt to reconnect on all close events, such as server shutting down
//     shouldReconnect: (closeEvent) => true,
//   });

//   useEffect(() => {
//     if (lastMessage !== null) {
//       setMessageHistory((prev) => prev.concat(lastMessage.data));
//     }
//   }, [lastMessage, setMessageHistory]);

//   const handleClickChangeSocketUrl = useCallback(
//     () => setSocketUrl('wss://demos.kaazing.com/echo'),
//     []
//   );

//   const handleClickSendMessage = useCallback(() => sendMessage('Hello'), []);

//   const connectionStatus = {
//     [ReadyState.CONNECTING]: 'Connecting',
//     [ReadyState.OPEN]: 'Open',
//     [ReadyState.CLOSING]: 'Closing',
//     [ReadyState.CLOSED]: 'Closed',
//     [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
//   }[readyState];

//   return (
//     <div>
//       <button onClick={handleClickChangeSocketUrl}>
//         Click Me to change Socket Url
//       </button>
//       <button
//         onClick={handleClickSendMessage}
//         disabled={readyState !== ReadyState.OPEN}
//       >
//         Click Me to send 'Hello'
//       </button>
//       <span>The WebSocket is currently {connectionStatus}</span>
//       {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
//       <ul>
//         {messageHistory.map((message, idx) => (
//           <span key={idx}>{message ? message : null}</span>
//         ))}
//       </ul>
//     </div>
//   );

// };

// export { WebSocketDemo };