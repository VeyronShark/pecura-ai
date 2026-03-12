import pandas as pd
import json
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import save_npz
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# Load products
df = pd.read_csv(os.path.join(BASE_DIR, "data", "products_clean.csv"))

# Convert ingredients_parsed (JSON string) to a single text blob per product
def ingredients_to_text(raw):
    try:
        items = json.loads(raw)
        return " ".join(items)
    except:
        return ""

df["ingredient_text"] = df["ingredients_parsed"].apply(ingredients_to_text)

# Build TF-IDF matrix
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(df["ingredient_text"])

# Save everything
joblib.dump(vectorizer, os.path.join(MODEL_DIR, "vectorizer.pkl"))
save_npz(os.path.join(MODEL_DIR, "tfidf_matrix.npz"), tfidf_matrix)
df[["product_id", "name", "brand", "price", "type"]].to_csv(
    os.path.join(BASE_DIR, "data", "products_indexed.csv"), index=False
)

print(f"✅ Saved vectorizer, tfidf_matrix, and product index. Shape: {tfidf_matrix.shape}")