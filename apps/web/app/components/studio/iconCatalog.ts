export type IconCategory = "general" | "cloud" | "data" | "dev";

export type CatalogIcon = {
  id: string;
  label: string;
  category: IconCategory;
  keywords: string;
};

export const ICON_CATEGORIES: { id: IconCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "general", label: "General" },
  { id: "cloud", label: "Cloud" },
  { id: "data", label: "Data" },
  { id: "dev", label: "Dev" },
];

export const ICON_CATALOG: CatalogIcon[] = [
  { id: "lucide:server", label: "Server", category: "general", keywords: "machine host box rack" },
  { id: "lucide:database", label: "Database", category: "general", keywords: "db storage data" },
  { id: "lucide:cloud", label: "Cloud", category: "general", keywords: "saas hosted" },
  { id: "lucide:user", label: "User", category: "general", keywords: "person client" },
  { id: "lucide:users", label: "Users", category: "general", keywords: "team people group" },
  { id: "lucide:globe", label: "Globe", category: "general", keywords: "web internet www" },
  { id: "lucide:lock", label: "Lock", category: "general", keywords: "auth security" },
  { id: "lucide:shield", label: "Shield", category: "general", keywords: "security firewall" },
  { id: "lucide:key", label: "Key", category: "general", keywords: "secret token iam" },
  { id: "lucide:mail", label: "Mail", category: "general", keywords: "email smtp" },
  { id: "lucide:smartphone", label: "Phone", category: "general", keywords: "mobile app" },
  { id: "lucide:monitor", label: "Monitor", category: "general", keywords: "desktop display" },
  { id: "lucide:cpu", label: "CPU", category: "general", keywords: "compute processor" },
  { id: "lucide:hard-drive", label: "Disk", category: "general", keywords: "storage volume" },
  { id: "lucide:folder", label: "Folder", category: "general", keywords: "files directory" },
  { id: "lucide:settings", label: "Settings", category: "general", keywords: "config gear" },
  { id: "lucide:git-branch", label: "Git", category: "general", keywords: "branch vcs" },
  { id: "lucide:terminal", label: "Terminal", category: "general", keywords: "cli shell" },
  { id: "lucide:boxes", label: "Services", category: "general", keywords: "modules packages" },
  { id: "lucide:workflow", label: "Workflow", category: "general", keywords: "pipeline ci" },
  { id: "lucide:message-square", label: "Chat", category: "general", keywords: "queue message" },
  { id: "lucide:radio", label: "Signal", category: "general", keywords: "iot wireless" },
  { id: "lucide:wifi", label: "Wifi", category: "general", keywords: "network" },
  { id: "lucide:building-2", label: "Office", category: "general", keywords: "company org" },

  { id: "skill-icons:aws-dark", label: "AWS", category: "cloud", keywords: "amazon web services" },
  { id: "skill-icons:gcp-dark", label: "GCP", category: "cloud", keywords: "google cloud" },
  { id: "skill-icons:azure-dark", label: "Azure", category: "cloud", keywords: "microsoft" },
  { id: "logos:aws-ec2", label: "EC2", category: "cloud", keywords: "aws compute instance" },
  { id: "logos:aws-s3", label: "S3", category: "cloud", keywords: "aws bucket storage" },
  { id: "logos:aws-lambda", label: "Lambda", category: "cloud", keywords: "aws function serverless" },
  { id: "logos:aws-rds", label: "RDS", category: "cloud", keywords: "aws database" },
  { id: "logos:aws-dynamodb", label: "DynamoDB", category: "cloud", keywords: "aws nosql" },
  { id: "logos:aws-ecs", label: "ECS", category: "cloud", keywords: "aws containers" },
  { id: "logos:aws-eks", label: "EKS", category: "cloud", keywords: "aws kubernetes" },
  { id: "logos:aws-api-gateway", label: "API Gateway", category: "cloud", keywords: "aws http" },
  { id: "logos:aws-cloudfront", label: "CloudFront", category: "cloud", keywords: "aws cdn" },
  { id: "simple-icons:cloudflare", label: "Cloudflare", category: "cloud", keywords: "cdn dns" },
  { id: "simple-icons:vercel", label: "Vercel", category: "cloud", keywords: "hosting deploy" },
  { id: "simple-icons:netlify", label: "Netlify", category: "cloud", keywords: "hosting" },
  { id: "simple-icons:digitalocean", label: "DigitalOcean", category: "cloud", keywords: "droplet vps" },

  { id: "skill-icons:postgres", label: "Postgres", category: "data", keywords: "sql database postgresql" },
  { id: "skill-icons:mysql-dark", label: "MySQL", category: "data", keywords: "sql database" },
  { id: "skill-icons:mongodb", label: "MongoDB", category: "data", keywords: "nosql document" },
  { id: "skill-icons:redis", label: "Redis", category: "data", keywords: "cache kv" },
  { id: "skill-icons:elasticsearch", label: "Elastic", category: "data", keywords: "search elk" },
  { id: "skill-icons:kafka", label: "Kafka", category: "data", keywords: "queue stream" },
  { id: "simple-icons:rabbitmq", label: "RabbitMQ", category: "data", keywords: "queue amqp" },
  { id: "simple-icons:sqlite", label: "SQLite", category: "data", keywords: "sql embedded" },
  { id: "simple-icons:prisma", label: "Prisma", category: "data", keywords: "orm" },
  { id: "simple-icons:supabase", label: "Supabase", category: "data", keywords: "postgres baas" },
  { id: "simple-icons:snowflake", label: "Snowflake", category: "data", keywords: "warehouse" },
  { id: "simple-icons:apachecassandra", label: "Cassandra", category: "data", keywords: "nosql" },

  { id: "skill-icons:react-dark", label: "React", category: "dev", keywords: "frontend ui" },
  { id: "skill-icons:nextjs-dark", label: "Next.js", category: "dev", keywords: "react" },
  { id: "skill-icons:nodejs-dark", label: "Node", category: "dev", keywords: "javascript backend" },
  { id: "skill-icons:typescript", label: "TypeScript", category: "dev", keywords: "ts javascript" },
  { id: "skill-icons:python-dark", label: "Python", category: "dev", keywords: "backend" },
  { id: "skill-icons:golang", label: "Go", category: "dev", keywords: "golang" },
  { id: "skill-icons:rust", label: "Rust", category: "dev", keywords: "systems" },
  { id: "skill-icons:docker", label: "Docker", category: "dev", keywords: "container" },
  { id: "skill-icons:kubernetes", label: "Kubernetes", category: "dev", keywords: "k8s cluster" },
  { id: "skill-icons:nginx", label: "Nginx", category: "dev", keywords: "proxy webserver" },
  { id: "skill-icons:graphql-dark", label: "GraphQL", category: "dev", keywords: "api" },
  { id: "skill-icons:github-dark", label: "GitHub", category: "dev", keywords: "git vcs" },
  { id: "skill-icons:gitlab-dark", label: "GitLab", category: "dev", keywords: "git ci" },
  { id: "skill-icons:terraform-dark", label: "Terraform", category: "dev", keywords: "iac" },
  { id: "simple-icons:prometheus", label: "Prometheus", category: "dev", keywords: "metrics monitoring" },
  { id: "simple-icons:grafana", label: "Grafana", category: "dev", keywords: "dashboards" },
  { id: "simple-icons:nginx", label: "Nginx", category: "dev", keywords: "proxy" },
];

