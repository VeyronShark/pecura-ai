import pandas as pd
import numpy as np
import re
import json

try:
    products_df = pd.read_csv('skincare_products.csv')
    ingredients_df = pd.read_csv('ingredientsList.csv')
    print("✅ Files loaded successfully.")
except FileNotFoundError:
    print("❌ Error: Files not found. Please check the filenames in the Colab file explorer.")

clean_products = products_df.copy()

clean_products['price'] = clean_products['price'].astype(str).str.replace('£', '').str.replace(',', '')
clean_products['price'] = pd.to_numeric(clean_products['price'], errors='coerce')

def parse_ingredients(text):
    if not isinstance(text, str):
        return []
    text = text.lower()
    text = re.sub(r'\([^)]*\)', '', text)
    items = text.split(',')
    cleaned_items = [item.strip() for item in items if item.strip()]
    return cleaned_items
clean_products['ingredients_parsed'] = clean_products['ingredients'].apply(parse_ingredients)

# 1. Define a Synonym Dictionary (The "Normalization Map")
# We map common variations to a single "Canonical Name"
synonym_map = {
    'aqua/water': 'water',
    'aqua': 'water',
    'water (aqua)': 'water',
    'eau': 'water',
    'glycerine': 'glycerin',
    'alcohol denat.': 'alcohol denat', # standardization
    'tocopherol (vitamin e)': 'tocopherol',
    'vitamin e': 'tocopherol',
    'sodium hyaluronate (hyaluronic acid)': 'sodium hyaluronate',
}

def heavy_duty_clean(text):
    if not isinstance(text, str):
        return []
    text = text.lower()
    text = re.sub(r'\([^)]*\)', '', text)
    items = text.split(',')
    cleaned_items = []
    for item in items:
        item = item.strip().strip('.')
        if not item:
            continue
        item = synonym_map.get(item, item)
        cleaned_items.append(item)
    return cleaned_items

clean_products['ingredients_parsed'] = clean_products['ingredients'].apply(heavy_duty_clean)
all_ingredients = [ing for sublist in clean_products['ingredients_parsed'] for ing in sublist]
ingredient_counts = pd.Series(all_ingredients).value_counts()

import json

final_products = clean_products.copy()

final_products['product_id'] = ['p' + str(i).zfill(5) for i in range(len(final_products))]

final_products = final_products.rename(columns={
    'product_name': 'name',
    'product_type': 'type'
})

final_products['brand'] = final_products['name'].apply(lambda x: x.split()[0] if isinstance(x, str) else 'Unknown')

final_products['ingredients_parsed'] = final_products['ingredients_parsed'].apply(json.dumps)


final_products = final_products[['product_id', 'name', 'brand', 'price', 'type', 'ingredients_parsed']]

unique_ingredients = sorted(list(set(all_ingredients)))
ingredients_clean_df = pd.DataFrame(unique_ingredients, columns=['inci_name'])

ingredients_clean_df.reset_index(inplace=True)
ingredients_clean_df.rename(columns={'index': 'ingredient_id'}, inplace=True)
ingredients_clean_df['ingredient_id'] = ingredients_clean_df['ingredient_id'].apply(lambda x: f"ing{x:05d}")

print("Saving files...")

final_products.to_csv('products_clean.csv', index=False)
ingredients_clean_df.to_csv('ingredients_clean.csv', index=False)

with open('ingredient_normalization.json', 'w') as f:
    json.dump(synonym_map, f, indent=4)

all_product_names = sorted(products_df['product_name'].unique())

multi_word_brands = [
    "The Ordinary", "La Roche-Posay", "First Aid Beauty", "Elizabeth Arden",
    "Estée Lauder", "Jo Malone London", "Bobbi Brown", "Burt's Bees",
    "L'Oréal Paris", "L'Oreal Paris", "Neal's Yard Remedies", "Dr Dennis Gross",
    "Peter Thomas Roth", "Sanctuary Spa", "Shea Moisture", "Molton Brown",
    "Emma Hardie", "Manuka Doctor", "Aromatherapy Associates", "Dr. PAWPAW",
    "Bloom & Blossom", "The INKEY List", "The Organic Pharmacy", "Sarah Chapman",
    "Westlab", "Mama Mio", "Bondi Sands", "Little Butterfly London",
    "The Chemistry Brand", "Dr. Brandt", "Dr Brandt", "Dr.Jart+",
    "Alpha-H", "Australian Bodycare", "Avant Skincare", "BARBER PRO",
    "BBB London", "Balance Me", "Comfort Zone", "Connock London",
    "Crystal Clear", "Dear, Klairs", "Dr Hauschka", "Dr. Hauschka",
    "Egyptian Magic", "Elemental Herbology", "Eve Lom", "Face by Skinny Tan",
    "Fade Out", "Frank Body", "Goldfaden MD", "Green People", "Holika Holika",
    "Indeed Labs", "Instant Effects", "Institut Esthederm", "James Read",
    "L:A BRUKET", "Lancer Skincare", "Laura Mercier", "Liz Earle", "Love Boo",
    "Natura Bissé", "NYX Professional Makeup", "Oh K!", "Pai Skincare",
    "Perricone MD", "Pestle & Mortar", "Piz Buin", "Project Lip",
    "Radical Skincare", "Recipe for Men", "Revolution Skincare", "Sea Magik",
    "Skin Doctors", "Sol de Janeiro", "Spa Magik", "The Ritual of",
    "This Works", "Too Faced", "Urban Decay", "Yes To", "yes to"
]

def extract_brand(name):
    if not isinstance(name, str):
        return "Unknown"
    name_clean = name.strip()
    for brand in multi_word_brands:
        if name_clean.lower().startswith(brand.lower()):
            if brand.lower() == "the ritual of":
                return "Rituals"
            if "l'oréal" in brand.lower() or "l'oreal" in brand.lower():
                return "L'Oréal Paris"
            if "ren clean skincare" in name_clean.lower():
                return "REN"
            return brand 

    first_word = name_clean.split()[0]

    if first_word.lower() == "ren": return "REN"
    if first_word.lower() == "garnier": return "Garnier"

    return first_word

clean_products['brand'] = clean_products['product_name'].apply(extract_brand)

final_products['brand'] = clean_products['brand']

final_products.to_csv('products_clean.csv', index=False)
ingredients_clean_df.to_csv('ingredients_clean.csv', index=False)

import pandas as pd

# 1. Load the files again (or use the variables in memory) to be sure
# We use try/except just in case the variables were cleared
try:
    df_products = pd.read_csv('products_clean.csv')
    df_ingredients = pd.read_csv('ingredients_clean.csv')
except FileNotFoundError:
    # If files aren't saved yet, use the variables from previous cells
    df_products = final_products
    df_ingredients = ingredients_clean_df
