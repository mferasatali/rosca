# Kameeti / Rosca Management App

A Vue 3 + Vuetify application for managing Kameeti (Rotating Savings and Credit Association) groups. This app helps you track monthly contributions, distributions, and calculations for ROSCA groups.

## Features

- **Group Management**: Create and manage multiple Kameeti groups
- **Member Management**: Add members with their kameeti counts (number of months they'll receive the pot)
- **Monthly Calculations**: Automatically calculate who receives the pot each month based on kameeti distribution
- **Firebase Integration**: Store all data in Firebase Firestore
- **Summary Views**: View monthly breakdowns and member summaries

## How It Works

In a Kameeti/Rosca:
- Members contribute a fixed amount each month
- Each month, one member receives the total pot (all contributions)
- Members can have multiple kameeti (multiple months where they receive the pot)
- Example: 10 months total, 8 members with 1 kameeti each, 1 member with 2 kameeti = 10 total kameeti

## Setup

### Prerequisites

- Node.js (^20.19.0 || >=22.12.0)
- Firebase account

### Installation

1. Install dependencies:
```sh
npm install
```

2. Set up Firebase (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)):
   - Create a Firebase project
   - Enable Firestore Database
   - Update `src/config/firebase.js` with your Firebase configuration

3. Run the development server:
```sh
npm run dev
```

4. Build for production:
```sh
npm run build
```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
