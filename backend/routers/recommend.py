from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import joblib
import numpy as np
from scipy.sparse import load_npz
from sklearn.metrics.pairwise import cosine_similarity
import json, os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR  = os.path.join(BASE_DIR, "data")

# Load once at startup
vectorizer   = joblib.load(os.path.join(MODEL_DIR, "vectorizer.pkl"))
tfidf_matrix = load_npz(os.path.join(MODEL_DIR, "tfidf_matrix.npz"))
products_df  = pd.read_csv(os.path.join(DATA_DIR, "products_clean.csv"))

# Build a quick id→index lookup
id_to_idx = {pid: i for i, pid in enumerate(products_df["product_id"])}


def get_matching_ingredients(idx_a: int, idx_b: int) -> list[str]:
    """Return the top shared ingredients between two products."""
    def get_ings(idx):
        raw = products_df.iloc[idx]["ingredients_parsed"]
        try:
            return set(json.loads(raw))
        except:
            return set()
    shared = get_ings(idx_a) & get_ings(idx_b)
    return sorted(list(shared))[:5]  # top 5 shared


@router.get("/recommend/{product_id}")
def recommend(product_id: str, top_n: int = Query(5, ge=1, le=20)):
    if product_id not in id_to_idx:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    
    idx = id_to_idx[product_id]
    product_vec = tfidf_matrix[idx]
    
    scores = cosine_similarity(product_vec, tfidf_matrix).flatten()
    scores[idx] = -1  # exclude self
    
    top_indices = np.argsort(scores)[::-1][:top_n]
    
    recs = []
    for i in top_indices:
        row = products_df.iloc[i]
        recs.append({
            "product_id":           row["product_id"],
            "name":                 row["name"],
            "brand":                row["brand"],
            "price":                row["price"],
            "type":                 row["type"],
            "score":                round(float(scores[i]), 4),
            "matching_ingredients": get_matching_ingredients(idx, i)
        })
    
    source = products_df.iloc[idx]
    return {
        "product_id":    product_id,
        "product_name":  source["name"],
        "recommendations": recs
    }


@router.get("/recommend/skin-type/{skin_type}")
def recommend_by_skin_type(skin_type: str, top_n: int = Query(10, ge=1, le=30)):
    """
    Recommend products based on skin type using ingredient keyword matching.
    """
    skin_ingredient_map = {
        "Oily":        ["niacinamide", "salicylic acid", "zinc", "clay", "retinol"],
        "Dry":         ["hyaluronic acid", "sodium hyaluronate", "glycerin", "ceramide", "shea butter"],
        "Combination": ["niacinamide", "glycerin", "hyaluronic acid", "salicylic acid"],
        "Sensitive":   ["centella asiatica", "allantoin", "aloe", "ceramide", "panthenol"],
        "Normal":      ["vitamin c", "retinol", "glycerin", "niacinamide"],
    }
    
    keywords = skin_ingredient_map.get(skin_type)
    if not keywords:
        raise HTTPException(status_code=400, detail=f"Unknown skin type: {skin_type}")
    
    # Score each product by how many target keywords appear in its ingredients
    def score_product(raw):
        try:
            ings = " ".join(json.loads(raw))
        except:
            return 0
        return sum(1 for kw in keywords if kw in ings)
    
    products_df["skin_score"] = products_df["ingredients_parsed"].apply(score_product)
    top = products_df[products_df["skin_score"] > 0].sort_values("skin_score", ascending=False).head(top_n)
    
    result = top[["product_id", "name", "brand", "price", "type", "skin_score"]].to_dict(orient="records")
    return {"skin_type": skin_type, "recommendations": result}