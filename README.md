# LokLink - Civic Issue Reporting Portal

LokLink is a modern full-stack web application designed for citizens to report civic issues (like potholes, broken streetlights, or garbage collection) directly to government authorities. It includes real-time tracking, geolocation support, and an authority portal for issue management.

## 🚀 Features

- **Citizen Portal**: Report issues with titles, descriptions, photos, and GPS location.
- **Interactive Map**: View all reported issues in the community with color-coded status pins.
- **GPS Integration**: Automatically fetch coordinates and geocode them into readable addresses.
- **Authority Portal**: Dashboard for government departments to assign, track, and resolve reported issues.
- **Evidence Support**: Support for uploading photo evidence for each reported issue.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Lucide React (Icons).
- **Styling**: Vanilla CSS with modern aesthetics.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB.
- **Maps**: Google Maps JavaScript API & Geocoding API.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)
- Google Cloud Console account (for Maps API)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/CCIRR.git
cd CCIRR
```

### 2. Server Setup
```bash
# Navigate to root
npm install
cp .env.example .env
# Edit .env and add your MongoDB URI
node server/app.js
```

### 3. Client Setup
```bash
cd client
npm install
cp .env.example .env
# Edit .env and add your VITE_GOOGLE_MAPS_API_KEY
npm run dev
```

## 🗺️ Google Maps Configuration

To use the map and GPS features:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable the **Maps JavaScript API** and **Geocoding API**.
4. Create an API Key under "Credentials".
5. Paste the key into `client/.env` as `VITE_GOOGLE_MAPS_API_KEY`.

## 📂 Project Structure

- `/client`: React frontend source code.
- `/server`: Node/Express backend and data models.
- `/server/data`: JSON seed data for initial setup.
- `/illustration`: Project assets and diagrams.

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements.

## 📄 License
This project is licensed under the MIT License.
