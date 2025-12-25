
try {
    const dbService = await import("../services/dbService.js");
    console.log("dbService loaded successfully");
} catch (e) {
    console.error("Failed to load dbService:", e);
}
