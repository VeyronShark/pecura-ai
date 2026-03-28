from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

CONFLICTS = [
    {"pair": ["retinol", "vitamin c"],          "warning": "Can cause irritation when combined. Use retinol at night and vitamin C in the morning."},
    {"pair": ["retinol", "glycolic acid"],       "warning": "Over-exfoliation risk. Use on alternate nights."},
    {"pair": ["retinol", "lactic acid"],         "warning": "Over-exfoliation risk. Use on alternate nights."},
    {"pair": ["retinol", "salicylic acid"],      "warning": "Over-exfoliation risk. Use on alternate nights."},
    {"pair": ["retinol", "aha"],                 "warning": "Over-exfoliation risk. Use on alternate nights."},
    {"pair": ["retinol", "bha"],                 "warning": "Over-exfoliation risk. Use on alternate nights."},
    {"pair": ["niacinamide", "vitamin c"],       "warning": "May reduce each other's efficacy at high concentrations. Apply separately or use a lower concentration."},
    {"pair": ["salicylic acid", "benzoyl peroxide"], "warning": "Excessive drying and irritation. Use at different times of day."},
    {"pair": ["glycolic acid", "salicylic acid"],    "warning": "Combining AHA and BHA can be too harsh. Patch test and use on alternate days."},
    {"pair": ["lactic acid", "salicylic acid"],      "warning": "Combining AHA and BHA can be too harsh. Patch test and use on alternate days."},
    {"pair": ["glycolic acid", "lactic acid"],       "warning": "Using multiple AHAs together increases irritation risk. Choose one at a time."},
    {"pair": ["aha", "bha"],                         "warning": "Can be too harsh combined. Patch test recommended."},
    {"pair": ["benzoyl peroxide", "vitamin c"],      "warning": "Benzoyl peroxide can oxidise and deactivate vitamin C. Use at different times of day."},
    {"pair": ["retinol", "benzoyl peroxide"],        "warning": "Can cause excessive dryness and irritation. Use at different times of day."},
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