# A Little Space for Us ♡ — setup notes

A romantic scrapbook-style website for Kyle. It is a front-end starter with page-turn navigation, mobile swipes, a 100-question journal, required four-part feelings form, local draft saving, and optional Firebase support for private online responses.

## Preview it
1. Extract the ZIP folder.
2. Open the folder in VS Code.
3. Install/use **Live Server** and open `index.html` with it. (ES modules work best over localhost, not by double-clicking the file.)
4. Click **Open this, my love**. On mobile, swipe left/right across the page; on desktop use the arrows or table of contents.

## Music player — “Muli” by Ace Banzuelo
The scrapbook uses the official YouTube music video embed, so you do not need to download or host an MP3. Press the music button to open the player; it stays mounted while you turn pages. An internet connection is required, and browser autoplay restrictions may mean the listener needs to press Play inside the embedded player. Closing the player stops playback.

Official video: https://www.youtube.com/watch?v=uLCH_ZWVATI

## Connect Firebase for private cross-device answers
**Important:** until these steps are completed, submissions are saved only in the current browser's local storage. They do not automatically appear on another device. Do not treat local preview mode as secure or as an online backup.

1. Create a **separate Firebase project** for this personal site (do not reuse a school project).
2. In Firebase Console, add a Web app and copy its config.
3. Enable **Authentication → Sign-in method → Anonymous** and **Google**. For Google sign-in, use the Google account that will read answers.
4. Create a Firestore database.
5. Copy `firebase-config.example.js` to `firebase-config.js` and fill in your Firebase web config values.
6. In `index.html`, add `<script src="firebase-config.js"></script>` before `<script type="module" src="app.js"></script>`.
7. In `app.js`, replace `REPLACE_WITH_YOUR_EMAIL` in `ADMIN_EMAIL` with the exact email that should read responses.
8. In `firestore.rules`, replace `REPLACE_WITH_YOUR_EMAIL` with the same exact email, then publish the rules.
9. Test using the deployed/localhost domain. Add the domain to **Authentication → Settings → Authorized domains** if Firebase asks.
10. To read submitted answers, open the site URL with `#answers` at the end (example: `https://your-site.example/#answers`) and sign in with the authorized Google account. Do not share that view or the authorized account.

### Privacy and transparency
The feelings form explicitly tells the person submitting that Nicole can read the submitted answers. Keep that disclosure in place. The Firestore rules limit reading to the verified authorized Google email; anonymous visitors can write only their own response document. Never replace these rules with public read access.

## Deploy to Vercel
Import the project folder/repository as a static site. Ensure `firebase-config.js` is present in the deployed project if you enabled Firebase. The project does not require a build command; the output directory is the project root.

## Files
- `index.html` — book layout and main interface
- `styles.css` — scrapbook design, responsive styles, page animations
- `app.js` — page navigation, questions, draft saving, form, audio and Firebase logic
- `firebase-config.example.js` — Firebase config template
- `firestore.rules` — private response access rules template
