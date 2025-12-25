import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`API running on http://172.26.0.111:${PORT}`);
});

server.on('error', (err) => {
    console.error("SERVER ERROR:", err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error("UNHANDLED REJECTION:", reason);
});

process.on('exit', (code) => {
    console.log(`Process exiting with code: ${code}`);
});
