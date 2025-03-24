import joblib
import numpy as np
import pandas as pd
import os

# Load model components
def load_model_components(model_dir):
    model = joblib.load(os.path.join(model_dir, "conflict_model.pkl"))
    scaler = joblib.load(os.path.join(model_dir, "scaler.pkl"))
    label_encoders = joblib.load(os.path.join(model_dir, "label_encoders.pkl"))
    return model, scaler, label_encoders


# Predict single datapoint (from form, etc.)
def predict_single(input_dict, model, scaler, label_encoders):
    # Convert categorical
    for col in ['COUNTRY', 'ADMIN1']:
        input_dict[col] = label_encoders[col].transform([input_dict[col]])[0]

    # Create feature array
    features_order = [
        'COUNTRY', 'ADMIN1', 'total_events', 'total_fatalities',
        'rainfall_mm', 'drought_index', 'temp_celsius',
        'poverty_rate', 'literacy_rate', 'infrastructure_score',
        'past_conflicts_3mo'
    ]
    features = np.array([input_dict[col] for col in features_order]).reshape(1, -1)
    features_scaled = scaler.transform(features)

    # Predict
    prediction = model.predict(features_scaled)[0]
    probability = model.predict_proba(features_scaled)[0][prediction]
    return prediction, probability


# Predict from uploaded CSV file
def predict_from_csv(csv_path, model, scaler, label_encoders):
    df = pd.read_csv(csv_path)

    # Encode categorical columns
    for col in ['COUNTRY', 'ADMIN1']:
        df[col] = label_encoders[col].transform(df[col])

    features = [
        'COUNTRY', 'ADMIN1', 'total_events', 'total_fatalities',
        'rainfall_mm', 'drought_index', 'temp_celsius',
        'poverty_rate', 'literacy_rate', 'infrastructure_score',
        'past_conflicts_3mo'
    ]
    X = scaler.transform(df[features])
    preds = model.predict(X)
    probs = model.predict_proba(X).max(axis=1)

    df['prediction'] = preds
    df['confidence'] = probs
    return df
