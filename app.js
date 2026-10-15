const firebaseConfig = window.LOVEBOOK_FIREBASE_CONFIG || null;
const ADMIN_EMAIL = 'brobonicole@gmail.com';

let db = null, auth = null, remoteReady = false, currentUser = null;
let initializeApp, getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup;
let getFirestore, doc, setDoc, getDocs, collection, serverTimestamp;

async function initializeFirebaseIfConfigured() {
  if (remoteReady) return;

  if (!firebaseConfig || !firebaseConfig.apiKey || String(firebaseConfig.apiKey).includes('PASTE')) {
    return;
  }

  try {
    const appMod = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
    const authMod = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
    const storeMod = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');

    ({ initializeApp } = appMod);
    ({ getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup } = authMod);
    ({ getFirestore, doc, setDoc, getDocs, collection, serverTimestamp } = storeMod);

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    remoteReady = true;
  } catch (e) {
    console.warn('Firebase is unavailable; the book will still work locally.', e);
  }
}

const chapters = [
  {
    title: 'The Little Things About You',
    sub: 'the tiny details that make you, you',
    questions: [
      "What's your all-time favorite food?",
      "What's a color that always makes you happy?",
      "What song can you listen to on repeat?",
      "What's your comfort food on a bad day?",
      'Are you more of a morning person or a night owl?',
      "What's your favorite kind of weather?",
      "What's one small thing that instantly improves your mood?",
      "What's your favorite movie or series?",
      "What's a random fact about you that I might not know?",
      "What's one thing you always bring with you?"
    ]
  },
  {
    title: 'Your Hobbies & Happy Place',
    sub: 'the things that make your eyes light up',
    questions: [
      "What's something you could talk about for hours?",
      "What's a hobby you never get tired of?",
      "What's one hobby you've always wanted to try?",
      'What do you usually do when you finally get free time?',
      'What kind of games do you enjoy most, and why?',
      "What's your favorite way to spend a day off?",
      'Do you prefer staying in or going on an adventure?',
      "What's a place where you feel completely at peace?",
      'What activity makes you forget about stress for a while?',
      'If you had a whole day just for yourself, what would you do?'
    ]
  },
  {
    title: 'Your Childhood & Memories',
    sub: 'little pieces of the person you grew into',
    questions: [
      "What's one of your happiest childhood memories?",
      'What were you like as a kid?',
      'Who made you feel safe when you were younger?',
      "What's something you loved doing as a child?",
      "What's a memory that still makes you laugh?",
      'Was there a dream job you wanted when you were little?',
      "What's a lesson from your family that stayed with you?",
      "What's something you wish people understood about your younger self?",
      "What's a place from your childhood you'd like to visit again?",
      'If you could tell your younger self one thing, what would it be?'
    ]
  },
  {
    title: 'Your Dreams & Future',
    sub: "the life you're quietly building",
    questions: [
      "What's one dream you're working toward right now?",
      'Where do you hope to be in five years?',
      "What's something you want to learn or get better at?",
      'What does a peaceful life look like to you?',
      "What's a goal you haven't told many people about?",
      "If money and fear weren't a problem, what would you try?",
      'What kind of person do you hope to become?',
      "What's one place you'd really love to travel to?",
      'What achievement would make you proud of yourself?',
      "What's one thing you hope your future self never forgets?"
    ]
  },
  {
    title: 'Things You Love & Hate',
    sub: 'your little yeses, nos, and everything between',
    questions: [
      "What's a little thing that annoys you more than it should?",
      "What's one thing that can make you smile even when you're tired?",
      'What kind of behavior makes you lose trust in someone?',
      "What's your biggest pet peeve?",
      'What kind of compliment means the most to you?',
      'What is something people do that makes you feel respected?',
      "What's one thing you absolutely need after a long day?",
      'What kind of surprise do you actually enjoy?',
      "What's something you dislike but rarely say out loud?",
      "What's a simple gesture that means a lot to you?"
    ]
  },
  {
    title: 'Your Heart & Feelings',
    sub: "you don't have to have every answer ready",
    questions: [
      'When you’re upset, do you prefer space, comfort, or someone who listens?',
      'How can I tell when something is bothering you?',
      "What's hard for you to explain about your feelings?",
      'What helps you calm down after a stressful day?',
      'What is something people often misunderstand about you?',
      'When do you feel most appreciated?',
      'What makes you feel safe enough to open up?',
      "What's a fear you'd like to become braver about?",
      "When you need support, what's the best way for me to show up?",
      'Is there anything you wish people asked you more often?'
    ]
  },
  {
    title: 'Love, Your Way',
    sub: 'learning how to love each other better',
    questions: [
      'What makes you feel loved in a relationship?',
      'Do you prefer words, quality time, thoughtful actions, gifts, or physical affection?',
      'What is a little thing a partner can do that makes you feel chosen?',
      'When there’s a misunderstanding, what helps you talk it through?',
      'What does a sincere apology look like to you?',
      'How do you prefer to receive reassurance?',
      'What is a boundary that helps you feel respected?',
      'When you need space, how can we communicate that kindly?',
      'What is something you want us to learn how to do better together?',
      'What does a healthy relationship feel like to you?'
    ]
  },
  {
    title: 'Us & Our Memories',
    sub: 'the moments I keep close to my heart',
    questions: [
      "What's the first thing you remember noticing about me?",
      "What's a moment with me that makes you smile?",
      "What's something you enjoy doing with me?",
      "What's one little memory of us you hope you never forget?",
      'When do you feel closest to me?',
      "What's something new you'd like us to try together?",
      "What's one thing about us that you appreciate?",
      'What is a small tradition you would like us to have?',
      'What is something I do that makes you feel understood?',
      "What's one memory you'd like us to make someday?"
    ]
  },
  {
    title: 'Things You Don’t Usually Say',
    sub: 'only share what feels okay to share',
    questions: [
      'What is something you wish people understood without you having to explain it?',
      'What is a worry you tend to keep to yourself?',
      'What do you find difficult to ask for?',
      "What's something you're still learning to accept about yourself?",
      "When have you felt really proud of yourself lately?",
      'What is one thing that helps you trust someone deeply?',
      'What do you wish you could be more honest about?',
      'What is a part of yourself you want to protect?',
      "What's something you need more of in your life right now?",
      'Is there anything you want me to know, even if it is hard to say?'
    ]
  },
  {
    title: 'Our Future Together',
    sub: 'not promises carved in stone, just hopes we can share',
    questions: [
      'What kind of everyday life would make you happy with a partner?',
      "What's one adventure you want us to have together?",
      'How can we make time for each other when life gets busy?',
      'What does growing together mean to you?',
      'What is one thing we should always make space to talk about?',
      "How can we support each other's goals?",
      "What's a habit you'd like us to build as a couple?",
      'What do you hope we remember during difficult moments?',
      "What's one thing you'd like us to celebrate more often?",
      'What is one hope you have for our next chapter?'
    ]
  }
];

