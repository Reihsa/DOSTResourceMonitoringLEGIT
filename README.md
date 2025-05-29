# DOST Resource Monitoring - Electricity Consumption Module

## Overview

This update adds a new electricity consumption upload feature, including API integration, UI components, and database schema for storing electricity data and related files.

---

## Changes

### 1. Backend / API

- **auth.js**
  - Added export statement to expose JWT authentication function: (Can be change if needed)
    ```js
    export { authenticateJWT };
    ```

- **api.js**
  - Added constant for electricity API endpoint:
    ```js
    const ELECTRICITY_API_URL = 'http://localhost:5000/api/electricity';
    ```
  - Added function to upload electricity data with authorization token:
    ```js
    export async function uploadElectricityData(formData, token) {
      const res = await fetch(ELECTRICITY_API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return res.json();
    }
    ```

---

### 2. Frontend / React

- **app.jsx**
  - Added conditional rendering for user role dashboard:
    ```jsx
    import UserDashboard from './components/UserDashboard.jsx'; //Import for User Dashboard

    {role === 'user' && (
      <div>
        <UserDashboard />
      </div>
    )}
    ```
  
- **New Components Added**
  - `UserDashboard.jsx`
  - `electricity.js`
  - `ElectricityUploadModal.jsx`

---

### 3. Database Schema (PostgreSQL)

- **electricity_consumption**
  ```sql
  CREATE TABLE electricity_consumption (
      id SERIAL PRIMARY KEY,
      month VARCHAR(20) NOT NULL,
      year INT NOT NULL,
      baseline DECIMAL(18,2) NOT NULL CHECK (baseline >= 0),
      consumption_kwh DECIMAL(18,2) NOT NULL CHECK (consumption_kwh >= 0),
      uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      user_id INT NOT NULL,
      CONSTRAINT UQ_month_year_user UNIQUE (month, year, user_id)
  );
  ```
  ```sql
  CREATE TABLE electricity_files (
      id SERIAL PRIMARY KEY,
      consumption_id INT NOT NULL REFERENCES electricity_consumption(id) ON DELETE CASCADE,
      file_name VARCHAR(255) NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  ```
