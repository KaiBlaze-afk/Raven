const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.use("/uploads", express.static(__dirname + '/uploads'));

let clients = new Map();

io.on('connection', (socket) => {
  socket.on('intro', (user) => {
    clients.set(user, socket.id);
    io.to(clients.get('$Ghost')).emit('clientList', Array.from(clients.keys()));
  });

  socket.on('message', (msg) => {
    console.log(msg);
    if (msg.targets) {
      msg.targets.forEach((targetUser) => {
        io.to(clients.get(targetUser)).emit('message', msg.message);
      });
    } else {
      io.to(clients.get('$Ghost')).emit('message', msg);
    }
  });

  socket.on('file_transfer', ({ file_name, file_data }) => {
    const filePath = __dirname + '/uploads/' + file_name;
    io.to(clients.get('$Ghost')).emit('fileurl', file_name);
    fs.writeFile(filePath, file_data, 'binary', (err) => {
      if (err) throw err;
      console.log(`File ${file_name} received and saved in uploads folder.`);
    });
  });

  socket.on('file_upload', (data) => {
    if (data.targets) {
      console.log(data.targets)
      data.targets.forEach((targetUser) => {
        io.to(clients.get(targetUser)).emit('updata', data);
      });
    }
  });

  socket.on('disconnect', () => {
    const disconnectedUser = Array.from(clients.keys()).find(
      (user) => clients.get(user) === socket.id
    );
    if (disconnectedUser) {
      clients.delete(disconnectedUser);
    }
    io.to(clients.get('$Ghost')).emit('clientList', Array.from(clients.keys()));
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
