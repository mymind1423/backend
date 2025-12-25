
const JOB_TEMPLATES = {
    "Informatique": [
        { title: "Développeur Fullstack React/Node", type: "Stage PFE", salary: "1500-2000 DH", description: "Participation au développement de nouvelles features..." },
        { title: "Développeur Front-end Junior", type: "Stage", salary: "1000-1500 DH", description: "Intégration de maquettes et optimisation des performances..." },
        { title: "DevOps Engineer", type: "Alternance", salary: "3000-4000 DH", description: "Automatisation des déploiements et gestion de l'infrastructure..." },
        { title: "Data Analyst", type: "Stage", salary: "1200-1800 DH", description: "Analyse de données et création de dashboards..." }
    ],
    "Marketing": [
        { title: "Assistant Marketing Digital", type: "Stage", salary: "1000-1500 DH", description: "Gestion des réseaux sociaux et création de contenu..." },
        { title: "Community Manager", type: "Stage", salary: "1000-1200 DH", description: "Animation de la communauté et modération..." },
        { title: "Growth Hacker", type: "Stage PFE", salary: "2000-3000 DH", description: "Mise en place de stratégies d'acquisition..." }
    ],
    "Commerce": [
        { title: "Business Developer", type: "Stage", salary: "Commission", description: "Prospection et développement du portefeuille client..." },
        { title: "Commercial Sédentaire", type: "Alternance", salary: "2500 DH + Primes", description: "Vente de solutions B2B..." }
    ],
    "Industrie": [
        { title: "Ingénieur Production", type: "Stage PFE", salary: "2000 DH", description: "Optimisation de la chaîne de production..." },
        { title: "Assistant Qualité", type: "Stage", salary: "1500 DH", description: "Suivi des normes ISO et contrôle qualité..." }
    ],
    "Telecoms": [
        { title: "Ingénieur Réseaux", type: "Stage PFE", salary: "2500 DH", description: "Déploiement et maintenance de réseaux..." },
        { title: "Technicien Fibre Optique", type: "Stage", salary: "1500 DH", description: "Installation et raccordement..." }
    ],
    "Finance": [
        { title: "Auditeur Junior", type: "Stage PFE", salary: "3000 DH", description: "Audit financier et comptable..." },
        { title: "Contrôleur de Gestion", type: "Stage", salary: "2000 DH", description: "Analyse des coûts et reporting..." }
    ]
};

const DEFAULT_TEMPLATES = [
    { title: "Stagiaire Polyvalent", type: "Stage", salary: "Non rémunéré", description: "Assistance sur diverses tâches administratives et opérationnelles..." },
    { title: "Assistant De Direction", type: "Stage", salary: "1000 DH", description: "Gestion d'agenda et communication interne..." }
];

export function generateJobForCompany(company) {
    const domain = company.domaine || "Informatique";
    // Find matching key roughly
    const key = Object.keys(JOB_TEMPLATES).find(k => domain.includes(k) || k.includes(domain)) || "Informatique";

    const templates = JOB_TEMPLATES[key] || DEFAULT_TEMPLATES;
    const template = templates[Math.floor(Math.random() * templates.length)];

    return {
        companyId: company.id,
        title: template.title,
        description: template.description,
        type: template.type,
        salary: template.salary,
        location: company.address || "Casablanca"
    };
}
