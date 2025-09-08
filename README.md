# Projects & Tasks Tracker

This is a modern project management and task tracking application built with Next.js, ShadCN UI, Tailwind CSS, and Genkit for AI-powered features. It was developed with Firebase Studio.

## Overview

This application provides a comprehensive platform for managing complex projects, particularly geared towards MEP (Mechanical, Electrical, Plumbing) engineering workflows. It allows users to create projects, define core tasks and sub-tasks with dependencies, assign team members, and track progress through various stages.

## Key Features

- **Project Dashboard**: A central view of all projects, with at-a-glance progress and status.
- **Detailed Project View**: Dive into individual projects to manage tasks, sub-tasks, and dependencies.
- **Team Management**: Add and view team members and see their assigned workloads.
- **Hierarchical Tasks**: Create core tasks and nested sub-tasks to break down complex work.
- **Task Dependencies**: Establish dependencies between tasks to ensure logical workflow progression.
- **AI-Powered Summaries**: Generate insightful PDF summaries for single projects or the entire portfolio, powered by Google's Gemini model via Genkit.
- **Dynamic Filtering**: Easily filter projects and tasks by stage, status, or team members.
- **Activity Logging**: Export a CSV log of all status changes for project auditing.

## Tech Stack

- **Framework**: Next.js (App Router)
- **UI**: React, ShadCN UI
- **Styling**: Tailwind CSS
- **Generative AI**: Genkit (with Google's Gemini)
- **State Management**: Client-side stores (for rapid prototyping)

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google AI API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**
    The application requires two processes to run concurrently: the Next.js frontend and the Genkit AI server.

    In your first terminal, run the Next.js app:
    ```bash
    npm run dev
    ```

    In a second terminal, run the Genkit server:
    ```bash
    npm run genkit:watch
    ```

5.  **Open the application:**
    Open [http://localhost:9002](http://localhost:9002) in your browser to see the result.
