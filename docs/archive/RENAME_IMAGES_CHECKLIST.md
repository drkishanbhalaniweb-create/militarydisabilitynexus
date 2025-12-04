# Image Renaming Checklist

## ✅ Code Updated - Now Rename the Files!

I've updated all the code references. Now you need to **rename the actual image files** in `frontend/public/`.

## Rename These Files:

In your `frontend/public/` folder, rename:

```bash
# Old Name → New Name

Gemini_Generated_Image_f6860of6860of686.png → hero-va-disability-background.jpg
Gemini_Generated_Image_mpiv0lmpiv0lmpiv.png → about-veteran-services-background.jpg
Gemini_Generated_Image_7ax9sd7ax9sd7ax9.png → blog-resources-background.jpg
wavefillservicep.png → services-wave-background.jpg
contactimg.png → contact-us-background.jpg
blogimg.png → blog-header-background.jpg (if used)
form bg image.png → forms-background.jpg
```

## How to Rename:

### Option 1: In File Explorer (Easiest)
1. Open `frontend/public/` folder in your file explorer
2. Right-click each file → Rename
3. Copy the new name from the list above
4. Change extension from `.png` to `.jpg` if needed

### Option 2: In VS Code
1. In VS Code, navigate to `frontend/public/`
2. Right-click each file → Rename
3. Enter the new name

### Option 3: Using Terminal (Windows CMD)
```cmd
cd frontend\public
ren "Gemini_Generated_Image_f6860of6860of686.png" "hero-va-disability-background.jpg"
ren "Gemini_Generated_Image_mpiv0lmpiv0lmpiv.png" "about-veteran-services-background.jpg"
ren "Gemini_Generated_Image_7ax9sd7ax9sd7ax9.png" "blog-resources-background.jpg"
ren "wavefillservicep.png" "services-wave-background.jpg"
ren "contactimg.png" "contact-us-background.jpg"
ren "form bg image.png" "forms-background.jpg"
```

## After Renaming:

1. ✅ Test your site locally (`npm start`)
2. ✅ Check that all background images load
3. ✅ Commit the renamed files
4. ✅ Push to GitHub
5. ✅ Deploy to Vercel

## Optional: Compress Images

Before deploying, compress the images to reduce file size:

1. Go to [TinyPNG.com](https://tinypng.com/)
2. Drag and drop all your renamed images
3. Download the compressed versions
4. Replace the originals with compressed versions

**Target file sizes:**
- Hero images: < 200 KB
- Background images: < 150 KB

## Verification Checklist:

After renaming and deploying, check:

- [ ] Home page background loads
- [ ] About page background loads
- [ ] Services page background loads
- [ ] Blog page background loads
- [ ] Contact page background loads
- [ ] Forms page background loads
- [ ] Footer background loads
- [ ] No broken images in browser console
- [ ] Page load speed is good

## SEO Benefits:

✅ **Better filenames** - Google can read and understand them
✅ **Improved organization** - Easier to manage
✅ **Professional** - No more generic AI-generated names
✅ **Accessibility** - Added `role="presentation"` and `aria-hidden="true"`

## Files Updated in Code:

- ✅ `frontend/src/pages/Home.js`
- ✅ `frontend/src/pages/About.js`
- ✅ `frontend/src/pages/Services.js`
- ✅ `frontend/src/pages/Blog.js`
- ✅ `frontend/src/pages/Contact.js`
- ✅ `frontend/src/pages/Forms.js`
- ✅ `frontend/src/components/Footer.js`

## Next Steps:

1. **Rename the files** (5 minutes)
2. **Test locally** (2 minutes)
3. **Commit and push** (1 minute)
4. **Deploy** (automatic)
5. **Verify on live site** (2 minutes)

**Total time: ~10 minutes** ⏱️

---

**Note:** The code is already updated and ready. Just rename the actual files and you're done! 🎉
