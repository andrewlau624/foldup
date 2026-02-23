# Foldup

**LLM-powered repository architecture analyzer** that reorganizes your project structure automatically for cleaner, more maintainable codebases.  

## Usage

```bash
# Export API key
export GROQ_API_KEY="your_api_key_here"

# Analyze and reorganize the current folder
npx foldup refold ./

# Optional: Add a custom prompt
npx foldup refold ./src/components -p "Organize files by feature modules instead of file type"
```

Made with ❤️ for developers who love clean, organized code.



