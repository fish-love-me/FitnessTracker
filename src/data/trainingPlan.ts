import type { TrainingPlan } from '../types/index';

export const trainingPlan: TrainingPlan = {
  Sunday: {
    name: "Upper Body (Strength)",
    duration: "~60 min",
    type: "strength",
    exercises: [
      { name: "Barbell Bench Press", sets: 5, reps: "4-6", rest: 180 },
      { name: "Barbell Rows", sets: 4, reps: "5-7", rest: 150 },
      { name: "Weighted Pull-ups", sets: 3, reps: "5-8", rest: 120 },
      { name: "Overhead Press", sets: 4, reps: "5-7", rest: 150 },
      { name: "Barbell Curls", sets: 3, reps: "6-8", rest: 90 },
      { name: "Tricep Dips", sets: 3, reps: "6-10", rest: 90 }
    ]
  },
  Monday: {
    name: "Lower Body (Strength)",
    duration: "~60 min",
    type: "strength",
    exercises: [
      { name: "Back Squats", sets: 5, reps: "4-6", rest: 180 },
      { name: "Leg Press", sets: 4, reps: "6-8", rest: 150 },
      { name: "Leg Curls", sets: 4, reps: "8-10", rest: 90 },
      { name: "Standing Calf Raises", sets: 4, reps: "8-12", rest: 90 },
      { name: "Hanging Leg Raises", sets: 3, reps: "10-15", rest: 60 }
    ]
  },
  Tuesday: {
    name: "Rest or Easy Swim",
    duration: "0-30 min",
    type: "rest",
    exercises: []
  },
  Wednesday: {
    name: "Rest or Easy Swim",
    duration: "0-30 min",
    type: "rest",
    exercises: []
  },
  Thursday: {
    name: "Upper Body (Hypertrophy)",
    duration: "~50-60 min",
    type: "hypertrophy",
    exercises: [
      { name: "Incline Dumbbell Press", sets: 4, reps: "8-12", rest: 90 },
      { name: "Seated Cable Rows", sets: 4, reps: "10-12", rest: 90 },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: "8-12", rest: 90 },
      { name: "Lat Pulldowns", sets: 3, reps: "10-15", rest: 90 },
      { name: "Lateral Raises", sets: 3, reps: "12-15", rest: 60 },
      { name: "Face Pulls", sets: 3, reps: "15-20", rest: 60 }
    ]
  },
  Friday: {
    name: "Lower Body (Hypertrophy)",
    duration: "~60 min",
    type: "hypertrophy",
    exercises: [
      { name: "Back Squats", sets: 4, reps: "8-12", rest: 120 },
      { name: "Leg Press", sets: 3, reps: "12-15", rest: 90 },
      { name: "Leg Curls", sets: 4, reps: "12-15", rest: 60 },
      { name: "Leg Extensions", sets: 4, reps: "12-15", rest: 60 },
      { name: "Seated Calf Raises", sets: 4, reps: "15-20", rest: 60 },
      { name: "Ab Wheel", sets: 3, reps: "10-12", rest: 60 }
    ]
  },
  Saturday: {
    name: "Full Rest",
    duration: "-",
    type: "rest",
    exercises: []
  }
};

export const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

