# SmartChef Architecture

SmartChef is a Next.js meal-planning app with a layered architecture: **UI → hook → services (AI + DB) → browser localStorage / OpenAI API**.

## Project Structure

| Layer | Path | Role |
|-------|------|------|
| **App shell** | `app/layout.tsx`, `app/page.tsx` | Root layout + main SPA page |
| **API** | `app/api/chatgpt/route.ts` | Server-side OpenAI proxy |
| **State** | `hooks/useSmartChef.ts` | Central state + all CRUD/AI actions |
| **UI** | `components/*.tsx` | Tab-specific views |
| **Domain** | `lib/types.ts` | Types + `IDatabase` / `IAIService` interfaces |
| **Persistence** | `lib/db/localStorageDB.ts` | Browser localStorage (swappable) |
| **AI** | `lib/ai/openaiService.ts`, `mockAIService.ts` | Real API vs fallback mock |

## Design Patterns

1. **Singleton factories** — `getDatabase()` and `getAIService()` return shared instances.
2. **Interface segregation** — `IDatabase` and `IAIService` let you swap localStorage → Supabase/Prisma or OpenAI → another provider without touching UI code.
3. **Graceful AI fallback** — OpenAI errors (missing key, 503) trigger `MockAIService`.
4. **Single source of truth** — `useSmartChef` owns all app state; components are mostly presentational.

---

## 1. High-Level Component Diagram

Shows the main layers and how they connect.

```mermaid
flowchart TB
    subgraph Client["Browser (Client)"]
        Page["app/page.tsx<br/>Home"]
        Hook["hooks/useSmartChef"]

        subgraph UI["components/"]
            Nav["Navigation"]
            Form["MealRequestForm"]
            Pending["PendingShoppingList"]
            Grocery["GroceryTracker"]
            Recipe["RecipeViewer"]
            Todo["MealTodo"]
            subgraph UIWidgets["components/ui/"]
                Badge["Badge"]
                Fresh["FreshnessIndicator"]
            end
        end

        subgraph Lib["lib/"]
            Types["types.ts"]
            subgraph DB["lib/db/"]
                DBFactory["getDatabase()"]
                LocalDB["LocalStorageDB"]
            end
            subgraph AI["lib/ai/"]
                AIFactory["getAIService()"]
                OpenAI["OpenAIService"]
                Mock["MockAIService"]
            end
        end

        LS[("localStorage")]
    end

    subgraph Server["Next.js Server"]
        API["app/api/chatgpt/route.ts"]
        OpenAIAPI[("OpenAI API")]
    end

    Page --> Hook
    Page --> Nav & Form & Pending & Grocery & Recipe & Todo
    Grocery --> Badge & Fresh
    Todo --> Fresh

    Hook --> DBFactory & AIFactory
    DBFactory --> LocalDB
    LocalDB --> LS
    AIFactory --> OpenAI & Mock
    OpenAI -->|POST /api/chatgpt| API
    API --> OpenAIAPI

    Hook -.-> Types
    LocalDB -.->|implements| Types
    OpenAI -.->|implements| Types
    Mock -.->|implements| Types
```

---

## 2. Domain Model (Class Diagram)

Core entities and how they relate.

```mermaid
classDiagram
    class Grocery {
        +string id
        +string name
        +GroceryCategory category
        +GroceryStatus status
        +string quantity
        +string date_bought
        +number estimated_expiry_days
        +string expires_at
    }

    class Recipe {
        +string id
        +string title
        +string description
        +RecipeIngredient[] ingredients
        +string[] instructions
        +number cooking_time
        +number servings
        +string[] tags
        +string created_at
    }

    class RecipeIngredient {
        +string name
        +string amount
        +string unit
    }

    class MealPlan {
        +string id
        +string meal_name
        +string planned_date
        +MealStatus status
        +string recipe_id
        +string[] ingredients_used
        +string created_at
    }

    class AIGeneratedPlan {
        +AIMealSuggestion[] meals
        +string notes
    }

    class AIMealSuggestion {
        +string meal_name
        +string planned_date
        +Recipe recipe
        +AIGroceryItem[] groceries
    }

    class AIGroceryItem {
        +string name
        +GroceryCategory category
        +number estimated_expiry_days
        +string quantity
    }

    Recipe *-- RecipeIngredient : contains
    MealPlan --> Recipe : recipe_id (optional FK)
    MealPlan --> Grocery : ingredients_used[] (FK)
    AIGeneratedPlan *-- AIMealSuggestion : contains
    AIMealSuggestion --> Recipe : embeds (no id)
    AIMealSuggestion *-- AIGroceryItem : contains

    note for Grocery "status: needed | bought"
    note for MealPlan "status: pending | cooked"
```

