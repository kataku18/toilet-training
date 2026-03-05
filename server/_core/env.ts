const isProduction = process.env.NODE_ENV === "production";

function requireEnv(key: string, value: string | undefined): string {
  if (isProduction && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? "";
}

function requireSecret(key: string, value: string | undefined, minLength = 32): string {
  const resolved = requireEnv(key, value);
  if (resolved.length > 0 && resolved.length < minLength) {
    throw new Error(
      `Environment variable ${key} must be at least ${minLength} characters long for security`,
    );
  }
  return resolved;
}

export const ENV = {
  appId: requireEnv("VITE_APP_ID", process.env.VITE_APP_ID),
  cookieSecret: requireSecret("JWT_SECRET", process.env.JWT_SECRET),
  databaseUrl: requireEnv("DATABASE_URL", process.env.DATABASE_URL),
  oAuthServerUrl: requireEnv("OAUTH_SERVER_URL", process.env.OAUTH_SERVER_URL),
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
