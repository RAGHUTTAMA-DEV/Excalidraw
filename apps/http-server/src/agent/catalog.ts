import type { NodeKind } from "./types.js";

export const ICON_CATALOG: { id: string; label: string }[] = [
  { id: "lucide:server", label: "Server" },
  { id: "lucide:database", label: "Database" },
  { id: "lucide:cloud", label: "Cloud" },
  { id: "lucide:user", label: "User" },
  { id: "lucide:users", label: "Users" },
  { id: "lucide:globe", label: "Globe" },
  { id: "lucide:lock", label: "Lock" },
  { id: "lucide:shield", label: "Shield" },
  { id: "lucide:key", label: "Key" },
  { id: "lucide:mail", label: "Mail" },
  { id: "lucide:smartphone", label: "Phone" },
  { id: "lucide:monitor", label: "Monitor" },
  { id: "lucide:cpu", label: "CPU" },
  { id: "lucide:hard-drive", label: "Disk" },
  { id: "lucide:folder", label: "Folder" },
  { id: "lucide:settings", label: "Settings" },
  { id: "lucide:git-branch", label: "Git" },
  { id: "lucide:terminal", label: "Terminal" },
  { id: "lucide:boxes", label: "Services" },
  { id: "lucide:workflow", label: "Workflow" },
  { id: "lucide:message-square", label: "Chat" },
  { id: "lucide:radio", label: "Signal" },
  { id: "lucide:wifi", label: "Wifi" },
  { id: "lucide:building-2", label: "Office" },
  { id: "skill-icons:aws-dark", label: "AWS" },
  { id: "skill-icons:gcp-dark", label: "GCP" },
  { id: "skill-icons:azure-dark", label: "Azure" },
  { id: "logos:aws-ec2", label: "EC2" },
  { id: "logos:aws-s3", label: "S3" },
  { id: "logos:aws-lambda", label: "Lambda" },
  { id: "logos:aws-rds", label: "RDS" },
  { id: "logos:aws-dynamodb", label: "DynamoDB" },
  { id: "logos:aws-ecs", label: "ECS" },
  { id: "logos:aws-eks", label: "EKS" },
  { id: "logos:aws-api-gateway", label: "API Gateway" },
  { id: "logos:aws-cloudfront", label: "CloudFront" },
  { id: "simple-icons:cloudflare", label: "Cloudflare" },
  { id: "simple-icons:vercel", label: "Vercel" },
  { id: "simple-icons:netlify", label: "Netlify" },
  { id: "simple-icons:digitalocean", label: "DigitalOcean" },
  { id: "skill-icons:postgres", label: "Postgres" },
  { id: "skill-icons:mysql-dark", label: "MySQL" },
  { id: "skill-icons:mongodb", label: "MongoDB" },
  { id: "skill-icons:redis", label: "Redis" },
  { id: "skill-icons:elasticsearch", label: "Elastic" },
  { id: "skill-icons:kafka", label: "Kafka" },
  { id: "simple-icons:rabbitmq", label: "RabbitMQ" },
  { id: "simple-icons:sqlite", label: "SQLite" },
  { id: "simple-icons:prisma", label: "Prisma" },
  { id: "simple-icons:supabase", label: "Supabase" },
  { id: "simple-icons:snowflake", label: "Snowflake" },
  { id: "simple-icons:apachecassandra", label: "Cassandra" },
  { id: "skill-icons:react-dark", label: "React" },
  { id: "skill-icons:nextjs-dark", label: "Next.js" },
  { id: "skill-icons:nodejs-dark", label: "Node" },
  { id: "skill-icons:typescript", label: "TypeScript" },
  { id: "skill-icons:python-dark", label: "Python" },
  { id: "skill-icons:golang", label: "Go" },
  { id: "skill-icons:rust", label: "Rust" },
  { id: "skill-icons:docker", label: "Docker" },
  { id: "skill-icons:kubernetes", label: "Kubernetes" },
  { id: "skill-icons:nginx", label: "Nginx" },
  { id: "skill-icons:graphql-dark", label: "GraphQL" },
  { id: "skill-icons:github-dark", label: "GitHub" },
  { id: "skill-icons:gitlab-dark", label: "GitLab" },
  { id: "skill-icons:terraform-dark", label: "Terraform" },
  { id: "simple-icons:prometheus", label: "Prometheus" },
  { id: "simple-icons:grafana", label: "Grafana" },
];

export const ALLOWED_ICON_IDS = new Set(ICON_CATALOG.map((icon) => icon.id));

export const KIND_FALLBACK: Record<NodeKind, string> = {
  user: "lucide:user",
  service: "lucide:boxes",
  store: "lucide:database",
  queue: "lucide:message-square",
  gateway: "lucide:globe",
  external: "lucide:cloud",
};

export function resolveIconId(iconId: string | undefined, kind: NodeKind): string {
  if (iconId && ALLOWED_ICON_IDS.has(iconId)) return iconId;
  return KIND_FALLBACK[kind];
}

export function catalogPromptList(): string {
  return ICON_CATALOG.map((icon) => `${icon.id} (${icon.label})`).join(", ");
}
