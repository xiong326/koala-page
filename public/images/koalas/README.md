# Koala Images Folder

## How to Add Koala Images

1. **Add your koala photos to this folder**
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
   - Recommended size: 800x600px or larger
   - Name them clearly (e.g., `jasmine.jpg`, `wutong.jpg`)

2. **Update the koala data** in `src/data/koalas.json`
   - Change the `"photo": null` to `"photo": "/images/koalas/filename.jpg"`

## Example

If you add a file named `jasmine.jpg` to this folder, update the JSON like this:

```json
{
  "id": "k001",
  "name": "茉莉",
  "photo": "/images/koalas/jasmine.jpg"
}
```

## Tips

- Use descriptive filenames (koala names work well)
- Keep file sizes reasonable (under 2MB recommended)
- Images will be displayed as 48px height in the koala detail card
- The app will show a 🐨 emoji placeholder for any koala without a photo
