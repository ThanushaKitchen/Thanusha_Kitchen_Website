/* =====================================================
   Thanusha's Kitchen — products.js
   All product data lives here.

   Each product needs:
     id          — unique number
     name        — product name
     subtitle    — short descriptor
     category    — "pickles" OR "podis"  ← determines which section it appears in
     price       — number (in ₹)
     weight      — string e.g. "500g"
     description — short description
     badge       — label shown on card e.g. "Bestseller", "New", "Hot"
     img         — image URL
     spice       — heat level 1 (mild) to 5 (very hot)
===================================================== */

const PRODUCTS = [

  /* ───────────── PICKLES ───────────── */
  {
    "id": 1,
    "name": "Avakaya Pickle",
    "subtitle": "Mango Pickle",
    "category": "pickles",
    "price": 399,
    "weight": "500g",
    "description": "Traditional spicy mango pickle made with authentic Andhra recipe. Bold, tangy and finger-licking good.",
    "badge": "Bestseller",
    "img": "Assets/Avakaya.jpg",
    "spice": 5
  },
  {
    "id": 2,
    "name": "Gongura Pickle",
    "subtitle": "Sorrel Leaves",
    "category": "pickles",
    "price": 349,
    "weight": "500g",
    "description": "Tangy and spicy Gongura pickle rich in flavor. Andhra's pride with earthy sour notes.",
    "badge": "Popular",
    "img": "Assets/Gongura.webp",
    "spice": 4
  },
  {
    "id": 3,
    "name": "Lemon Pickle",
    "subtitle": "Nimma Pachadi",
    "category": "pickles",
    "price": 299,
    "weight": "500g",
    "description": "Homemade lemon pickle with perfectly balanced spice and sour taste. Goes with everything.",
    "badge": "Mild",
    "img": "Assets/Lemon_Pickle.webp",
    "spice": 3
  },
  {
    "id": 4,
    "name": "Chicken Pickle",
    "subtitle": "Chicken Pachadi",
    "category": "pickles",
    "price": 329,
    "weight": "500g",
    "description": "Strong-flavored garlic pickle prepared with traditional Andhra spices. A condiment lover's delight.",
    "badge": "Hot",
    "img": "Assets/Chicken_Pickle.webp",
    "spice": 5
  },
  {
    "id": 5,
    "name": "Tomato Pickle",
    "subtitle": "Tomato Pachadi",
    "category": "pickles",
    "price": 279,
    "weight": "500g",
    "description": "Andhra-style tomato pickle with a rich, tangy taste and aromatic tempering. Perfect for rice.",
    "badge": "New",
    "img": "Assets/TomatoAvakaya.webp",
    "spice": 3
  },

  /* ───────────── PODIS & SPICES ───────────── */
  {
    "id": 6,
    "name": "Karivepaku Podi",
    "subtitle": "Curry Leaf Powder",
    "category": "podis",
    "price": 179,
    "weight": "200g",
    "description": "Aromatic curry leaf podi packed with flavor and nutrition. A staple in every Andhra household.",
    "badge": "Popular",
    "img": "Assets/KarivepakuPodi.jpg",
    "spice": 2
  },
  {
    "id": 7,
    "name": "Kandi Podi",
    "subtitle": "Toor Dal Powder",
    "category": "podis",
    "price": 199,
    "weight": "200g",
    "description": "Classic Andhra toor dal podi with roasted spices. Mix with rice and ghee for a soul-satisfying meal.",
    "badge": "Bestseller",
    "img": "Assets/Kandi.jpg",
    "spice": 3
  },
  
  {
    "id": 8,
    "name": "Munagaku Podi",
    "subtitle": "Drum Stick Leaf Powder",
    "category": "podis",
    "price": 149,
    "weight": "200g",
    "description": "Dried Drum stcik Leaves are grinded with a blend of spices Tastes delicious while having with Rice or Dosa",
    "badge": "Mild",
    "img": "Assets/munagaaku.webp",
    "spice": 2
  },
  {
    "id": 9,
    "name": "Pasupu",
    "subtitle": "Turmeric Powder",
    "category": "podis",
    "price": 169,
    "weight": "200g",
    "description": "A Fresh turmeric farm grown is dried under sun and blended to gicve best turmeric with No color added",
    "badge": "New",
    "img": "Assets/Pasupu.webp",
    "spice": 0
  },
  {
    "id": 10,
    "name": "Garam Masala",
    "subtitle": "Garam Masala",
    "category": "podis",
    "price": 189,
    "weight": "200g",
    "description": "Freshly prepared blend of all spices which tastes heavenly when used while cooking curries or Biryani",
    "badge": "Hot",
    "img": "Assets/GaramMasala.jpg",
    "spice": 4
  }

];