/* ------------------------------------------------------------------
   Kitchen Craft PK — shop settings
   Yeh file aap kabhi kabhi hi badlenge (number, naam, logo).
   Products badalne ke liye products.json ya admin.html use karein.
------------------------------------------------------------------- */
window.SHOP = {
  name: "Kitchen Craft PK",
  tagline: "Smart Kitchen Better Life",

  // WhatsApp number: country code ke saath, bina + aur bina space ke.
  // 0301 9088013  ->  923019088013
  whatsapp: "923019088013",
  phoneDisplay: "0301 9088013",

  currency: "Rs",

  // Apna logo lagana ho to images folder mein logo.png rakhein aur yahan likhein: "images/logo.png"
  logo: "",

  // Supabase (optional). Jab admin.html se products badalna chahein tab dono bharein.
  // Khali rahein to site products.json se chalti rahegi.
  supabaseUrl: "",
  supabaseAnonKey: ""
};
