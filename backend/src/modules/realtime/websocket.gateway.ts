import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../../lib/config.js';

const JWT_SECRET = config.jwtSecret;

let io: Server;

export function initWebSocketGateway(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: config.corsOrigin.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['x-auth-token'];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    jwt.verify(token as string, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return next(new Error('Invalid or expired token'));
      }
      
      // Attach user and tenant info to socket
      (socket as any).user = user;
      next();
    });
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    
    // Auto-join the tenant-specific room for logical isolation
    const tenantRoom = `tenant_${user.organizationId}`;
    socket.join(tenantRoom);
    
    console.log(`[WS] User ${user.id} joined room: ${tenantRoom}`);

    socket.on('disconnect', () => {
      console.log(`[WS] User ${user.id} disconnected`);
    });
    
    // Allow clients to explicitly join specific operational rooms (like a specific map view)
    // but scoped by their tenant
    socket.on('join_topic', (topic: string) => {
      const scopedTopic = `${tenantRoom}_${topic}`;
      socket.join(scopedTopic);
    });

    socket.on('leave_topic', (topic: string) => {
      const scopedTopic = `${tenantRoom}_${topic}`;
      socket.leave(scopedTopic);
    });
  });

  return io;
}

export function broadcastToTenant(tenantId: string, eventName: string, payload: any) {
  if (io) {
    io.to(`tenant_${tenantId}`).emit(eventName, payload);
  }
}

export function broadcastToTopic(tenantId: string, topic: string, eventName: string, payload: any) {
  if (io) {
    io.to(`tenant_${tenantId}_${topic}`).emit(eventName, payload);
  }
}
