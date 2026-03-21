# Science Bee Study

Practice tools and study resources for the National Science Bee.

## Contents

- `science_bee_practice.html` — Interactive practice tool for Science Bee questions

## Quick Start

1. Download [`science_bee_practice.html`](https://github.com/steadycoding/science-bee-study/blob/main/science_bee_practice.html)
2. Double-click the file to open it in your browser — no installation required
3. Everything is self-contained in that single file

## How to Use

1. **Select question sets** using the checkboxes on the start screen
2. Optionally filter by **category** (Biology, Chemistry, Physics, etc.)
3. Click **START + LISTEN** to begin — questions will be read aloud
4. Press the **BUZZ** button (or Space/Enter) as soon as you know the answer
5. **Speak your answer** — the app will try to grade it automatically
6. The correct answer is revealed so you can compare
7. If the app couldn't grade it automatically, use the **✓** (correct) or **✗** (wrong) buttons to mark it manually
8. After finishing, review your results in the **end screen** table broken down by category

## Tips for Best Results

- Use **Chrome** or **Edge** for the best experience
- Sit in a **quiet room** close to the microphone
- Encourage answering **early in the question** to earn bonus points for buzzing before the final clue

## Why It's Useful

- Goes through questions faster than manual flashcards
- Bonus points for early answers incentivize knowing the material deeply
- Category breakdown at the end makes it easy to identify which topics to focus on

## How the App Works (for Parents & Coaches)

When your student speaks their answer, the audio **never leaves the device**. The app uses a small AI model called Whisper that runs entirely inside the browser — it listens, figures out what was said, and grades the answer all on your computer, with nothing sent to any server.

The first time the app is opened, it downloads that AI model (~40 MB, about the size of a small app) from the internet and stores it in the browser's cache. After that, **the app works with no internet connection at all**.

The answer flow works like this:

1. The question is read aloud, and the student **buzzes in** when they know the answer
2. The student **speaks or types their answer**
3. The app automatically grades it — or, if it wasn't sure what was said, **reveals the correct answer first** so the student can see it
4. If the answer needs a human judgment call, the student then marks it **✓ or ✗** before moving on

This means students always know the right answer before they have to decide whether they got it right, so they can make an honest, informed judgment.

**One small tradeoff:** Because the AI runs on your device instead of a remote server, it may take a second or two to process each answer and may occasionally mishear a word. The manual ✓/✗ buttons are always available as a fallback.

## Known Limitations

1. **Speech recognition sometimes misses the answer.** The correct answer is shown first — just use the ✓/✗ buttons to manually mark whether the answer was correct, then review missed questions at the end.

2. **The AI model needs a one-time download.** On first use, the browser downloads ~40 MB for the speech model. After that it's cached and the app works offline.

## Browser Compatibility

| Browser | Speech Recognition | Manual Mode |
|---------|-------------------|-------------|
| Chrome / Edge | ✓ Full support | ✓ |
| Firefox | ✓ Full support | ✓ |
| Safari | ✓ Full support | ✓ |

All audio processing runs locally in the browser — no cloud service required.