---

## 3. Service Interfaces & Implementations

The project uses the **Strategy + Factory** pattern so DB and AI backends can be swapped.

```mermaid
classDiagram
    class IDatabase {
        <<interface>>
        +getGroceries() Promise~Grocery[]~
        +addGrocery(grocery) Promise~Grocery~
        +addGroceries(groceries) Promise~Grocery[]~
        +updateGrocery(id, updates) Promise~Grocery~
        +deleteGrocery(id) Promise~void~
        +clearNeededGroceries() Promise~void~
        +getMealPlans() Promise~MealPlan[]~
        +addMealPlan(plan) Promise~MealPlan~
        +updateMealPlan(id, updates) Promise~MealPlan~
        +deleteMealPlan(id) Promise~void~
        +getRecipes() Promise~Recipe[]~
        +addRecipe(recipe) Promise~Recipe~
        +deleteRecipe(id) Promise~void~
    }

    class LocalStorageDB {
        -KEYS: groceries, mealPlans, recipes
        +getGroceries()
        +addGrocery()
        +updateGrocery()
        ...
    }

    class IAIService {
        <<interface>>
        +generateMealPlan(prompt) Promise~AIGeneratedPlan~
    }

    class OpenAIService {
        +generateMealPlan(prompt)
    }

    class MockAIService {
        +generateMealPlan(prompt)
    }

    class getDatabase {
        <<function>>
        +returns singleton IDatabase
    }

    class getAIService {
        <<function>>
        +returns IAIService
    }

    IDatabase <|.. LocalStorageDB
    IAIService <|.. OpenAIService
    IAIService <|.. MockAIService
    getDatabase --> LocalStorageDB : creates
    getAIService --> OpenAIService : default
    getAIService --> MockAIService : if NEXT_PUBLIC_USE_MOCK_AI
```

---

## 4. React Component Structure

How `page.tsx` composes the UI and passes data down.

```mermaid
classDiagram
    class Home {
        -activeTab: TabId
        +useSmartChef()
        +handleAddToShoppingList()
        +handleAddToMealPlan()
        +handleSaveRecipe()
        +handleAddAllAndNavigate()
    }

    class useSmartChef {
        <<hook>>
        +groceries: Grocery[]
        +mealPlans: MealPlan[]
        +recipes: Recipe[]
        +pendingAIPlan: AIGeneratedPlan
        +generateMealPlan()
        +addGroceriesFromAI()
        +markGroceryBought()
        +addMealPlan()
        +markMealCooked()
        +saveRecipe()
        ...
    }

    class Navigation {
        +activeTab: TabId
        +onTabChange()
        +pendingGroceryCount
        +urgentMealCount
    }

    class MealRequestForm {
        +onSubmit(prompt)
        +isLoading
        +error
    }

    class PendingShoppingList {
        +plan: AIGeneratedPlan
        +onAddToShoppingList()
        +onSaveRecipe()
        +onAddToMealPlan()
        +onDismiss()
    }

    class GroceryTracker {
        +groceries
        +onMarkBought()
        +onMarkNeeded()
        +onDelete()
    }

    class RecipeViewer {
        +mealPlans, recipes, groceries
        +onMarkCooked()
        +onDeleteMealPlan()
        +onDeleteRecipe()
    }

    class MealTodo {
        +mealPlans, recipes, groceries
        +onMarkCooked()
        +onNavigateToRecipe()
    }

    Home --> useSmartChef : uses
    Home *-- Navigation
    Home *-- MealRequestForm : tab=planner
    Home *-- PendingShoppingList : tab=planner
    Home *-- GroceryTracker : tab=grocery
    Home *-- RecipeViewer : tab=recipes
    Home *-- MealTodo : tab=todo
```

