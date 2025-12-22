# Bug Fix Report: Admin Panel Showing Incorrect Customer Names

## Root Cause Analysis
The issue where all orders displayed the Admin's name (or the latest signed-in user's name) proceeded from two main factors:
1.  **Missing Data Snapshot:** When an order was created, the system relied solely on `user_id` reference and `shipping_address`. It did NOT save a snapshot of the customer's profile (`name`, `email`) at the time of order.
2.  **Fallback to Linked Account:** If `shipping_address` was incomplete or `populate` logic favored the linked `user_id`, and if orders were created *by* the Admin (during testing) or if `user_id` linkage was ambiguous, the Admin Panel displayed the linked account's details.

## Changes Applied

### 1. Backend Schema Updates (`src/models/order.js`)
- Added explicit snapshot fields to the Order schema:
  - `customer_name`
  - `customer_email`
  - `customer_phone`
- This ensures that every order carries its own customer identity, independent of the `User` collection reference.

### 2. Backend Logic Updates
- **Order Creation (`src/controllers/order.controller.js`):**
  - Updated `createOrder` to fetch the current user's profile (`User.findById(req.user.id)`) and save it to the new `customer_*` snapshot fields.
- **Admin Order Retrieval (`src/controllers/adminOrder.controller.js`):**
  - Updated `getAllOrders`, `searchOrderByNumber`, and `exportOrders`.
  - Implemented explicit valid logic to **prioritize** the snapshot data (`customer_name`) over the `user_id` reference.
  - This guarantees that "What you see is who placed the order", even if the original User account is modified or deleted.

### 3. Frontend Verification
- Verified `OrderTable.jsx` and `OrderDetailsModal.jsx`.
- Confirmed they correctly read from `order.user.name`. Since the backend now correctly populates `order.user` with the snapshot data (fallback to `user_id`), the frontend will display the correct name without modification.
- Confirmed no global `AuthContext` state is leaking into the order list.

## Validation Steps (How to Test)
1.  **Restart Backend:** `npm start` in `node-backend`.
2.  **Create User A:** Sign up/Login as "User A" in the Super App.
3.  **Place Order:** Create a new order (e.g., specific item, specific total).
4.  **Check Admin:** Log in to Admin Panel. Locate the new order.
    - **Expected:** Name should be "User A".
5.  **Create User B:** Sign up/Login as "User B".
6.  **Place Order:** Create another order.
7.  **Check Admin:** Refresh Admin Panel.
    - **Expected:** New order shows "User B". Previous order still shows "User A".

**Note:** Old orders created *before* this fix will still default to their linked `user_id` or `shipping_address`, as they lack the new snapshot fields. New orders will work correctly.
