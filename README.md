[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

# BlindReview

## Project overview

BlindReview is a scholarship review app where reviewers score the work first, and an applicant's name can only be revealed when 2 of 3 selection-panel members agree. No admin, server or single person can reveal it alone.

Built with [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked).

### 1. Vision & originality

Picture a scholarship round. Reviewers should judge each portfolio on its quality, not on who the applicant is, which university they come from or what their name sounds like. "Blind review" is the usual fix: hide the name on the screen.

The catch is that hiding a name on the screen hides nothing. The name still sits in the database. An admin can open it, a developer can query it, and a curious reviewer with extra access can look it up. Blind review today is a promise, not a guarantee.

BlindReview turns that promise into something the system enforces:

- The applicant's identity (name, email, university, photo) is **encrypted in their own browser** before it is sent. Our server only ever stores scrambled text.
- During the review stage, **nobody can decrypt it**: not reviewers, not the admin, not our server, not us.
- The identity can only be opened after scores are locked **and 2 of the 3 panel members approve the reveal**. Even then, only the panel can read it.

What makes it different: the rule "no one unblinds early" is not written in our code where an admin could change it. It is enforced by the Tide network, which simply refuses to decrypt until the right people have agreed.

### 2. Trust constraint insight

**What is hard today.** Any review process that wants to be fair has to trust someone with the identities: the platform, the IT team or the admin running the round. Applicants have to hope that person never peeks, never leaks, and never gets hacked. Organisers can't prove to anyone that the review really was blind.

**Why that blocks things.** Because one person always holds the keys:

- Applicants from less known schools or backgrounds have no real protection from bias.
- Organisations can't credibly say "our selection was blind", because their own admin could have looked.
- A single stolen admin account exposes every applicant at once.

**What changes when that constraint is removed.** With BlindReview there is no master key to steal or misuse. The stage change from "blind" to "reveal" is a decision made by a group, and the network only follows the group's decision. So a fair review can be proven, not just promised: if anyone tries to look early, the attempt fails, as the demo shows.

### 3. Value & impact

**Who benefits**

- **Applicants:** they are judged on their work. Their personal details stay sealed until the decision stage.
- **Reviewers:** they can focus on the work, and they are protected from accusations of bias.
- **Organisers** (universities, scholarship funds, hiring teams): they can show their process was really blind, and a single compromised admin can't leak the whole applicant list.

**A concrete example**

A student from a small regional college applies for a scholarship alongside students from big-name universities. In a normal system, a reviewer who glances at the university name might score her lower without realising it. In BlindReview, the reviewer only sees "Portfolio CA4F", her project description and her skills. Her name and college stay encrypted until all scores are locked and two panel members approve the reveal. By then her score is already final.

The same pattern works for job applications, research grant reviews, student assignment marking or design competitions: anywhere people should be judged on their work first.

### 4. Why TideCloak matters

TideCloak isn't just our login box. Its decentralised key network is what makes the core idea possible.

| What we need | How TideCloak provides it |
|---|---|
| Sign-in with no passwords stored by us | Users sign in with a Tide account. Every API call carries a token bound to the browser (DPoP), and the server checks the token, its signature and the user's role on every request. |
| Encrypt identity so our server can't read it | The applicant's browser encrypts the identity through the Tide network before sending it. The server stores ciphertext only. |
| "Anyone may encrypt, nobody may decrypt yet" | Two **policies** on Tide's built-in `RelationshipAttestation:1` contract. A *write* policy lets the `applicant` role encrypt (a drop box they can't read back). A *read* policy lets the `selection-panel` role decrypt, but only once that role holds the `_tide_decryptor` permission. |
| No single person can change the rules | Realm admin actions use TideCloak's **IGA quorum**. The three panel members are the only realm admins, with a threshold of **2 of 3**. Signing a policy or granting decryption needs two panel signatures, collected in each person's own secure Tide window. |
| Reveal only after group approval | The reveal is a change request that adds `_tide_decryptor` to `selection-panel`. It only takes effect after 2 of 3 panel members approve it. Before that, every decryption attempt is refused by the Tide network itself, not by our app. |

That last row is the key point. Even if someone edits our database to say "stage = reveal", decryption still fails, because the Tide network checks the user's real permissions, not our database. (The repo includes `npm run demo:flip-stage` to show exactly this.)

### 5. Prototype & storytelling

**What works today**

- Sign in with Tide for four demo accounts: three panel members and one operations account.
- Submit a portfolio: the work samples are readable, and the identity is encrypted in the browser.
- Score portfolios anonymously against 4 criteria (1–5 each) plus written feedback.
- "Reveal identity" button on every portfolio. Before the reveal it is **refused by the Tide network**, for any role.
- The admin can lock scores but **cannot advance** to the reveal stage alone.
- Panel members propose the reveal, approve it **2 of 3** in the Tide enclave, then refresh their token and read the identity.
- Policy setup itself needs 2 of 3 panel signatures.

**The moment judges should watch for (about 2 minutes)**

