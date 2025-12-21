import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  products: [],
  categories: [],
  restaurants: [],
  hotels: [],
  users: [],
  orders: [],
  settings: {},
  notifications: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'UPDATE_PRODUCTS':
      return { ...state, products: action.payload };
    case 'UPDATE_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'UPDATE_RESTAURANTS':
      return { ...state, restaurants: action.payload };
    case 'UPDATE_HOTELS':
      return { ...state, hotels: action.payload };
    case 'UPDATE_USERS':
      return { ...state, users: action.payload };
    case 'UPDATE_ORDERS':
      return { ...state, orders: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 