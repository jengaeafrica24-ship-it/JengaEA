# Custom Domain Setup Guide for jengaeafrica.com

## Overview
This guide will help you configure your custom domain `jengaeafrica.com` to work with your JengaEstimate application deployed on Render.

---

## Domain Architecture

Your setup will use the following subdomain structure:

- **`jengaeafrica.com`** → Frontend (React app)
- **`www.jengaeafrica.com`** → Frontend (React app - redirect from www)
- **`api.jengaeafrica.com`** → Backend (Django REST API)

---

## Step 1: DNS Configuration

### A. Log into your Domain Registrar
Go to your domain registrar's DNS management panel (GoDaddy, Namecheap, Google Domains, etc.)

### B. Add DNS Records

Add the following DNS records:

#### For Frontend (jengaeafrica.com)
```
Type: CNAME
Name: @  (or leave blank for root domain)
Value: jengaeafrontend.onrender.com
TTL: 3600 (or Auto)

Type: CNAME  
Name: www
Value: jengaeafrontend.onrender.com
TTL: 3600 (or Auto)
```

#### For Backend API (api.jengaeafrica.com)
```
Type: CNAME
Name: api
Value: jengaea.onrender.com
TTL: 3600 (or Auto)
```

**Note:** Some registrars don't support CNAME for root domains (@). In that case:
1. Use ALIAS or ANAME record type (if available)
2. Or use an A record pointing to Render's IP (check Render docs)
3. Or use `www.jengaeafrica.com` as your primary domain

### C. DNS Propagation
- DNS changes can take 24-48 hours to propagate globally
- Use https://dnschecker.org to check propagation status
- Most changes are visible within 15-30 minutes

---

## Step 2: Configure Render Backend Service

### A. Add Custom Domain to Backend Service

1. Go to https://dashboard.render.com
2. Select your **backend service** (jengaea)
3. Click **Settings** tab
4. Scroll to **Custom Domains** section
5. Click **Add Custom Domain**
6. Enter: `api.jengaeafrica.com`
7. Click **Save**
8. Render will automatically provision SSL certificate (takes ~5 minutes)

### B. Add Environment Variables

In your Render backend service settings:

1. Go to **Environment** tab
2. Add/Update these environment variables:

```
DJANGO_SECRET_KEY=<your-secret-key>
DEBUG=False
CORS_ALLOWED_ORIGINS=https://jengaeafrica.com,https://www.jengaeafrica.com
CSRF_TRUSTED_ORIGINS=https://jengaeafrica.com,https://www.jengaeafrica.com,https://api.jengaeafrica.com
GOOGLE_API_KEY=<your-key>
GEMINI_API_KEY=<your-key>
AFRICAS_TALKING_API_KEY=<your-key>
AFRICAS_TALKING_USERNAME=<your-username>
```

3. Click **Save Changes**
4. Render will automatically redeploy

---

## Step 3: Configure Render Frontend Service

### A. Add Custom Domains to Frontend Service

1. Go to https://dashboard.render.com
2. Select your **frontend service** (jengaeafrontend)
3. Click **Settings** tab
4. Scroll to **Custom Domains** section
5. Add **both** domains:
   - `jengaeafrica.com`
   - `www.jengaeafrica.com`
6. Render will provision SSL certificates for both

### B. Add Environment Variable

In your Render frontend service:

1. Go to **Environment** tab
2. Add this environment variable:

```
REACT_APP_API_URL=https://api.jengaeafrica.com
```

3. Click **Save Changes**
4. Render will automatically rebuild and deploy

---

## Step 4: Verify SSL Certificates

### A. Check Backend SSL
1. After ~5 minutes, visit: `https://api.jengaeafrica.com`
2. You should see a JSON response or Django admin page
3. Browser should show a padlock 🔒 (SSL is active)

### B. Check Frontend SSL
1. Visit: `https://jengaeafrica.com`
2. Visit: `https://www.jengaeafrica.com`
3. Both should load your React app with SSL

### C. Troubleshooting SSL
- If SSL shows "Not Secure", wait 10-15 minutes
- Check DNS propagation at https://dnschecker.org
- Verify CNAME records are correct in your DNS panel
- Check Render dashboard for SSL provisioning status

---

## Step 5: Test the Integration

### A. Test Backend API
Open browser console and run:
```javascript
fetch('https://api.jengaeafrica.com/api/projects/project-types/')
  .then(r => r.json())
  .then(console.log)
```

Expected: Should return project types data

### B. Test Frontend
1. Visit `https://jengaeafrica.com`
2. Try to register a new account
3. Try to log in
4. Generate a material estimate
5. Check browser console for errors

### C. Test CORS
1. Open browser DevTools → Network tab
2. Generate an estimate
3. Look for API calls to `api.jengaeafrica.com`
4. Check response headers include:
   - `Access-Control-Allow-Origin: https://jengaeafrica.com`
   - `Access-Control-Allow-Credentials: true`

---

## Step 6: Update Social Media & Documentation

### A. Update README.md
Replace Render URLs with your custom domain:
- Frontend: `https://jengaeafrica.com`
- Backend API: `https://api.jengaeafrica.com`

### B. Update Marketing Materials
- Website links
- Social media profiles
- Business cards
- Documentation

---

## Common Issues & Solutions

### Issue 1: "CORS Error" in Browser Console
**Solution:**
- Check that `api.jengaeafrica.com` is in `CORS_ALLOWED_ORIGINS`
- Verify environment variables are set on Render
- Clear browser cache and cookies
- Check Network tab to see actual Origin header sent

