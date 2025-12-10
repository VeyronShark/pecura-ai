# Skin-Care Product Recommendation System — Project README

## Project Objective
Build a production-ready prototype of a **Skin-Care Product Recommendation System** that gives personalized product and routine suggestions based on a user's skin type, concerns, ingredient compatibility, and community feedback. The system should be usable as a capstone submission: well-documented, modular, tested, and clearly demonstrable.

Primary goals:
- Accurately classify user skin type from a short survey.
- Recommend products based on ingredient similarity and suitability for the user's skin profile.
- Prevent harmful ingredient combinations and surface safety notes.
- Allow the user to build, save and track skincare routines.
- Provide an explainable recommendation (why a product was suggested).

## High-level architecture & tech stack
- **Frontend:** React + Vite (TypeScript optional) for interactive UI and routing.
- **Backend / API:** FastAPI (Python) for ML model serving and business logic.
- **ML & Data:** scikit-learn, pandas, joblib for models and preprocessing. VADER for review sentiment.
- **Storage:** CSVs for prototyping; SQLite or MongoDB for persistent storage if needed.
- **Deployment (optional):** Docker + Uvicorn/Gunicorn; host on Heroku / Render / Railway / Coolify.
- **Version control:** Git (GitHub or Gitea).

## Ideal file structure
```
/project-root
  /frontend                      # React app (Vite)
    /src
      /api                       # axios wrapper and api clients
      /components                # reusable UI components
      /pages                     # app pages: Landing, Quiz, Dashboard, Recommendations...
      /mock                      # local mock JSON for dev
  /backend                       # FastAPI project
    /data                        # raw datasets + cleaned CSVs (Member 1)
    /models                      # serialized models & vectorizers (.pkl, .npz)
    /routers                     # FastAPI routers (skin_type, recommend, products, ingredients, sentiment)
    /utils                       # utilities (compatibility rules, text cleaning)
    main.py
    requirements.txt
    train_models.py              # scripts to retrain models
  /docs                          # design docs, diagrams, SRS, test plans
  /tests                         # unit/integration tests (pytest)
  README.md                      # this file
  LICENSE
```

## Team and Roles (clear responsibilities)

### Team Member 1 — Data Engineer (Owner of `backend/data/`)
**Objective:** Build a high-quality, canonical dataset that the whole project consumes.
**Responsibilities:**
- Aggregate raw datasets (product lists, ingredient lists, optional review datasets).
- Clean, normalize, and deduplicate product and ingredient records.
- Produce: `products_clean.csv`, `ingredients_clean.csv`, `ingredient_normalization.json`.
- Provide a short data dictionary and `README_data_cleaning.md` describing sources and transformations.
- Provide scripts used for cleaning and normalization so results are reproducible.

**Acceptance criteria:**
- `products_clean.csv` contains `product_id, name, brand, price, type, ingredients_parsed`.
- `ingredients_clean.csv` contains canonical INCI ingredient names and metadata where available.
- `ingredient_normalization.json` maps common synonyms to canonical names (top ~100 synonyms included).

---

### Team Member 2 — ML Engineer (Skin-Type Classifier Owner)
**Objective:** Deliver a robust survey-based skin-type classifier and an API endpoint to serve predictions.
**Responsibilities:**
- Create or collect survey-labeled data (synthetic generation allowed initially).
- Train and validate a lightweight classifier (RandomForest / SVM) to map survey features → skin type.
- Save serialized model as `models/skin_type_model.pkl` and provide a training script `train_skin_type.py`.
- Implement and document `POST /predict/skin-type` FastAPI endpoint.
- Provide tests and sample requests to validate predictions.

**Acceptance criteria:**
- Endpoint returns `skin_type` and `confidence` for valid survey payloads.
- Training script runs reproducibly and outputs the model file.

---

### Team Member 3 — ML/NLP Engineer (Recommendation Engine + Sentiment)
**Objective:** Build the product recommendation pipeline (ingredient similarity) and optional review sentiment endpoint.
**Responsibilities:**
- Use `products_clean.csv` to create ingredient-text representations and a TF-IDF or simple embedding model.
- Implement recommendation function `recommend(product_id, top_n)` based on cosine similarity of ingredient vectors.
- Serialize vectorizer (`vectorizer.pkl`) and matrix (`tfidf_matrix.npz` or similar).
- Implement `GET /recommend/{product_id}` and `GET /reviews/sentiment/{product_id}` endpoints.
- Provide a `train_recommender.py` script and tests validating recommendations.

