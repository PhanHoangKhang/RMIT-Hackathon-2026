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

## Tech stack

- **Frontend and app:** Next.js, React, TypeScript, Tailwind CSS
- **Authentication:** TideCloak
- **Database:** PostgreSQL with Prisma ORM
- **Infrastructure:** Docker and Docker Compose

---

## Prerequisites

Install the following before starting:

- **Node.js 20 or newer**
- **npm**
- **Docker Desktop**, running
- **Git**
- **Bash, curl and jq**
- A modern browser that **allows pop-ups** for `localhost:3000`

> **Windows users:** use **Git Bash** to run `npm run init`.
>
> Install `jq` with:
> ```bash
> winget install jqlang.jq
> ```

Restart your terminal after installing `jq`, then check that everything is installed:

```bash
node --version
npm --version
docker --version
docker compose version
curl --version
jq --version
```

Each command should print a version number. If one fails, install that tool before continuing.

> **Keep the TideCloak secure web enclave window open while using the app.** You may minimise it, but do not close it during the demo.

---

## 1. Clone the repository

```bash
git clone https://github.com/PhanHoangKhang/RMIT-Hackathon-2026.git
cd RMIT-Hackathon-2026
npm install
```

---

## 2. Configure environment variables

### 2.1 Create your `.env` file

```bash
cp .env.example .env
```

On Windows, run this command in Git Bash. Then open `.env` and fill in the values the project needs.

### 2.2 Example `.env`

Use this as a template. **If the variable names in `.env.example` or `docker-compose.yml` are different, keep their names.**

```dotenv
# PostgreSQL
POSTGRES_DB=blindreview
POSTGRES_USER=blindreview
POSTGRES_PASSWORD=change_this_to_a_strong_local_password

# Application database connection
DATABASE_URL=postgresql://blindreview:change_this_to_a_strong_local_password@localhost:5432/blindreview

# TideCloak initialization
KC_BOOTSTRAP_ADMIN_PASSWORD=change_this_to_a_strong_admin_password
TIDE_LICENSE_EMAIL=your-real-email@example.com
TIDE_TERMS_ACCEPTED=no
```

### 2.3 What each variable does

| Variable | Purpose |
|---|---|
| `POSTGRES_DB` | Database name used by the PostgreSQL container, if Compose references it |
| `POSTGRES_USER` | PostgreSQL user created for the application |
| `POSTGRES_PASSWORD` | Password for that PostgreSQL user |
| `DATABASE_URL` | Connection string Prisma uses to reach the database |
| `KC_BOOTSTRAP_ADMIN_PASSWORD` | Password for the local TideCloak bootstrap administrator |
| `TIDE_LICENSE_EMAIL` | An email address you control, used for TideCloak setup |
| `TIDE_TERMS_ACCEPTED` | Set to `yes` **only after** reading and accepting the applicable terms |

### 2.4 Make the passwords match

> **Important:** `POSTGRES_PASSWORD` and the password inside `DATABASE_URL` **must be the same.**

- If your existing Compose file uses a variable called `DB_PASSWORD` instead, keep that name, or update the Compose configuration to match.
- Don't define several password variables unless the configuration actually uses them.

How to read the `DATABASE_URL` above:

```
postgresql://blindreview:<password>@localhost:5432/blindreview
             username    password   host      port database
```

| Part | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `blindreview` |
| Username | `blindreview` |
| Password | the same value as `POSTGRES_PASSWORD` |

If your PostgreSQL service uses a different port, change the port in `DATABASE_URL` too.

### 2.5 Tide terms and safety

- Read Tide's terms at [https://tide.org/legal](https://tide.org/legal) **before** setting `TIDE_TERMS_ACCEPTED=yes`.
- **Never commit `.env` to Git.**
- Use strong local passwords, and never reuse production credentials.

---

## 3. Start PostgreSQL with Docker Compose

Start **Docker Desktop** before running these commands. Run them from the repository root.

### 3.1 Check the Compose configuration

```bash
docker compose config
```

This checks the Compose file and fills in the values from your environment. If a required variable is missing, Docker may show a warning or an error. Fix it in `.env` before continuing.

### 3.2 Start PostgreSQL

If the PostgreSQL service in `docker-compose.yml` is named `postgres`, run:

```bash
docker compose up -d postgres
```

If the service has a different name, replace `postgres` with that name.

If the Compose file is meant to start PostgreSQL **and** other required services together, you can run this instead:

```bash
docker compose --env-file .env up -d
```

Check that the container is running:

```bash
docker compose ps
```