### Issue 2: "CSRF Token Missing" Error
**Solution:**
- Verify `CSRF_TRUSTED_ORIGINS` includes your domains
- Check that cookies are being sent (withCredentials: true)
- Clear browser cookies for the domain
- Check that `CSRF_COOKIE_SAMESITE = 'None'` in production

### Issue 3: SSL Certificate Not Provisioning
**Solution:**
- Verify DNS records are correct (use `nslookup api.jengaeafrica.com`)
- Wait 24 hours for DNS propagation
- Contact Render support if issue persists
- Try removing and re-adding the custom domain

### Issue 4: www Redirect Not Working
**Solution:**
- Ensure BOTH `jengaeafrica.com` and `www.jengaeafrica.com` are added in Render
- Some registrars need separate DNS records for www
- Use URL forwarding in your domain registrar if needed

### Issue 5: API Calls Still Going to Old URL
**Solution:**
- Hard refresh browser (Ctrl + Shift + R / Cmd + Shift + R)
- Clear browser cache completely
- Check that REACT_APP_API_URL is set in Render environment
- Verify the frontend build includes the new API URL

---

## DNS Record Examples by Registrar

### GoDaddy
```
Type: CNAME | Host: @ | Points to: jengaeafrontend.onrender.com | TTL: 1 Hour
Type: CNAME | Host: www | Points to: jengaeafrontend.onrender.com | TTL: 1 Hour  
Type: CNAME | Host: api | Points to: jengaea.onrender.com | TTL: 1 Hour
```

### Namecheap
```
Type: ALIAS | Host: @ | Value: jengaeafrontend.onrender.com
Type: CNAME | Host: www | Value: jengaeafrontend.onrender.com
Type: CNAME | Host: api | Value: jengaea.onrender.com
```

### Cloudflare
```
Type: CNAME | Name: @ | Target: jengaeafrontend.onrender.com | Proxy: ON (orange cloud)
Type: CNAME | Name: www | Target: jengaeafrontend.onrender.com | Proxy: ON
Type: CNAME | Name: api | Target: jengaea.onrender.com | Proxy: ON
```

**Note:** If using Cloudflare, set SSL/TLS mode to "Full (strict)"

---

## Security Checklist

After domain setup, verify:

- ✅ SSL/HTTPS enabled on all domains
- ✅ No mixed content warnings (http resources on https page)
- ✅ CORS configured correctly (no wildcard * in production)
- ✅ CSRF protection active (tokens being sent)
- ✅ Secure cookies enabled (SameSite=None, Secure=True)
- ✅ DEBUG=False in production
- ✅ Strong SECRET_KEY configured
- ✅ Database backups enabled on Render
- ✅ Environment variables secured (not in code)

---

## Performance Optimization

### A. Enable Caching
Add to Django settings:
```python
# Cache static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### B. Enable Compression
Already configured with WhiteNoise for Django static files.

### C. CDN (Optional)
For better global performance, consider:
- Cloudflare CDN (free tier available)
- AWS CloudFront
- Fastly

Configure by updating DNS to point through CDN.

---

## Monitoring & Maintenance

### A. Set Up Monitoring
1. **Uptime Monitoring:**
   - UptimeRobot (free): https://uptimerobot.com
   - Monitor both frontend and API URLs
   
2. **Error Tracking:**
   - Sentry for Django: https://sentry.io
   - LogRocket for React: https://logrocket.com

### B. Regular Checks
- Weekly: Check SSL certificate expiry
- Monthly: Review server logs for errors
- Quarterly: Update dependencies and security patches

---

## Rollback Plan

If custom domain causes issues:

### Quick Rollback
1. Remove custom domains from Render
2. Revert `api.js` to use Render URLs:
   ```javascript
   baseURL: 'https://jengaea.onrender.com'
   ```
3. Remove custom domain environment variables
4. Redeploy both services

---

## Support Resources

- **Render Custom Domains:** https://render.com/docs/custom-domains
- **Render SSL Certificates:** https://render.com/docs/tls
- **DNS Checker:** https://dnschecker.org
- **SSL Checker:** https://www.sslshopper.com/ssl-checker.html

---

## Timeline Summary

| Task | Estimated Time |
|------|----------------|
| DNS Configuration | 5-10 minutes |
| DNS Propagation | 15 minutes - 48 hours |
| Add Domain to Render | 5 minutes |
| SSL Provisioning | 5-15 minutes |
| Environment Variables | 5 minutes |
| Testing & Verification | 15-30 minutes |
| **Total (Best Case)** | **1-2 hours** |
| **Total (Worst Case)** | **48-72 hours** |

---

## Post-Setup Testing Checklist

Once everything is configured, test:

- [ ] Frontend loads at `https://jengaeafrica.com`
- [ ] www redirect works (`https://www.jengaeafrica.com` → `https://jengaeafrica.com`)
- [ ] API accessible at `https://api.jengaeafrica.com`
- [ ] User registration works
- [ ] User login works
- [ ] Material cost estimation works
- [ ] Labor cost estimation works
- [ ] Project summary loads
- [ ] Market analysis works
- [ ] No CORS errors in console
- [ ] No CSRF errors in console
- [ ] SSL certificates valid (green padlock)
- [ ] Mobile responsive design works
- [ ] All images and assets load

---

## Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review Render deployment logs
3. Check browser console for specific errors
4. Verify DNS propagation status
5. Contact Render support for infrastructure issues

---

**Last Updated:** November 18, 2025
**Domain:** jengaeafrica.com
**Project:** JengaEstimate Construction Cost Estimation Platform
