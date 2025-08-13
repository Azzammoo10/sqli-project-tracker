import type { AxisModel } from "@syncfusion/ej2-react-charts";

export const sidebarItems = [
  {
    id: 1,
    icon: "/assets/icons/home.svg",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    id: 3,
    icon: "/assets/icons/users.svg",
    label: "All Users",
    href: "/all-users",
  },
  {
    id: 4,
    icon: "/assets/icons/briefcase.svg",
    label: "Projets",
    href: "/projets",
  },
  {
    id: 4,
    icon: "/assets/icons/taches.svg",
    label: "Taches",
    href: "/taches",
  },
  {
    id: 4,
    icon: "/assets/icons/state.svg",
    label: "Statistique",
    href: "/stat",
  },
  {
    id: 4,
    icon: "/assets/icons/settings.svg",
    label: "Parametres",
    href: "/parametres",
  },
];

export const chartOneData: object[] = [
  {
    x: "Jan",
    y1: 0.5,
    y2: 1.5,
    y3: 0.7,
  },
  {
    x: "Feb",
    y1: 0.8,
    y2: 1.2,
    y3: 0.9,
  },
  {
    x: "Mar",
    y1: 1.2,
    y2: 1.8,
    y3: 1.5,
  },
  {
    x: "Apr",
    y1: 1.5,
    y2: 2.0,
    y3: 1.8,
  },
  {
    x: "May",
    y1: 1.8,
    y2: 2.5,
    y3: 2.0,
  },
  {
    x: "Jun",
    y1: 2.0,
    y2: 2.8,
    y3: 2.5,
  },
];

export const travelStyles = [
  "Relaxed",
  "Luxury",
  "Adventure",
  "Cultural",
  "Nature & Outdoors",
  "City Exploration",
];

export const interests = [
  "Food & Culinary",
  "Historical Sites",
  "Hiking & Nature Walks",
  "Beaches & Water Activities",
  "Museums & Art",
  "Nightlife & Bars",
  "Photography Spots",
  "Shopping",
  "Local Experiences",
];

export const budgetOptions = ["Budget", "Mid-range", "Luxury", "Premium"];

export const groupTypes = ["Solo", "Couple", "Family", "Friends", "Business"];

export const footers = ["Terms & Condition", "Privacy Policy"];

export const selectItems = [
  "groupType",
  "travelStyle",
  "interest",
  "budget",
] as (keyof TripFormData)[];

export const comboBoxItems = {
  groupType: groupTypes,
  travelStyle: travelStyles,
  interest: interests,
  budget: budgetOptions,
} as Record<keyof TripFormData, string[]>;

export const userXAxis: AxisModel = { valueType: "Category", title: "Day" };
export const useryAxis: AxisModel = {
  minimum: 0,
  maximum: 10,
  interval: 2,
  title: "Count",
};

export const tripXAxis: AxisModel = {
  valueType: "Category",
  title: "Travel Styles",
  majorGridLines: { width: 0 },
};

export const tripyAxis: AxisModel = {
  minimum: 0,
  maximum: 10,
  interval: 2,
  title: "Count",
};

export const CONFETTI_SETTINGS = {
  particleCount: 200, // Number of confetti pieces
  spread: 60, // Spread of the confetti burst
  colors: ["#ff0", "#ff7f00", "#ff0044", "#4c94f4", "#f4f4f4"], // Confetti colors
  decay: 0.95, // Gravity decay of the confetti
};

export const LEFT_CONFETTI = {
  ...CONFETTI_SETTINGS,
  angle: 45, // Direction of the confetti burst (90 degrees is top)
  origin: { x: 0, y: 1 }, // Center of the screen
};

export const RIGHT_CONFETTI = {
  ...CONFETTI_SETTINGS,
  angle: 135,
  origin: { x: 1, y: 1 },
};

export const user = {name: "AZZAM"}
export const dahsboardStats = {
    totalProjets: 400,
    projectAded: {currentMont: 15, lassmonth: 10},
    totaltachees: 10,
    taskaded: {currentMont: 10, lassmonth: 10},
    userRole: {total: 10, currentMont: 10, lassmonth: 107}
}

export const allProjects = [{
    id: 1,
    name: "Migration vers AWS",
    imageUrls: ["/assets/images/sampleSQLI.png"],
    clients: [{client: "CyberWatch Africa"}],
    tags: ["Cloud", "DevOps"],
    travelStyle: "Solo",
    status: "EN_ATTENTE",
},
    {
        id: 2,
        name: "Dashboard Cybersécurité",
        imageUrls: ["/assets/images/sampleSQLI.png"],
        clients: [{client: "SmartBank"}],
        tags: ["Sécurité", "Web"],
        travelStyle: "Family",
        status: "EN_COURS",
    },
    {
        id: 3,
        name: "Application Mobile RH",
        imageUrls: ["/assets/images/sampleRFC.png"],
        clients: [{client: "CyberWatch Africa"}],
        tags: ["Mobile", "Flutter"],
        travelStyle: "Couple",
        status: "TERMINE",
    },
    {
        id: 4,
        name: "Analyse IA des ventes",
        imageUrls: ["/assets/images/sampleRFC.png"],
        clients: [{client: "Business Intelligence"}],
        tags: ["IA", "Data Science"],
        travelStyle: "Friends",
        status: "BLOQUE",
    },
];