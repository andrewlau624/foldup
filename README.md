# Foldup

**LLM-powered repository architecture analyzer** that reorganizes your project structure automatically for cleaner, more maintainable codebases.  

### 🌐 Links

- **Website:** [http://andrewlau.dev/](http://andrewlau.dev/)  
- **GitHub:** [https://github.com/andrewlau624](https://github.com/andrewlau624)  
- **NPM:** [https://www.npmjs.com/package/@andrewlau624/foldup](https://www.npmjs.com/package/@andrewlau624/foldup)  

## Usage

```bash
# Export API key
export GROQ_API_KEY="your_api_key_here"

# Analyze and reorganize the current folder
npx foldup refold ./

# Optional: Add a custom prompt
npx foldup refold ./src/components -p "Organize files by feature modules instead of file type"
```

## Currently Supported LLMs

- **GROQ** (via `GROQ_API_KEY`)  
> More providers coming soon!
---

Made with ❤️ for developers who love clean, organized code.



