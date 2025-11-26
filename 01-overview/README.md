# Snake Game

A beautifully designed and responsive Snake Game built with React, Vite, and Tailwind CSS. This classic game includes modern features like wall toggling, speed control, and pass-through mode for an enhanced gaming experience.

## Features

- **Classic Snake Gameplay**: Control the snake to eat food and grow without hitting walls or yourself
- **Wall Toggle**: Switch between wall mode (game ends when hitting walls) and pass-through mode (snake wraps around the screen)
- **Speed Control**: Adjust the game speed to make the game easier or more challenging
- **Score Tracking**: Keep track of your score as you play
- **Pause/Resume**: Pause and resume gameplay at any time
- **Responsive Design**: Works well on different screen sizes
- **Beautiful UI**: Clean and modern interface using Tailwind CSS

## Technology Stack

- **React**: A JavaScript library for building user interfaces
- **Vite**: Next-generation frontend tooling for fast development
- **Tailwind CSS**: Utility-first CSS framework for styling
- **JavaScript (ES6+)**: Modern JavaScript for game logic

## How to Play

1. Use the **arrow keys** to control the direction of the snake
2. Press **spacebar** to pause and resume the game
3. Press **'W'** key to toggle between walls and pass-through mode
4. Adjust the speed using the slider control
5. Try to eat as much food as possible without colliding with walls or yourself

## Game Modes

- **Walls Mode**: The snake dies if it hits the walls
- **Pass-through Mode**: The snake wraps around the screen when it reaches an edge

## Controls

- **Arrow Keys**: Move the snake
- **Spacebar**: Pause/Resume game
- **W Key**: Toggle walls/pass-through mode
- **Start/Restart buttons**: Start new game

## Installation

1. Clone or download this repository
2. Navigate to the project directory: `cd 01-overview/snake-game`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Open your browser to the URL shown in the terminal

## Development

This project was bootstrapped with Vite for fast development and optimized builds. The game logic is implemented in React using hooks for state management.

## Game Mechanics

- Each food item eaten increases the score by 10 points
- The snake grows in length with each food item consumed
- The game ends if the snake collides with itself or (in wall mode) with the boundaries
- The snake can move in four directions: up, down, left, right

## Customization

You can easily customize the game by modifying:

- Grid size (default: 20x20)
- Initial snake position
- Game speed range
- Colors and styling using Tailwind CSS classes