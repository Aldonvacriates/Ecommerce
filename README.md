# E-Commerce React App

A simple storefront built with React, TypeScript, Vite, Firebase Authentication, Firestore, and Redux Toolkit. Browse products from Firestore, filter by category, manage a cart, and place orders tied to authenticated users.

## Prerequisites
- Node.js 18+ (20/22 recommended)
- npm 10+

## Setup
```bash
npm install
```

### Firebase setup
1. Create a Firebase project in the Firebase console.
2. Add a web app to the Firebase project and copy the config values.
3. Enable Email/Password Authentication.
4. Enable Firestore (test mode for local development is fine).
5. Create a `.env.local` file based on `.env.example` and fill in your Firebase config values.

## Run the app
```bash
npm run dev
```
The dev server URL is printed in the terminal (default `http://localhost:5173`). 

## Production build
```bash
npm run build
npm run preview   # optional: serve the built app locally
```

## Features
- **Product catalog:** Loads products from Firestore and shows title, price, category, rating, description, and image with a placeholder fallback if the image fails to load.
- **Category filter:** Categories are derived from product data and filtered without hardcoding options.
- **Cart management:** Redux Toolkit stores cart items (add/remove/update quantity) and keeps them in `sessionStorage` for persistence between sessions.
- **Checkout + orders:** Checkout writes orders to Firestore and clears the cart after success.
- **Authentication:** Email/password registration and login with profile details stored in Firestore.
- **User profile:** View and update profile details, plus delete account data.
- **Product management:** Create, update, and delete products directly in the UI.
- **Order history:** View previous orders and expand them for full product details.

## Project structure
- `src/pages/Home.tsx`: Product listing, category filter, and cart layout.
- `src/pages/Profile.tsx`: Authentication, profile management, and order history.
- `src/commponents/ProductCard.tsx`: Product display card with image fallback and add-to-cart.
- `src/commponents/ProductManager.tsx`: Product create/edit/delete UI.
- `src/commponents/ShoppingCart.tsx`: Cart UI with quantities, totals, and checkout.
- `src/context/AuthContext.tsx`: Auth state and user profile actions.
- `src/firebase/firebase.ts`: Firebase app initialization.
- `src/firebase/firestore.ts`: Firestore helpers for products and orders.
- `src/store/*`: Redux store, cart slice, and typed hooks.
- `src/types/types.ts`: Shared product and cart item types.

## Notes
- Firestore collections used: `users`, `products`, and `orders`.
- You may need to create a composite index for `orders` if Firestore prompts you after running the app.
- The project uses Bootstrap for layout/styling; adjust as needed.
