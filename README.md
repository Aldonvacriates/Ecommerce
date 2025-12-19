# E‑Commerce React App

A simple storefront built with React, TypeScript, Vite, React Query, and Redux Toolkit. Browse products from FakeStore API, filter by category, add items to a cart, and simulate checkout with session‑persisted state.

## Prerequisites
- Node.js 20.19+ or 22.12+
- npm 10+

## Setup
```bash
npm install
```

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
- **Product catalog:** Fetches all products via React Query; shows title, price, category, rating, description, and image with a placeholder fallback if the image fails to load.
- **Category filter:** Dynamically loads categories from FakeStore API and filters products without hardcoding options.
- **Cart management:** Redux Toolkit stores cart items (add/remove/update quantity) and keeps them in `sessionStorage` for persistence between sessions.
- **Totals & checkout:** Cart panel shows item counts and total price; checkout clears Redux state and session storage with success feedback.
- **Add from list:** Every product card provides “Add to Cart” directly on the Home page.

## Project structure
- `src/pages/Home.tsx`: Product listing, category filter, and cart layout.
- `src/commponents/ProductCard.tsx`: Product display card with image fallback and add-to-cart.
- `src/commponents/ShoppingCart.tsx`: Cart UI with quantities, totals, and checkout.
- `src/store/*`: Redux store, cart slice, and typed hooks.
- `src/types/types.ts`: Shared product and cart item types.

## Notes
- Data loads from `https://fakestoreapi.com/`. If any image endpoint 404s, the UI swaps to a placeholder for consistency.
- The project uses Bootstrap for layout/styling; adjust as needed.
