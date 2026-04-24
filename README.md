# 💊 Smart Prescription Navigator 💊

Smart Prescription Navigator is a Node.js backend service designed to streamline the process of finding and obtaining prescription medicines. By leveraging real-time communication with Socket.IO and integrating map services, this project helps users locate the nearest pharmacy that stocks their prescribed medicines, making healthcare more accessible and reducing the hurdles in medicine procurement.

## Features

- **Real-Time Communication:** Uses Socket.IO for instant updates between users and pharmacies.
- **Pharmacy Locator:** Integrates with map APIs to find the nearest pharmacy based on your prescription.
- **Prescription Management:** Securely handles user prescriptions and pharmacy inventories.
- **Community Support:** Facilitates easier access to medicines, supporting the local community.

## Folder Structure

```
Backend-Node.js/
├── controllers/        # Business logic for prescriptions, pharmacies, users
├── models/             # Mongoose models for MongoDB collections
├── routes/             # Express route definitions
├── sockets/            # Socket.IO event handlers
├── utils/              # Utility functions (e.g., map integration, helpers)
├── config/             # Configuration files (DB, environment, etc.)
├── middleware/         # Express middleware (auth, error handling)
├── tests/              # Automated tests
├── app.js              # Main application entry point
├── package.json        # Project metadata and dependencies
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- npm

### Installation

```bash
git clone https://github.com/GDG-Hackaton-G10/Backend-Node.js.git
cd Backend-Node.js
npm install
```

### Configuration

1. Copy `.env.example` to `.env` and update environment variables (MongoDB URI, API keys, etc.).
2. Set up any required map API keys (e.g., Google Maps).

### Running the Server

```bash
npm start
```

The server will run on the port specified in your `.env` file.

## API Endpoints

- `POST /api/prescriptions` — Upload a new prescription
- `GET /api/pharmacies/nearby` — Find nearby pharmacies with required medicines
- `GET /api/prescriptions/:id/status` — Track prescription status in real-time

## Real-Time Communication

Socket.IO is used for:

- Live updates on prescription status
- Notifications when medicines are available
- Real-time chat between users and pharmacies

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.

## Contact

😊 Thank you for checking out **Smart Prescription Navigator**!  
If you have suggestions, ideas, or want to contribute, feel free to join the discussion.  
Stay healthy ! 💊