export function iconMatches(icon: CatalogIcon, query: string) {
  if (!query) return true;
  const hay = `${icon.label} ${icon.keywords} ${icon.id}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((part) => hay.includes(part));
}

export function iconifyUrl(id: string, size = 32) {
  const [prefix, ...rest] = id.split(":");
  const name = rest.join(":");
  return `https://api.iconify.design/${prefix}/${name}.svg?height=${size}`;
}

export function isMonoIcon(id: string) {
  return id.startsWith("lucide:") || id.startsWith("mdi:");
}

export function colorizeSvg(svg: string, color: string) {
  return svg.replace(/currentColor/g, color);
}

export async function fetchIconSvg(id: string, color?: string): Promise<string> {
  const [prefix, ...rest] = id.split(":");
  const name = rest.join(":");
  const tint = color && isMonoIcon(id) ? `?color=${encodeURIComponent(color)}` : "";
  const response = await fetch(`https://api.iconify.design/${prefix}/${name}.svg${tint}`);
  if (!response.ok) throw new Error("Icon not found");
  const svg = await response.text();
  if (!svg.includes("<svg")) throw new Error("Bad icon");
  return color && isMonoIcon(id) ? colorizeSvg(svg, color) : svg;
}

type IconifySearch = { icons?: string[] };

export async function searchRemoteIcons(query: string): Promise<CatalogIcon[]> {
  const response = await fetch(
    `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=36`
  );
  if (!response.ok) return [];
  const data = (await response.json()) as IconifySearch;
  const allowed = ["lucide", "simple-icons", "skill-icons", "logos"];
  return (data.icons || [])
    .filter((id) => allowed.includes(id.split(":")[0] || ""))
    .map((id) => {
      const name = id.split(":")[1] || id;
      return {
        id,
        label: name.replace(/-dark|-light/g, "").replace(/dotjs/g, ".js").replace(/-/g, " "),
        category: "dev" as const,
        keywords: query,
      };
    });
}
