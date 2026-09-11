import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/token.utils.js";

let ioInstance = null;

export const initSocketIO = (httpServer, allowedOrigins = []) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
        ) {
          return callback(null, true);
        }
        return callback(new Error("CORS not allowed for Socket.IO origin: " + origin));
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  // Socket authentication middleware (optional token validation for logging identity)
  ioInstance.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        socket.data.user = decoded;
      } catch (err) {
        console.warn("[Admin Socket] Handshake token verification warning:", err.message);
      }
    }
    next();
  });

  ioInstance.on("connection", (socket) => {
    const adminUser = socket.data?.user?.username || "Anonymous Admin";
    console.log(`[Admin Socket] Client connected: ${socket.id} (${adminUser})`);

    socket.emit("connected", {
      status: "connected",
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Admin Socket] Client disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

export const broadcastAdminEvent = (eventName, payload) => {
  if (ioInstance) {
    try {
      ioInstance.emit(eventName, {
        ...payload,
        emittedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`[Admin Socket] Broadcast error for '${eventName}':`, err.message);
    }
  }
};
