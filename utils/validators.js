// Function to validate email format
function isValidEmail(email) {
    // Regular expression to validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email);
}


function isPasswordStrong(password) {
    // Regular expression to validate password format
    const passwordRegex = /^.{6,}$/;
    return passwordRegex.test(password);
}


export default { isValidEmail, isPasswordStrong };