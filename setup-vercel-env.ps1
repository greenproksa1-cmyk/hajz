$env_vars = @{
  "DATABASE_URL" = "postgres://postgres.vxwiajngmkbnvohnaqet:mb8D6wDgodkmpZhD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
  "POSTGRES_URL_NON_POOLING" = "postgres://postgres.vxwiajngmkbnvohnaqet:mb8D6wDgodkmpZhD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
  "NEXTAUTH_SECRET" = "riyadh-exhibition-super-secret-2026"
  "NEXTAUTH_URL" = "https://my-project-lb4onfb2c-vuodvs-projects.vercel.app"
  "SMTP_HOST" = "smtp.gmail.com"
  "SMTP_PORT" = "587"
  "SMTP_USER" = "fareszanw@gmail.com"
  "SMTP_PASS" = "papi hcxh izhd esgu"
  "SMTP_FROM" = "Riyadh Contractors Exhibition <fareszanw@gmail.com>"
}

foreach ($key in $env_vars.Keys) {
  $val = $env_vars[$key]
  Write-Host "Adding $key..."
  echo $val | npx vercel env add $key production
}

Write-Host "Done! Now redeploying..."
npx vercel --prod
