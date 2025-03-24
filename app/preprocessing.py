import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler


def load_and_preprocess_data(filepath):
    # Load dataset
    df = pd.read_csv(filepath)

    # Encode categorical variables
    label_encoders = {}
    for col in ['COUNTRY', 'ADMIN1']:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    # Define features and target
    features = [
        'COUNTRY', 'ADMIN1', 'total_events', 'total_fatalities',
        'rainfall_mm', 'drought_index', 'temp_celsius',
        'poverty_rate', 'literacy_rate', 'infrastructure_score',
        'past_conflicts_3mo'
    ]
    target = 'label'

    X = df[features]
    y = df[target]

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    return X_train, X_test, y_train, y_test, scaler, label_encoders
