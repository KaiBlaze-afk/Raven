
const socket = io();
const messageInput = document.getElementById("messageInput");
const clientSwitches = document.getElementById("clientSwitches");
let targets = [];

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

socket.on("connect", () => {
  socket.emit("intro", "$Ghost");
});

socket.on("clientList", (userList) => {
  console.log(userList);
  updateSwitches(userList);
});

function sendMessage() {
  const message = messageInput.value;
  socket.emit("message", { targets, message });
  newres("Ghost$ "+message);
  messageInput.value = "";
}

function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (file) {
    socket.emit("file_upload", { targets, fileName: file.name, file });
  }
}

socket.on("message", (msg) => {newres("Response:\n"+msg)});

function newres(msg) {
    const msgbox = document.createElement("div");
    msgbox.classList+='msgbox';
    msgbox.innerText = msg;
    let resbox = document.getElementById('response');
    resbox.insertBefore(msgbox,resbox.firstChild);
}

function updateSwitches(userList) {
  clientSwitches.innerHTML = "";

  userList.forEach((user) => {
    if (user !== "$Ghost") {
      const switchContainer = document.createElement("div");
      const switchId = `${user}Switch`;
      const isChecked = targets.includes(user);

      const label = document.createElement("label");
      label.textContent = user;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = switchId;
      checkbox.checked = isChecked;
      checkbox.onchange = function () {
        updateTargets(user, this.checked);
      };

      switchContainer.appendChild(label);
      switchContainer.appendChild(checkbox);
      clientSwitches.appendChild(switchContainer);
    }
  });
}

function updateTargets(user, isChecked) {
  if (isChecked) {
    targets.push(user);
  } else {
    const index = targets.indexOf(user);
    if (index !== -1) {
      targets.splice(index, 1);
    }
  }
}