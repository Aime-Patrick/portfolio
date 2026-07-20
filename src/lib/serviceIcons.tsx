import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiLayout,
  FiLink2,
  FiMonitor,
  FiSmartphone,
  FiCpu,
  FiHardDrive,
  FiSettings,
  FiLayers,
  FiPackage,
  FiZap,
  FiTarget,
  FiTrendingUp,
  FiMessageCircle,
  FiPenTool,
  FiGlobe,
  FiMail,
  FiUsers,
  FiShoppingBag,
  FiCamera,
  FiVideo,
  FiSearch,
  FiTerminal,
  FiBox,
  FiWifi,
  FiKey,
  FiRefreshCw,
} from "react-icons/fi";
import {
  FaLaptopCode,
  FaCodeBranch,
  FaGears,
  FaWandMagicSparkles,
  FaChartSimple,
  FaFingerprint,
  FaRobot,
  FaBrain,
} from "react-icons/fa6";
import {
  FaServer,
  FaCloud,
  FaCog,
  FaDatabase,
  FaShieldAlt,
  FaLock,
  FaMicrochip,
  FaDocker,
  FaCode,
  FaMobileAlt,
  FaDesktop,
  FaGlobe,
  FaRocket,
  FaPaintBrush,
  FaChartLine,
  FaTools,
  FaBolt,
  FaLightbulb,
  FaEnvelope,
  FaComments,
  FaUsers,
  FaStore,
  FaShoppingCart,
  FaCreditCard,
  FaCamera,
  FaVideo,
  FaPen,
  FaMagic,
  FaWifi,
  FaNetworkWired,
  FaKey,
  FaUserShield,
  FaLayerGroup,
  FaSitemap,
  FaTerminal,
  FaBug,
  FaSync,
  FaPlug,
  FaCube,
  FaBoxes,
  FaCogs,
  FaAws,
  FaReact,
  FaNodeJs,
  FaPython,
  FaAndroid,
  FaApple,
  FaFigma,
  FaGithub,
} from "react-icons/fa";
import {
  GiSmartphone,
  GiArtificialIntelligence,
  GiCircuitry,
  GiRobotGolem,
} from "react-icons/gi";

export type ServiceIconEntry = {
  label: string;
  Icon: IconType;
};

