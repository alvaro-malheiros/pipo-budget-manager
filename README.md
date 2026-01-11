
# Pipo Budget Manager (iOS-inspired)

A sophisticated personal finance manager built with React, Tailwind CSS, and Google Gemini AI.

## Deployment on Vercel

1. **Push to GitHub**: Create a new repository and push all files to it.
2. **Connect to Vercel**: 
   - Go to [vercel.com](https://vercel.com).
   - Click "Add New" -> "Project".
   - Import your GitHub repository.
3. **Configure Environment Variables**:
   - In the Vercel project settings, go to **Environment Variables**.
   - Add a new variable:
     - **Key**: `API_KEY`
     - **Value**: Your Google Gemini API Key.
4. **Deploy**: Vercel will automatically detect the Vite project and deploy it.

## Local Development

```bash
npm install
npm run dev
```
