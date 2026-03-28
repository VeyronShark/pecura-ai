from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import json, os
from utils.product_serializer import row_to_product

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

products_df = pd.read_csv(os.path.join(DATA_DIR, "products_clean.csv"))


@router.get("/products")
def get_products(
    type: str = Query(None),
    brand: str = Query(None),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
):
    df = products_df.copy()

    if type:
        df = df[df["type"].str.lower() == type.lower()]
    if brand:
        df = df[df["brand"].str.lower().str.contains(brand.lower(), na=False)]
    if search:
        mask = (
            df["name"].str.lower().str.contains(search.lower(), na=False) |
            df["brand"].str.lower().str.contains(search.lower(), na=False) |
            df["ingredients_parsed"].str.lower().str.contains(search.lower(), na=False)
        )
        df = df[mask]

    total = len(df)
    total_pages = max(1, -(-total // limit))  # ceiling division
    start = (page - 1) * limit
    df = df.iloc[start: start + limit]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "products": [row_to_product(row) for _, row in df.iterrows()],
    }


@router.get("/product/{product_id}")
def get_product(product_id: str):
    row = products_df[products_df["product_id"] == product_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Product not found")
    return row_to_product(row.iloc[0])
