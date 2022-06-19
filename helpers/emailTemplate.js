   function passwordReset(emailRecipient, newPassword, userFirstName) {
    return `
      Hello ${userFirstName}!
  
      A new password has been requested by the following email:
      ${emailRecipient}
      
      This is your new temporary Password: ${newPassword}
      
      For your security, please change your Password after logging in, by visiting your profile settings and completing the new password change.
      
      Thanks!
      Test App Team
      `;
  }
  
  module.exports = {
    passwordReset
  };
  