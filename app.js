const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();
const chatEmitter = new EventEmitter();

// Serve static files from the public directory
app.use(express.static(__dirname + '/public'));

// Function to serve chat.html
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

// Function to respond with plain text
function respondText(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hi');
}

// Function to respond with JSON
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

// Function to respond with transformed input
function respondEcho(req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

// Function to handle chat messages
function respondChat(req, res) {
  const { message } = req.query;
  chatEmitter.emit('message', message);
  res.end();
}

// Function to handle server-sent events
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// Define routes
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
