# Deploy Backend to Render

## Prerequisites
- GitHub account with your repository pushed
- Render account (sign up at https://render.com)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Render configuration"
   git push origin main
   ```

2. **Create a New Blueprint on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click "Apply" to create both the database and web service

3. **Update Environment Variables**
   - After deployment, go to your web service dashboard
   - Click "Environment" tab
   - Update `CORS_ORIGIN` with your frontend URL
   - Render auto-generates `JWT_SECRET` and `JWT_REFRESH_SECRET`

4. **Run Database Migrations**
   Migrations run automatically on deployment via the start command:
   ```
   npx prisma migrate deploy && npm run start:prod
   ```

5. **Seed Database (Optional)**
   - Go to your web service dashboard
   - Click "Shell" tab
   - Run: `npm run seed`

### Option 2: Manual Setup

1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Name: `portal-professor-db`
   - Choose free plan
   - Click "Create Database"
   - Copy the "Internal Database URL"

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder (Root Directory: `backend`)
   - Configure:
     - **Name**: `portal-professor-backend`
     - **Region**: Oregon (US West)
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npx prisma generate && npm run build`
     - **Start Command**: `npx prisma migrate deploy && npm run start:prod`
     - **Plan**: Free

3. **Add Environment Variables**
   In the "Environment" section, add:
   - `DATABASE_URL`: Paste the Internal Database URL from step 1
   - `JWT_SECRET`: Generate a random string (use https://randomkeygen.com/)
   - `JWT_REFRESH_SECRET`: Generate another random string
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://your-app.onrender.com`)
   - `PORT`: `3000` (Render sets this automatically, but explicit is good)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete
   - Your API will be available at `https://your-service-name.onrender.com`

## Post-Deployment

### Test Your API
```bash
curl https://your-service-name.onrender.com/api/health
```

### Seed Database
1. Go to your web service dashboard
2. Click "Shell" tab (top right)
3. Run:
   ```bash
   npm run seed
   ```

### View Logs
- Go to your web service dashboard
- Click "Logs" tab to see real-time logs

### Connect Frontend
Update your frontend `.env` file:
```env
VITE_API_URL=https://your-service-name.onrender.com/api
```

## Important Notes

### Free Plan Limitations
- ⚠️ **Spins down after 15 minutes of inactivity**
- First request after inactivity takes ~30-60 seconds
- Database limited to 90 days on free plan
- Consider upgrading for production apps

### Database Backups
Render doesn't provide automatic backups on the free plan. For production:
1. Upgrade to a paid plan with backups
2. Or set up manual backups using `pg_dump`

### Monitoring
- Check logs regularly in Render dashboard
- Set up health check endpoint (if not already done)
- Monitor for errors and performance issues

### Custom Domain (Optional)
1. Go to web service settings
2. Click "Custom Domain"
3. Add your domain and configure DNS

## Troubleshooting

### Build Fails
- Check build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Use **Internal Database URL** (not External)
- Check if migrations ran successfully

### CORS Errors
- Ensure `CORS_ORIGIN` matches your frontend URL exactly
- Include protocol (https://)
- No trailing slash

### Migration Issues
If migrations fail, connect to the database shell:
```bash
npx prisma migrate deploy
npx prisma db push
```

## Useful Commands

### Access Database Shell
In your web service shell:
```bash
npx prisma studio
```

### Reset Database (⚠️ Careful!)
```bash
npx prisma migrate reset --force
```

### View Database Status
```bash
npx prisma migrate status
```

## Resources
- [Render Documentation](https://render.com/docs)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render)
