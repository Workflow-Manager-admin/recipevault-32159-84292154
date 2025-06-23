from fastapi import FastAPI, HTTPException, Depends, Query, Path, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import uuid4, UUID

# App-level OpenAPI metadata and tags
app = FastAPI(
    title="RecipeVault API",
    description=(
        "Backend API for browsing, searching, and managing recipes with user authentication "
        "and CRUD operations."
    ),
    version="0.1.0",
    openapi_tags=[
        {
            "name": "Recipes",
            "description": "Browsing, searching, retrieving, and managing recipes."
        },
        {
            "name": "Ingredients",
            "description": "Ingredient data management (stubs for future)."
        },
        {
            "name": "Users",
            "description": "User authentication and profile (basic demo purposes)."
        },
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stub in-memory stores (use a proper DB in production!)
recipes_db = {}
users_db = {
    "user@example.com": {
        "username": "user@example.com",
        "full_name": "Standard User",
        "hashed_password": "fakehashedpassword",  # Always hash in real usage!
        "favorites": [],
    }
}
fake_tokens = {}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# ---------- Data Models ----------

class Ingredient(BaseModel):
    name: str = Field(
        ..., description="Name of the ingredient"
    )
    quantity: str = Field(
        ..., description="Amount of the ingredient (e.g., '2 cups')"
    )


class RecipeBase(BaseModel):
    title: str = Field(
        ..., description="Recipe title"
    )
    description: Optional[str] = Field(
        None, description="Overview or blurb for the recipe"
    )
    ingredients: List[Ingredient] = Field(
        ..., description="Ingredients needed"
    )
    steps: List[str] = Field(
        ..., description="Preparation steps for the recipe"
    )
    tags: Optional[List[str]] = Field(
        [], description="Keyword tags (e.g., vegetarian, quick)"
    )
    author: Optional[str] = Field(
        None, description="User submitting the recipe"
    )


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(RecipeBase):
    pass


class Recipe(RecipeBase):
    id: UUID = Field(..., description="Unique identifier for the recipe")


class User(BaseModel):
    username: str
    full_name: Optional[str]
    favorites: Optional[List[UUID]] = []


class Token(BaseModel):
    access_token: str
    token_type: str


# ---------- Dependency & Utilities (Stub) ----------

def fake_verify_token(token: str = Depends(oauth2_scheme)):
    # WARNING: replace with real JWT auth in production!
    user = fake_tokens.get(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return users_db[user]


def fake_hash_password(pw: str):
    return "fakehashed" + pw


# ---------- Health Check ----------

# PUBLIC_INTERFACE
@app.get("/", tags=["Users"])
def health_check():
    """Basic service liveness check"""
    return {"message": "Healthy"}


# ---------- Auth ----------

# PUBLIC_INTERFACE
@app.post(
    "/token",
    response_model=Token,
    tags=["Users"],
    summary="Obtain access token",
    description="Simple login (demo only, not secure!)"
)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_db.get(form_data.username)
    if not user or fake_hash_password(form_data.password) != user["hashed_password"]:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    # Simulate user token creation
    token = str(uuid4())
    fake_tokens[token] = form_data.username
    return {"access_token": token, "token_type": "bearer"}


# ---------- Users ----------

# PUBLIC_INTERFACE
@app.get(
    "/users/me",
    response_model=User,
    tags=["Users"],
    summary="Get current user profile"
)
def get_current_user(user=Depends(fake_verify_token)):
    """Get details for the currently authenticated user."""
    return User(
        username=user["username"],
        full_name=user["full_name"],
        favorites=user["favorites"]
    )


# ---------- Recipes CRUD ----------

# PUBLIC_INTERFACE
@app.get(
    "/recipes",
    response_model=List[Recipe],
    tags=["Recipes"],
    summary="List or search recipes"
)
def list_recipes(
    q: Optional[str] = Query(
        None, description="Search string for recipe titles or tags"
    ),
    skip: int = 0,
    limit: int = 20
):
    """List all recipes, optionally filtered by search term."""
    items = list(recipes_db.values())
    if q:
        q_lower = q.lower()
        items = [
            r for r in items
            if q_lower in r.title.lower()
            or (r.tags and any(q_lower in tag.lower() for tag in r.tags))
        ]
    return items[skip: skip + limit]


# PUBLIC_INTERFACE
@app.get(
    "/recipes/{recipe_id}",
    response_model=Recipe,
    tags=["Recipes"],
    summary="Get recipe details"
)
def get_recipe(recipe_id: UUID = Path(..., description="Recipe ID")):
    """Get details for a single recipe."""
    recipe = recipes_db.get(str(recipe_id))
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


# PUBLIC_INTERFACE
@app.post(
    "/recipes",
    response_model=Recipe,
    status_code=201,
    tags=["Recipes"],
    summary="Create new recipe"
)
def create_recipe(recipe: RecipeCreate, user=Depends(fake_verify_token)):
    """Create a new recipe. Auth required."""
    recipe_id = uuid4()
    recipe_obj = Recipe(
        **recipe.dict(),
        id=recipe_id,
        author=user["username"]
    )
    recipes_db[str(recipe_id)] = recipe_obj
    return recipe_obj


# PUBLIC_INTERFACE
@app.put(
    "/recipes/{recipe_id}",
    response_model=Recipe,
    tags=["Recipes"],
    summary="Update existing recipe"
)
def update_recipe(recipe_id: UUID, recipe: RecipeUpdate, user=Depends(fake_verify_token)):
    """Update an existing recipe if owner."""
    existing = recipes_db.get(str(recipe_id))
    if not existing:
        raise HTTPException(status_code=404, detail="Recipe not found")
    # Optionally, check author
    if existing.author and existing.author != user["username"]:
        raise HTTPException(status_code=403, detail="Not allowed to update this recipe")
    updated = existing.copy(update=recipe.dict())
    recipes_db[str(recipe_id)] = updated
    return updated


# PUBLIC_INTERFACE
@app.delete(
    "/recipes/{recipe_id}",
    status_code=204,
    tags=["Recipes"],
    summary="Delete recipe"
)
def delete_recipe(recipe_id: UUID, user=Depends(fake_verify_token)):
    """Delete a recipe if owner."""
    recipe = recipes_db.get(str(recipe_id))
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe.author and recipe.author != user["username"]:
        raise HTTPException(status_code=403, detail="Not allowed to delete this recipe")
    del recipes_db[str(recipe_id)]
    return


# ---------- (Stub) Favorite/Save recipe for user ----------

# PUBLIC_INTERFACE
@app.post(
    "/recipes/{recipe_id}/favorite",
    tags=["Recipes"],
    summary="Favorite a recipe"
)
def favorite_recipe(recipe_id: UUID, user=Depends(fake_verify_token)):
    """Add a recipe to user's favorites list."""
    recipe = recipes_db.get(str(recipe_id))
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe_id not in user["favorites"]:
        user["favorites"].append(recipe_id)
    return {
        "message": "Favorited",
        "favorites": user["favorites"]
    }


# ---------- (Stub) Ingredient endpoints for future expansion ----------

# PUBLIC_INTERFACE
@app.get(
    "/ingredients",
    tags=["Ingredients"],
    summary="List all ingredients (stub)"
)
def list_ingredients():
    """Ingredient list endpoint (to be implemented later)."""
    return []


# PUBLIC_INTERFACE
@app.get(
    "/ingredients/{ingredient_name}",
    tags=["Ingredients"],
    summary="Get ingredient details (stub)"
)
def get_ingredient(ingredient_name: str):
    """Ingredient detail endpoint (to be implemented later)."""
    return {
        "ingredient": ingredient_name,
        "details": None
    }
