# MEDEVAC Form Application - Azure SQL Database Setup

This application is now configured to use Azure SQL Database for cloud deployment. Follow these steps to set up your database and run the application.

## Prerequisites

- Node.js 20 or higher
- Azure account with SQL Database access
- Git (for deployment)

## Step 1: Create Azure SQL Database

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → "Databases" → "SQL Database"
3. Fill in the required information:
   - **Database name**: `medevac-db` (or your preferred name)
   - **Server**: Create new server or use existing
   - **Pricing tier**: Basic or Standard for development
4. Click "Review + create" → "Create"
5. Wait for deployment to complete

## Step 2: Configure Database Firewall

1. Go to your SQL Database in Azure Portal
2. Click on "Set server firewall" in the overview
3. For development, add your current IP address:
   - Click "Add client IP"
4. For temporary testing, you can allow all IPs (NOT RECOMMENDED for production):
   - Start IP: `0.0.0.0`
   - End IP: `255.255.255.255`
5. Click "Save"

## Step 3: Get Connection Details

1. In your SQL Database, go to "Connection strings"
2. Copy the ADO.NET connection string
3. Extract the following values:
   - **Server**: `your-server.database.windows.net`
   - **Database**: Your database name
   - **User**: Your admin username
   - **Password**: Your admin password

## Step 4: Configure Environment Variables

1. Copy the environment template:
   ```powershell
   copy .env.template .env
   ```

2. Edit `.env` file with your Azure SQL Database details:
   ```
   AZURE_SQL_SERVER=your-server-name.database.windows.net
   AZURE_SQL_USER=your-username
   AZURE_SQL_PASSWORD=your-password
   AZURE_SQL_DATABASE=your-database-name
   
   NODE_ENV=development
   PORT=3001
   SESSION_SECRET=your-random-session-secret
   JWT_SECRET=your-random-jwt-secret
   ```

3. Generate secure secrets:
   ```powershell
   # Generate random secrets (Windows PowerShell)
   -join ((1..32) | ForEach {[char][System.Random]::new().Next(65,91)})
   ```

## Step 5: Install Dependencies

```powershell
npm install
```

## Step 6: Setup Database Tables

Run the setup script to create all necessary tables:

```powershell
npm run setup-db
```

This will:
- Test your database connection
- Create all required tables (users, sessions, medevac_submissions, activity_log)
- Create performance indices
- Verify everything is working

## Step 7: Run the Application

Start both the API server and React frontend:

```powershell
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:3001

## Step 8: Test the Application

1. Go to http://localhost:3000
2. Click "Login" in the top right
3. Create a new account
4. Submit a test MEDEVAC form
5. View your submissions in the dashboard

## Database Schema

The application creates the following tables:

### users
- User accounts with authentication
- Fields: username, email, password_hash, first_name, last_name, role

### user_sessions
- Active user sessions for authentication
- Fields: user_id, session_token, expires_at, ip_address

### medevac_submissions
- MEDEVAC form submissions
- Fields: patient details, costs, status, dates, form data (JSON)

### activity_log
- User activity tracking
- Fields: user_id, action, resource_type, details, timestamp

## Troubleshooting

### Connection Issues
- Verify your Azure SQL Database is running
- Check firewall settings (make sure your IP is allowed)
- Confirm connection string details in `.env`

### Authentication Issues
- Make sure SESSION_SECRET and JWT_SECRET are set
- Clear browser cookies/localStorage

### Permission Issues
- Ensure your Azure SQL user has CREATE, INSERT, UPDATE, DELETE permissions
- Check if your database user is the admin user or has appropriate roles

### Performance Issues
- Consider upgrading your Azure SQL Database pricing tier
- The application creates indices automatically for better performance

## Deployment to Azure

This application is ready for deployment to Azure Static Web Apps or Azure App Service. The database is already cloud-ready with:

- Connection pooling for scalability
- Parameterized queries for security
- Proper error handling
- Activity logging for monitoring

## Security Notes

- Never commit your `.env` file to git
- Use strong passwords for your Azure SQL Database
- Generate cryptographically secure secrets for production
- Consider using Azure Key Vault for production secrets
- Regularly update dependencies

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify your database connection with `npm run setup-db`
3. Ensure all environment variables are correctly set
4. Check Azure SQL Database firewall settings