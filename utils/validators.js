// Function to validate email format
function isValidEmail(email) {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


function isPasswordStrong(password) {
    // Regular expression to validate password format
    const passwordRegex = /^.{6,}$/;
    return passwordRegex.test(password);
}


module.exports = { isValidEmail, isPasswordStrong };