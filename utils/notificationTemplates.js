export const NOTIFICATION_TEMPLATES = {
    NEW_APPLICATION: {
        title: "Nouvelle Candidature",
        message: "Nouveau profil disponible pour consultation."
    },
    INTERVIEW_ACCEPTED: (date, room) => ({
        title: "Entretien Validé !",
        message: `Entretien validé ! RDV au Campus de Balbala, Salle ${room}, le ${date.toLocaleString('fr-FR')}.`
    }),
    QUOTA_REACHED: {
        title: "Offre Clôturée",
        message: "Offre complète, votre jeton a été libéré pour une autre entreprise."
    },
    REMINDER_STUDENT: (date) => ({
        title: "Rappel Entretien",
        message: `N'oubliez pas votre entretien demain à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} au Campus de Balbala.`
    })
};
