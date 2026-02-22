# PizzaPilot: Talk. Tap. Eat.

PizzaPilot is an AI-powered pizza ordering platform designed for a modern, conversational ordering experience.

## 🚀 Application Flow

### 🍕 Consumer Experience
1.  **Authentication**: Users start at a professionally centered login screen.
2.  **Location Setup**: Once logged in, users are prompted to set a delivery address using browser geolocation.
3.  **AI Assistant**: Users order by chatting: *"Add two pepperonis and a coke."*
4.  **Checkout**: A clean bill summary with tax calculation and payment method selection.
5.  **Live Tracking**: A real-time status screen that updates as the restaurant processes the order.

### 👔 Owner Experience
1.  **Admin Portal**: Accessible for users with the `owner` role.
2.  **Subscription Gating**: Dashboard access requires a subscription (Basic or Professional).
3.  **Order Management**: A real-time board for accepting and processing orders.
4.  **Inventory Control**: Toggle item availability in real-time.
5.  **Analytics**: (Pro Plan) Visualize sales trends and delivery hotspots.

## 🛠 Deployment (Vercel)

To deploy successfully, you must add these **Environment Variables** in Vercel:

### Client-Side (NEXT_PUBLIC_)
*   `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase Web API Key.
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: `your-project.firebaseapp.com`.
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase Project ID.
*   `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase Web App ID.

### Server-Side (Private)
*   `FIREBASE_PROJECT_ID`: Your Firebase Project ID.
*   `FIREBASE_CLIENT_EMAIL`: The service account email.
*   `FIREBASE_PRIVATE_KEY`: The full service account private key (including BEGIN/END markers).
*   `GEMINI_API_KEY`: Your Google Gemini API Key.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & ShadCN UI
- **Backend/Auth**: Firebase Admin & Client SDKs
- **AI**: Genkit with Google Gemini
