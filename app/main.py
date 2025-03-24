from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import pandas as pd
import shutil
import os

from prediction import load_model_components, predict_single, predict_from_csv
from model import train_and_evaluate_model

app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

MODEL_DIR = "../models"
DATA_PATH = "../data/conflict_dataset.csv"

model, scaler, label_encoders = load_model_components(MODEL_DIR)


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/predict")
def predict(
    request: Request,
    country: str = Form(...),
    region: str = Form(...),
    total_events: float = Form(...),
    total_fatalities: float = Form(...),
    rainfall_mm: float = Form(...),
    drought_index: float = Form(...),
    temp_celsius: float = Form(...),
    poverty_rate: float = Form(...),
    literacy_rate: float = Form(...),
    infrastructure_score: float = Form(...),
    past_conflicts_3mo: int = Form(...)
):
    input_dict = {
        "COUNTRY": country,
        "ADMIN1": region,
        "total_events": total_events,
        "total_fatalities": total_fatalities,
        "rainfall_mm": rainfall_mm,
        "drought_index": drought_index,
        "temp_celsius": temp_celsius,
        "poverty_rate": poverty_rate,
        "literacy_rate": literacy_rate,
        "infrastructure_score": infrastructure_score,
        "past_conflicts_3mo": past_conflicts_3mo
    }
    pred, prob = predict_single(input_dict, model, scaler, label_encoders)
    return templates.TemplateResponse("index.html", {
        "request": request,
        "prediction": pred,
        "confidence": f"{prob:.2f}"
    })


@app.post("/upload")
def upload_file(file: UploadFile = File(...)):
    file_path = f"../data/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    df = predict_from_csv(file_path, model, scaler, label_encoders)
    output_path = file_path.replace(".csv", "_predicted.csv")
    df.to_csv(output_path, index=False)
    return {"message": "Prediction complete", "output_file": output_path}


@app.post("/retrain")
def retrain():
    train_and_evaluate_model(DATA_PATH, MODEL_DIR)
    global model, scaler, label_encoders
    model, scaler, label_encoders = load_model_components(MODEL_DIR)
    return {"message": "Retraining complete and model reloaded."}
