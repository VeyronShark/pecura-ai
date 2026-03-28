import json

TYPE_IMAGES = {
    "Moisturiser":  ["photo-1556228578-8c89e6adf883", "photo-1571781926291-c477ebfd024b", "photo-1556228720-195a672e8a03"],
    "Cleanser":     ["photo-1556228453-efd6c1ff04f6", "photo-1612817288484-6f916006741a", "photo-1570194065650-d99fb4bedf0a"],
    "Serum":        ["photo-1620916566398-39f1143ab7be", "photo-1598300042247-d088f8ab3a91", "photo-1571019613454-1cb2f99b2d8b"],
    "Toner":        ["photo-1570194065650-d99fb4bedf0a", "photo-1556228720-195a672e8a03", "photo-1612817288484-6f916006741a"],
    "Exfoliator":   ["photo-1556228453-efd6c1ff04f6", "photo-1608248543803-ba4f8c70ae0b", "photo-1598300042247-d088f8ab3a91"],
    "Oil":          ["photo-1608248543803-ba4f8c70ae0b", "photo-1571019613454-1cb2f99b2d8b", "photo-1556228578-8c89e6adf883"],
    "Mask":         ["photo-1570194065650-d99fb4bedf0a", "photo-1556228841-a3c527ebefe5", "photo-1612817288484-6f916006741a"],
    "Eye Care":     ["photo-1571781926291-c477ebfd024b", "photo-1620916566398-39f1143ab7be", "photo-1556228720-195a672e8a03"],
    "Mist":         ["photo-1556228453-efd6c1ff04f6", "photo-1570194065650-d99fb4bedf0a"],
    "Peel":         ["photo-1598300042247-d088f8ab3a91", "photo-1608248543803-ba4f8c70ae0b"],
    "Balm":         ["photo-1556228578-8c89e6adf883", "photo-1571781926291-c477ebfd024b"],
    "Body Wash":    ["photo-1612817288484-6f916006741a", "photo-1556228453-efd6c1ff04f6"],
    "Bath Salts":   ["photo-1570194065650-d99fb4bedf0a", "photo-1556228841-a3c527ebefe5"],
    "Bath Oil":     ["photo-1608248543803-ba4f8c70ae0b", "photo-1571019613454-1cb2f99b2d8b"],
}
DEFAULT_IMAGES = ["photo-1556228720-195a672e8a03", "photo-1620916566398-39f1143ab7be", "photo-1571019613454-1cb2f99b2d8b"]

SKIN_TYPE_MAP = {
    "Moisturiser":  ["Dry", "Normal", "Sensitive"],
    "Cleanser":     ["Oily", "Combination", "Normal"],
    "Serum":        ["Normal", "Combination", "Oily"],
    "Toner":        ["Oily", "Combination"],
    "Exfoliator":   ["Oily", "Combination"],
    "Oil":          ["Dry", "Normal"],
    "Mask":         ["Oily", "Combination", "Sensitive"],
    "Eye Care":     ["Normal", "Dry", "Sensitive"],
    "Mist":         ["Sensitive", "Dry", "Normal"],
    "Peel":         ["Oily", "Combination", "Normal"],
    "Balm":         ["Dry", "Sensitive"],
    "Body Wash":    ["Normal", "Dry"],
    "Bath Salts":   ["Normal", "Dry"],
    "Bath Oil":     ["Dry", "Sensitive"],
}


def get_image(product_type: str, product_id: str) -> str:
    pool = TYPE_IMAGES.get(product_type, DEFAULT_IMAGES)
    idx = abs(hash(product_id)) % len(pool)
    return f"https://images.unsplash.com/{pool[idx]}?w=400&h=400&fit=crop"


def row_to_product(row) -> dict:
    try:
        ingredients = json.loads(row["ingredients_parsed"])
    except Exception:
        ingredients = []
    ptype = row["type"]
    return {
        "product_id":   row["product_id"],
        "name":         row["name"],
        "brand":        row["brand"],
        "price":        float(row["price"]),
        "type":         ptype,
        "ingredients":  ingredients,
        "image":        get_image(ptype, row["product_id"]),
        "rating":       round(3.5 + (abs(hash(row["product_id"])) % 15) / 10, 1),
        "reviews_count": 100 + (abs(hash(row["name"])) % 2000),
        "description":  f"{ptype} by {row['brand']}.",
        "skin_types":   SKIN_TYPE_MAP.get(ptype, ["Normal"]),
    }
