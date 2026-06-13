import type { AIGeneratedPlan, IAIService } from '../types';

/**
 * Deterministic mock — used when no OPENAI_API_KEY is configured.
 * Parses dish names from the prompt and returns realistic recipe + grocery data.
 */
export class MockAIService implements IAIService {
  async generateMealPlan(prompt: string): Promise<AIGeneratedPlan> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 1200));

    const lower = prompt.toLowerCase();

    const meals: AIGeneratedPlan['meals'] = [];

    if (lower.includes('chicken parm') || lower.includes('chicken parmesan')) {
      meals.push({
        meal_name: 'Chicken Parmesan',
        planned_date: extractDay(prompt, 'tuesday') ?? 'Tuesday',
        recipe: {
          title: 'Classic Chicken Parmesan',
          description: 'Crispy breaded chicken breast smothered in marinara and melted mozzarella.',
          ingredients: [
            { name: 'Chicken breast', amount: '2', unit: 'pieces' },
            { name: 'Marinara sauce', amount: '1', unit: 'cup' },
            { name: 'Mozzarella cheese', amount: '1', unit: 'cup' },
            { name: 'Parmesan cheese', amount: '½', unit: 'cup' },
            { name: 'Breadcrumbs', amount: '1', unit: 'cup' },
            { name: 'Eggs', amount: '2', unit: '' },
            { name: 'Olive oil', amount: '2', unit: 'tbsp' },
            { name: 'Garlic powder', amount: '1', unit: 'tsp' },
            { name: 'Italian seasoning', amount: '1', unit: 'tsp' },
            { name: 'Spaghetti', amount: '8', unit: 'oz' },
          ],
          instructions: [
            'Preheat oven to 400°F (200°C).',
            'Pound chicken breasts to ½-inch thickness between plastic wrap.',
            'Season chicken with salt, pepper, and garlic powder.',
            'Dip chicken in beaten eggs, then coat thoroughly in breadcrumbs.',
            'Heat olive oil in an oven-safe skillet over medium-high heat.',
            'Sear chicken 3-4 minutes per side until golden brown.',
            'Spoon marinara sauce over each breast.',
            'Top with mozzarella and parmesan cheese.',
            'Bake 15-18 minutes until cheese is bubbly and golden.',
            'Meanwhile, cook spaghetti according to package directions.',
            'Serve chicken over spaghetti with extra marinara sauce.',
          ],
          cooking_time: 40,
          servings: 2,
          tags: ['Italian', 'Comfort Food', 'Baked'],
        },
        groceries: [
          { name: 'Chicken breast', category: 'Meat & Seafood', estimated_expiry_days: 3, quantity: '2 pieces' },
          { name: 'Marinara sauce', category: 'Pantry', estimated_expiry_days: 180, quantity: '1 jar' },
          { name: 'Mozzarella cheese', category: 'Dairy & Eggs', estimated_expiry_days: 7, quantity: '1 cup shredded' },
          { name: 'Parmesan cheese', category: 'Dairy & Eggs', estimated_expiry_days: 30, quantity: '½ cup grated' },
          { name: 'Italian breadcrumbs', category: 'Pantry', estimated_expiry_days: 180, quantity: '1 cup' },
          { name: 'Eggs', category: 'Dairy & Eggs', estimated_expiry_days: 21, quantity: '2' },
          { name: 'Spaghetti', category: 'Pantry', estimated_expiry_days: 730, quantity: '8 oz' },
        ],
      });
    }

    if (lower.includes('mediterranean') || lower.includes('chickpea salad')) {
      meals.push({
        meal_name: 'Mediterranean Chickpea Salad',
        planned_date: extractDay(prompt, 'thursday') ?? 'Thursday',
        recipe: {
          title: 'Mediterranean Chickpea Salad',
          description: 'A vibrant, protein-packed salad with chickpeas, fresh vegetables, and tangy feta.',
          ingredients: [
            { name: 'Canned chickpeas', amount: '2', unit: 'cans (15 oz each)' },
            { name: 'Cherry tomatoes', amount: '1', unit: 'cup' },
            { name: 'Cucumber', amount: '1', unit: 'large' },
            { name: 'Red onion', amount: '½', unit: '' },
            { name: 'Baby spinach', amount: '3', unit: 'cups' },
            { name: 'Kalamata olives', amount: '½', unit: 'cup' },
            { name: 'Feta cheese', amount: '½', unit: 'cup crumbled' },
            { name: 'Lemon', amount: '2', unit: '' },
            { name: 'Olive oil', amount: '3', unit: 'tbsp' },
            { name: 'Fresh parsley', amount: '¼', unit: 'cup' },
            { name: 'Garlic', amount: '2', unit: 'cloves' },
          ],
          instructions: [
            'Drain and rinse chickpeas; pat dry with paper towels.',
            'Halve cherry tomatoes and slice cucumber into half-moons.',
            'Thinly slice red onion and soak in cold water 5 minutes to mellow sharpness.',
            'Whisk together lemon juice, olive oil, minced garlic, salt, and pepper.',
            'Combine chickpeas, tomatoes, cucumber, drained onion, and olives in a large bowl.',
            'Add baby spinach and toss gently.',
            'Drizzle dressing over salad and toss to coat.',
            'Top with crumbled feta cheese and fresh parsley.',
            'Taste and adjust seasoning. Serve immediately or chill 30 minutes.',
          ],
          cooking_time: 15,
          servings: 4,
          tags: ['Mediterranean', 'Salad', 'Vegetarian', 'Healthy'],
        },
        groceries: [
          { name: 'Canned chickpeas', category: 'Pantry', estimated_expiry_days: 730, quantity: '2 cans' },
          { name: 'Cherry tomatoes', category: 'Produce', estimated_expiry_days: 5, quantity: '1 cup' },
          { name: 'Cucumber', category: 'Produce', estimated_expiry_days: 5, quantity: '1 large' },
          { name: 'Red onion', category: 'Produce', estimated_expiry_days: 30, quantity: '1 medium' },
          { name: 'Baby spinach', category: 'Produce', estimated_expiry_days: 4, quantity: '5 oz bag' },
          { name: 'Kalamata olives', category: 'Pantry', estimated_expiry_days: 365, quantity: '½ cup' },
          { name: 'Feta cheese', category: 'Dairy & Eggs', estimated_expiry_days: 14, quantity: '4 oz' },
          { name: 'Lemons', category: 'Produce', estimated_expiry_days: 14, quantity: '2' },
          { name: 'Fresh parsley', category: 'Produce', estimated_expiry_days: 5, quantity: '1 bunch' },
        ],
      });
    }

    if (lower.includes('pasta') || lower.includes('spaghetti') || lower.includes('carbonara')) {
      meals.push({
        meal_name: 'Spaghetti Carbonara',
        planned_date: 'Wednesday',
        recipe: {
          title: 'Creamy Spaghetti Carbonara',
          description: 'Silky Roman pasta made with eggs, pancetta, and Pecorino Romano.',
          ingredients: [
            { name: 'Spaghetti', amount: '400g', unit: '' },
            { name: 'Pancetta or guanciale', amount: '150g', unit: '' },
            { name: 'Eggs', amount: '3', unit: '' },
            { name: 'Egg yolks', amount: '2', unit: '' },
            { name: 'Pecorino Romano', amount: '100g', unit: '' },
            { name: 'Black pepper', amount: '1', unit: 'tsp freshly cracked' },
          ],
          instructions: [
            'Bring a large pot of salted water to a boil.',
            'Cook pancetta in a large skillet over medium heat until crispy.',
            'Whisk eggs, yolks, and grated cheese in a bowl; season with pepper.',
            'Cook spaghetti 1 minute less than package directions.',
            'Reserve 1 cup pasta cooking water before draining.',
            'Remove skillet from heat. Add hot drained pasta to pancetta.',
            'Quickly add egg mixture, tossing constantly and adding pasta water to create a creamy sauce.',
            'Serve immediately with extra cheese and cracked pepper.',
          ],
          cooking_time: 25,
          servings: 4,
          tags: ['Italian', 'Pasta', 'Classic'],
        },
        groceries: [
          { name: 'Spaghetti', category: 'Pantry', estimated_expiry_days: 730, quantity: '400g' },
          { name: 'Pancetta', category: 'Meat & Seafood', estimated_expiry_days: 7, quantity: '150g' },
          { name: 'Eggs', category: 'Dairy & Eggs', estimated_expiry_days: 21, quantity: '5 large' },
          { name: 'Pecorino Romano', category: 'Dairy & Eggs', estimated_expiry_days: 30, quantity: '100g' },
        ],
      });
    }

    if (lower.includes('taco') || lower.includes('tacos')) {
      meals.push({
        meal_name: 'Beef Tacos',
        planned_date: 'Friday',
        recipe: {
          title: 'Street-Style Beef Tacos',
          description: 'Juicy seasoned ground beef tacos with fresh salsa and all the toppings.',
          ingredients: [
            { name: 'Ground beef', amount: '1 lb', unit: '' },
            { name: 'Taco shells', amount: '8', unit: '' },
            { name: 'Taco seasoning', amount: '2', unit: 'tbsp' },
            { name: 'Cheddar cheese', amount: '1', unit: 'cup shredded' },
            { name: 'Iceberg lettuce', amount: '2', unit: 'cups shredded' },
            { name: 'Roma tomatoes', amount: '2', unit: '' },
            { name: 'Sour cream', amount: '½', unit: 'cup' },
            { name: 'Lime', amount: '1', unit: '' },
            { name: 'Avocado', amount: '1', unit: '' },
          ],
          instructions: [
            'Brown ground beef in a skillet over medium-high heat, breaking apart.',
            'Drain excess fat, add taco seasoning and ¼ cup water.',
            'Simmer 5 minutes until sauce thickens.',
            'Warm taco shells per package directions.',
            'Dice tomatoes and shred lettuce.',
            'Mash avocado with lime juice and salt for quick guacamole.',
            'Assemble tacos: meat, cheese, lettuce, tomato, sour cream, guacamole.',
            'Serve with lime wedges.',
          ],
          cooking_time: 20,
          servings: 4,
          tags: ['Mexican', 'Quick', 'Family-Friendly'],
        },
        groceries: [
          { name: 'Ground beef', category: 'Meat & Seafood', estimated_expiry_days: 3, quantity: '1 lb' },
          { name: 'Taco shells', category: 'Pantry', estimated_expiry_days: 180, quantity: '8 count box' },
          { name: 'Taco seasoning', category: 'Pantry', estimated_expiry_days: 365, quantity: '1 packet' },
          { name: 'Cheddar cheese', category: 'Dairy & Eggs', estimated_expiry_days: 14, quantity: '8 oz shredded' },
          { name: 'Iceberg lettuce', category: 'Produce', estimated_expiry_days: 7, quantity: '1 head' },
          { name: 'Roma tomatoes', category: 'Produce', estimated_expiry_days: 5, quantity: '2' },
          { name: 'Sour cream', category: 'Dairy & Eggs', estimated_expiry_days: 14, quantity: '8 oz' },
          { name: 'Avocado', category: 'Produce', estimated_expiry_days: 3, quantity: '1' },
          { name: 'Lime', category: 'Produce', estimated_expiry_days: 14, quantity: '1' },
        ],
      });
    }

    if (lower.includes('salmon') || lower.includes('fish')) {
      meals.push({
        meal_name: 'Pan-Seared Salmon',
        planned_date: 'Monday',
        recipe: {
          title: 'Pan-Seared Salmon with Lemon Butter',
          description: 'Restaurant-quality salmon with crispy skin and a bright lemon butter sauce.',
          ingredients: [
            { name: 'Salmon fillets', amount: '2', unit: '6 oz each' },
            { name: 'Butter', amount: '3', unit: 'tbsp' },
            { name: 'Garlic', amount: '3', unit: 'cloves' },
            { name: 'Lemon', amount: '1', unit: '' },
            { name: 'Fresh dill', amount: '2', unit: 'tbsp' },
            { name: 'Asparagus', amount: '1', unit: 'bunch' },
            { name: 'Olive oil', amount: '1', unit: 'tbsp' },
          ],
          instructions: [
            'Pat salmon dry; season with salt and pepper.',
            'Heat olive oil in a heavy skillet over medium-high until shimmering.',
            'Place salmon skin-side up; cook 4 minutes without touching.',
            'Flip salmon and add butter and garlic to the pan.',
            'Baste with melted butter for 3-4 minutes until cooked through.',
            'Meanwhile, roast asparagus at 400°F for 12 minutes.',
            'Squeeze lemon over salmon and garnish with fresh dill.',
            'Serve immediately.',
          ],
          cooking_time: 20,
          servings: 2,
          tags: ['Seafood', 'Healthy', 'Quick', 'Keto'],
        },
        groceries: [
          { name: 'Salmon fillets', category: 'Meat & Seafood', estimated_expiry_days: 2, quantity: '2 fillets' },
          { name: 'Butter', category: 'Dairy & Eggs', estimated_expiry_days: 30, quantity: '1 stick' },
          { name: 'Garlic', category: 'Produce', estimated_expiry_days: 30, quantity: '1 head' },
          { name: 'Lemon', category: 'Produce', estimated_expiry_days: 14, quantity: '1' },
          { name: 'Fresh dill', category: 'Produce', estimated_expiry_days: 5, quantity: '1 bunch' },
          { name: 'Asparagus', category: 'Produce', estimated_expiry_days: 4, quantity: '1 bunch' },
        ],
      });
    }

    // Fallback for unrecognized dishes — generic healthy meal
    if (meals.length === 0) {
      meals.push({
        meal_name: 'Garlic Herb Roasted Chicken',
        planned_date: 'Any day',
        recipe: {
          title: 'Garlic Herb Roasted Chicken',
          description: 'Juicy whole roasted chicken with fragrant herbs and crispy golden skin.',
          ingredients: [
            { name: 'Whole chicken', amount: '1', unit: '4 lb' },
            { name: 'Butter', amount: '4', unit: 'tbsp' },
            { name: 'Garlic', amount: '4', unit: 'cloves' },
            { name: 'Fresh rosemary', amount: '3', unit: 'sprigs' },
            { name: 'Fresh thyme', amount: '3', unit: 'sprigs' },
            { name: 'Lemon', amount: '1', unit: '' },
            { name: 'Carrots', amount: '3', unit: 'medium' },
            { name: 'Potatoes', amount: '4', unit: 'medium' },
          ],
          instructions: [
            'Preheat oven to 425°F (220°C).',
            'Pat chicken dry inside and out.',
            'Mix softened butter with minced garlic, rosemary, and thyme.',
            'Rub herb butter under and over the skin.',
            'Stuff cavity with lemon halves and herb sprigs.',
            'Surround with carrots and quartered potatoes.',
            'Roast 1 hour 15 minutes, basting every 30 minutes.',
            'Rest 15 minutes before carving.',
          ],
          cooking_time: 90,
          servings: 4,
          tags: ['Roasted', 'Classic', 'Sunday Dinner'],
        },
        groceries: [
          { name: 'Whole chicken', category: 'Meat & Seafood', estimated_expiry_days: 2, quantity: '4 lb' },
          { name: 'Butter', category: 'Dairy & Eggs', estimated_expiry_days: 30, quantity: '1 stick' },
          { name: 'Garlic', category: 'Produce', estimated_expiry_days: 30, quantity: '1 head' },
          { name: 'Fresh rosemary', category: 'Produce', estimated_expiry_days: 7, quantity: '1 bunch' },
          { name: 'Fresh thyme', category: 'Produce', estimated_expiry_days: 7, quantity: '1 bunch' },
          { name: 'Lemon', category: 'Produce', estimated_expiry_days: 14, quantity: '1' },
          { name: 'Carrots', category: 'Produce', estimated_expiry_days: 14, quantity: '3 medium' },
          { name: 'Potatoes', category: 'Produce', estimated_expiry_days: 30, quantity: '4 medium' },
        ],
      });
    }

    return { meals, notes: 'Recipes generated. Select the ones you want to cook and add ingredients to your shopping list.' };
  }
}

function extractDay(text: string, day: string): string | null {
  const lower = text.toLowerCase();
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const d of days) {
    if (lower.includes(d)) {
      return d.charAt(0).toUpperCase() + d.slice(1);
    }
  }
  return day ? day.charAt(0).toUpperCase() + day.slice(1) : null;
}
