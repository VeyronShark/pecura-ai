from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os

app = FastAPI(title="Pecura AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models")

try:
    skin_model = joblib.load(os.path.join(MODEL_PATH, "skin_type_model.pkl"))
    skin_encoders = joblib.load(os.path.join(MODEL_PATH, "skin_encoders.pkl"))
except:
    skin_model = None
    print("⚠️ Model not found. Run train_models.py first.")

class QuizInput(BaseModel):
    responses: dict

@app.get("/")
def home():
    return {"message": "Skin Care AI is running!"}

@app.post("/predict/skin-type")
def predict_skin_type(data: QuizInput):
    if not skin_model:
        raise HTTPException(status_code=500, detail="Model not loaded")

    input_vector = []
    for q in ['q1', 'q2', 'q3', 'q4']:
        val = data.responses.get(q)
        encoder = skin_encoders[q]
        if val not in encoder.classes_:
            val = encoder.classes_[0]
        input_vector.append(encoder.transform([val])[0])

    prediction = skin_model.predict([input_vector])[0]
    confidence = float(max(skin_model.predict_proba([input_vector])[0]))

    return {
        "skin_type": prediction,
        "confidence": confidence,
        "description": f"You have {prediction} skin."
    }