// utils/password.ts
export function generateStrongPassword(length = 14): string {
    // Conformité backend: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{10,}$
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const special = "@$!%*?&";
    const all = lower + upper + digits + special;

    // Au moins 1 de chaque
    const req = [
        pick(lower), pick(upper), pick(digits), pick(special)
    ];

    // Reste aléatoire
    const remaining = Math.max(length - req.length, 0);
    for (let i = 0; i < remaining; i++) req.push(pick(all));

    // Mélange robuste
    return shuffle(req).join("");
}

export function isBackendValid(pwd: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{10,}$/.test(pwd);
}

export function scorePassword(pwd: string): { score: 0|1|2|3; label: string } {
    // Simple scoring UX (ne remplace pas la validation serveur)
    let score = 0 as 0|1|2|3;
    const rules = [
        /.{10,}/,          // longueur min
        /[a-z]/,           // minuscule
        /[A-Z]/,           // majuscule
        /\d/,              // chiffre
        /[@$!%*?&]/        // spécial autorisé
    ];
    let hits = rules.reduce((acc, r) => acc + (r.test(pwd) ? 1 : 0), 0);

    if (pwd.length >= 14) hits++;           // bonus longueur
    if (/(?:.{3,}).*(?:.{3,})/.test(pwd)) hits++; // dispersion basique

    if (hits <= 2) score = 0;
    else if (hits <= 4) score = 1;
    else if (hits <= 6) score = 2;
    else score = 3;

    const label = ["Faible", "Moyen", "Fort", "Très fort"][score];
    return { score, label };
}

/* helpers */
function pick(chars: string): string {
    // crypto-safe si dispo
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        return chars[arr[0] % chars.length];
    }
    return chars[Math.floor(Math.random() * chars.length)];
}

function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = rand(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function rand(max: number): number {
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        return arr[0] % max;
    }
    return Math.floor(Math.random() * max);
}

