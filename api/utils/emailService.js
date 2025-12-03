const nodemailer = require('nodemailer');

// Email configuration
const EMAIL_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
};

// Admin email addresses (from environment variable)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

// Create email transporter
let transporter;
try {
    if (EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass) {
        transporter = nodemailer.createTransporter(EMAIL_CONFIG);
    }
} catch (error) {
    console.log('Email service not configured:', error.message);
}

// Send email notification for new access request
async function sendNewRequestNotification(accessRequest) {
    if (!transporter || ADMIN_EMAILS.length === 0) {
        console.log('Email notifications not configured');
        return false;
    }

    const subject = `New Access Request: ${accessRequest.userDetails}`;
    const html = `
        <h2>New MEDEVAC System Access Request</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Request Details</h3>
            <p><strong>User:</strong> ${accessRequest.userDetails}</p>
            <p><strong>Identity Provider:</strong> ${accessRequest.identityProvider}</p>
            <p><strong>Requested Role:</strong> ${accessRequest.requestedRole}</p>
            <p><strong>Request Date:</strong> ${new Date(accessRequest.requestedAt).toLocaleString()}</p>
            <p><strong>Request ID:</strong> ${accessRequest.id}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Justification</h3>
            <p>${accessRequest.reason}</p>
        </div>
        
        <div style="margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/access-requests" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Review Request
            </a>
        </div>
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #6c757d;">
            This is an automated notification from the MEDEVAC System.<br>
            Please do not reply to this email.
        </p>
    `;

    try {
        await transporter.sendMail({
            from: EMAIL_CONFIG.auth.user,
            to: ADMIN_EMAILS,
            subject: subject,
            html: html
        });
        console.log('New request notification sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending new request notification:', error);
        return false;
    }
}

// Send email notification when request is approved/denied
async function sendRequestDecisionNotification(accessRequest, userEmail) {
    if (!transporter || !userEmail) {
        console.log('Email notifications not configured or user email not available');
        return false;
    }

    const isApproved = accessRequest.status === 'approved';
    const subject = `Access Request ${isApproved ? 'Approved' : 'Denied'}: MEDEVAC System`;
    
    const html = `
        <h2>Access Request ${isApproved ? 'Approved' : 'Denied'}</h2>
        <div style="background-color: ${isApproved ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Decision Details</h3>
            <p><strong>Request ID:</strong> ${accessRequest.id}</p>
            <p><strong>Status:</strong> ${accessRequest.status.toUpperCase()}</p>
            <p><strong>Reviewed By:</strong> ${accessRequest.reviewedBy}</p>
            <p><strong>Review Date:</strong> ${new Date(accessRequest.reviewedAt).toLocaleString()}</p>
            ${accessRequest.reviewComments ? `<p><strong>Comments:</strong> ${accessRequest.reviewComments}</p>` : ''}
        </div>
        
        ${isApproved ? `
            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Next Steps</h3>
                <p>Your access to the MEDEVAC System has been approved with the role: <strong>${accessRequest.requestedRole}</strong></p>
                <p>You can now access the system by logging in again.</p>
                <a href="${process.env.FRONTEND_URL}" 
                   style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    Access MEDEVAC System
                </a>
            </div>
        ` : `
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Request Denied</h3>
                <p>Your access request has been denied. If you believe this is an error or have additional information, please contact your system administrator.</p>
            </div>
        `}
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #6c757d;">
            This is an automated notification from the MEDEVAC System.<br>
            Please do not reply to this email.
        </p>
    `;

    try {
        await transporter.sendMail({
            from: EMAIL_CONFIG.auth.user,
            to: userEmail,
            cc: ADMIN_EMAILS,
            subject: subject,
            html: html
        });
        console.log(`Request decision notification sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending request decision notification:', error);
        return false;
    }
}

module.exports = {
    sendNewRequestNotification,
    sendRequestDecisionNotification
};