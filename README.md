# Economic Policy Predictor

A sophisticated economic policy prediction system that uses machine learning models to analyze and predict the impact of various economic policies on key economic indicators.

## Project Structure

The project consists of two main components:

1. **FlaskApp_og**: Backend API service built with Flask
   - Contains machine learning models for economic predictions
   - Handles policy impact calculations
   - Provides REST API endpoints for predictions

2. **PBLapp**: Frontend application
   - React Native mobile application
   - Provides user interface for policy predictions

## Features

- Predicts multiple economic indicators:
  - GDP Growth
  - CPI (Consumer Price Index)
  - Unemployment Rate
  - Exports (% of GDP)
  - Imports (% of GDP)

- Supports various economic policies:
  - Government spending adjustments
  - Fiscal deficit management
  - Subsidies and tax breaks
  - Export credits
  - Sector-specific policies

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd Economic_Policy_Predictor
```

2. Install backend dependencies:
```bash
cd FlaskApp_og
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd ../PBLapp
npm install
```

## Running the Application

### Backend (Flask API)

1. Navigate to the FlaskApp_og directory:
```bash
cd FlaskApp_og
```

2. Start the Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend (React Native App)

1. Navigate to the PBLapp directory:
```bash
cd PBLapp
```

2. Start the development server:
```bash
npm start
```

## API Endpoints

- `POST /predict`: Get predictions for economic indicators
- `POST /post_policy`: Apply and analyze economic policies

## Dependencies

### Backend
- Flask
- Pandas
- Scikit-learn
- Joblib
- NumPy
- Gunicorn

### Frontend
- React Native
- Expo

## Model Files

The following pre-trained models are included:
- GDP_Growth_rf.pkl
- General index_CPI_rf.pkl
- Exports of goods and services (% of GDP)_rf.pkl
- Imports of goods and services (% of GDP)_rf.pkl
- Unemployment Rate (%)_rf.pkl

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

Anvesha Singh anvesha2102@gmail.com