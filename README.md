# FOMO Reservation Web App
A Vue.JS 3 web application with Firebase as backend for real-time reservation, ordering, and payment, designed for a restaurant.

## Testing Notes
https://docs.google.com/document/d/1eSZ2GrIvIkwLBvSkPuOp87g1EHIlQ1M_Zo3GwCv4GOw/

## Features
_[Screenshots available here](https://ckcdev.vercel.app/project/fomo_reservation)_
- Real-time application updates (no web page reloads)
- Reservation can be limited to a number of persons (First Come, First Serve)
- Orders can also be capped to a number of items
- Payment integration with [Paymongo](https://www.paymongo.com/) (test payment only)
- Customers: View your past orders and print or save your receipt as image.
- Super Admin: A single account can add multiple admin accounts to view and handle orders.
- Admin: Can view and edit available products to order.
- Admin: Can use a [Google Sheet template](https://docs.google.com/spreadsheets/d/1VaO2SQamZREIwnsv7M7ZOSQhEQHfg9m7/) downloaded as .csv for easier product management

## Deployment Notes

1. Deploy this [repository](https://github.com/christiankyle-ching/FOMO-Reservation--Netlify-Functions) to Netlify Functions.
2. Get Firebase Config File.
3. Set `.env` variables
   - VUE_APP_CLIENT - Name of Company (Client)
   - VUE_APP_CLIENT_LINK - URL Link to Client's Website
   - VUE_APP_TITLE - App Title
   - VUE_APP_BACKEND_URL - Base URL of deployed Netlify functions
