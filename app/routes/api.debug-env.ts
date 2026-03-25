import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';

export async function loader({ context }: ActionFunctionArgs) {
  const cloudflareEnv = (context?.cloudflare?.env as any) || {};

  return json({
    managed_model_process: process.env.MANAGED_MODEL || 'NOT SET',
    managed_provider_process: process.env.MANAGED_PROVIDER || 'NOT SET',
    anthropic_key_process: process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET',
    managed_model_cf: cloudflareEnv.MANAGED_MODEL || 'NOT SET',
    managed_provider_cf: cloudflareEnv.MANAGED_PROVIDER || 'NOT SET',
    anthropic_key_cf: cloudflareEnv.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET',
  });
}
