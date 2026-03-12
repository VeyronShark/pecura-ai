from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

CONFLICTS = [
    {"pair": ["retinol", "vitamin c"],  "warning": "Can cause irritation when combined. Use at different times of day."},
    {"pair": ["retinol", "aha"],        "warning": "Over-exfoliation risk. Use on alternate nights."},
    {"pair": ["retinol", "bha"],        "warning": "Over-exfoliation risk. Use on alternate nights."},
    {"pair": ["niacinamide", "vitamin c"], "warning": "May reduce each other's efficacy. Slight risk of flushing."},
    {"pair": ["salicylic acid", "benzoyl peroxide"], "warning": "Excessive drying. Use separately."},
    {"pair": ["aha", "bha"],            "warning": "Can be too harsh combined. Patch test recommended."},
]

class IngredientsPayload(BaseModel):
    ingredients: list[str]

@router.post("/analyze/ingredients")
def analyze_ingredients(payload: IngredientsPayload):
    ings = [i.lower().strip() for i in payload.ingredients]
    warnings = []
    for conflict in CONFLICTS:
        a, b = conflict["pair"]
        if any(a in i for i in ings) and any(b in i for i in ings):
            warnings.append({"ingredients": conflict["pair"], "message": conflict["warning"]})
    return {
        "analyzed": ings,
        "warnings": warnings,
        "safe": len(warnings) == 0
    }