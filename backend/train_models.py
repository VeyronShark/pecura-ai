import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# 1. Define the directory to save models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# 2. Generate Synthetic Data
def generate_synthetic_data(n_samples=1000):
    data = []
    options = {
        'q1': ['tight_dry', 'comfortable', 'oily_shiny', 'irritated'],
        'q2': ['never', 'occasionally', 'frequently', 'constantly'],
        'q3': ['same', 'slightly_oily', 'very_oily', 'dry_tight'],
        'q4': ['no_reaction', 'mild_reaction', 'strong_reaction', 'very_sensitive'],
    }

    for _ in range(n_samples):
        row = {k: np.random.choice(v) for k, v in options.items()}

        score = 0
        if row['q1'] == 'oily_shiny': score += 2
        if row['q3'] == 'very_oily': score += 2
        if row['q3'] == 'slightly_oily': score += 1
        if row['q2'] in ['frequently', 'constantly']: score += 1
        if row['q1'] == 'tight_dry': score -= 2
        if row['q3'] == 'dry_tight': score -= 2

        if row['q4'] in ['strong_reaction', 'very_sensitive'] or row['q1'] == 'irritated':
            row['skin_type'] = 'Sensitive'
        elif (row['q1'] == 'oily_shiny' and row['q3'] == 'dry_tight') or \
             (row['q1'] == 'tight_dry' and row['q3'] == 'slightly_oily'):
            row['skin_type'] = 'Combination'
        elif score >= 2:
            row['skin_type'] = 'Oily'
        elif score <= -2:
            row['skin_type'] = 'Dry'
        else:
            row['skin_type'] = 'Normal'

        data.append(row)
    return pd.DataFrame(data)

def train_and_save():
    print("🔄 Generating synthetic data...")
    df = generate_synthetic_data(1000)

    X = df[['q1', 'q2', 'q3', 'q4']]
    y = df['skin_type']

    encoders = {}
    for col in X.columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoders[col] = le

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    joblib.dump(model, os.path.join(MODEL_DIR, "skin_type_model.pkl"))
    joblib.dump(encoders, os.path.join(MODEL_DIR, "skin_encoders.pkl"))
    print(f"✅ Model saved to {MODEL_DIR}")

if __name__ == "__main__":
    train_and_save()