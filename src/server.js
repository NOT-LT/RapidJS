const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Configure Express to serve JavaScript files with correct MIME type
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.type('application/javascript');
    }
    next();
});

// Serve static files from the root directory
app.use(express.static(path.resolve(__dirname, '../')));

// Always return index.html for unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
