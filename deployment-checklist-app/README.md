# Deployment Checklist App

A lightweight, customizable checklist tool for developers to track and complete deployment steps. Everything is stored locally in the browser — no backend or user authentication required.

## Features

- **Add, Edit, and Delete Tasks**
  - Input form to add new checklist items
  - Edit item name by clicking the edit icon
  - Delete individual items with the trash icon

- **Mark as Complete**
  - Checkbox to mark items as completed
  - Completed items show a strikethrough effect

- **Save to Local Storage**
  - All checklist items and their status are automatically saved
  - Items persist across page reloads

- **Pre-Loaded Deployment Checklist**
  - Default checklist loaded on first visit
  - User can edit/delete default items as needed

- **Dark Mode Toggle**
  - Light/dark theme switcher with preference saved to localStorage

- **Reset All**
  - "Clear All" button to remove all tasks (with confirmation prompt)

- **Export Checklist**
  - Export your checklist to a Markdown file

- **Timestamps**
  - Each task shows when it was added

## Getting Started

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start managing your deployment tasks!

## Technologies Used

- HTML5
- CSS3 (with animations and transitions)
- Vanilla JavaScript
- Font Awesome for icons
- Local Storage API for data persistence

## Project Structure

```
deployment-checklist-app/
├── index.html      # Main HTML structure
├── style.css       # Styling with dark/light mode
└── script.js       # Application logic and localStorage handling
```

## No Installation Required

This is a client-side only application with no dependencies. Simply open the HTML file in any modern browser to use it.
