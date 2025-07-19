# 🎨 Collaborative Drawing App (Excalidraw Clone)

A real-time collaborative drawing application built with Next.js, Socket.IO, and Prisma. Multiple users can draw together on a shared canvas while chatting in real-time.

![Collaborative Drawing App](https://img.shields.io/badge/Status-Active-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)

## ✨ Features

### 🎯 Current Features

#### **Real-time Collaboration**
- 🔄 **Live Drawing Sync** - See other users' drawings in real-time
- 👥 **Multi-user Rooms** - Join rooms with multiple participants
- 💬 **Real-time Chat** - Send messages while drawing
- 👤 **User Presence** - See who's in the room

#### **Drawing Tools**
- ✏️ **Pen Tool** - Freehand drawing with customizable colors and stroke width
- 🧽 **Eraser** - Remove drawings from the canvas
- ⬜ **Rectangle Tool** - Draw rectangles by clicking and dragging
- ⭕ **Circle Tool** - Draw circles with radius based on drag distance
- 📏 **Line Tool** - Draw straight lines between two points

#### **Canvas Features**
- 🎨 **Color Picker** - Choose from any color for your drawings
- 📏 **Stroke Width Control** - Adjust line thickness (1-20px)
- 🗑️ **Clear Canvas** - Clear all drawings from the canvas
- 💾 **Persistent Storage** - Drawings are saved to database and restored on room join

#### **User Interface**
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎛️ **Tool Sidebar** - Easy access to all drawing tools and settings
- 👥 **Members Panel** - See all users in the current room
- 💬 **Chat Interface** - Real-time messaging with timestamps

#### **Authentication & Rooms**
- 🔐 **JWT Authentication** - Secure user login and registration
- 🏠 **Room Management** - Create and join drawing rooms
- 👥 **Room Members** - View who's currently in the room
- 🔒 **Protected Routes** - Secure access to drawing rooms

### 🚀 Future Features (Roadmap)

#### **Phase 1: Enhanced Drawing Tools**
- [ ] **Text Tool** - Add text annotations to drawings
- [ ] **Image Upload** - Upload and place images on canvas
- [ ] **Shape Library** - Pre-made shapes (arrows, stars, etc.)
- [ ] **Fill Tool** - Fill closed shapes with colors
- [ ] **Gradient Support** - Linear and radial gradients

#### **Phase 2: Advanced Collaboration**
- [ ] **User Cursors** - See other users' mouse cursors in real-time
- [ ] **Drawing Layers** - Organize drawings in layers
- [ ] **Undo/Redo** - Individual and collaborative undo/redo
- [ ] **Drawing History** - View drawing timeline and revert changes
- [ ] **Comments** - Add comments to specific parts of drawings

#### **Phase 3: Export & Sharing**
- [ ] **Export Options** - PNG, JPG, SVG, PDF export
- [ ] **Share Links** - Generate shareable room links
- [ ] **Templates** - Save and reuse drawing templates
- [ ] **Version Control** - Track drawing versions and changes
- [ ] **Collaboration Analytics** - Track participation and activity

#### **Phase 4: Advanced Features**
- [ ] **Voice Chat** - Audio communication while drawing
- [ ] **Screen Sharing** - Share your screen in the room
- [ ] **Drawing Animations** - Animate drawings and transitions
- [ ] **AI Integration** - AI-powered drawing suggestions
- [ ] **Mobile App** - Native mobile applications

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Zustand** - State management
- **Axios** - HTTP client for API calls

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework (HTTP server)
- **Socket.IO** - Real-time WebSocket communication
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens

### **Infrastructure**
- **Turborepo** - Monorepo build system
- **pnpm** - Package manager
- **ESLint** - Code linting
- **TypeScript** - Type checking

## 📦 Project Structure

```
Excalidraw/
├── apps/
│   ├── web/                 # Next.js frontend app
│   │   ├── app/            # App Router pages
│   │   ├── Zustand/        # State management
│   │   └── hooks/          # Custom React hooks
│   ├── http-server/        # Express.js API server
│   │   ├── src/
│   │   │   ├── Controller/ # API controllers
│   │   │   ├── Routes/     # API routes
│   │   │   └── middleware/ # Express middleware
│   └── ws-server/          # Socket.IO WebSocket server
│       └── src/            # WebSocket event handlers
├── packages/
│   ├── db/                 # Database package
│   │   ├── prisma/         # Database schema and migrations
│   │   └── generated/      # Generated Prisma client
│   ├── ui/                 # Shared UI components
│   ├── eslint-config/      # ESLint configurations
│   └── typescript-config/  # TypeScript configurations
└── README.md
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Excalidraw
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example env files
   cp apps/http-server/.env.example apps/http-server/.env
   cp apps/ws-server/.env.example apps/ws-server/.env
   cp packages/db/.env.example packages/db/.env
   ```

4. **Configure your environment variables**
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/drawing_app"
   
   # JWT Secret
   JWT_SECRET="your-super-secret-jwt-key"
   
   # Server Ports
   PORT=3001  # HTTP Server
   WS_PORT=8080  # WebSocket Server
   ```

5. **Set up the database**
   ```bash
   cd packages/db
   pnpm prisma generate
   pnpm prisma db push
   ```

6. **Start the development servers**
   ```bash
   # From the root directory
   pnpm dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - HTTP API: http://localhost:3001
   - WebSocket Server: http://localhost:8080

### **Usage**

1. **Register/Login** - Create an account or sign in
2. **Create/Join Room** - Create a new drawing room or join an existing one
3. **Start Drawing** - Use the tools in the left sidebar to draw
4. **Collaborate** - Invite others to join your room and draw together
5. **Chat** - Use the chat interface to communicate while drawing

## 🔧 Development

### **Available Scripts**

```bash
# Development
pnpm dev              # Start all services in development mode
pnpm dev:web          # Start only the frontend
pnpm dev:api          # Start only the HTTP API
pnpm dev:ws           # Start only the WebSocket server

# Building
pnpm build            # Build all packages and apps
pnpm build:web        # Build only the frontend

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Prisma Studio

# Linting
pnpm lint             # Lint all packages
pnpm lint:fix         # Fix linting issues
```

### **Database Schema**

The app uses the following main entities:

- **User** - User accounts with authentication
- **Room** - Drawing rooms with members and canvas state
- **Message** - Chat messages in rooms
- **RoomMembers** - Many-to-many relationship between users and rooms

### **API Endpoints**

#### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### **Rooms**
- `GET /api/room` - List user's rooms
- `POST /api/room` - Create new room
- `GET /api/room/:id/details` - Get room details with members
- `POST /api/room/:id/join` - Join a room

#### **WebSocket Events**
- `join:Room` - Join a drawing room
- `message` - Send/receive chat messages
- `drawing:update` - Update canvas drawings
- `drawing:clear` - Clear the canvas
- `user:joined` - User joined the room
- `user:left` - User left the room

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Excalidraw](https://excalidraw.com/)
- Built with [Next.js](https://nextjs.org/) and [Socket.IO](https://socket.io/)
- Database powered by [Prisma](https://www.prisma.io/)

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

**Happy Drawing! 🎨✨**
