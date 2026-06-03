# FruitMart

This repository is split into two application folders:

- `frontend/` - Angular 21 client application
- `backend/` - Node.js + Express + MongoDB API

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Run the project

Frontend:

```bash
cd frontend
npm install
npm start
```

Backend:

```bash
cd backend
npm install
npm start
```

App URLs:

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000`
- Backend health check: `http://localhost:3000/api/health`

## Security updates

The backend now includes:

- `helmet` security headers
- API-wide rate limiting
- stricter auth rate limiting
- JSON body size limits
- hidden `x-powered-by` header

The frontend now restores auth state more safely by rejecting invalid or expired stored tokens.

## Responsive UI updates

The following areas were improved for phones, tablets, and desktop screens:

- admin dashboard tables and tabs
- cart layout
- orders layout
- profile layout

## Frontend commands

Run these inside `frontend/`:

```bash
npm start
npm run build
npm test
```

## Backend commands

Run these inside `backend/`:

```bash
npm start
```

## Email setup (Gmail SMTP)

FruitMart now supports:

- Customer Contact form email delivery
- Automatic acknowledgement email to customer
- Admin "Send Email" action to message users from the dashboard

Configure these in [backend/.env](backend/.env):

```env
SUPPORT_EMAIL=sanjayworks99@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sanjayworks99@gmail.com
SMTP_PASS=your_gmail_app_password
MAIL_FROM_NAME=FruitMart
MAIL_FROM_ADDRESS=sanjayworks99@gmail.com
```

Important:

- For Gmail, use an App Password in `SMTP_PASS` (not your normal Gmail login password)
- You may need to enable 2-step verification in Gmail before generating an app password
