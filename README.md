# PizzaPilot: Talk. Tap. Eat.

PizzaPilot is an AI-powered pizza ordering platform designed for a modern, conversational ordering experience.

## 🚀 Application Flow

### 🍕 Consumer Flow
1.  **Authentication**: Users start at a professionally centered login screen. New users can quickly create an account.
2.  **Location Setup**: Once logged in, users are prompted to set a delivery address. This supports browser geolocation for a "one-tap" experience.
3.  **AI Assistant**: The core ordering interface.
    *   **Natural Language**: Users order by chatting: *"Add two pepperonis and a coke."*
    *   **Menu QA**: Users can ask questions: *"Is the Paneer Tikka spicy?"* or *"What do you have under ₹300?"*
    *   **Smart Upselling**: Adding a pizza triggers a GenAI suggestion for a relevant side or drink.
4.  **Checkout**: A clean bill summary with tax calculation and payment method selection (Cash or Online).
5.  **Live Tracking**: A real-time status screen that updates as the restaurant processes the order.

### 👔 Owner Flow
1.  **Admin Portal**: Accessible via `/admin/login` for users with the `owner` role.
2.  **Subscription Gating**: The dashboard requires a subscription. 
    *   **Basic**: Standard order and menu management.
    *   **Professional**: Unlocks advanced Business Intelligence (Analytics).
3.  **Order Management**: A real-time kanban-style board for accepting new orders and updating their status.
4.  **Inventory Control**: Toggle item availability. Out-of-stock items are immediately hidden from the AI's ordering logic.
5.  **Analytics**: (Pro Plan) Visualize sales trends, popular items, and delivery hotspots.
6.  **Restaurant Settings**: Manage public metadata like the restaurant name and contact info.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & ShadCN UI
- **Backend/Auth**: Firebase (Firestore & Authentication)
- **AI**: Genkit with Google Gemini 2.5 Flash
- **Icons**: Lucide React