const questionList = chapters.flatMap((c, ci) =>
  c.questions.map((q, qi) => ({
    id: ci * 10 + qi + 1,
    chapter: ci,
    question: q
  }))
);

const pageMeta = [
  {
    eyebrow: 'A NOTE FROM ME',
    title: 'Before you turn the page',
    sub: 'a little note, from me to you',
    type: 'intro'
  },
  {
    eyebrow: 'A LITTLE MESSAGE FOR YOU',
    title: 'Things I want you to know',
    sub: 'words from my heart to yours',
    type: 'message'
  },
  {
    eyebrow: 'FROM THE SOFTEST PART OF MY HEART',
    title: 'What I couldn’t say that day',
    sub: 'a letter I hope you read gently',
    type: 'letter'
  },
  {
    eyebrow: '100 LITTLE WINDOWS INTO YOU',
    title: 'Tell me more about you',
    sub: '100 questions · 10 tiny chapters',
    type: 'questions'
  },
  {
    eyebrow: 'YOUR HEART, YOUR WORDS',
    title: 'I want to understand you',
    sub: 'four things I want to hear from you',
    type: 'feelings'
  },
  {
    eyebrow: 'OUR NEXT CHAPTER',
    title: 'A promise to keep learning',
    sub: 'not perfect, just willing',
    type: 'ending'
  }
];

