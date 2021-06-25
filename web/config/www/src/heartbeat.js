import socketio from 'socket.io-client';

export default {
  setupHeartbeatSocket: function () {
    if (ACTIVATE_WEBSOCKET === 'True') {
      var addr = WEBSOCKET_SERVER
    } else {
      var addr = ''
    }
    var socket = socketio(addr)

    socket.on('connect', function() {
      var data = {
        client: window.location.href,
        message: 'I\'m connected!'
      }
      socket.emit('session-connect', data);
    })

    socket.on('heartbeat-request', () => {
      console.log('got a heartbeat request check!')
      var data = {
        client: window.location.href,
        message: 'I\'m active!'
      }
      socket.emit('heartbeat-response', data)
    })
  }
}