**Acceptance criteria:**
- Recommendations are produced within reasonable time for `top_n=5` and are explainable (show matching ingredients/scores).
- Sentiment endpoint aggregates review sentiment and extracts a few keywords (if reviews used).

---

### Team Member 4 — Frontend & Integration Lead
**Objective:** Implement the user workflows, integrate with backend APIs, and build a presentable UI for demos.
**Responsibilities:**
- Implement React app with routes: Landing, Sign-in, Quiz, Dashboard, Recommendations, Product Detail, Ingredient Checker, Routine Builder.
- Provide mock data and fallback UI while backend endpoints aren’t ready.
- Integrate to backend endpoints as they become available and handle errors/graceful fallbacks.
- Implement state management for user profile, saved products, and routines (localStorage or backend storage).
- Prepare end-to-end demo scenarios and screenshots for submission.

**Acceptance criteria:**
- Frontend runs locally with `npm run dev` and displays real recommendations once backend is live.
- Key flows are complete: take quiz → get skin type → view recommendations → add to routine.

---

## Development workflow & integration plan (how to get from zero → demo)

### Initial setup (Day 0)
- Create repo, invite team members, create branches: `main`, `dev`, `member1`, `member2`, etc.
- Seed `backend/data/datasets/` with raw CSVs (Member 1), and `frontend/mock` with sample JSON (Member 4).
- Each member clones the repo and creates their working branch.

### Parallel development (Days 1–7)
- **Member 1:** Cleans datasets and commits `products_clean.csv` and `ingredients_clean.csv` to `/backend/data/`. Push a short data README.
- **Member 2:** Generates synthetic training data and trains `skin_type_model.pkl`. Exposes `POST /predict/skin-type` locally.
- **Member 3:** Uses `products_clean.csv` to train TF-IDF and save `vectorizer.pkl` and `tfidf_matrix.npz`. Exposes `/recommend/{product_id}`.
- **Member 4:** Builds UI skeleton, integrates mock data, and sets up axios wrapper to point to `http://localhost:8000`.

### Integration (Days 8–10)
- Members coordinate to point frontend to live endpoints. Run integration tests and fix API contract mismatches.
- Add CORS policy in backend to allow local frontend origin.
- Implement small fixes: ingredient normalization updates, minor UI/UX polish, error handling.

### Finalization & polish (Days 11–14)
- Add tests (pytest) for backend endpoints; add a few frontend unit tests if possible.
- Prepare demo script: 3–5 flows (new user, returning user, routine creation, ingredient conflict example).
- Document limitations and future scope in `/docs/` and finalize README for submission.

## APIs (contract)
Implement these core endpoints (stable shapes):

1. `POST /predict/skin-type`
   - Input: `{"responses": {...}}`
   - Output: `{"skin_type": "Combination", "confidence": 0.92}`

2. `GET /recommend/{product_id}?top_n=5`
   - Output: `{"product_id":"p123","recommendations":[{"product_id":"p111","score":0.89,"name":"Product A"},...]}`

3. `POST /analyze/ingredients`
   - Input: `{"ingredients":["aqua","niacinamide","salicylic acid"]}`
   - Output: `{ "warnings": [...], "safety": [...] }`

4. `GET /product/{product_id}`
   - Output: product metadata from the cleaned CSV

5. `GET /reviews/sentiment/{product_id}` (optional)
   - Output: aggregated sentiment + keywords

## Suggested datasets & exact links (who uses which)

> All links are public dataset pages. Kaggle requires login to download; OpenBeautyFacts and other sources are freely downloadable.

### Core product & ingredient datasets (Member 1 & Member 3)
- **Skincare Products and their Ingredients — Kaggle**
  https://www.kaggle.com/datasets/eward96/skincare-products-and-their-ingredients
  - Use: baseline product & ingredient lists, brand, price, ingredient strings.

- **Skincare Products Clean Dataset — Kaggle (clean variant)**
  https://www.kaggle.com/datasets/eward96/skincare-products-clean-dataset
  - Use: optional alternative if you prefer a pre-cleaned dataset.

