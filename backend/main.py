from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import logging

app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MoodRequest(BaseModel):
    text: str

# Load emotion detection model
try:
    emotion_classifier = pipeline("text-classification", model="nateraw/bert-base-uncased-emotion")
except Exception as e:
    logging.error("Failed to load model: %s", str(e))
    raise RuntimeError("Model loading failed")

mood_suggestions = {
    "joy": "Keep spreading positivity! 🌞",
    "sadness": "Take a walk, talk to a friend, or write down your thoughts. 💙",
    "anger": "Try deep breathing or take a short break to cool down. 🔥",
    "fear": "You're safe. Practice mindfulness and grounding techniques. 🌱",
    "love": "Stay connected with loved ones and cherish the moment. ❤️",
    "surprise": "Embrace the unexpected! Reflect on what you can learn. ✨",
}

@app.get("/")
def read_root():
    return {"message": "Welcome to the SoulSync Emotion Classifier API"}

@app.post("/analyze")
async def analyze(req: MoodRequest):
    try:
        prediction = emotion_classifier(req.text)
        top_emotion = prediction[0]['label']
        suggestion = mood_suggestions.get(top_emotion.lower(), "Try to take a deep breath and reflect. 💫")

        return {
            "mood": top_emotion.capitalize(),
            "suggestion": suggestion
        }
    except Exception as e:
        logging.exception("Error during mood detection")
        raise HTTPException(status_code=500, detail="Internal error while detecting mood.")
