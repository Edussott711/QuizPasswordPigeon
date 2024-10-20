let gameState = {
    username: '',
    password: '',
    goodreasons: '',
    badreasons: '',
    score: 0,
    attempt: 0,
};

window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    const confirmationMessage = 'Êtes-vous sûr de vouloir partir ? Vos progrès pourraient être perdus.';
    return confirmationMessage;
});

// Phase 1: Splash Page with Leaderboard
function showSplashPage() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-full bg-white bg-opacity-80 rounded-lg shadow-lg p-8">
            <div class="w-full max-w-md mb-6">
                <h2 class="text-4xl font-bold mb-4 text-center" style="color: rgb(22, 10, 58);">Classement</h2>
                <ul class="space-y-2 max-h-64 overflow-y-auto" id="leaderboard">
                    <!-- Placeholder for leaderboard content -->
                </ul>
            </div>
        </div>
    `;
    fetchLeaderboard();
}

function fetchLeaderboard() {
    // Fetch leaderboard from /api/board
    fetch('/api/board')
        .then(response => response.json())
        .then(data => {
            let leaderboardHtml = '';
            data.forEach(entry => {
                leaderboardHtml += `<li>${entry.user}: ${entry.score}</li>`;
            });

            if (leaderboardHtml == '') {
                leaderboardHtml += `<li class="text-center">Aucun participant pour le moment.</li>`;
                leaderboardHtml += `<li class="text-center">Soyez le premier à jouer !</li>`;
            }

            document.getElementById('leaderboard').innerHTML = leaderboardHtml;
        });
}

function startGame() {
    showPasswordResetPage();
}

// Phase 2: Fake Password Reset
function showPasswordResetPage() {
    document.getElementById('game-container').innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h2 class="text-2xl font-semibold mb-4">Réinitialiser votre mot de passe</h2>
            <p class="mb-4 text-center">Imaginez que vous devez réinitialiser un nouveau mot de passe pour votre compte fictif professionnel. Choisissez un mot de passe que vous considérez sécurisé.</p>
            <input type="password" id="password" placeholder="Entrez votre nouveau mot de passe" class="border rounded-lg p-2 mb-4 w-64" />
            <button class="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition" onclick="submitPassword()">
                Valider mon mot de passe
            </button>
        </div>
    `;
}

function submitPassword() {
    const password = document.getElementById('password').value;
    gameState.password = password;

    if (confirm('Êtes-vous certain que vous allez vous en rappeler, cela semble assez complexe?')) {
        showTextBoxPage();
    }

}