/** Keys are stored in Firestore and must stay stable. */
export const SERVICE_ICONS: Record<string, ServiceIconEntry> = {
  // Design & UI
  FiLayout: { label: "Layout", Icon: FiLayout },
  FaPaintBrush: { label: "Paint Brush", Icon: FaPaintBrush },
  FiPenTool: { label: "Pen Tool", Icon: FiPenTool },
  FaPen: { label: "Pen", Icon: FaPen },
  FaFigma: { label: "Figma", Icon: FaFigma },
  FaMagic: { label: "Magic", Icon: FaMagic },
  FaWandMagicSparkles: {
    label: "Magic Sparkles",
    Icon: FaWandMagicSparkles,
  },
  FiLayers: { label: "Layers", Icon: FiLayers },
  FaLayerGroup: { label: "Layer Group", Icon: FaLayerGroup },

  // Development
  FaLaptopCode: { label: "Laptop Code", Icon: FaLaptopCode },
  FaCode: { label: "Code", Icon: FaCode },
  FaCodeBranch: { label: "Code Branch", Icon: FaCodeBranch },
  FiTerminal: { label: "Terminal", Icon: FiTerminal },
  FaTerminal: { label: "Terminal (alt)", Icon: FaTerminal },
  FaBug: { label: "Bug / Debug", Icon: FaBug },
  FaGithub: { label: "GitHub", Icon: FaGithub },
  FaReact: { label: "React", Icon: FaReact },
  FaNodeJs: { label: "Node.js", Icon: FaNodeJs },
  FaPython: { label: "Python", Icon: FaPython },

  // Mobile
  GiSmartphone: { label: "Smartphone", Icon: GiSmartphone },
  FaMobileAlt: { label: "Mobile", Icon: FaMobileAlt },
  FiSmartphone: { label: "Phone", Icon: FiSmartphone },
  FaAndroid: { label: "Android", Icon: FaAndroid },
  FaApple: { label: "Apple", Icon: FaApple },

  // Infrastructure & Cloud
  FaServer: { label: "Server", Icon: FaServer },
  FaCloud: { label: "Cloud", Icon: FaCloud },
  FaAws: { label: "AWS", Icon: FaAws },
  FaDocker: { label: "Docker", Icon: FaDocker },
  FaDatabase: { label: "Database", Icon: FaDatabase },
  FiHardDrive: { label: "Hard Drive", Icon: FiHardDrive },
  FaNetworkWired: { label: "Network", Icon: FaNetworkWired },
  FiWifi: { label: "Wi‑Fi", Icon: FiWifi },
  FaWifi: { label: "Wi‑Fi (alt)", Icon: FaWifi },
  FaPlug: { label: "API / Plug", Icon: FaPlug },
  FiLink2: { label: "Link", Icon: FiLink2 },

  // AI & Smart systems
  FaMicrochip: { label: "Microchip", Icon: FaMicrochip },
  FiCpu: { label: "CPU", Icon: FiCpu },
  FaBrain: { label: "Brain / AI", Icon: FaBrain },
  FaRobot: { label: "Robot", Icon: FaRobot },
  GiArtificialIntelligence: {
    label: "AI",
    Icon: GiArtificialIntelligence,
  },
  GiCircuitry: { label: "Circuitry", Icon: GiCircuitry },
  GiRobotGolem: { label: "Automation", Icon: GiRobotGolem },
  FaFingerprint: { label: "Fingerprint", Icon: FaFingerprint },

  // Security
  FaShieldAlt: { label: "Shield", Icon: FaShieldAlt },
  FaLock: { label: "Lock", Icon: FaLock },
  FaKey: { label: "Key", Icon: FaKey },
  FiKey: { label: "Key (alt)", Icon: FiKey },
  FaUserShield: { label: "User Shield", Icon: FaUserShield },

  // Settings & Tools
  FaCog: { label: "Settings", Icon: FaCog },
  FaCogs: { label: "Cogs", Icon: FaCogs },
  FaGears: { label: "Gears", Icon: FaGears },
  FiSettings: { label: "Settings (alt)", Icon: FiSettings },
  FaTools: { label: "Tools", Icon: FaTools },
  FaSync: { label: "Sync", Icon: FaSync },
  FiRefreshCw: { label: "Refresh", Icon: FiRefreshCw },

  // Business & Growth
  FaRocket: { label: "Rocket", Icon: FaRocket },
  FaBolt: { label: "Bolt", Icon: FaBolt },
  FiZap: { label: "Zap", Icon: FiZap },
  FaLightbulb: { label: "Lightbulb", Icon: FaLightbulb },
  FaChartLine: { label: "Chart Line", Icon: FaChartLine },
  FaChartSimple: { label: "Chart", Icon: FaChartSimple },
  FiTrendingUp: { label: "Trending Up", Icon: FiTrendingUp },
  FiTarget: { label: "Target", Icon: FiTarget },
  FaSitemap: { label: "Sitemap", Icon: FaSitemap },

  // Devices & Media
  FaDesktop: { label: "Desktop", Icon: FaDesktop },
  FiMonitor: { label: "Monitor", Icon: FiMonitor },
  FaGlobe: { label: "Globe", Icon: FaGlobe },
  FiGlobe: { label: "Globe (alt)", Icon: FiGlobe },
  FaCamera: { label: "Camera", Icon: FaCamera },
  FiCamera: { label: "Camera (alt)", Icon: FiCamera },
  FaVideo: { label: "Video", Icon: FaVideo },
  FiVideo: { label: "Video (alt)", Icon: FiVideo },
  FiSearch: { label: "Search", Icon: FiSearch },

  // Communication & Commerce
  FaEnvelope: { label: "Email", Icon: FaEnvelope },
  FiMail: { label: "Mail", Icon: FiMail },
  FaComments: { label: "Comments", Icon: FaComments },
  FiMessageCircle: { label: "Message", Icon: FiMessageCircle },
  FaUsers: { label: "Users", Icon: FaUsers },
  FiUsers: { label: "Users (alt)", Icon: FiUsers },
  FaStore: { label: "Store", Icon: FaStore },
  FaShoppingCart: { label: "Cart", Icon: FaShoppingCart },
  FiShoppingBag: { label: "Shopping Bag", Icon: FiShoppingBag },
  FaCreditCard: { label: "Payments", Icon: FaCreditCard },

  // Packaging
  FiPackage: { label: "Package", Icon: FiPackage },
  FiBox: { label: "Box", Icon: FiBox },
  FaCube: { label: "Cube", Icon: FaCube },
  FaBoxes: { label: "Boxes", Icon: FaBoxes },
};

export const serviceIconOptions: {
  value: string;
  label: string;
  preview: ReactNode;
}[] = Object.entries(SERVICE_ICONS).map(([value, { label, Icon }]) => ({
  value,
  label,
  preview: <Icon className="size-8" />,
}));

export function getServiceIconComponent(
  iconName: string,
  size = 32,
  className = "text-white"
) {
  const entry = SERVICE_ICONS[iconName];
  const Icon = entry?.Icon ?? FiLayout;
  return <Icon size={size} className={className} />;
}