1. The admin opens a portfolio and clicks **Reveal identity** → *refused by the Tide network*.
2. The admin tries **Advance to reveal** → *refused*: one admin is not enough.
3. Panel member 3 proposes the reveal (1/2). Panel member 1 approves (2/2).
4. Panel member 3 refreshes their token and clicks **Reveal identity** → the name, email and university appear.

Same button, same data, different result. The only thing that changed is that two people agreed.

**Honest limits of the prototype**

- **Free-tier seats.** Tide's free tier allows 5 accounts, so the admin, reviewer and applicant roles share one account (`ops-admin`). In production each role is a separate person. The three panel members are separate accounts. The app shows a banner about this.
- **One check lives in our server.** "All scores must be locked before the reveal is proposed" is checked by our server, not by Tide. The 2-of-3 approval itself is enforced by Tide.
- **A reveal can't be undone.** Once a panel member has seen an identity, revoking access later can't make them forget it.
- **Decryption is per role, not per round.** Granting `_tide_decryptor` to `selection-panel` reveals every round with a signed read policy. A next step would be one role per review round.
- **Demo data only.** All portfolios and identities are synthetic.

## Setup

### What you need

- Node.js 20 or newer
- Docker Desktop (running)
- `bash`, `curl` and `jq`. On Windows, use Git Bash for `npm run init`, and install jq with `winget install jqlang.jq`.
- A browser that allows pop-ups for `localhost:3000`. Tide opens a small "Secure web enclave" window: keep it open (you can minimise it) while you use the app.

### 1. Install

```bash
git clone https://github.com/PhanHoangKhang/RMIT-Hackathon-2026.git
cd RMIT-Hackathon-2026
git checkout hackathon
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Fill in `.env`:

- `KC_BOOTSTRAP_ADMIN_PASSWORD`: any strong password for the local TideCloak admin.
- `TIDE_LICENSE_EMAIL`: a real email address you control.
- `TIDE_TERMS_ACCEPTED=yes`: only after you have read [Tide's terms](https://tide.org/legal).

`.env` is gitignored. Never commit it.

### 3. Start TideCloak and create the realm

```bash
npm run init
```

This script:

1. Starts TideCloak in Docker on `http://localhost:8080`.
2. Creates the `blind-review` realm with the app roles (`applicant`, `reviewer`, `admin`, `panel-member`, `selection-panel`).
3. Creates four demo users: `panel1`, `panel2`, `panel3` and `ops-admin`. It writes an invite link for each one to `data/invite-links.txt`.
4. **Waits for you to link each user.** Open each link in its own private window, click *Create an account*, and choose a Tide username and password. Write them down: you'll sign in with them during the demo.
5. Gives realm-admin rights to the three panel members (threshold 2 of 3) and writes `data/tidecloak.json`, the app's connection file. This file is gitignored because each realm generates its own.

If some role grants are still pending at the end, sign in as a panel member at `http://localhost:8080/admin/blind-review/console/`, open **Change Requests** and approve them.

### 4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`. The app must run on port 3000, because TideCloak only accepts sign-ins from that address.

### 5. One-time setup in the app

1. Sign in as **panel3**, open **Panel**, and click **Sign in enclave** for the *write* policy, then the *read* policy.
2. Sign in as **panel1** in another window, open **Panel** and approve both pending signings. Both rows should show **Signed ✓**.
3. Sign in as **ops-admin**, open **Apply**, click **Fill synthetic sample**, then **Encrypt & submit**. Do this twice.
4. Score both portfolios from **Review**, then click **Lock scores** on **Admin**.

You are now ready for the demo flow in section 5 above.

### Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the app on `http://localhost:3000` |
| `npm run build` | Production build (needs `data/tidecloak.json`) |
| `npm run init` | Start TideCloak and create the realm |
| `npm run demo:flip-stage` | Fakes the reveal stage by editing the database directly. "Reveal identity" still fails, which proves Tide enforces the rule, not our database. |
| `npm run demo:flip-stage -- --undo` | Puts the stage back to blind |

### Troubleshooting

- **A page stays on "Loading…"**: your session has expired. Click **Logout** and sign in again.
- **"Error opening enclave of type: Hidden. Trying popup."**: harmless. Tide falls back to a pop-up window. Allow pop-ups for `localhost:3000`, and allow third-party cookies for `[*.]tideprotocol.com` to avoid the warning.
- **"Not enough approvals … threshold of '2'"**: the action needs a second panel member. Sign in as another panel member and approve it.
- **Port 3000 is already in use**: stop the other `npm run dev` before starting this one.

### Project structure

```
src/app/            pages: home, apply, review, admin, panel, portfolios/[id]
src/app/api/        API routes; each checks the token, the DPoP proof and the role
src/lib/auth/       token and DPoP verification (from the TideCloak scaffold)
src/lib/tide/       policy signing, encryption and decryption helpers
src/lib/store.ts    simple JSON file store (data/db.json): ciphertext and scores only
scripts/            TideCloak bootstrap and demo helpers
```