import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from preprocessing import load_and_preprocess_data


def train_and_evaluate_model(data_path, model_output_path):
    # Load processed data
    X_train, X_test, y_train, y_test, scaler, label_encoders = load_and_preprocess_data(data_path)

    # Train the model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Predict
    y_pred = model.predict(X_test)

    # Evaluate
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    print("\nMetrics:")
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("Precision:", precision_score(y_test, y_pred))
    print("Recall:", recall_score(y_test, y_pred))
    print("F1 Score:", f1_score(y_test, y_pred))

    # Save model, scaler, and encoders
    os.makedirs(model_output_path, exist_ok=True)
    joblib.dump(model, os.path.join(model_output_path, "conflict_model.pkl"))
    joblib.dump(scaler, os.path.join(model_output_path, "scaler.pkl"))
    joblib.dump(label_encoders, os.path.join(model_output_path, "label_encoders.pkl"))

    print("\n✅ Model, scaler, and encoders saved.")


if __name__ == "__main__":
    data_path = "../data/conflict_dataset.csv"
    model_output_path = "../models"
    train_and_evaluate_model(data_path, model_output_path)
