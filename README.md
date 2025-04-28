# LearnSphere: Personalized Learning Platform

LearnSphere is a full-stack educational platform powered by Perplexity's Sonar API that provides personalized learning experiences. The platform enables users to ask questions on any topic and receive in-depth, educational responses with follow-up questions and trusted citations.

## 📚 Features

- **Intelligent Question Answering**: Get comprehensive answers to any educational query with reputable sources
- **Follow-up Questions**: Dive deeper into topics with suggested follow-up questions
- **Source Citations**: All responses include citations from trusted sources
- **Learning Paths**: Generate customized learning paths for any topic based on your level
- **Progress Tracking**: Monitor your learning history and revisit previous topics
- **Content Saving**: Save valuable explanations, learning paths, and notes for future reference
- **Difficulty Adjustments**: Customize explanations based on your knowledge level (beginner, intermediate, advanced)
- **User Profiles**: Personalize your learning experience with custom preferences

## 🚀 Technology Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Perplexity Sonar API Integration
- RESTful API Architecture

### Frontend
- React.js
- Material-UI Component Library
- React Router for Navigation
- Context API for State Management
- Formik & Yup for Form Handling
- Recharts for Data Visualization
- React Markdown for Content Rendering

## 🛠️ Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Perplexity Sonar API Key

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/learnsphere.git
   cd learnsphere
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SONAR_API_KEY=your_perplexity_sonar_api_key
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd ../client
   ```

2. Install client dependencies:
   ```bash
   npm install
   ```

3. Start the client:
   ```bash
   npm start
   ```

4. The application should now be running at `http://localhost:3000`

## 🎯 Perplexity Sonar API Integration

LearnSphere utilizes Perplexity's Sonar API to power its educational content:

- **Sonar Reasoning Pro**: Used for main educational responses with comprehensive explanations
- **Follow-up Questions**: Sonar's follow-up feature helps guide the learning journey
- **Citation Support**: All educational content includes citations from trusted sources

### API Integration Details

The application integrates with Perplexity's Sonar API through the `perplexity.service.js` module:

- **Educational Prompts**: Queries are enhanced with educational contexts based on user level
- **Learning Paths**: The API generates structured learning paths for any topic
- **Follow-up System**: Maintains context to provide relevant follow-up questions

## 📊 Project Structure

```
learnsphere/
├── client/                  # React frontend application
│   ├── public/              # Public assets
│   └── src/
│       ├── components/      # Reusable React components
│       ├── context/         # Context providers for state management
│       ├── pages/           # Page components
│       ├── services/        # API service integrations
│       └── utils/           # Utility functions
│
├── server/                  # Node.js/Express backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Request handlers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── services/            # Business logic services
│   ├── middleware/          # Express middleware
│   └── utils/               # Utility functions
│
└── docker/                  # Docker configuration files
```

## 🔒 Authentication and Security

- JWT-based authentication system
- Password hashing with bcrypt
- Protected routes with middleware
- Input validation with express-validator
- Rate limiting to prevent abuse
- Helmet for security headers

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🔄 Deployment

The platform can be deployed using:
- Docker containers (configuration included)
- Traditional hosting (PM2, Nginx)
- Cloud services (AWS, Google Cloud, Azure)

## 🚧 Future Enhancements

- **Collaborative Learning**: Share learning paths and notes with other users
- **Interactive Exercises**: Add quizzes and practice problems
- **Visual Learning Tools**: Integrate diagrams and visual explanations
- **Rich Media Support**: Add support for video and audio learning resources
- **Analytics Dashboard**: Enhanced learning analytics and progress tracking
- **Learning Communities**: Create and join study groups around specific topics

## 📝 License

This project is licensed under the Apache-2.0 license - see the LICENSE file for details.

## 🙏 Acknowledgements

- Perplexity for providing the Sonar API
- Material-UI for the component library
- The open-source community for various libraries used in this project

---

&copy; 2025 LearnSphere. All rights reserved.
