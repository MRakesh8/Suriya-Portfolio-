# Surya Portfolio — Deployment Guide

## 🚀 Deploy to Vercel (Free)

### Method 1: Drag & Drop (Easiest)
1. Go to [vercel.com](https://vercel.com) and sign up free
2. Click **"Add New Project"**
3. Click **"Deploy from file"** or drag the entire `surya-portfolio` folder
4. Click **Deploy** — Done! You get a live link instantly.

### Method 2: GitHub (Recommended for updates)
1. Create a free account at [github.com](https://github.com)
2. Create a new repository called `surya-portfolio`
3. Upload all files in this folder to the repository
4. Go to [vercel.com](https://vercel.com) → "Add New Project" → Import from GitHub
5. Select your repo → Click Deploy
6. Every time you push changes to GitHub, Vercel auto-deploys ✅

---

## 📁 Adding Your Own Images & Videos

Replace the placeholder cards in `index.html` with your real work:

```html
<!-- Replace this placeholder -->
<div class="port-card">...</div>

<!-- With your image -->
<div class="port-card" style="background-image:url('assets/reel1.jpg'); background-size:cover;">
  <div class="port-overlay"><span>Reel #1</span></div>
</div>
```

Create an `assets/` folder and drop your images/thumbnails there.

---

## ✏️ Customizing Content

All your content is in `index.html`. Search for:
- **"Surya"** → your name
- **"8098970058"** → your WhatsApp
- **"suryapranav2606@gmail.com"** → your email
- **"___editor_surya"** → your Instagram handle

---

## 📱 Mobile Optimized
The site is fully responsive — looks great on phones, tablets & laptops.

---

## 🎨 Changing Colors
Open `style.css` and edit the `:root` variables at the top:
```css
--gold: #C9A84C;   /* Main gold accent */
--bg: #080808;     /* Main background */
```
