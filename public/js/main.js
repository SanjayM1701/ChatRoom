const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (element) => {
  element.preventDefault();

  const msg = element.target.msg.value;

  socket.emit('chatMessage', msg);

  element.target.msg.value = "";
  element.target.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class= "meta">${message.username} <span>${message.time} </span></p>
    <p class ="text">
    ${message.text}
    </p>`;

  document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}

document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});