<h1 align="center">
  Knowda
  <br>
</h1>
<p align="center">Your reward based trivia platform built on Cardano.</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#testing-the-validator">Testing The Validator</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#video-demo">Video Demo</a> •
  <a href="#author">Author</a> •
  <a href="#acknowledgements">Acknowledgements</a>
</p>

## Features
- **Create Game:** Create your own quiz game with customised settings, set the Ada amount you wish to pay to the game winner(s)
- **Host Game:** Host your game for players to join in and participate in your quiz.
- **Join Game:** Join a quiz game as a player using your Cardano wallet address, claim the top spot in the game leaderboard and win Ada reward.

## Project Structure
Knowda/<br/>
│── frontend/  (Next.js Codebase)<br/>
│── smart-contract/ (Aiken Validator)<br/>
│── README.md (Project README)

## Quick Start

**1. Clone the repository:**
```bash
git clone https://github.com/0xGIDHUB/Knowda
```

**2. Navigate to the frontend directory:**
```bash
cd frontend
```

**3. Install dependencies:**
```bash
npm install
```

**4. Setup the environment variables:**
```
NEXT_PUBLIC_BLOCKFROST_PROVIDER=yourblockfrostproviderapi
NEXT_PUBLIC_SUPABASE_URL=knowdasupabaseurl
NEXT_PUBLIC_SUPABASE_ANON_KEY=knowdasupabasekey
NEXT_PUBLIC_MESH_WALLET_PRIVATE_KEY=knowdameshwalletprivatekey
```
**4. Startup the project:**
```bash
npm run dev
```

## Testing The Validator
To test the aiken validator, navigate to the smart contract directory:
```bash
cd smart-contract
```
Ensure you have [Aiken](https://aiken-lang.org/installation-instructions) installed on your machine, then run the command:
```bash
aiken check
```
You should see an output like this:
```bash
Compiling gideon/knowda 0.0.0 (.)
    Compiling aiken-lang/stdlib v2.2.0 (./build/packages/aiken-lang-stdlib)
    Compiling sidan-lab/vodka 0.1.10 (./build/packages/sidan-lab-vodka)
   Collecting all tests scenarios across all modules
      Testing ...

    ┍━ knowda ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    │ PASS [mem: 91780, cpu: 31639254] pay_first_winner_passes
    │ PASS [mem: 63819, cpu: 20742467] pay_first_winner_fails_with_invalid_redeemer
    │ PASS [mem: 40969, cpu: 13459414] pay_first_fails_with_no_tx_input
    │ PASS [mem: 99339, cpu: 31851715] pay_first_winner_fails_with_multiple_input
    │ PASS [mem: 92481, cpu: 31827303] pay_first_winner_fails_with_invalid_ada_amount
    │ PASS [mem: 83302, cpu: 27513902] pay_first_winner_fails_with_invalid_tx_signer
    ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 6 tests | 6 passed | 0 failed


      Summary 6 checks, 0 errors, 0 warnings
```

> [!NOTE]
> To learn more about about the smart contract, check out the validator script which contains a lot of helpful comments [here](https://github.com/0xGIDHUB/Knowda/blob/main/smart-contract/validators/knowda.ak).<br/>
> Also, check out the mesh.js integration of the validator [here](https://github.com/0xGIDHUB/Knowda/tree/main/frontend/src/offchain).


## Documentation
Learn more about Knowda by checking out the documentation:
+ [Notion](https://hill-desert-843.notion.site/Knowda-27a87d3170f780688143cc3fc46ce0fc?source=copy_link)
+ [Word](https://1drv.ms/w/c/d1bc433b580bd566/ER4tNzo-F_NNnKj_QnNYCjcBZk6nNbSZuzYeAd6s7Ncgxg)

## Video Demo
Check out the video demo of the knowda app [here](https://drive.google.com/drive/folders/1JU7AbQ_kk4iTo2tsMqDU50fat2WWsB4T)

## Author
+ Gideon - [@0xGIDHUB](https://github.com/0xGIDHUB)

## Acknowledgements
+ Gimbalabs - [Sign up](https://www.gimbalabs.com/)