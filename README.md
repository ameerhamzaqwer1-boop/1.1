# Kitchen Craft PK — website

Smart Kitchen Better Life. Customer item chunta hai, **Order on WhatsApp** dabata hai, aur message aapke number **0301 9088013** par aa jata hai.

## Is folder mein kya hai

| File | Kaam |
|---|---|
| `index.html`, `style.css`, `app.js` | Website ka design aur code (inhe chhedne ki zaroorat nahi) |
| `products.json` | Aapke saare products ki list — yahan se items badle jate hain |
| `images/` | Product ki photos |
| `config.js` | WhatsApp number, shop ka naam, logo, Supabase keys |
| `admin.html` | Owner panel — phone se items add/edit/delete (Supabase chahiye, optional) |
| `supabase-setup.sql` | Owner panel ke liye one-time setup |

---

## Step 1 — GitHub par upload (free)

1. github.com par account banayein → **New repository** → naam likhein, jaise `kitchen-craft-pk` → **Public** rakhein → Create.
2. **Add file → Upload files** → is folder ki **saari files aur `images` folder** drag karke daalein → **Commit changes**.
   (Zip ko pehle extract kar lein. `.nojekyll` file bhi upload honi chahiye.)

## Step 2 — Website live karein

1. Repository mein **Settings → Pages**.
2. **Source: Deploy from a branch** → Branch **main**, folder **/ (root)** → **Save**.
3. 1–2 minute baad link mil jayega: `https://AAPKA-USERNAME.github.io/kitchen-craft-pk/`
   Yeh link WhatsApp status / Facebook / Instagram par share kar dein.

> Free GitHub Pages ke liye repository **Public** honi chahiye.

---

## Items badalne ke 2 tareeqay

### A) `products.json` edit karein (koi setup nahi)
GitHub mein `products.json` kholein → pencil (✏️) → naya item copy-paste karein → **Commit changes**. 1–2 minute mein site update.

```json
{
  "id": "p21",
  "name": "Non-stick Tawa 28 cm",
  "subtitle": "Heavy base, easy to clean",
  "category": "Cookware",
  "brand": "Sonex",
  "price": 2500,
  "image": "images/p21.jpg",
  "details": ["28 cm", "Non-stick coating", "Heavy base"],
  "in_stock": true
}
```

- `price` khali rakhna ho to `null` likhein — site par "Ask for price" aayega.
- `"in_stock": false` karne se item par "Sold out" lag jata hai.
- `category` ka naya naam likhein to site khud naya tab bana deti hai.
- Har item ke baad comma `,` lagana na bhoolein (aakhri item ke baad nahi).
- Naye item ki photo `images` folder mein upload karein, naam wohi jo `image` mein likha ho.

### B) Owner panel `admin.html` (phone se bhi, sabse tez)
Ek baar setup ke baad aap sirf login karke items add / edit / delete kar sakti hain, photo bhi wahin se upload hoti hai. Sirf aapki email item badal sakti hai.

**One-time setup (10 minute):**
1. supabase.com → free account → **New project** (region: nearest, jaise Mumbai). Database password save kar lein.
2. **Authentication → Users → Add user → Create new user**: apni email aur password dein, **Auto Confirm User** on rakhein.
   Authentication settings mein **"Allow new users to sign up"** off kar dein.
3. `supabase-setup.sql` kholein → `YOUR_EMAIL_HERE` ko apni email se replace karein (sab jagah) → **SQL Editor → New query** mein paste → **Run**.
4. **Project Settings → API**: **Project URL** aur **anon / publishable key** copy karein → `config.js` mein `supabaseUrl` aur `supabaseAnonKey` mein paste karein → GitHub par commit.
   (Yeh key public hoti hai, safe hai — items sirf aapki email badal sakti hai.)
5. `https://AAPKA-USERNAME.github.io/kitchen-craft-pk/admin.html` kholein → login → **Load starter items** dabayein. Ab saare 20 items yahan edit ho sakte hain.

> Agar Supabase kuch waqt ke liye band ho (free projects hafte bhar use na ho to pause ho jate hain) to site khud `products.json` dikha degi. Isliye kabhi kabhi `products.json` bhi update rakhein, ya Supabase dashboard se project restore kar dein.

---

## Chhoti settings (`config.js`)
- **WhatsApp number**: `whatsapp: "923019088013"` (country code 92 ke saath, bina 0, + aur space ke).
- **Logo**: apna logo `images/logo.png` naam se upload karein, phir `logo: "images/logo.png"` likhein.

## Photos ke tips
- Product ko seedha, roshni mein, saaf background par rakhkar photo lein — site par yeh sabse achhi lagti hai.
- Photo 900 px ke aas paas aur 150 KB se kam ho to site tez chalti hai (admin panel yeh khud kar deta hai).

## Order kaise aata hai
Customer ka message aisa hota hai:

```
Assalam o Alaikum Kitchen Craft PK!
Mujhe yeh items order karne hain:

1. Electric Kettle 2.0L (RAF) x 2
2. Deli Glass Mug Set (Delisoga) x 1

Naam: Ayesha
Shehr: Lahore
Address: ...

Price aur delivery confirm kar dein. Shukriya.
```