Watch the PostgreSQL logs:

```bash
docker compose logs -f postgres
```

**Wait until PostgreSQL is ready to accept connections before you continue.**

### 3.3 Verify the database connection

If the PostgreSQL container includes `pg_isready`, check that it is ready:

```bash
docker compose exec postgres pg_isready
```

If your service has a different name, use that name instead of `postgres`.

### 3.4 Run Prisma setup

Once PostgreSQL is ready, generate the Prisma client:

```bash
npx prisma generate
```

Then apply the database migrations. **Pick one of the two commands below, not both.**

| Situation | Command |
|---|---|
| You are developing and may create new migrations | `npx prisma migrate dev` |
| The migrations are already committed, and you only want to apply them without creating new ones | `npx prisma migrate deploy` |

Follow the migration workflow the project already uses, and choose the command that suits your environment and the existing migration files.

**Optional:** to browse the local records, open Prisma Studio:

```bash
npx prisma studio
```

Keep that terminal running while you use Studio.

---

## 4. Initialize TideCloak

BlindReview uses TideCloak for authentication (who you are) and authorization (what you are allowed to do).

### 4.1 Run the initialization script

Make sure **Docker Desktop is running** and **`.env` is filled in**. Then run (in Git Bash on Windows):

```bash
npm run init
```

Following the project's initialization workflow, this script:

1. Starts TideCloak in Docker and makes it available at `http://localhost:8080`.
2. Creates the `blind-review` realm.
3. Sets up the application roles:
   - `applicant`
   - `reviewer`
   - `admin`
   - `panel-member`
   - `selection-panel`
4. Creates the demo users `panel1`, `panel2`, `panel3` and `ops-admin`.
5. Writes their invitation links to `data/invite-links.txt`.
6. Requests the realm-admin role grants the panel members need.
7. Generates `data/tidecloak.json`, the connection settings the application uses.

> **You normally don't need to start a separate TideCloak container yourself, because `npm run init` already starts one.** If the script fails before TideCloak starts, look at the script and your Docker setup before starting a second instance.

### 4.2 Register the demo users

The script saves the invitation links in:

```text
data/invite-links.txt
```

Open each link in **its own private browser window**, then for each user:

1. Open the invitation link.
2. Select **Create an account**.
3. Choose a Tide username and password.
4. Finish the registration.
5. Keep the credentials somewhere safe for the demo.

> The real passwords are the ones you choose during registration. **Don't assume the username is also the password.**

### 4.3 Approve pending role grants

If some role grants are still pending after initialization:

1. Open [http://localhost:8080/admin/blind-review/console/](http://localhost:8080/admin/blind-review/console/).
2. Sign in with an authorized panel account.
3. Open **Change Requests**.
4. Approve the pending requests, as the project workflow requires.

The panel is designed to need **2 of 3 panel members** to approve. Check the resulting grants in the TideCloak console before relying on them in the demo.

---

## 5. Understand `data/tidecloak.json`

### What it is

`data/tidecloak.json` is created by `npm run init`. It holds the TideCloak connection details for the realm created during initialization, so the application connects to the right TideCloak instance and realm.

Expected location:

```text
data/tidecloak.json
```

### How to get it

**Don't download a random configuration file or copy one from another realm.** Instead:

1. Fill in the required environment variables.
2. Run `npm run init`.
3. Wait for initialization to finish.
4. Confirm that `data/tidecloak.json` exists.
5. Check the application configuration to confirm it reads the file from that location.

Check that the file exists (Git Bash):

```bash
test -f data/tidecloak.json \
  && echo "TideCloak configuration found" \
  || echo "TideCloak configuration is missing"
```

If the file is missing, look at the initialization script and its output. The script may have stopped before it finished creating the realm or writing the file.

### Important security notes

- Don't commit `data/tidecloak.json` if it is generated per local realm or contains sensitive settings.
- Don't share `data/invite-links.txt` publicly.
- Don't publish administrator credentials or private keys.
- Check that `.gitignore` covers the generated local configuration and invitation files.

---

## 6. Run the application

Once **PostgreSQL** and **TideCloak** are both ready, start the Next.js development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> **The app must run on port 3000**, because the TideCloak client only accepts sign-ins from that address. Don't change the port unless you also update the TideCloak client configuration.

### Sign-in steps

1. Open the application.
2. Click the sign-in button.
3. Allow the browser to open the Tide secure web enclave.
4. Complete authentication.
5. Keep the enclave window open while you use the app.
6. Return to the app and try the portfolio and review workflows.

---

### 7. One-time setup in the app

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