# Quick Start: jengaeafrica.com Setup

## 🚀 Immediate Actions Required

### 1️⃣ Configure DNS (At Your Domain Registrar)

**Login to your domain registrar** (GoDaddy, Namecheap, etc.) and add these DNS records:

```
Type: CNAME
Name: @
Value: jengaeafrontend.onrender.com

Type: CNAME
Name: www
Value: jengaeafrontend.onrender.com

Type: CNAME
Name: api
Value: jengaea.onrender.com
```

**Note:** Some registrars use "Host" instead of "Name". If your registrar doesn't support CNAME for root (@), use ALIAS or ANAME instead.

⏰ **DNS Propagation:** 15 minutes - 48 hours (usually ~30 minutes)

---

### 2️⃣ Configure Render Backend Service

**Go to:** https://dashboard.render.com → Your backend service (jengaea)

#### A. Add Custom Domain
1. Click **Settings** tab
2. Scroll to **Custom Domains**
3. Click **Add Custom Domain**
4. Enter: `api.jengaeafrica.com`
5. Click **Save**
6. Wait for SSL certificate (5-15 minutes)

#### B. Add Environment Variable
1. Click **Environment** tab
2. Add new variable:
   ```
   Key: REACT_APP_API_URL
   Value: https://api.jengaeafrica.com
   ```
3. Click **Save**

---

### 3️⃣ Configure Render Frontend Service

**Go to:** https://dashboard.render.com → Your frontend service (jengaeafrontend)

#### A. Add Custom Domains
1. Click **Settings** tab
2. Scroll to **Custom Domains**
3. Add **first domain:**
   - Enter: `jengaeafrica.com`
   - Click **Save**
4. Add **second domain:**
   - Click **Add Custom Domain** again
   - Enter: `www.jengaeafrica.com`
   - Click **Save**
5. Wait for SSL certificates (5-15 minutes each)

#### B. Add Environment Variable
1. Click **Environment** tab
2. Add new variable:
   ```
   Key: REACT_APP_API_URL
   Value: https://api.jengaeafrica.com
   ```
3. Click **Save**
4. Service will automatically redeploy

---

### 4️⃣ Verify Setup (After DNS Propagation)

**Check DNS Propagation:**
- Visit: https://dnschecker.org
- Enter: `jengaeafrica.com`
- Should show: `jengaeafrontend.onrender.com`

**Test Backend:**
```
Visit: https://api.jengaeafrica.com
Should show: Django/API response with SSL 🔒
```

**Test Frontend:**
```
Visit: https://jengaeafrica.com
Visit: https://www.jengaeafrica.com
Both should load React app with SSL 🔒
```

**Test Full Integration:**
1. Open https://jengaeafrica.com
2. Register a new account
3. Log in
4. Generate a material estimate
5. Check browser console (F12) for errors

---

## ⚡ Common Issues

### "DNS_PROBE_FINISHED_NXDOMAIN"
- **Solution:** DNS not propagated yet. Wait 30 minutes and try again.

### "Your connection is not private" (SSL Error)
- **Solution:** SSL provisioning in progress. Wait 10-15 minutes.

### "CORS Error" in Console
- **Solution:** Code already deployed with fix. Hard refresh (Ctrl+Shift+R).

### API Calls Still Go to Old URL
- **Solution:** Clear browser cache. Hard refresh. Check REACT_APP_API_URL is set.

---

## 📋 Checklist

- [ ] DNS records added at domain registrar
- [ ] `api.jengaeafrica.com` added to Render backend
- [ ] `jengaeafrica.com` added to Render frontend
- [ ] `www.jengaeafrica.com` added to Render frontend
- [ ] `REACT_APP_API_URL` set on frontend Render service
- [ ] DNS propagated (check dnschecker.org)
- [ ] SSL certificates provisioned (green padlock 🔒)
- [ ] Frontend loads at https://jengaeafrica.com
- [ ] API accessible at https://api.jengaeafrica.com
- [ ] User registration works
- [ ] User login works
- [ ] Material/Labor estimates work
- [ ] No CORS/CSRF errors in console

---

## 🆘 Need Help?

1. Read full guide: `CUSTOM_DOMAIN_SETUP.md`
2. Check Render logs for errors
3. Verify DNS with: https://dnschecker.org
4. Test SSL with: https://www.sslshopper.com/ssl-checker.html

---

**Estimated Total Time:** 1-2 hours (including DNS propagation)

**Your Domains:**
- Frontend: https://jengaeafrica.com
- Backend API: https://api.jengaeafrica.com
