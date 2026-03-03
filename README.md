# Flashcards Quiz App

A web-based quiz application designed for practicing various academic subjects. The application features a modern, dark-themed user interface built with Tailwind CSS and dynamically loads quiz content from JSON files.

## 🌐 Live Access

The application is available online at: **[quiz.ivanb.eu](https://quiz.ivanb.eu)**

## 📚 Available Quizzes

The platform currently hosts quizzes for the following engineering subjects:

*   **DIGEL 1.dio** - Digitalna Elektronika (Prvi kolokvij)
*   **DIGEL 2.dio** - Digitalna Elektronika (Drugi kolokvij)
*   **PZI 2.dio** - Programiranje Za Internet (Drugi kolokvij)
*   **IGIP 1** - Inženjerska grafika i projektiranje
*   **Kom.Vj.1** - Komunikacijske Vještine (Prvi kolokvij)

## 🚀 Features

*   **Modes of Practice**:
    *   **10 / 20 / 30 Random Pitanja**: Quick practice with a random selection of questions.
    *   **Sva pitanja**: Challenge yourself with the complete question bank for a subject.
    *   **Pregled**: Review mode to study questions and answers without the pressure of a quiz.
*   **Variable Answer Options**: Supports 2–8 answer choices per question with responsive layout.
*   **Interactive Interface**:
    *   Real-time score tracking.
    *   Timer for performance monitoring.
    *   Immediate feedback on answers.
*   **Responsiveness**: Fully responsive design that works on mobile and desktop devices.
*   **Dark Mode**: Modern glassmorphism dark theme optimized for late-night study sessions.

## 🛠️ Technology Stack

*   **HTML5 & CSS3**: Semantic structure and styling.
*   **Tailwind CSS**: Utility-first CSS framework for rapid and consistent UI design.
*   **JavaScript (Vanilla)**: Handles application logic, quiz state management, and JSON data fetching.
*   **Node.js + Express**: Local admin tool for managing quiz content.

## 📂 Project Structure

*   `index.html`: The main single-page application file containing the functionality and UI.
*   `quiz/`: Directory containing subject-specific data.
    *   Each subdirectory (e.g., `digel1dio/`) contains:
        *   `quiz.json`: database of questions and answers.
        *   Assets (images) specific to that quiz.
*   `admin/`: Local admin tool for managing quiz JSON files.
    *   `server.js`: Express server that provides a REST API for CRUD operations.
    *   `public/index.html`: Admin web UI.

## 🔧 Quiz Admin Tool

A local web-based admin interface for managing quiz questions without any online databases.

### Setup & Usage

```bash
cd admin
npm install
npm start
```

Then open **http://localhost:3333** in your browser.

### Features

*   **List all quizzes** with question counts
*   **Add, edit, delete, and duplicate** questions within any quiz
*   **Create new quiz categories** (creates folder + JSON file)
*   **Delete entire quizzes**
*   **Search** through questions
*   **Support for 2–8 answer options** per question
*   All changes are saved directly to the local `quiz.json` files — no online databases

## 👤 Author

**Ivan.B**
