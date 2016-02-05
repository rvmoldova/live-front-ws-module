'use strict';

class LiveModule {
  constructor(url, options) {
    this._reconnect = true;
    this._debug = false;
    this._cb = {};
    this._url = url;
    if (typeof options == 'object') {
      if (typeof options.reconnect != undefined) {
        this._reconnect = options.reconnect ? true : false;
      }
      if (typeof options.debug != undefined) {
        this._debug = options.debug ? true : false;
      }
      if (typeof options.onDisconnectCallback == 'function') {
        this._cb['onDisconnect'] = options.onDisconnectCallback;
      }
      if (typeof options.onConnectCallback == 'function') {
        this._cb['onConnect'] = options.onConnectCallback;
      }
      if (typeof options.onErrorCallback == 'function') {
        this._cb['onError'] = options.onErrorCallback;
      }
    }
  }

  get options() {
    return {
      debug: this._debug,
      reconnect: this._reconnect,
      onDisconnectCallback: this._cb['onDisconnect'],
      onConnectCallback: this._cb['onConnect'],
      onErrorCallback: this._cb['onError']
    }
  }

  _try_reconnect() {
    if (this._reconnect && this._lastfail) {
      this.reconnect();
      setTimeout(this._try_reconnect, 1000);
    }
  }

  connect() {
    if (this._socket) {
      this.reconnect();
    } else {
      this._socket = new WebSocket(this._url);
    }
    this._lastfail = false;
    var _super = this;
    this._socket.onopen = (ev) => {
      this._lastfail = false;
      if (_super._debug) {
        console.debug('Connected to', _super._url);
        console.debug(ev);
      }
      if (_super._cb['onConnect']) {
        _super._cb['onConnect'](ev);
      }
    }
    this._socket.onclose = (ev) => {
      this._lastfail = true;
      this._try_reconnect();
      if (_super._debug) {
        console.debug('Disconnected from', _super._url);
        console.debug(ev);
      }
      if (_super._cb['onDisconnect']) {
        _super._cb['onDisconnect'](ev);
      }
    }
    this._socket.onerror = (ev) => {
      this._lastfail = true;
      if (_super._debug) {
        console.debug('Error');
        console.debug(ev);
      }
      if (_super._cb['onError']) {
        _super._cb['onError'](ev);
      }
    }
    this._socket.onmessage = (ev) => {
      if (_super._debug) {
        console.debug('received msg');
        console.debug(ev.data);
      }

      let temp_msg = {};
      try {
        temp_msg = JSON.parse(ev.data);
      } catch (e) {
        //
      }

      if (_super._cb[temp_msg.event]) {
        if (_super._debug) {
          console.debug('Calling cb for', temp_msg.event);
        }
        _super._cb[temp_msg.event](temp_msg.data);
      }
    };
  }

  reconnect() {
    let temp = this._reconnect;
    this._reconnect = false;
    this._socket.close();
    this.connect();
    this._reconnect = true;
  }

  disconnect() {
    this._reconnect = false;
    this._socket.close();
  }

  auth(token) {
    this._socket.send(JSON.stringify({
      auth: token
    }));
  }

  subscribe(channel, cb) {
    if (!cb) {
      throw "no callback";
    }
    this._socket.send(JSON.stringify({
      subscribe: channel
    }));
    this._cb[channel] = cb;
  }

  unsubscribe(channel) {
    this._socket.send(JSON.stringify({
      subscribe: channel
    }));
    this._cb[channel] = null;
  }
}
