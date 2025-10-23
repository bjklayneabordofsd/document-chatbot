

# Run and deploy

Windows prerequisite:
   - docker desktop
Linux prerequisite:
   - docker engine
   - docker compose
   
Go to project directory and use "docker-compose -f docker-compose.yml up --build -d" or "docker compose up --build -d"

## Run Locally 

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`


## How It Works: Data Flow

### 1. PDF Processing & Information Update

1.  **Admin Upload**: An admin selects a PDF file from their local machine and clicks "Upload and Process."
2.  **File Conversion**: The React app reads the file and converts it into a `base64`-encoded string.
3.  **Gemini API Call (Text Extraction)**: The `base64` string is sent to the Gemini API with the prompt: `"Extract all text from this PDF document."`
4.  **Store Knowledge Base**: The text response from Gemini is stored in the browser's `localStorage` under the key `pdf_text`.
5.  **State Reset**: Upon a successful new upload, the existing `chat_history`, `chat_sessions`, and `question_stats` in `localStorage` are cleared to ensure the new document starts with fresh statistics.
6.  **UI Feedback**: The admin interface displays a success message confirming the chatbot is updated.

### 2. User Chat Interaction

1.  **User Enters Chat**: A user navigates to the "Regular User" view. The app checks `localStorage` for `pdf_text`. If it's missing, the chat input is disabled with a message to the user.
2.  **User Sends Message**: The user types a question and sends it.
3.  **Constructing the Prompt**: The app retrieves the `pdf_text` from `localStorage`. It then constructs a detailed prompt for the Gemini API, which includes a strict `systemInstruction` and the user's question, framed by the document's content.
4.  **Gemini API Call (Chat Response)**: The prompt is sent to the Gemini API. The `systemInstruction` forces the model to base its answer *only* on the provided text and to use a specific phrase ("I'm sorry, I don't have that information right now.") if the answer isn't present.
5.  **Display Response**: The AI's response is added to the chat history, which is displayed in the UI and saved back to `localStorage`.
6.  **Background Categorization**: Simultaneously, the user's question is sent in a separate, non-blocking call to the Gemini API with a prompt to categorize it (e.g., "Rooms," "Booking," "Amenities"). The returned category is used to update the `question_stats` in `localStorage`.

### 3. Admin Dashboard Design

1.  **Data Retrieval**: When the Admin view is loaded, it reads `chat_sessions` and `question_stats` directly from `localStorage`.
2.  **Data Transformation**: The `question_stats` object (e.g., `{ "Rooms": 5, "Booking": 3 }`) is transformed into an array format that the Recharts library can consume (e.g., `[{ name: "Rooms", questions: 5 }, ...]`).
3.  **Rendering**: The components render the retrieved data. The bar chart is rendered using the transformed data, providing a clear visual breakdown of user interests. The data updates in real-time as users interact with the chatbot in other tabs or sessions.

---

## Instructions for Running, Testing, and Extending

Please refer to the `DEPLOYMENT.md` file for detailed instructions on how to set up and run this project locally.

### Extending the System

This application provides a solid foundation that can be extended in several ways:
-   **Backend Integration**: Replace `localStorage` with a proper database and backend API (e.g., Node.js, Firebase) to enable multi-user persistence and more robust data management.
-   **User Authentication**: Add a login system for admins to protect the dashboard and upload functionality.
-   **Streaming Responses**: Modify the chat to use Gemini's streaming capabilities for a more immediate "typing" effect from the AI.
-   **Advanced Analytics**: Track more detailed metrics, such as user satisfaction ratings on AI responses or common unanswered questions.

