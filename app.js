const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to my API');
});

// User routes
app.use('/users', require('./app/user/route/user'));

// Post routes
app.use('/listings', require('./app/listing/route/listing'));

// Animal routes
//app.use('/animals', require('./routes/animal'));

// Vehicle routes
/*app.use('/vehicles', require('./routes/vehicle'));



// Picture routes
app.use('/pictures', require('./routes/picture'));

// Message routes
app.use('/messages', require('./routes/message'));

// Chat routes
app.use('/chats', require('./routes/chat'));

// Notification routes
app.use('/notifications', require('./routes/notification'));
*/

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});