let pageIndex = 0;
let questionChapter = 0;
let answers = {};
let feelings = {};
let toastTimer;
let touchStartX = 0;
let localDemo = true;

const $ = id => document.getElementById(id);
const cover = $('cover');
const reader = $('reader');
const paper = $('paperPage');
const content = $('pageContent');

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function enterBook() {
  cover.classList.remove('active');
  reader.classList.add('active');
  renderPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goCover() {
  reader.classList.remove('active');
  cover.classList.add('active');
}

function turnPage(delta) {
  const next = Math.max(0, Math.min(pageMeta.length - 1, pageIndex + delta));
  if (next === pageIndex) return;

  paper.classList.add(delta > 0 ? 'flipping-next' : 'flipping-prev');

  setTimeout(() => {
    pageIndex = next;
    renderPage();
    paper.classList.remove('flipping-next', 'flipping-prev');
  }, 170);
}

function renderPage() {
  const p = pageMeta[pageIndex];

  $('chapterEyebrow').textContent = p.eyebrow;
  $('pageHeading').textContent = p.title;
  $('pageNumber').textContent = String(pageIndex + 1).padStart(2, '0');
  $('pageTotal').textContent = String(pageMeta.length).padStart(2, '0');
  $('footerPage').textContent = String(pageIndex + 1).padStart(2, '0') + ' ♡';
  $('pageSubtext').textContent = p.sub;
  $('readingProgress').style.width = ((pageIndex + 1) / pageMeta.length * 100) + '%';

  $('prevPage').disabled = pageIndex === 0;
  $('prevText').disabled = pageIndex === 0;
  $('nextPage').disabled = pageIndex === pageMeta.length - 1;
  $('nextText').textContent = pageIndex === pageMeta.length - 1
    ? 'back to the beginning ↗'
    : 'turn the page →';

  $('nextText').classList.toggle('next-text', pageIndex !== pageMeta.length - 1);

  document.querySelectorAll('.contents-item').forEach((el, i) => {
    el.classList.toggle('current', i === pageIndex);
  });

  if (p.type === 'intro') content.innerHTML = introHTML();
  if (p.type === 'message') content.innerHTML = messageHTML();
  if (p.type === 'letter') content.innerHTML = letterHTML();
  if (p.type === 'questions') content.innerHTML = questionsHTML();
  if (p.type === 'feelings') content.innerHTML = feelingsHTML();
  if (p.type === 'ending') content.innerHTML = endingHTML();

  wirePageControls();
}

function introHTML() {
  return `
    <p class="page-script">Hi, my love… ♡</p>
    <p class="page-paragraph">I made this little corner of the internet for you—not because I can fit every feeling into a website, but because sometimes I find it easier to gather my thoughts when I give them a place to live.</p>
    <p class="page-paragraph">I know that getting back together doesn't magically make every hurt disappear. I don't expect us to be okay about everything in one day. I just want you to know that <strong>your feelings matter to me, even the ones that are difficult to talk about.</strong></p>
    <div class="mini-polaroids">
      <div class="polaroid"><div class="polaroid-art">☁</div><small>soft days</small></div>
      <div class="polaroid"><div class="polaroid-art">♡</div><small>you & me</small></div>
      <div class="polaroid"><div class="polaroid-art">✿</div><small>new growth</small></div>
    </div>
    <p class="page-paragraph">There's no test here and no perfect answer you have to give. Just a little space for us to understand each other, one honest conversation at a time.</p>
    <p class="handwritten">Take your time, okay? I'm listening.</p>
    <div class="decorative-rule">✿</div>
    <p class="page-paragraph">P.S. You can skip any question you're not ready for. I want you to feel safe, not pressured. ♡</p>
  `;
}

function messageHTML() {
  return `
    <p class="page-script">A few things I hope you remember, my love. ♡</p>
    <div class="quote-card">You do not have to hide your feelings from me just to keep the peace.</div>
    <p class="page-paragraph">I want you to feel that you can tell me when something hurts, when you need reassurance, or when you need a little space. I may not always understand everything right away, but I want to listen and learn instead of guessing what is on your mind.</p>
    <div class="quote-card">We do not have to be perfect at communicating. We just have to keep trying honestly.</div>
    <p class="page-paragraph">Thank you for the little things you do, for giving us another chance, and for being part of my life. I hope this little book makes it easier for us to open up, one page and one conversation at a time.</p>
    <p class="handwritten">No pressure to answer perfectly. Just be you. ♡</p>
  `;
}

function letterHTML() {
  return `
    <p class="page-script">My love,</p>
    <p class="page-paragraph">Thank you for giving us another chance. I know forgiveness doesn't mean the hurt disappears instantly, and I don't want to act like everything is automatically okay just because we're together again.</p>
    <p class="page-paragraph">I'm sorry for the ways this situation hurt you. I wish I had handled things in a way that made you feel more secure and understood. I'm not writing this to rush you into feeling better or to ask you to forget what happened. I want to understand what stayed with you, even the parts you haven't found the words for yet.</p>
    <p class="page-paragraph">I still choose you, and I hope we can keep choosing each other in ways that feel honest and healthy. I want us to be able to say when we're hurt, ask for reassurance without shame, and listen without turning every hard conversation into a fight. I know I have things to learn, too.</p>
    <p class="page-paragraph">You don't have to pretend to be okay for my sake. If there's still tampo, sadness, doubt, or something you need me to understand, you can tell me. I'll do my best to listen instead of getting defensive. And I hope we can both be gentle with each other while we figure things out.</p>
    <p class="page-paragraph">I can't promise that we'll never make mistakes. I can promise that I want to keep learning, communicating, and making room for both of our feelings—not just mine, not just yours, but <strong>ours.</strong></p>
    <p class="page-paragraph">Thank you for being here, Kyle. I love you, and I'm grateful for the chance to write a better next chapter with you, slowly and sincerely.</p>
    <p class="letter-signoff">With love, always learning ♡</p>
  `;
}

function questionsHTML() {
  const c = chapters[questionChapter];

  return `
    <p class="page-script">I want to know you, not assume.</p>
    <p class="question-intro">One hundred questions, divided into ten little chapters. Answer whichever ones you feel like answering. Your progress saves on this device while you're here; when Firebase is set up, your answers can be saved privately online for us to revisit together.</p>
    <div class="chapter-tabs">
      ${chapters.map((x, i) => `
        <button type="button" class="chapter-tab ${i === questionChapter ? 'active' : ''}" data-chapter="${i}">
          ${String(i + 1).padStart(2, '0')}
        </button>
      `).join('')}
    </div>
    <div class="question-panel">
      <div class="question-panel-top">
        <span>CHAPTER ${String(questionChapter + 1).padStart(2, '0')} / 10</span>
        <span>${questionList.filter(q => q.chapter === questionChapter && answers[q.id]?.trim()).length} / 10 answered</span>
      </div>
      <h3>${c.title}</h3>
      <p class="soft-note">${c.sub}</p>
      ${c.questions.map((q, i) => {
        const id = questionChapter * 10 + i + 1;
        return `
          <div class="question-row">
            <span class="question-num">${String(id).padStart(2, '0')}</span>
            <div>
              <label for="q${id}">${q}</label>
              <textarea id="q${id}" data-qid="${id}" placeholder="Write whatever feels right…">${escapeHTML(answers[id] || '')}</textarea>
            </div>
          </div>
        `;
      }).join('')}
      <div class="question-actions">
        <button class="small-button" id="prevChapter" type="button" ${questionChapter === 0 ? 'disabled' : ''}>← Previous</button>
        <span class="soft-note">${questionList.filter(q => answers[q.id]?.trim()).length} / 100 answered</span>
        <button class="small-button" id="nextChapter" type="button">${questionChapter === 9 ? 'Review answers' : 'Next chapter →'}</button>
      </div>
    </div>
    <p class="soft-note" style="margin-top:14px">You can leave any answer blank. There is no wrong answer, and you can come back to this chapter later. ♡</p>
  `;
}

function feelingsHTML() {
  return `
    <p class="page-script">Your side matters to me.</p>
    <p class="page-paragraph">If you're comfortable, I'd really like to understand how you're feeling about us right now. These four questions are required before sending so I can make sure I hear all four parts of your answer—but you can write “I don't know yet” if that's the honest answer. Please be open, not perfect.</p>
    <form class="response-form" id="feelingsForm">
      <div class="response-field">
        <label for="feelingNow">1. How are you feeling about us right now? <span class="required-mark">*</span></label>
        <textarea id="feelingNow" required placeholder="Tell me honestly, even if your feelings are mixed…">${escapeHTML(feelings.feelingNow || '')}</textarea>
      </div>
      <div class="response-field">
        <label for="stillHurts">2. Is there anything that still hurts or feels unresolved? <span class="required-mark">*</span></label>
        <textarea id="stillHurts" required placeholder="What do you wish I understood?…">${escapeHTML(feelings.stillHurts || '')}</textarea>
      </div>
      <div class="response-field">
        <label for="understand">3. What do you wish your girlfriend understood better about you? <span class="required-mark">*</span></label>
        <textarea id="understand" required placeholder="Something you need me to hear…">${escapeHTML(feelings.understand || '')}</textarea>
      </div>
      <div class="response-field">
        <label for="anythingElse">4. Is there anything else you want to tell me? <span class="required-mark">*</span></label>
        <textarea id="anythingElse" required placeholder="Anything at all, in your own words…">${escapeHTML(feelings.anythingElse || '')}</textarea>
      </div>
      <label class="consent-line">
        <input id="shareConsent" type="checkbox" ${feelings.shareConsent ? 'checked' : ''} required>
        <span>I understand that when I submit this, my answers will be saved and can be read by Nicole. I am choosing to share them with her. <strong>*</strong></span>
      </label>
      <div class="form-status" id="formStatus"></div>
      <button class="primary-button" type="submit">Send my answers with honesty ♡ &nbsp; ↗</button>
      <p class="soft-note">Your answers are not public. Once the private Firebase setup is complete, only the authorized account can read submitted responses. Until then, this preview saves to this browser only.</p>
    </form>
  `;
}

function endingHTML() {
  return `
    <div class="ending-card">
      <p class="handwritten">To us, and the growing we still have to do.</p>
      <div class="decorative-rule">♡</div>
      <p class="page-paragraph">I hope this little book reminds us that love isn't only about the happy days or the big promises. It's also the small choices: being honest, making time, listening carefully, apologizing sincerely, and giving each other room to be human.</p>
      <p class="page-paragraph">We don't have to figure out every chapter tonight. We just have to be willing to keep talking, keep learning, and keep treating each other with care.</p>
      <p class="page-paragraph">Whenever you're ready, I want to hear your answers—not to judge them, but to understand you better. Thank you for letting me try again with you.</p>
      <p class="handwritten">One page at a time, my love. ♡</p>
    </div>
    <button class="primary-button" id="restartBook" type="button">Read from the beginning ↶</button>
    <p class="soft-note" style="margin-top:16px">Made with love, a little hope, and a lot of intention.</p>
  `;
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function wirePageControls() {
  document.querySelectorAll('[data-chapter]').forEach(b => {
    b.addEventListener('click', () => {
      saveQuestionInputs();
      questionChapter = Number(b.dataset.chapter);
      renderPage();
    });
  });

  document.querySelectorAll('[data-qid]').forEach(el => {
    el.addEventListener('input', () => {
      answers[el.dataset.qid] = el.value;
      saveDraft();
      updateQuestionCount();
    });
  });

  const pc = $('prevChapter');
  const nc = $('nextChapter');

  if (pc) {
    pc.addEventListener('click', () => {
      saveQuestionInputs();
      questionChapter = Math.max(0, questionChapter - 1);
      renderPage();
    });
  }

  if (nc) {
    nc.addEventListener('click', () => {
      saveQuestionInputs();

      if (questionChapter < 9) {
        questionChapter++;
        renderPage();
      } else {
        showToast('You made it through all ten chapters. Proud of you both. ♡');
      }
    });
  }

  const sf = $('feelingsForm');

  if (sf) {
    ['feelingNow', 'stillHurts', 'understand', 'anythingElse', 'shareConsent'].forEach(id => {
      $(id).addEventListener('input', () => {
        feelings[id] = id === 'shareConsent' ? $(id).checked : $(id).value;
        saveDraft();
      });
    });

    sf.addEventListener('submit', submitFeelings);
  }

  const rb = $('restartBook');

  if (rb) {
    rb.addEventListener('click', () => {
      pageIndex = 0;
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function saveQuestionInputs() {
  document.querySelectorAll('[data-qid]').forEach(el => {
    answers[el.dataset.qid] = el.value;
  });

  saveDraft();
}

function updateQuestionCount() {
  const n = questionList.filter(q => answers[q.id]?.trim()).length;
  const top = document.querySelector('.question-panel-top span:last-child');

  if (top) {
    top.textContent = questionList.filter(
      q => q.chapter === questionChapter && answers[q.id]?.trim()
    ).length + ' / 10 answered';
  }

  const bot = document.querySelector('.question-actions .soft-note');

  if (bot) {
    bot.textContent = n + ' / 100 answered';
  }
}

function saveDraft() {
  try {
    localStorage.setItem('littleSpaceDraft', JSON.stringify({
      answers,
      feelings,
      questionChapter
    }));
  } catch (e) {
    console.warn('Could not save local draft.', e);
  }
}

function loadDraft() {
  try {
    const d = JSON.parse(localStorage.getItem('littleSpaceDraft') || '{}');

    answers = d.answers || {};
    feelings = d.feelings || {};
    questionChapter = Number.isInteger(d.questionChapter)
      ? Math.max(0, Math.min(9, d.questionChapter))
      : 0;
  } catch (e) {
    console.warn('Could not load local draft.', e);
  }
}

async function submitFeelings(e) {
  e.preventDefault();

  feelings = {
    feelingNow: $('feelingNow').value.trim(),
    stillHurts: $('stillHurts').value.trim(),
    understand: $('understand').value.trim(),
    anythingElse: $('anythingElse').value.trim(),
    shareConsent: $('shareConsent').checked
  };

  saveQuestionInputs();

  const status = $('formStatus');
  status.textContent = '';

  if (!feelings.shareConsent) {
    status.textContent = 'Please confirm that you understand who can read these answers.';
    return;
  }

  const payload = {
    feelings,
    answers,
    submittedAt: new Date().toISOString(),
    status: 'submitted'
  };

  if (remoteReady && auth && db) {
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      currentUser = auth.currentUser;

      await setDoc(
        doc(db, 'responses', currentUser.uid),
        {
          ...payload,
          submittedAt: serverTimestamp(),
          uid: currentUser.uid
        },
        { merge: true }
      );

      status.textContent = 'Your answers were saved privately. Thank you for trusting me with them. ♡';
      showToast('Your answers were sent. Thank you for being honest. ♡');
      return;
    } catch (err) {
      console.error('Could not save responses to Firebase:', err);
      status.textContent = 'Online save did not work yet. Your draft is still on this device. Check Firebase setup.';
      showToast('Saved as a local draft; online save needs setup.');
      return;
    }
  }

  try {
    localStorage.setItem('littleSpaceSubmitted', JSON.stringify(payload));
    status.textContent = 'Saved in this browser preview. Online/private sharing is not connected yet.';
    showToast('Saved on this device for preview. ♡');
  } catch (err) {
    console.error('Could not save the local submission:', err);
    status.textContent = 'Could not save in this browser. Please copy your answers before leaving.';
  }
}

function buildContents() {
  const list = $('contentsList');

  list.innerHTML = pageMeta.map((p, i) => `
    <button type="button" class="contents-item" data-page="${i}">
      <span class="contents-num">${String(i + 1).padStart(2, '0')}</span>
      <span>
        <strong>${p.title}</strong>
        <small>${p.sub}</small>
      </span>
    </button>
  `).join('');

  list.querySelectorAll('[data-page]').forEach(b => {
    b.addEventListener('click', () => {
      pageIndex = Number(b.dataset.page);

      if (!reader.classList.contains('active')) {
        enterBook();
      } else {
        renderPage();
      }

      closeDrawer();
    });
  });
}

function openDrawer() {
  $('contentsDrawer').classList.add('open');
  $('drawerBackdrop').classList.add('open');
  $('contentsDrawer').setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  $('contentsDrawer').classList.remove('open');
  $('drawerBackdrop').classList.remove('open');
  $('contentsDrawer').setAttribute('aria-hidden', 'true');
}

$('openBook').addEventListener('click', enterBook);
$('nextPage').addEventListener('click', () => turnPage(1));
$('prevPage').addEventListener('click', () => turnPage(-1));

$('nextText').addEventListener('click', () => {
  if (pageIndex === pageMeta.length - 1) {
    goCover();
  } else {
    turnPage(1);
  }
});

$('prevText').addEventListener('click', () => turnPage(-1));
$('openContents').addEventListener('click', openDrawer);
$('closeContents').addEventListener('click', closeDrawer);
$('drawerBackdrop').addEventListener('click', closeDrawer);

$('bookStage').addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

$('bookStage').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].screenX - touchStartX;

  if (Math.abs(dx) > 55) {
    turnPage(dx < 0 ? 1 : -1);
  }
}, { passive: true });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrawer();

  if (
    reader.classList.contains('active') &&
    e.key === 'ArrowRight' &&
    e.target.tagName !== 'TEXTAREA'
  ) {
    turnPage(1);
  }

  if (
    reader.classList.contains('active') &&
    e.key === 'ArrowLeft' &&
    e.target.tagName !== 'TEXTAREA'
  ) {
    turnPage(-1);
  }
});