// Phase 3: Text Box with Paragraph
function showTextBoxPage() {
    document.getElementById('game-container').innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h2 class="text-2xl font-semibold mb-4">Fait amusant!</h2>
            <p class="text-center mb-4 max-w-lg mx-auto">
                Saviez-vous qu'en 2023, plus de 1 000 000 de données ont été exposées lors de violations de sécurité, 
                ce qui représente une augmentation de 50 % par rapport à l'année précédente ? 
                Protégez votre mot de passe pour éviter d'être le prochain !
            </p>
            <!-- https://www.getastra.com/blog/security-audit/data-breach-statistics/ -->
            <img src="/resources/funfact.png" alt="2 millions de personnes affecte en 2022" class="mx-auto mb-4 w-64 h-auto">

            <button class="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition" onclick="showLoginPage()">
                Suivant
            </button>
        </div>
    `;
}

// Phase 4: Fake Login Page
function showLoginPage() {
    document.getElementById('game-container').innerHTML = `
    <h2 class="text-2xl font-semibold mb-4">Connexion à votre compte</h2>
    <p class="mb-4 text-center">Maintenant, essayez de vous connecter avec le mot de passe que vous venez de créer et indiquez votre mail comme Nom d'utilisateur pour le classement.</p>
    <input type="text" id="username" placeholder="Nom d'utilisateur" class="border rounded-lg p-2 mb-2 w-64" />
    <input type="password" id="login-password" placeholder="Mot de passe" class="border rounded-lg p-2 mb-4 w-64" />
    <button class="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition" onclick="submitLogin()">
        Se connecter
    </button>
    `;
}

async function submitLogin() {
    const username = document.getElementById('username').value;
    const loginPassword = document.getElementById('login-password').value;

    if (gameState.attempt >= 1 && loginPassword !== gameState.password) {
        gameState.username = username;
        const result = await scorePassword(loginPassword, false);
        gameState.score = result.score;
        gameState.goodreasons = result.goodreasons;
        gameState.badreasons = result.badreasons;
        alert("L'authentification a échoué, vous avez utilisé les deux tentatives !");
        showScorePage();
        return;
    }

    if (loginPassword === gameState.password) {
        gameState.username = username;
        const result = await scorePassword(loginPassword, true);
        gameState.score = result.score;
        gameState.goodreasons = result.goodreasons;
        gameState.badreasons = result.badreasons;
        showScorePage();
    } else {
        gameState.attempt++;
        alert('Mot de passe incorrect. Réessayez !');
    }
}

async function scorePassword(password, rememberedPassword) {
    let score = 0;
    const goodreasons = [];  // Array to hold reasons for the score
    const badreasons = [];  // Array to hold reasons for the score

    // Length check (the longer the better)
    if (password.length >= 12) {
        score += 20 * password.length;  // Multiply by length to differentiate more
        goodreasons.push('La longueur du mot de passe est suffisante (≥ 12 caractères).');
    } else {
        badreasons.push('La longueur du mot de passe est insuffisante (< 12 caractères).');
    }

    if (password.length >= 16) {
        score += 30;  // Bonus for extra length
        goodreasons.push('Bonus pour la longueur supplémentaire (≥ 16 caractères).');
    }

    // Check for uppercase, lowercase, numbers, and special characters
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>-_ ]/.test(password);

    if (hasUpperCase) {
        score += 15 * (Math.random() + 1);
        goodreasons.push('Contient des lettres majuscules.');
    } else {
        badreasons.push('Absence de lettres majuscules.');
    }

    if (hasLowerCase) {
        score += 15 * (Math.random() + 1);
        goodreasons.push('Contient des lettres minuscules.');
    } else {
        badreasons.push('Absence de lettres minuscules.');
    }

    if (hasNumbers) {
        score += 15 * (Math.random() + 1);
        goodreasons.push('Contient des chiffres.');
    } else {
        badreasons.push('Absence de chiffres.');
    }

    if (hasSpecialChars) {
        score += 15 * (Math.random() + 1);
        goodreasons.push('Contient des caractères spéciaux.');
    } else {
        badreasons.push('Absence de caractères spéciaux.');
    }

    // Penalize for common patterns or repetition
    const patterns = /(.)\1\1/;  // Same character repeated 3+ times
    if (!patterns.test(password)) {
        score += 10;  // No repeating characters
        goodreasons.push('Pas de caractères répétés.');
    } else {
        score -= 10;  // Penalize if patterns exist
        badreasons.push('Contient des caractères répétés.');
    }

    // Check entropy (variation in character types)
    const uniqueChars = new Set(password).size;

    // Check the number of unique characters and adjust the score and reasons accordingly
    if (uniqueChars >= 10) {
        score += 15 * uniqueChars; // Higher unique characters = higher score
        goodreasons.push(`Caractères uniques: ${uniqueChars}. Grande variété !`);
    } else {
        score += 5 * uniqueChars; // Lower score for fewer unique characters
        badreasons.push(`Caractères uniques: ${uniqueChars}. Essayez d'utiliser plus de caractères différents.`);
    }

    // Check if the password has been breached
    const breachPenalty = await checkBreach(password);
    if (breachPenalty) {
        score = Math.min(score, 50); // Deduct a significant penalty for breached passwords
        badreasons.push('Le mot de passe a été compromis et n\'est pas sûr.');
    }
    else {
        goodreasons.push('Le mot de passe n\'a pas été compromis et est sûr.');
    }

    // Emphasize memory factor
    if (rememberedPassword) {
        score += 10;
        goodreasons.push('L\'utilisateur se souvient du mot de passe.');
    } else {
        score = Math.min(score, 100);  // Large penalty if they won't remember
        badreasons.push('L\'utilisateur ne se souvient pas du mot de passe, ce qui entraîne une pénalité.');
    }

    // Round score
    score = Math.ceil(score)

    // Return a JSON object with score and reasons
    return {
        score: score,
        goodreasons: goodreasons,
        badreasons: badreasons
    };
}

async function checkBreach(password) {


    // Hash the password using SHA-1
    const hash = CryptoJS.SHA1(password).toString();

    // Extract prefix and postfix
    const prefix = hash.substring(0, 5);
    const postfix = hash.substring(5);

    // Send the prefix to a URL with a CORS proxy
    const url = '/api/breach/' + prefix; // Replace with your URL
    let response;

    try {
        response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Network response was not ok.');

        const responseText = await response.text();

        // Check if the postfix exists in the response list
        const list = responseText
            .trim() // Remove any leading or trailing whitespace
            .split('\r\n') // Split the string into lines
            .map(line => line.split(':')[0]); // Extract the first part of each line

        const postfixExists = list.includes(postfix.toUpperCase());


        return postfixExists;

    } catch (error) {
        console.error('Error:', error);
    }
}

// Phase 5: Score Page
function showScorePage() {
    const breachedPasswordMessage = 'Le mot de passe a été compromis et n\'est pas sûr.';
    document.getElementById('game-container').innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">

        <h1 class="text-4xl font-bold mb-4">Résultat de votre défi</h1>
        <h2 class="text-3xl font-semibold mb-4">Votre score : ${gameState.score}</h2>
        <h3 class="text-xl font-semibold mb-2">Analyse de votre mot de passe :</h3>
         <ul class="list-disc list-inside mb-4">
                ${gameState.badreasons.map(badReason => 
                    badReason === breachedPasswordMessage
                        ? `<li class="text-red-600 text-xl text-base/loose font-bold">${badReason}</li>`
                        : `<li class="text-red-600 text-xl text-base/loose">${badReason}</li>`
                ).join('')}
                ${gameState.goodreasons.map(goodReason => 
                    `<li class="text-green-600 text-xl text-base/loose">${goodReason}</li>`
                ).join('')}
            </ul>
            <button onclick="finishGame()" class="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition">
                Terminer le défi
            </button>
        </div>
    `;

    // Send score to API
    fetch('/api/board/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user: gameState.username,
            score: gameState.score,
        }),
    });
}

function finishGame() {
    gameState = { username: '', password: '', badreasons: '', goodreasons: '', score: 0, attempt: 0 };
    showSplashPage();
}

// Initialize the game
showSplashPage();