- **Dermstore Skincare Products & Ingredients — Kaggle**
  https://www.kaggle.com/datasets/crawlfeeds/dermstore-skincare-products-and-ingredients-dataset
  - Use: to expand product catalog and improve recommendation diversity.

### Ingredient metadata (Member 1 & Member 2 for safety / glossary)
- **INCI Ingredient Metadata List — Kaggle**
  https://www.kaggle.com/datasets/amaboh/skin-care-product-ingredients-inci-list
  - Use: map ingredient names to INCI descriptions, safety notes, functions.

- **Open Beauty Facts (API) — OpenBeautyFacts**
  https://world.openbeautyfacts.org/ (API docs: https://wiki.openfoodfacts.org/API )
  - Use: supplement with product labels, allergens, barcodes and extra metadata.

### Review dataset (Member 3 — optional sentiment boosting)
- **Sephora Products & Skincare Reviews — Kaggle**
  https://www.kaggle.com/datasets/nadyinky/sephora-products-and-skincare-reviews
  - Use: augment recommendations using review sentiment and extract keywords like “hydrating”, “irritating”.

### (Optional, future) Image datasets — *only if you add image features later* (Member 3)
- **SCIN — Skin Condition Image Network (GitHub / research)** — for dermatology images (careful: licensing and ethics)
- **DDI — Diverse Dermatology Images** — for diverse-skin training
- **HAM10000** — dermatoscopic lesions dataset (medical; optional / research-only)

## Which dataset is used by which team member (exact mapping)

- **Team Member 1 (Data Engineer)**
  - Primary datasets to download & clean:
    - Skincare Products and their Ingredients (Kaggle)
    - INCI Ingredient Metadata List (Kaggle)
    - Dermstore dataset (optional)
    - OpenBeautyFacts API (optional supplement)
  - Output: `products_clean.csv`, `ingredients_clean.csv`, `ingredient_normalization.json`

- **Team Member 2 (Skin-Type Classifier)**
  - Primary datasets:
    - *Synthetic / self-collected survey dataset* (generated locally or gathered from classmates)
    - Use `ingredients_clean.csv` for mapping ingredient suitability if needed (to validate predictions)
  - Output: `skin_type_model.pkl` and training script

- **Team Member 3 (Recommendation Engine)**
  - Primary datasets:
    - `products_clean.csv` (from Member 1)
    - Sephora Products & Skincare Reviews (Kaggle) — optional for sentiment
    - Dermstore / other product datasets to increase catalog (optional)
  - Output: `vectorizer.pkl`, `tfidf_matrix.npz`, recommendation router

- **Team Member 4 (Frontend)**
  - Primary datasets:
    - Uses `products_clean.csv` and `products_indexed.csv` via backend endpoints (doesn't need raw datasets directly)
    - Uses mock JSON for development (`/frontend/mock/`) until backend is ready
  - Output: React app wired to backend APIs

## Testing and acceptance
- Each endpoint must have minimal unit tests (pytest) that validate output shapes and common edge cases.
- Create an integration test script that runs the following sequence locally:
  1. POST `/predict/skin-type` with a sample survey → expect valid `skin_type`.
  2. GET `/recommend/{sample_product}` → expect list of 5 recommendations.
  3. POST `/analyze/ingredients` with a conflicting pair → expect a warning.
  4. GET `/product/{sample_product}` → expect product metadata.
- Prepare 3 demo users and record 3 demo flows (videos or screenshots) for submission.

## Deliverables for submission
- `/backend/data/products_clean.csv` and `/backend/data/ingredients_clean.csv` (with data README)
- `/backend/models/*` (serialized models & vectorizers)
- `/backend` FastAPI with routers and tests
- `/frontend` React app linked to APIs, with demo flows
- `/docs` containing SRS, architecture diagram, and limitations/future scope

## Ethics & limitations
- This system is **NOT** a substitute for professional dermatological advice. Include a disclaimer in the UI.
- Be cautious about demographic bias in datasets (skin tone, region). Document biases & limitations.
- Respect dataset licenses (Kaggle terms) and attribute sources in `docs/`.

---
This README is intended to be your primary engineering guide. I saved it as a markdown file for download.