---

## 5. Sequence: AI Meal Plan Generation

What happens when the user submits a prompt on the Meal Planner tab.

```mermaid
sequenceDiagram
    actor User
    participant Form as MealRequestForm
    participant Page as Home (page.tsx)
    participant Hook as useSmartChef
    participant AI as getAIService()
    participant OpenAI as OpenAIService
    participant API as /api/chatgpt
    participant Mock as MockAIService
    participant Pending as PendingShoppingList

    User->>Form: Submit prompt
    Form->>Page: onSubmit(prompt)
    Page->>Hook: generateMealPlan(prompt)
    Hook->>AI: getAIService()
    AI-->>Hook: OpenAIService (or Mock if env set)
    Hook->>OpenAI: generateMealPlan(prompt)
    OpenAI->>API: POST { prompt }

    alt API key configured
        API->>API: OpenAI chat.completions (gpt-4o-mini)
        API-->>OpenAI: AIGeneratedPlan JSON
        OpenAI-->>Hook: plan
    else No API key / 503 / API error
        OpenAI-->>Hook: throws error
        Hook->>Mock: generateMealPlan(prompt)
        Mock-->>Hook: deterministic mock plan
    end

    Hook->>Hook: setPendingAIPlan(plan)
    Hook-->>Page: re-render
    Page->>Pending: render plan
    Pending-->>User: Show recipes + grocery list
```

---

## 6. Sequence: Accept AI Plan → Grocery + Recipes + Meal Plans

What happens when the user clicks "Add to shopping list" for selected meals.

```mermaid
sequenceDiagram
    actor User
    participant Pending as PendingShoppingList
    participant Page as Home
    participant Hook as useSmartChef
    participant DB as LocalStorageDB
    participant LS as localStorage

    User->>Pending: Select meals + "Add all"
    Pending->>Page: onAddToShoppingList(meals)
    Page->>Hook: addGroceriesFromAI(meals)
    Hook->>DB: getGroceries()
    Hook->>Hook: dedupe by name (case-insensitive)
    Hook->>DB: addGroceries(new items, status=needed)
    DB->>LS: write smartchef_groceries

    loop each meal
        Page->>Hook: saveRecipe(meal.recipe)
        Hook->>DB: addRecipe()
        DB->>LS: write smartchef_recipes
    end

    loop each meal
        Page->>Hook: addMealPlan({ meal_name, recipe_id, ... })
        Hook->>DB: addMealPlan()
        DB->>LS: write smartchef_meal_plans
    end

    Page->>Hook: clearPendingPlan()
    Page->>Page: setActiveTab('grocery')
    Hook->>Hook: refreshAll()
    Hook-->>Page: updated state
```

---

## 7. Tab Navigation & Data Flow

How the four tabs map to features.

```mermaid
stateDiagram-v2
    [*] --> Planner: default tab

    Planner --> Grocery: user navigates / "Add all"
    Planner --> Recipes: user navigates
    Planner --> Todo: user navigates
    Grocery --> Planner
    Grocery --> Recipes
    Grocery --> Todo
    Recipes --> Planner
    Recipes --> Grocery
    Recipes --> Todo
    Todo --> Recipes: onNavigateToRecipe()

    state Planner {
        [*] --> MealRequestForm
        MealRequestForm --> PendingShoppingList: AI plan ready
        PendingShoppingList --> [*]: dismiss / accept
    }

    state Grocery {
        [*] --> GroceryTracker
        note right of GroceryTracker
            needed vs bought
            freshness tracking
        end note
    }

    state Recipes {
        [*] --> RecipeViewer
        note right of RecipeViewer
            pending meals + saved recipes
            step-by-step cooking
        end note
    }

    state Todo {
        [*] --> MealTodo
        note right of MealTodo
            urgency by expiring ingredients
        end note
    }
```

---

## Viewing the Diagrams

These diagrams use [Mermaid](https://mermaid.js.org/) syntax. They render automatically in:

- GitHub / GitLab markdown previews
- VS Code / Cursor with a Mermaid preview extension
- Many documentation tools (Notion, Obsidian, etc.)

To export as images, paste a diagram into the [Mermaid Live Editor](https://mermaid.live/) and download as PNG or SVG.