// Private response viewer: visit #answers.
// Requires Firebase configuration and the authorized Google account.
async function openAnswerViewer() {
  if (!remoteReady || !auth || !db) {
    showToast('Private answer viewer needs Firebase setup first. Check your Firebase configuration.');
    return;
  }

  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      currentUser = result.user;
    } catch (e) {
      console.error('Google sign-in failed:', e);
      showToast('Google sign-in failed. Check the browser console for the exact error.');
      return;
    }
  }

  if (auth.currentUser?.email !== ADMIN_EMAIL) {
    showToast('This Google account is not the authorized reader. Use the account set in ADMIN_EMAIL.');
    return;
  }

  try {
    const snap = await getDocs(collection(db, 'responses'));

    let html = `
      <p class="page-script">Your answers, saved with care.</p>
      <p class="page-paragraph">
        Private reader view · ${snap.size} response record(s).
        Keep this page private.
      </p>
    `;

    snap.forEach(s => {
      const d = s.data();

      html += `
        <div class="question-panel" style="margin:12px 0">
          <h3>Heart & feelings</h3>

          ${Object.entries(d.feelings || {})
            .filter(([k]) => k !== 'shareConsent')
            .map(([k, v]) => `
              <p class="page-paragraph">
                <strong>${escapeHTML(k)}</strong><br>
                ${escapeHTML(v || '—')}
              </p>
            `).join('')}

          <div class="decorative-rule">100 questions</div>

          ${questionList
            .filter(q => d.answers?.[q.id]?.trim())
            .map(q => `
              <p class="page-paragraph">
                <strong>${q.id}. ${escapeHTML(q.question)}</strong><br>
                ${escapeHTML(d.answers[q.id])}
              </p>
            `).join('')}
        </div>
      `;
    });

    if (snap.empty) {
      html += '<p class="page-paragraph">No submitted responses were found in the database yet.</p>';
    }

    content.innerHTML = html;
    $('chapterEyebrow').textContent = 'PRIVATE READER';
    $('pageHeading').textContent = 'His answers';
    $('pageSubtext').textContent = 'handle his words with care';
    $('pageNumber').textContent = '♡';
    $('footerPage').textContent = 'PRIVATE ♡';
    $('readingProgress').style.width = '100%';

  } catch (e) {
    console.error('Could not load responses:', e);
    showToast('Could not load responses. Check Firestore rules and the browser console.');
  }
}

loadDraft();
buildContents();

(async () => {
  await initializeFirebaseIfConfigured();

  if (location.hash === '#answers') {
    enterBook();
    await openAnswerViewer();
  }
})();

window.addEventListener('hashchange', async () => {
  if (location.hash === '#answers') {
    await initializeFirebaseIfConfigured();
    enterBook();
    await openAnswerViewer();
  }
});