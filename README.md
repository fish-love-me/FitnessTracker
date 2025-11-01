# FitTrack - Fitness Tracker App

A beautiful, native Android fitness tracking app built with React Native, TypeScript, and Expo. Inspired by the Claude.ai design aesthetic.

## Features

- 🏋️ **Workout Tracking**: Log sets, reps, and weights with automatic rest timers
- 📊 **Progress Tracking**: Visual progress charts, weight tracking, and workout history
- 🍎 **Nutrition Tracking**: Daily macro intake tracking with quick-add meals
- 📅 **Training Plan**: Customizable weekly workout schedule with full edit mode
- 🎨 **Beautiful Design**: Claude.ai-inspired dark theme with elegant typography

## Tech Stack

- **React Native** with **TypeScript**
- **Expo** (managed workflow)
- **React Navigation** (Stack & Bottom Tabs)
- **AsyncStorage** for local data persistence
- **Expo Haptics** for tactile feedback
- **Expo Notifications** for rest timer alerts

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for emulator) or Expo Go app (for physical device)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fish-love-me/FitnessTracker.git
cd FitnessTracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
# or
expo start
```

4. Run on Android:
- Press `a` in the terminal to open on Android emulator
- Or scan the QR code with Expo Go app on your phone

## Project Structure

```
FitnessTracker/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens
│   ├── hooks/          # Custom React hooks
│   ├── data/           # Training plan data
│   ├── types/          # TypeScript type definitions
│   ├── theme/          # Design system (colors, typography)
│   └── utils/          # Utility functions
├── App.tsx             # Root component
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## Features in Detail

### Home Screen
- Today's workout card with day navigation
- Weekly progress tracking
- Current weight & target display
- Nutrition summary with progress bars

### Workout Screen
- Active workout session tracking
- Automatic rest timer with notifications
- Set logging with large number pad
- Exercise navigation (Previous/Next)
- Haptic feedback on set completion

### Training Plan
- Full weekly schedule view
- Edit mode with drag-and-drop reordering
- Customize workout days and exercises
- Edit exercise details (sets, reps, rest time)

### Nutrition Tracking
- Daily macro intake (calories, protein, carbs, fats)
- Progress bars for each macro
- Quick-add meal buttons
- Number pad for easy input

### Progress Tracking
- Weight tracking with visual progress bar
- Workout history with statistics
- Total workouts and average duration
- Weight change tracking

## Design System

The app uses a custom design system inspired by Claude.ai:
- **Colors**: Warm dark background (#1c1c1c), terra cotta primary (#da7756)
- **Typography**: Serif headings, sans-serif body, monospace for numbers
- **Components**: Flat design with subtle borders and spacing

## Building for Production

To build an APK:
```bash
expo build:android
```

Or use EAS Build:
```bash
npm install -g eas-cli
eas build --platform android
```

## License

Private project

## Author

Your Name
