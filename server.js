const express = require('express');
const http = require('http');
const multer = require('multer');
const fs = require('fs');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });
var temp_url;
let clients = new Map();
app.use(bodyParser.text());
app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.use("/uploads", express.static(__dirname + '/uploads'));
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('File received:', req.file.originalname);
  res.send('File received successfully!');
});

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
// login System
app.get('/:dynamicParam', (req, res) => {
  const dynamicParam = req.params.dynamicParam;
  if (dynamicParam == temp_url) {
    res.sendFile(__dirname + '/public/main.html');
  } else {
    res.status(404).sendFile(__dirname + '/public/index.html');
  }
});
// login System
app.post('/', (req, res) => {
  const receivedNumber = parseInt(req.body);
  console.log('Received number:', receivedNumber);
  let currentDate = new Date();
  currentDate = currentDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const hr = parseInt(currentDate.split(' ')[1].split(':')[0]);
  const dt = parseInt(currentDate.split(' ')[0].split('/')[0]);
  if (receivedNumber == (3760 - Number(hr.toString() + dt.toString()))) {
    temp_url = generateRandomString(32);
    res.send('/' + temp_url);
  } else {
    console.log("Incorrect password!");
  }
});

// Sockets system
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
