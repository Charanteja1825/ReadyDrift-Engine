# 📋 Use Case Diagram for SkillForge

This document outlines the primary actors and use cases for the **SkillForge** application, illustrating how users interact with the system's AI-powered features.

```mermaid
usecaseDiagram
    actor "Student" as S
    actor "AI System (Gemini)" as AI

    package "SkillForge Application" {
        
        usecase "View Dashboard" as UD1
        usecase "Manage Profile" as UD2
        usecase "View Connections" as UD3

        package "AI Learning Features" {
            usecase "Perform Skill Gap Analysis" as UC1
            usecase "Take Mock Exam" as UC2
            usecase "Conduct Mock Interview" as UC3
            usecase "Chat with Study Assistant" as UC4
        }
        
    }

    %% User Actions
    S --> UD1
    S --> UD2
    S --> UD3
    S --> UC1
    S --> UC2
    S --> UC3
    S --> UC4

    %% AI Interactions
    UC1 -.-> AI : "Generates Roadmap & Strategy"
    UC2 -.-> AI : "Generates Questions & Explanations"
    UC3 -.-> AI : "Analyzes & Provides Feedback"
    UC4 -.-> AI : "Responds to Queries"

```

## 📝 Use Case Descriptions

### 1. Perform Skill Gap Analysis
- **Actor:** Student
- **Description:** The student inputs their current skills and a desired target role.
- **AI Action:** The AI analyzes the gap and generates a detailed learning roadmap, identifying missing skills and suggesting a timeline.

### 2. Take Mock Exam
- **Actor:** Student
- **Description:** The student selects a topic (e.g., DSA, SQL) and takes a generated exam comprising MCQs and coding questions.
- **AI Action:** The AI generates unique questions for each session and provides detailed explanations for answers.

### 3. Conduct Mock Interview
- **Actor:** Student
- **Description:** The student simulates a technical interview scenario.
- **AI Action:** The AI evaluates the student's performance, providing scores on confidence, clarity, and stress, along with qualitative feedback on strengths and weaknesses.

### 4. Chat with Study Assistant
- **Actor:** Student
- **Description:** The student asks study-related questions or seeks clarification on concepts.
- **AI Action:** The AI acts as a tutor, answering questions while filtering out non-educational topics.

### 5. Manage Profile
- **Actor:** Student
- **Description:** The student updates their personal information, education, skills, and projects to keep their portfolio current.

### 6. View Dashboard
- **Actor:** Student
- **Description:** The student views their overall progress, recent activities, and performance metrics.
