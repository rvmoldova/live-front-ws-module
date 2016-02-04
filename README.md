
# Module to connect to WS api

##### Just install it via Bower

```
bower install --save live-front-ws-module
```

 I made this plugin for one of my projects.


 To init it:

 ```
 var LM = new LiveModule('ws://localhost:1235', {
   debug: false, // VERBOSE
   reconnect: true, // On fail, try to reconnect each second,
   onDisconnectCallback: function(rs) { // callbacks
     console.log(rs)
   },
   onConnectCallback: function(rs) { // callbacks
     console.log(rs)
   },
   onErrorCallback: function(rs) { // callbacks
     console.log(rs)
   }
 });
 ```


 And other examples:

 ```
 LM.connect(); // connect to websocket;


 LM.auth('token'); // auths with token;


 LM.subscribe('chat', function(rs) {    // subscribe to channel chat
   console.log('Receive from channel chat', rs)
 });

 LM.unsubscribe('chat');  // unsubscribe to channel chat

 ```
