const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

io.on('connection', (socket) => {
  socket.on('message', (msg) => {
    console.log(msg);
    socket.broadcast.emit('message', msg);
  });

  socket.on('file_transfer', ({ file_name, file_data }) => {
    fs.writeFile(file_name, file_data, 'binary', (err) => {
      if (err) throw err;
      console.log(`File ${file_name} received and saved.`);
    });
  });

  socket.on('file_upload', (data) => socket.broadcast.emit('updata', data));

  socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
