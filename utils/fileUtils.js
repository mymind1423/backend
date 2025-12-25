import fs from 'fs/promises';
import path from 'path';

/**
 * Supprime un fichier du système de fichiers à partir de son URL
 * @param {string} fileUrl - URL du fichier (ex: "uploads/avatars/abc123.jpg")
 * @returns {Promise<boolean>} - true si supprimé, false sinon
 */
export async function deleteFileFromUrl(fileUrl) {
    if (!fileUrl) return false;

    try {
        // Extraire le chemin relatif depuis l'URL
        // Format attendu: "uploads/avatars/filename.jpg" ou "/uploads/avatars/filename.jpg"
        let relativePath = fileUrl;

        // Si c'est une URL complète (http://...), extraire juste le chemin
        if (fileUrl.startsWith('http')) {
            const url = new URL(fileUrl);
            relativePath = url.pathname.replace(/^\//, ''); // Enlever le / initial
        }

        // Construire le chemin absolu
        const uploadRoot = process.env.UPLOAD_ROOT || path.join(process.cwd(), 'uploads');
        const filePath = path.join(uploadRoot, relativePath.replace('uploads/', ''));

        // Vérifier que le fichier existe
        await fs.access(filePath);

        // Supprimer le fichier
        await fs.unlink(filePath);

        console.log(`🗑️  Fichier supprimé: ${filePath}`);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`⚠️  Fichier introuvable (déjà supprimé?): ${fileUrl}`);
        } else {
            console.error(`❌ Erreur lors de la suppression de ${fileUrl}:`, error.message);
        }
        return false;
    }
}

/**
 * Supprime l'ancien fichier avant de mettre à jour avec un nouveau
 * @param {string} oldUrl - Ancienne URL du fichier
 * @param {string} newUrl - Nouvelle URL (ou null si suppression)
 */
export async function replaceFile(oldUrl, newUrl) {
    // Si l'ancienne URL existe et est différente de la nouvelle
    if (oldUrl && oldUrl !== newUrl) {
        await deleteFileFromUrl(oldUrl);
    }
}
