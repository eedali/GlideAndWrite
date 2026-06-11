# 👆 Glide & Write

Glide & Write is an intuitive, accessible, gesture-based communication application specifically designed for non-verbal individuals or those with speech impairments. By utilizing simple directional swipes or continuous screen glides, users can rapidly construct sentences and communicate their thoughts aloud using built-in text-to-speech.

## 📖 How It Works

Instead of typing on a traditional keyboard, users map words or phrases to directional sequences (Up, Down, Left, Right). 
For example, swiping `Up` then `Right` could output the word `"Hello"`.

* **Talk Mode:** The primary interface. Perform your saved gestures to quickly build a sentence on the screen.
* **Entry Mode:** The learning interface. Execute a new sequence, type the corresponding word, and save it to your dictionary on the fly.
* **Input Styles:** 
  * **Step:** Distinct, individual swipes for each direction.
  * **Glide:** Draw a continuous line across the screen, changing direction without lifting your finger.

## ✨ Core Features

* **Custom Vocabularies (Configurations):** Create multiple dictionaries for different contexts (e.g., "Home", "School", "Medical"). Each configuration can have its own target language for accurate pronunciation.
* **Native Text-to-Speech (TTS):** One-tap speech synthesis. The app automatically selects the correct voice profile based on the active configuration's language.
* **Adaptive User Interface:**
  * **Dynamic Typography:** Font sizes scale smoothly and automatically as your drafted sentence grows.
  * **Theming:** Includes 6 carefully designed visual themes (Bone, Oatmeal, Slate, Sage, Charcoal, Midnight) for optimal contrast and eye comfort.
* **Personalized Quick Symbols:** A dedicated, fully editable punctuation and symbol bar. Supports long-press actions for alternative insertion behaviors (e.g., attaching punctuation without spaces).
* **True Multi-language Support:** The application interface is translated into 12 languages (English, Turkish, Spanish, French, German, Chinese, etc.).
* **Offline First & Privacy Focused:** All custom words, configurations, and drafted sentences are persisted entirely locally on your device via `localStorage`. No cloud syncing, no data collection.

## 🛠 Tech Stack

* **Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
* **Animation:** [Motion](https://motion.dev/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Mobile Runtime:** [Capacitor](https://capacitorjs.com/) (Targeting Android & iOS)

## 🚀 Local Development

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/eedali/GlideAndWrite
   cd GlideAndWrite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 📱 Mobile Build (Capacitor)

This project is configured as a cross-platform mobile app using Capacitor. To sync your web assets and open the Android project in Android Studio:

```bash
# Build the web assets first
npm run build

# Sync the assets to the Android project
npx cap sync android

# Open Android Studio
npx cap open android
```

## 🤝 Contributing

Contributions, issues, and feature requests are highly encouraged! Feel free to check the issues page or open a pull request.

## 📄 License

This project is open-source and free to use.
