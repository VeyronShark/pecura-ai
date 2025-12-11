# Pecura AI - Frontend

A React-based frontend application for the Skin-Care Product Recommendation System. This application provides an intuitive interface for users to discover their skin type, get personalized product recommendations, and build effective skincare routines.

## Features

- **Skin Type Quiz**: Interactive questionnaire to determine user's skin type
- **Product Recommendations**: AI-powered suggestions based on skin profile
- **Product Browser**: Comprehensive catalog with search and filtering
- **Ingredient Checker**: Safety analysis for ingredient combinations
- **Routine Builder**: Create and manage morning/evening skincare routines
- **Dashboard**: Personalized overview with recommendations and routine tracking

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/           # API client and service functions
├── components/    # Reusable UI components
├── pages/         # Page components
├── mock/          # Mock data for development
├── App.jsx        # Main app component with routing
├── main.jsx       # Application entry point
└── index.css      # Global styles
```

## Key Components

### Pages
- **Landing** - Homepage with features and call-to-action
- **Quiz** - Multi-step skin type assessment
- **Dashboard** - Personalized user overview
- **Products** - Product catalog with search/filter
- **IngredientChecker** - Ingredient safety analysis
- **RoutineBuilder** - Morning/evening routine creation

### Components
- **Layout** - Navigation and page structure
- **ProductCard** - Product display with actions
- **LoadingSpinner** - Loading state indicator

## API Integration

The frontend uses a service layer (`src/api/skincare.js`) that can operate in two modes:

1. **Mock Mode** (default): Uses local JSON data for development
2. **API Mode**: Connects to the FastAPI backend

To switch to API mode, set `USE_MOCK_DATA = false` in `src/api/skincare.js`.

## Mock Data

Development uses realistic mock data:
- Product catalog with images, ratings, and ingredients
- Skin type information and descriptions
- Quiz questions with multiple choice options

## Styling

- **Tailwind CSS** for utility-first styling
- **Custom CSS** for animations and component variants
- **Responsive design** with mobile-first approach
- **Purple/pink gradient** brand theme

## State Management

- **localStorage** for persisting user data
- **React hooks** for component state
- **URL state** for navigation and routing

## Environment Variables

```bash
VITE_API_URL=http://localhost:8000  # Backend API URL
VITE_APP_NAME=Pecura AI           # Application name
VITE_APP_VERSION=1.0.0              # Version number
```

## Development Workflow

1. **Mock Development**: Build UI with mock data
2. **API Integration**: Connect to backend endpoints
3. **Testing**: Validate user flows and edge cases
4. **Polish**: Refine UX and add error handling

## Key Features Implementation

### Skin Type Quiz
- Multi-step form with progress tracking
- Support for single and multiple choice questions
- Results stored in localStorage for dashboard

### Product Recommendations
- Similarity-based matching using ingredient analysis
- Confidence scores and match explanations
- Integration with user's skin type profile

### Routine Builder
- Drag-and-drop ordering for morning/evening routines
- Product categorization and conflict detection
- Persistent storage across sessions

### Ingredient Safety
- Real-time conflict detection
- Common ingredient suggestions
- Safety warnings and recommendations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style and patterns
2. Use semantic component names
3. Implement responsive design for all features
4. Add loading states and error handling
5. Test across different screen sizes

## Deployment

Build for production:
```bash
npm run build
```

The `dist/` folder contains the production-ready files that can be deployed to any static hosting service.

## Future Enhancements

- User authentication and profiles
- Social features and reviews
- Advanced filtering and search
- Mobile app version
- Offline functionality
